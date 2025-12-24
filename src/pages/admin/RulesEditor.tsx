import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  BookOpen,
  FolderOpen,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { MainCategory, SubCategory, Rule } from '@/types/rules';

// Default rules data to import (no lastUpdate - will be set when edited)
const defaultRulesData: MainCategory[] = [
  {
    id: "1",
    title: "Genel Kurallar",
    subCategories: [
      {
        id: "1.1",
        title: "Davranış Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "1.1.1", title: "Saygılı Davranış", description: "Tüm oyunculara saygılı davranılmalıdır. Herhangi bir oyuncuya karşı ayrımcılık, nefret söylemi veya kışkırtıcı davranışlarda bulunmak kesinlikle yasaktır.", lastUpdate: "" },
          { id: "1.1.2", title: "Küfür ve Hakaret", description: "Küfür, hakaret ve aşağılayıcı söylemler yasaktır. Bu kural hem oyun içi hem de Discord sunucusunda geçerlidir.", lastUpdate: "" },
          { id: "1.1.3", title: "Spam Yasağı", description: "Spam yapmak ve gereksiz mesajlar göndermek yasaktır. Tekrarlayan mesajlar, flood ve benzeri davranışlar cezalandırılır.", lastUpdate: "" },
          { id: "1.1.4", title: "Taciz Yasağı", description: "Oyun içi ve dışı her türlü taciz yasaktır. Bu durum tespit edildiğinde kalıcı ban ile sonuçlanabilir.", lastUpdate: "" },
        ],
      },
      {
        id: "1.2",
        title: "Yetki Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "1.2.1", title: "Yetkililerin Kararları", description: "Yetkililerin kararlarına saygı gösterilmelidir. Yetkililer sunucunun düzenini sağlamak için çalışmaktadır ve kararları nihaidir.", lastUpdate: "" },
          { id: "1.2.2", title: "İtiraz Yöntemi", description: "Yetkililerle tartışmak yerine ticket açılmalıdır. Oyun içinde yetkililere karşı çıkmak veya kararlarını sorgulamak yasaktır.", lastUpdate: "" },
          { id: "1.2.3", title: "Karar İtirazları", description: "Yetkili kararlarına itiraz Discord üzerinden yapılır. İtirazlarınızı kanıtlarla destekleyerek ticket sistemi üzerinden iletebilirsiniz.", lastUpdate: "" },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Roleplay Kuralları",
    subCategories: [
      {
        id: "2.1",
        title: "Temel RP Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "2.1.1", title: "Karakter Kalıcılığı", description: "Her zaman karakterinizde kalmalısınız (IC). Oyun içinde OOC konuşmalar minimum düzeyde tutulmalı.", lastUpdate: "" },
          { id: "2.1.2", title: "OOC İletişim", description: "OOC konuşmalar için belirlenen kanalları kullanın. Oyun içinde OOC bilgi paylaşımı yasaktır.", lastUpdate: "" },
          { id: "2.1.3", title: "Powergaming Yasağı", description: "Powergaming yasaktır - karşı tarafa tepki verme şansı tanıyın.", lastUpdate: "" },
          { id: "2.1.4", title: "Metagaming Yasağı", description: "Metagaming yasaktır - IC bilmediğiniz bilgileri kullanmayın.", lastUpdate: "" },
        ],
      },
      {
        id: "2.2",
        title: "Saldırı Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "2.2.1", title: "RDM Yasağı", description: "Random Deathmatch (RDM) kesinlikle yasaktır.", lastUpdate: "" },
          { id: "2.2.2", title: "VDM Yasağı", description: "Vehicle Deathmatch (VDM) kesinlikle yasaktır.", lastUpdate: "" },
          { id: "2.2.3", title: "Combat Logging Yasağı", description: "Combat logging yasaktır.", lastUpdate: "" },
          { id: "2.2.4", title: "Revenge Kill Yasağı", description: "Revenge Kill yasaktır.", lastUpdate: "" },
        ],
      },
      {
        id: "2.3",
        title: "Karakter Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "2.3.1", title: "Gerçekçi Geçmiş", description: "Karakteriniz gerçekçi bir geçmişe sahip olmalıdır.", lastUpdate: "" },
          { id: "2.3.2", title: "İsim Kuralları", description: "Ünlü kişilerin isimlerini kullanamazsınız.", lastUpdate: "" },
          { id: "2.3.3", title: "Yaş Sınırı", description: "Karakterinizin yaşı 18'den büyük olmalıdır.", lastUpdate: "" },
          { id: "2.3.4", title: "Fear RP Kuralı", description: "Fear RP kuralına uymalısınız.", lastUpdate: "" },
          { id: "2.3.5", title: "New Life Rule (NLR)", description: "Öldükten sonra önceki olayları hatırlayamazsınız.", lastUpdate: "" },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Suç ve Çete Kuralları",
    subCategories: [
      {
        id: "3.1",
        title: "Soygun Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "3.1.1", title: "Banka Soygunu", description: "Banka soygunu için minimum 4 polis online olmalıdır.", lastUpdate: "" },
          { id: "3.1.2", title: "Mücevherat Soygunu", description: "Mücevherat soygunu için minimum 3 polis online olmalıdır.", lastUpdate: "" },
          { id: "3.1.3", title: "Market Soygunu", description: "Market soygunu için minimum 2 polis online olmalıdır.", lastUpdate: "" },
          { id: "3.1.4", title: "Soygun Aralığı", description: "Ardışık soygunlar arasında en az 30 dakika beklenmelidir.", lastUpdate: "" },
        ],
      },
      {
        id: "3.2",
        title: "Rehine Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "3.2.1", title: "Rehine Süresi", description: "Rehine alma süresi maksimum 30 dakikadır.", lastUpdate: "" },
          { id: "3.2.2", title: "Çete Üyesi Yasağı", description: "Rehine olarak kendi çete üyelerinizi kullanamazsınız.", lastUpdate: "" },
          { id: "3.2.3", title: "Rehine Hakları", description: "Rehinenin gerçekçi talepleri karşılanmalıdır.", lastUpdate: "" },
        ],
      },
      {
        id: "3.3",
        title: "Çete Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "3.3.1", title: "Cop Baiting Yasağı", description: "Cop baiting yasaktır.", lastUpdate: "" },
          { id: "3.3.2", title: "Güvenli Bölgeler", description: "Güvenli bölgelerde suç işlenemez.", lastUpdate: "" },
          { id: "3.3.3", title: "Gang Savaşları", description: "Gang savaşları için yetki alınmalıdır.", lastUpdate: "" },
          { id: "3.3.4", title: "Silah Kullanımı", description: "Silah kullanımı öncesi RP yapılmalıdır.", lastUpdate: "" },
          { id: "3.3.5", title: "Üye Limiti", description: "Çete üye sayısı maksimum 15 kişidir.", lastUpdate: "" },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Araç ve Trafik Kuralları",
    subCategories: [
      {
        id: "4.1",
        title: "Sürüş Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "4.1.1", title: "Trafik Kuralları", description: "Trafik kurallarına uyulmalıdır.", lastUpdate: "" },
          { id: "4.1.2", title: "Araç Parkı", description: "Araç parkı belirlenen yerlere yapılmalıdır.", lastUpdate: "" },
          { id: "4.1.3", title: "Kasıtlı Kaza", description: "Araçları kasıtlı olarak kaza yaptırmak yasaktır.", lastUpdate: "" },
          { id: "4.1.4", title: "Kaldırım Yasağı", description: "Kaldırımda araç kullanmak yasaktır.", lastUpdate: "" },
        ],
      },
      {
        id: "4.2",
        title: "Araç Kullanım Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "4.2.1", title: "Uçan Araçlar", description: "Uçan araçlar için özel izin gereklidir.", lastUpdate: "" },
          { id: "4.2.2", title: "Araç Modifikasyonu", description: "Araç modifikasyonları karakter bütçesine uygun olmalıdır.", lastUpdate: "" },
          { id: "4.2.3", title: "Çalıntı Araçlar", description: "Çalıntı araçlar 2 saat içinde terk edilmelidir.", lastUpdate: "" },
          { id: "4.2.4", title: "Süper Araçlar", description: "Süper araçlar sadece whitelisted oyunculara açıktır.", lastUpdate: "" },
        ],
      },
    ],
  },
  {
    id: "5",
    title: "İletişim ve Ekonomi Kuralları",
    subCategories: [
      {
        id: "5.1",
        title: "İletişim Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "5.1.1", title: "Mikrofon Kullanımı", description: "Oyun içi iletişim için mikrofon kullanılmalıdır.", lastUpdate: "" },
          { id: "5.1.2", title: "Push-to-Talk", description: "Push-to-talk önerilir.", lastUpdate: "" },
          { id: "5.1.3", title: "Telsiz Mesafesi", description: "Telsiz mesafesi kurallarına uyulmalıdır.", lastUpdate: "" },
          { id: "5.1.4", title: "Discord Voice", description: "Discord voice chat sadece OOC iletişim içindir.", lastUpdate: "" },
          { id: "5.1.5", title: "Telefon Görüşmeleri", description: "Karakterler arası telefon görüşmeleri IC olarak yapılmalıdır.", lastUpdate: "" },
        ],
      },
      {
        id: "5.2",
        title: "Ekonomi Kuralları",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "5.2.1", title: "Para Transferleri", description: "Para transferleri kayıt altına alınır.", lastUpdate: "" },
          { id: "5.2.2", title: "Gerçek Para Yasağı", description: "Gerçek para ile oyun içi para alışverişi yasaktır.", lastUpdate: "" },
          { id: "5.2.3", title: "Ekonomi Manipülasyonu", description: "Ekonomiyi bozmaya yönelik eylemler yasaktır.", lastUpdate: "" },
          { id: "5.2.4", title: "İş Yeri Fiyatları", description: "İş yeri sahipleri fiyatları makul tutmalıdır.", lastUpdate: "" },
          { id: "5.2.5", title: "Çoklu Hesap", description: "Çoklu hesap ile ekonomi manipülasyonu yasaktır.", lastUpdate: "" },
        ],
      },
      {
        id: "5.3",
        title: "Ceza Sistemi",
        description: "Bu bölümdeki kurallar aşağıda listelenmiştir.",
        rules: [
          { id: "5.3.1", title: "İlk İhlal", description: "İlk ihlal: Sözlü uyarı verilir.", lastUpdate: "" },
          { id: "5.3.2", title: "İkinci İhlal", description: "İkinci ihlal: Yazılı uyarı ve 24 saat ban.", lastUpdate: "" },
          { id: "5.3.3", title: "Üçüncü İhlal", description: "Üçüncü ihlal: 7 gün ban uygulanır.", lastUpdate: "" },
          { id: "5.3.4", title: "Dördüncü İhlal", description: "Dördüncü ihlal: Kalıcı ban uygulanır.", lastUpdate: "" },
          { id: "5.3.5", title: "Ağır İhlaller", description: "Ağır ihlaller doğrudan kalıcı ban ile sonuçlanabilir.", lastUpdate: "" },
          { id: "5.3.6", title: "Ban İtirazları", description: "Ban itirazları Discord üzerinden yapılabilir.", lastUpdate: "" },
        ],
      },
    ],
  },
];

const RulesEditor = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  
  const [rulesId, setRulesId] = useState<string | null>(null);
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [originalCategories, setOriginalCategories] = useState<MainCategory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // UI State
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ type: 'category' | 'subcategory' | 'rule'; id: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'subcategory' | 'rule'; id: string; parentId?: string; subParentId?: string } | null>(null);
  const [importConfirm, setImportConfirm] = useState(false);

  // Preview state
  const [previewExpandedCats, setPreviewExpandedCats] = useState<string[]>([]);
  const [previewExpandedSubs, setPreviewExpandedSubs] = useState<string[]>([]);

  // Check admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        toast.error('Bu sayfaya erişmek için giriş yapmalısınız');
        navigate('/');
        return;
      }

      try {
        const { data: hasAdminRole, error } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });

        if (error || !hasAdminRole) {
          toast.error('Bu sayfaya erişim yetkiniz yok');
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading, navigate]);

  // Load rules data
  useEffect(() => {
    if (isAuthorized) {
      loadRules();
    }
  }, [isAuthorized]);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading rules:', error);
        toast.error('Kurallar yüklenirken hata oluştu');
        return;
      }

      if (data) {
        setRulesId(data.id);
        const loadedCategories = (data.data as MainCategory[]) || [];
        setCategories(loadedCategories);
        setOriginalCategories(JSON.parse(JSON.stringify(loadedCategories))); // Deep copy for comparison
        setLastUpdated(data.updated_at);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Kurallar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('rules')
        .update({
          data: categories,
          updated_by: user?.id,
        })
        .eq('id', rulesId!);

      if (error) {
        console.error('Save error:', error);
        toast.error('Kurallar kaydedilirken hata oluştu');
        return;
      }

      toast.success('Kurallar başarıyla kaydedildi');
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kurallar kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportDefaults = () => {
    setCategories(defaultRulesData);
    setOriginalCategories(JSON.parse(JSON.stringify(defaultRulesData))); // Deep copy
    setImportConfirm(false);
    toast.success('Varsayılan kurallar içe aktarıldı. Kaydetmeyi unutmayın!');
  };

  // Category operations
  const addCategory = () => {
    const newId = String(categories.length + 1);
    const newCategory: MainCategory = {
      id: newId,
      title: 'Yeni Kategori',
      subCategories: [],
    };
    setCategories([...categories, newCategory]);
    setExpandedCategories(new Set([...expandedCategories, newId]));
    setEditingItem({ type: 'category', id: newId });
  };

  const updateCategory = (id: string, updates: Partial<MainCategory>) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setDeleteConfirm(null);
  };

  // SubCategory operations
  const addSubCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const newId = `${categoryId}.${category.subCategories.length + 1}`;
    const newSubCategory: SubCategory = {
      id: newId,
      title: 'Yeni Alt Kategori',
      description: 'Bu bölümdeki kurallar aşağıda listelenmiştir.',
      rules: [],
    };

    updateCategory(categoryId, {
      subCategories: [...category.subCategories, newSubCategory],
    });
    setExpandedSubCategories(new Set([...expandedSubCategories, newId]));
    setEditingItem({ type: 'subcategory', id: newId });
  };

  const updateSubCategory = (categoryId: string, subCategoryId: string, updates: Partial<SubCategory>) => {
    setCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(sub =>
          sub.id === subCategoryId ? { ...sub, ...updates } : sub
        ),
      };
    }));
  };

  const deleteSubCategory = (categoryId: string, subCategoryId: string) => {
    setCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.filter(sub => sub.id !== subCategoryId),
      };
    }));
    setDeleteConfirm(null);
  };

  // Rule operations
  const addRule = (categoryId: string, subCategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const subCategory = category?.subCategories.find(s => s.id === subCategoryId);
    if (!subCategory) return;

    const newId = `${subCategoryId}.${subCategory.rules.length + 1}`;
    const today = new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const newRule: Rule = {
      id: newId,
      title: 'Yeni Kural',
      description: 'Kural açıklaması buraya yazılacak.',
      lastUpdate: today,
    };

    updateSubCategory(categoryId, subCategoryId, {
      rules: [...subCategory.rules, newRule],
    });
    setEditingItem({ type: 'rule', id: newId });
  };

  const updateRule = (categoryId: string, subCategoryId: string, ruleId: string, updates: Partial<Rule>) => {
    setCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(sub => {
          if (sub.id !== subCategoryId) return sub;
          return {
            ...sub,
            rules: sub.rules.map(rule => {
              if (rule.id !== ruleId) return rule;
              
              // Find original rule for comparison
              const originalCat = originalCategories.find(c => c.id === categoryId);
              const originalSub = originalCat?.subCategories.find(s => s.id === subCategoryId);
              const originalRule = originalSub?.rules.find(r => r.id === ruleId);
              
              // Check if content actually changed
              const newTitle = updates.title ?? rule.title;
              const newDescription = updates.description ?? rule.description;
              const hasContentChanged = 
                newTitle !== originalRule?.title || 
                newDescription !== originalRule?.description;
              
              // Only update lastUpdate if content changed
              const today = new Date().toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              
              return { 
                ...rule, 
                ...updates, 
                lastUpdate: hasContentChanged ? today : rule.lastUpdate 
              };
            }),
          };
        }),
      };
    }));
  };

  const deleteRule = (categoryId: string, subCategoryId: string, ruleId: string) => {
    setCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(sub => {
          if (sub.id !== subCategoryId) return sub;
          return {
            ...sub,
            rules: sub.rules.filter(rule => rule.id !== ruleId),
          };
        }),
      };
    }));
    setDeleteConfirm(null);
  };

  const toggleCategory = (id: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedCategories(newSet);
  };

  const toggleSubCategory = (id: string) => {
    const newSet = new Set(expandedSubCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedSubCategories(newSet);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count total rules
  const totalRules = categories.reduce((acc, cat) =>
    acc + cat.subCategories.reduce((subAcc, sub) => subAcc + sub.rules.length, 0), 0
  );

  // Preview toggle functions
  const togglePreviewCategory = (id: string) => {
    setPreviewExpandedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePreviewSubCategory = (id: string) => {
    setPreviewExpandedSubs(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Kurallar Editörü</h1>
                <p className="text-sm text-muted-foreground">
                  {categories.length} ana kategori, {totalRules} kural
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Son güncelleme: {formatDate(lastUpdated)}
                </span>
              )}
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content with Tabs */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="editor" className="gap-2">
              <Pencil className="w-4 h-4" />
              Düzenle
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Önizleme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  {categories.length === 0 && (
                    <Button onClick={() => setImportConfirm(true)} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Varsayılan Kuralları İçe Aktar
                    </Button>
                  )}
                  <div className="ml-auto">
                    <Button onClick={addCategory} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Ana Kategori Ekle
                    </Button>
                  </div>
                </div>

                {categories.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-lg border border-border">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Henüz kural kategorisi eklenmemiş</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => setImportConfirm(true)} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Varsayılan Kuralları İçe Aktar
                      </Button>
                      <Button onClick={addCategory} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Sıfırdan Başla
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="bg-card rounded-lg border border-border overflow-hidden">
                        <Collapsible
                          open={expandedCategories.has(category.id)}
                          onOpenChange={() => toggleCategory(category.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              {expandedCategories.has(category.id) ? (
                                <ChevronDown className="w-5 h-5 text-primary" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                              <BookOpen className="w-5 h-5 text-primary" />
                              
                              {editingItem?.type === 'category' && editingItem.id === category.id ? (
                                <Input
                                  value={category.title}
                                  onChange={(e) => updateCategory(category.id, { title: e.target.value })}
                                  onBlur={() => setEditingItem(null)}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                                  className="max-w-md"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="font-semibold text-foreground flex-1">
                                  {category.id}. {category.title}
                                </span>
                              )}

                              <Badge variant="outline" className="ml-auto">
                                {category.subCategories.length} alt kategori
                              </Badge>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingItem({ type: 'category', id: category.id })}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirm({ type: 'category', id: category.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="border-t border-border bg-muted/20">
                              <div className="p-4 space-y-3">
                                {category.subCategories.map((subCategory) => (
                                  <div key={subCategory.id} className="bg-card rounded-lg border border-border">
                                    <Collapsible
                                      open={expandedSubCategories.has(subCategory.id)}
                                      onOpenChange={() => toggleSubCategory(subCategory.id)}
                                    >
                                      <CollapsibleTrigger asChild>
                                        <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                          <div className="w-4" />
                                          {expandedSubCategories.has(subCategory.id) ? (
                                            <ChevronDown className="w-4 h-4 text-primary" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                          )}
                                          <FolderOpen className="w-4 h-4 text-amber-500" />

                                          {editingItem?.type === 'subcategory' && editingItem.id === subCategory.id ? (
                                            <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                                              <Input
                                                value={subCategory.title}
                                                onChange={(e) => updateSubCategory(category.id, subCategory.id, { title: e.target.value })}
                                                placeholder="Alt kategori başlığı"
                                                autoFocus
                                              />
                                              <Input
                                                value={subCategory.description || ''}
                                                onChange={(e) => updateSubCategory(category.id, subCategory.id, { description: e.target.value })}
                                                placeholder="Açıklama"
                                              />
                                              <Button size="sm" onClick={() => setEditingItem(null)}>Tamam</Button>
                                            </div>
                                          ) : (
                                            <span className="font-medium text-foreground flex-1">
                                              {subCategory.id}. {subCategory.title}
                                            </span>
                                          )}

                                          <Badge variant="outline" className="text-xs">
                                            {subCategory.rules.length} kural
                                          </Badge>

                                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setEditingItem({ type: 'subcategory', id: subCategory.id })}
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => setDeleteConfirm({
                                                type: 'subcategory',
                                                id: subCategory.id,
                                                parentId: category.id,
                                              })}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CollapsibleTrigger>

                                      <CollapsibleContent>
                                        <div className="border-t border-border p-3 space-y-2 bg-muted/10">
                                          {subCategory.rules.map((rule) => (
                                            <div key={rule.id} className="bg-card rounded border border-border p-3">
                                              {editingItem?.type === 'rule' && editingItem.id === rule.id ? (
                                                <div className="space-y-2">
                                                  <Input
                                                    value={rule.title}
                                                    onChange={(e) => updateRule(category.id, subCategory.id, rule.id, { title: e.target.value })}
                                                    placeholder="Kural başlığı"
                                                    autoFocus
                                                  />
                                                  <Textarea
                                                    value={rule.description}
                                                    onChange={(e) => updateRule(category.id, subCategory.id, rule.id, { description: e.target.value })}
                                                    placeholder="Kural açıklaması"
                                                    rows={3}
                                                  />
                                                  <Button size="sm" onClick={() => setEditingItem(null)}>Tamam</Button>
                                                </div>
                                              ) : (
                                                <div className="flex items-start gap-3">
                                                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <span className="font-medium text-foreground">
                                                        {rule.id}. {rule.title}
                                                      </span>
                                                      {rule.lastUpdate && (
                                                        <Badge variant="outline" className="text-xs">
                                                          {rule.lastUpdate}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                      {rule.description}
                                                    </p>
                                                  </div>
                                                  <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => setEditingItem({ type: 'rule', id: rule.id })}
                                                    >
                                                      <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="text-destructive hover:text-destructive"
                                                      onClick={() => setDeleteConfirm({
                                                        type: 'rule',
                                                        id: rule.id,
                                                        parentId: category.id,
                                                        subParentId: subCategory.id,
                                                      })}
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}

                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addRule(category.id, subCategory.id)}
                                            className="w-full gap-2"
                                          >
                                            <Plus className="w-3 h-3" />
                                            Kural Ekle
                                          </Button>
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                ))}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSubCategory(category.id)}
                                  className="w-full gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Alt Kategori Ekle
                                </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Kurallar Önizlemesi</h2>
              
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">Önizlenecek kural bulunmuyor</p>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => togglePreviewCategory(category.id)}
                          className="w-full flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                        >
                          {previewExpandedCats.includes(category.id) ? (
                            <ChevronDown className="w-5 h-5 text-primary" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-primary" />
                          )}
                          <span className="font-bold text-lg text-foreground">
                            {category.id}. {category.title}
                          </span>
                          <Badge className="ml-auto bg-primary/20 text-primary">
                            {category.subCategories.reduce((acc, sub) => acc + sub.rules.length, 0)} kural
                          </Badge>
                        </button>

                        {previewExpandedCats.includes(category.id) && (
                          <div className="p-4 space-y-3">
                            {category.subCategories.map((subCategory) => (
                              <div key={subCategory.id} className="border border-border/50 rounded-lg">
                                <button
                                  onClick={() => togglePreviewSubCategory(subCategory.id)}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  {previewExpandedSubs.includes(subCategory.id) ? (
                                    <ChevronDown className="w-4 h-4 text-amber-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-amber-500" />
                                  )}
                                  <span className="font-semibold text-foreground">
                                    {subCategory.id}. {subCategory.title}
                                  </span>
                                </button>

                                {previewExpandedSubs.includes(subCategory.id) && (
                                  <div className="px-4 pb-4 space-y-2">
                                    {subCategory.description && (
                                      <p className="text-sm text-muted-foreground italic mb-3">
                                        {subCategory.description}
                                      </p>
                                    )}
                                    {subCategory.rules.map((rule) => (
                                      <div
                                        key={rule.id}
                                        className="p-3 bg-muted/30 rounded-lg border-l-2 border-primary/50"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-foreground">
                                            {rule.id}. {rule.title}
                                          </span>
                                          {rule.lastUpdate && (
                                            <span className="text-xs text-muted-foreground">
                                              Güncelleme: {rule.lastUpdate}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {rule.description}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {deleteConfirm?.type === 'category' && 'Kategoriyi Sil'}
              {deleteConfirm?.type === 'subcategory' && 'Alt Kategoriyi Sil'}
              {deleteConfirm?.type === 'rule' && 'Kuralı Sil'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'category' && 'Bu kategori ve içindeki tüm alt kategoriler ve kurallar silinecek.'}
              {deleteConfirm?.type === 'subcategory' && 'Bu alt kategori ve içindeki tüm kurallar silinecek.'}
              {deleteConfirm?.type === 'rule' && 'Bu kural kalıcı olarak silinecek.'}
              {' '}Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteConfirm) return;
                if (deleteConfirm.type === 'category') {
                  deleteCategory(deleteConfirm.id);
                } else if (deleteConfirm.type === 'subcategory' && deleteConfirm.parentId) {
                  deleteSubCategory(deleteConfirm.parentId, deleteConfirm.id);
                } else if (deleteConfirm.type === 'rule' && deleteConfirm.parentId && deleteConfirm.subParentId) {
                  deleteRule(deleteConfirm.parentId, deleteConfirm.subParentId, deleteConfirm.id);
                }
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={importConfirm} onOpenChange={setImportConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Varsayılan Kuralları İçe Aktar</AlertDialogTitle>
            <AlertDialogDescription>
              Mevcut tüm kurallar silinip varsayılan kurallar ile değiştirilecek. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportDefaults}>
              İçe Aktar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RulesEditor;
