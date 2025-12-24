import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, AlertCircle, Lock, KeyRound } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { FormQuestion, FormSettings } from "@/types/formBuilder";

interface FormTemplate {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  questions: FormQuestion[];
  settings: FormSettings;
}

// Floating particles generator
const generateFloatingParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 8,
  }));
};

const BasvuruForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const particles = useMemo(() => generateFloatingParticles(15), []);

  // Password protection state
  const [accessCode, setAccessCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Load form template
  useEffect(() => {
    const loadFormTemplate = async () => {
      if (!formId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('form_templates')
          .select('*')
          .eq('id', formId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Form template fetch error:', error);
          toast({
            title: "Hata",
            description: "Form yüklenirken bir hata oluştu.",
            variant: "destructive",
          });
        } else if (data) {
          const template = {
            ...data,
            questions: data.questions as FormQuestion[],
            settings: data.settings as FormSettings
          };
          setFormTemplate(template);
          
          // If form is not password protected, mark as verified
          if (!template.settings?.isPasswordProtected) {
            setIsCodeVerified(true);
          }
        }
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormTemplate();
  }, [formId, toast]);

  const handleCodeSubmit = () => {
    if (!formTemplate?.settings?.accessCodes) return;
    
    const trimmedCode = accessCode.trim();
    if (formTemplate.settings.accessCodes.includes(trimmedCode)) {
      setIsCodeVerified(true);
      setCodeError('');
      toast({
        title: "Erişim Sağlandı",
        description: "Kod doğrulandı, forma erişebilirsiniz.",
      });
    } else {
      setCodeError('Geçersiz erişim kodu');
      toast({
        title: "Hatalı Kod",
        description: "Girdiğiniz erişim kodu geçersiz.",
        variant: "destructive",
      });
    }
  };

  const updateField = (questionId: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentValues = (formData[questionId] as string[]) || [];
    if (checked) {
      updateField(questionId, [...currentValues, option]);
    } else {
      updateField(questionId, currentValues.filter(v => v !== option));
    }
  };

  const isFormValid = () => {
    if (!formTemplate) return false;
    
    return formTemplate.questions.every(question => {
      if (!question.required) return true;
      const value = formData[question.id];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== '';
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Giriş Yapmalısınız",
        description: "Başvuru göndermek için giriş yapmanız gerekmektedir.",
        variant: "destructive",
      });
      return;
    }

    if (!formTemplate || !formId) {
      toast({
        title: "Hata",
        description: "Form bilgileri eksik.",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format content with question labels for better readability
      const formattedContent: Record<string, string> = {};
      formTemplate.questions.forEach(question => {
        const value = formData[question.id];
        const formattedValue = Array.isArray(value) ? value.join(', ') : (value || '');
        formattedContent[question.label || question.id] = formattedValue;
      });

      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          type: formId,
          content: formattedContent,
          status: 'pending'
        });

      if (error) {
        console.error('Application submit error:', error);
        throw error;
      }

      toast({
        title: "Başvurunuz Gönderildi",
        description: "Başvurunuz incelemeye alınacaktır.",
      });
      navigate("/basvuru");
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Hata",
        description: "Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: FormQuestion, index: number) => {
    const value = formData[question.id];

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="space-y-3"
      >
        <Label className="text-foreground">
          {question.label}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {question.type === 'short_text' && (
          <Input
            value={(value as string) || ''}
            onChange={(e) => updateField(question.id, e.target.value)}
            placeholder={question.placeholder || ''}
            className="bg-card/40 border-border/30"
          />
        )}

        {question.type === 'paragraph' && (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => updateField(question.id, e.target.value)}
            placeholder={question.placeholder || ''}
            className="bg-card/40 border-border/30 min-h-[120px] resize-none"
          />
        )}

        {question.type === 'number' && (
          <Input
            type="number"
            value={(value as string) || ''}
            onChange={(e) => updateField(question.id, e.target.value)}
            placeholder={question.placeholder || ''}
            className="bg-card/40 border-border/30 max-w-[200px]"
          />
        )}

        {question.type === 'discord_id' && (
          <Input
            value={(value as string) || ''}
            onChange={(e) => updateField(question.id, e.target.value)}
            placeholder={question.placeholder || 'Örn: 123456789012345678'}
            className="bg-card/40 border-border/30 max-w-[300px] font-mono"
          />
        )}

        {question.type === 'radio' && question.options && (
          <RadioGroup
            value={(value as string) || ''}
            onValueChange={(val) => updateField(question.id, val)}
            className="space-y-2"
          >
            {question.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 bg-card/40 hover:border-primary/30 transition-colors"
              >
                <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                <Label
                  htmlFor={`${question.id}-${optionIndex}`}
                  className="text-foreground cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'checkbox' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const isChecked = ((value as string[]) || []).includes(option);
              return (
                <div
                  key={optionIndex}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 bg-card/40 hover:border-primary/30 transition-colors"
                >
                  <Checkbox
                    id={`${question.id}-${optionIndex}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(question.id, option, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`${question.id}-${optionIndex}`}
                    className="text-foreground cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Form not found
  if (!formTemplate) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground" />
            <h1 className="text-2xl text-foreground">Form Bulunamadı</h1>
            <p className="text-muted-foreground">Bu form mevcut değil veya aktif değil.</p>
            <Link to="/basvuru" className="inline-block text-primary hover:underline">
              Başvuru merkezine dön
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-display text-foreground">Giriş Yapmalısınız</h1>
            <p className="text-muted-foreground">Başvuru yapabilmek için önce giriş yapmanız gerekmektedir.</p>
            <Link 
              to="/"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Password protection screen
  if (formTemplate.settings?.isPasswordProtected && !isCodeVerified) {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Floating Particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-primary/30"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -80, 0],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 0.5, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Background */}
        <div className="fixed inset-0 hero-gradient pointer-events-none z-[0]" />
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-[0]" />

        <Header />

        <main className="flex-1 pt-32 pb-24 relative z-10 flex items-center justify-center">
          <div className="container mx-auto px-4 md:px-6 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/40 border border-border/30 rounded-xl p-8"
            >
              {/* Lock Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
                >
                  <Lock className="w-10 h-10 text-primary" />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Şifreli Form
                </h1>
                <p className="text-muted-foreground text-sm">
                  Bu forma erişmek için erişim kodu gereklidir
                </p>
                <p className="text-primary font-medium mt-2">{formTemplate.title}</p>
              </div>

              {/* Code Input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-code" className="text-foreground">
                    Erişim Kodu
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="access-code"
                      type="text"
                      value={accessCode}
                      onChange={(e) => {
                        setAccessCode(e.target.value);
                        setCodeError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCodeSubmit();
                      }}
                      placeholder="Erişim kodunuzu girin"
                      className={`bg-card/40 border-border/30 pl-10 ${
                        codeError ? 'border-destructive' : ''
                      }`}
                    />
                  </div>
                  {codeError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-destructive text-sm flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {codeError}
                    </motion.p>
                  )}
                </div>

                <Button
                  onClick={handleCodeSubmit}
                  disabled={!accessCode.trim()}
                  className="w-full gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Erişim Sağla
                </Button>

                <Link
                  to="/basvuru"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Başvuru merkezine dön
                </Link>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Background */}
      <div className="fixed inset-0 hero-gradient pointer-events-none z-[0]" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-[0]" />

      <Header />

      <main className="flex-1 pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/basvuru"
              className="inline-flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <motion.div
                whileHover={{ x: -4 }}
                className="p-2 rounded-lg bg-card/50 border border-border/30 group-hover:border-primary/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.div>
              <span className="text-sm tracking-wide">Başvuru Merkezi</span>
            </Link>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 border border-border/30 rounded-xl overflow-hidden"
          >
            {/* Cover Image */}
            {formTemplate.cover_image_url && (
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={formTemplate.cover_image_url}
                  alt={formTemplate.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Form Header */}
            <div className="p-8 border-b border-border/20">
              <h1 className="text-3xl font-display text-foreground mb-2">
                {formTemplate.title}
              </h1>
              {formTemplate.description && (
                <p className="text-muted-foreground">{formTemplate.description}</p>
              )}
            </div>

            {/* Questions */}
            <div className="p-8 space-y-8">
              {formTemplate.questions.map((question, index) =>
                renderQuestion(question, index)
              )}
            </div>

            {/* Submit Button */}
            <div className="p-8 pt-0">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid()}
                className="w-full py-6 text-lg gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Başvuruyu Gönder
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BasvuruForm;
