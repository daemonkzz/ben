import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TOTP verification using HMAC-SHA1
async function generateTOTPCode(secret: string, counter: number): Promise<string> {
  // Decode base32 secret
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const cleanSecret = secret.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  for (const char of cleanSecret) {
    const val = base32Chars.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  const keyBytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < keyBytes.length; i++) {
    keyBytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  
  // Convert counter to 8-byte big-endian
  const counterBytes = new Uint8Array(8);
  let tempCounter = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = tempCounter & 0xff;
    tempCounter = Math.floor(tempCounter / 256);
  }
  
  // Import key for HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  // Generate HMAC
  const signature = await crypto.subtle.sign('HMAC', key, counterBytes);
  const hmac = new Uint8Array(signature);
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

async function verifyTOTP(secret: string, code: string, window: number = 1): Promise<boolean> {
  const period = 30;
  const currentCounter = Math.floor(Date.now() / 1000 / period);
  
  // Check current time and window before/after
  for (let i = -window; i <= window; i++) {
    const expectedCode = await generateTOTPCode(secret, currentCounter + i);
    if (expectedCode === code) {
      return true;
    }
  }
  
  return false;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Yetkilendirme gerekli' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { code } = await req.json();
    
    if (!code || typeof code !== 'string' || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Geçersiz kod formatı' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // First, verify the user's JWT and get their ID
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Geçersiz oturum' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`TOTP verification attempt for user: ${user.id}`);

    // Get the user's 2FA settings using service role (bypasses RLS)
    const { data: settings, error: settingsError } = await supabaseAuth
      .from('admin_2fa_settings')
      .select('totp_secret, is_blocked, failed_attempts, is_provisioned')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings) {
      console.error('Settings error:', settingsError);
      return new Response(
        JSON.stringify({ success: false, error: '2FA ayarları bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is blocked
    if (settings.is_blocked) {
      return new Response(
        JSON.stringify({ success: false, error: 'Hesabınız bloklanmış. Yönetici ile iletişime geçin.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if 2FA is provisioned
    if (!settings.is_provisioned || !settings.totp_secret) {
      return new Response(
        JSON.stringify({ success: false, error: '2FA kurulumu tamamlanmamış' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the TOTP code server-side
    const isValid = await verifyTOTP(settings.totp_secret, code, 1);

    if (isValid) {
      // Reset failed attempts on success
      await supabaseAuth
        .from('admin_2fa_settings')
        .update({ failed_attempts: 0, last_failed_at: null })
        .eq('user_id', user.id);

      console.log(`TOTP verification successful for user: ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Increment failed attempts
      const newAttempts = (settings.failed_attempts || 0) + 1;
      const shouldBlock = newAttempts >= 5;

      await supabaseAuth
        .from('admin_2fa_settings')
        .update({
          failed_attempts: newAttempts,
          last_failed_at: new Date().toISOString(),
          is_blocked: shouldBlock,
        })
        .eq('user_id', user.id);

      console.log(`TOTP verification failed for user: ${user.id}, attempts: ${newAttempts}`);

      if (shouldBlock) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Çok fazla başarısız deneme. Hesabınız bloklandı.',
            blocked: true 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Yanlış kod. ${5 - newAttempts} deneme hakkınız kaldı.`,
          remaining_attempts: 5 - newAttempts 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('TOTP verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Sunucu hatası' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});