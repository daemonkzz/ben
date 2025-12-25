import { useNavigate } from 'react-router-dom';
import { Loader2, FileText, Check, X, Filter, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Application, FormTemplate, ApplicationFilterType } from '@/types/application';
import type { FormType } from '@/types/formBuilder';
import { formatDateTime } from '@/lib/formatters';
import { getStatusConfig } from '@/constants/status';

interface ApplicationsTabProps {
  applications: Application[];
  formTemplates: FormTemplate[];
  isLoading: boolean;
  updatingId: number | null;
  applicationFilter: ApplicationFilterType;
  setApplicationFilter: (filter: ApplicationFilterType) => void;
  updateApplicationStatus: (id: number, status: 'approved' | 'rejected') => Promise<void>;
}

export const ApplicationsTab = ({
  applications,
  formTemplates,
  isLoading,
  updatingId,
  applicationFilter,
  setApplicationFilter,
  updateApplicationStatus,
}: ApplicationsTabProps) => {
  const navigate = useNavigate();

  const getFormType = (template: FormTemplate): FormType => {
    return (template.settings as any)?.formType || 'other';
  };

  const getFormTypeByFormId = (formId: string): FormType => {
    const template = formTemplates.find(t => t.id === formId);
    if (template) {
      return getFormType(template);
    }
    return 'other';
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <Badge className={`${config.bgClass} ${config.textClass} ${config.borderClass}`}>
        {config.label}
      </Badge>
    );
  };

  const getCharacterName = (content: Record<string, string>) => {
    const nameKeys = Object.keys(content).filter(key => 
      key.toLowerCase().includes('karakter') || 
      key.toLowerCase().includes('character') ||
      key.toLowerCase().includes('isim') ||
      key.toLowerCase().includes('ad')
    );
    if (nameKeys.length > 0) {
      return content[nameKeys[0]] || 'Belirtilmemiş';
    }
    const values = Object.values(content);
    return values[0] || 'Belirtilmemiş';
  };

  const getFormTypeName = (type: string) => {
    const template = formTemplates.find(t => t.id === type);
    if (template) return template.title;
    return type;
  };

  const filteredApplications = applications.filter(app => {
    if (applicationFilter === 'all') return true;
    const formType = getFormTypeByFormId(app.type);
    return formType === applicationFilter;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Başvurular</h2>
          <p className="text-muted-foreground">Tüm başvuruları görüntüle ve yönet</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={applicationFilter} onValueChange={(v) => setApplicationFilter(v as ApplicationFilterType)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Başvurular</SelectItem>
              <SelectItem value="whitelist">Whitelist Başvuruları</SelectItem>
              <SelectItem value="other">Diğer Başvurular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {applicationFilter === 'all' 
              ? 'Henüz başvuru bulunmuyor'
              : applicationFilter === 'whitelist'
              ? 'Whitelist başvurusu bulunmuyor'
              : 'Diğer başvuru bulunmuyor'
            }
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Başvuran</TableHead>
                <TableHead className="text-muted-foreground">Form</TableHead>
                <TableHead className="text-muted-foreground">Tip</TableHead>
                <TableHead className="text-muted-foreground">Tarih</TableHead>
                <TableHead className="text-muted-foreground">Durum</TableHead>
                <TableHead className="text-muted-foreground text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => {
                const formType = getFormTypeByFormId(app.type);
                return (
                  <TableRow 
                    key={app.id} 
                    className="border-border cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/basvuru/${app.id}`)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {getCharacterName(app.content as Record<string, string>)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {getFormTypeName(app.type)}
                    </TableCell>
                    <TableCell>
                      {formType === 'whitelist' ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Whitelist
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Diğer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(app.created_at)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                          onClick={() => updateApplicationStatus(app.id, 'approved')}
                          disabled={updatingId === app.id || app.status === 'approved'}
                        >
                          {updatingId === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span className="ml-1">Onayla</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          onClick={() => updateApplicationStatus(app.id, 'rejected')}
                          disabled={updatingId === app.id || app.status === 'rejected'}
                        >
                          {updatingId === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span className="ml-1">Reddet</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;
