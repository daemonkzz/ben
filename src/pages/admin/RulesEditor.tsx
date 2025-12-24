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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import type { MainCategory, SubCategory, Rule, RulesData } from '@/types/rules';

const RulesEditor = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [rulesId, setRulesId] = useState<string | null>(null);
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // UI State
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ type: 'category' | 'subcategory' | 'rule'; id: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'subcategory' | 'rule'; id: string; parentId?: string; subParentId?: string } | null>(null);

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
        setCategories((data.data as MainCategory[]) || []);
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
    const today = new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    setCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(sub => {
          if (sub.id !== subCategoryId) return sub;
          return {
            ...sub,
            rules: sub.rules.map(rule =>
              rule.id === ruleId ? { ...rule, ...updates, lastUpdate: today } : rule
            ),
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

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add Category Button */}
            <div className="flex justify-end">
              <Button onClick={addCategory} className="gap-2">
                <Plus className="w-4 h-4" />
                Ana Kategori Ekle
              </Button>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-lg border border-border">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Henüz kural kategorisi eklenmemiş</p>
                <Button onClick={addCategory} className="gap-2">
                  <Plus className="w-4 h-4" />
                  İlk Kategoriyi Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category, catIndex) => (
                  <div key={category.id} className="bg-card rounded-lg border border-border overflow-hidden">
                    {/* Category Header */}
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
                          {/* SubCategories */}
                          <div className="p-4 space-y-3">
                            {category.subCategories.map((subCategory, subIndex) => (
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
                                            placeholder="Açıklama (opsiyonel)"
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
                                      {/* Rules */}
                                      {subCategory.rules.map((rule, ruleIndex) => (
                                        <div
                                          key={rule.id}
                                          className="bg-card rounded border border-border p-3"
                                        >
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

                                      {/* Add Rule Button */}
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

                            {/* Add SubCategory Button */}
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
    </div>
  );
};

export default RulesEditor;
