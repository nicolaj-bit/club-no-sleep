import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Trash2, MessageSquareX, AlertTriangle, FileText, Upload, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function MyData() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [user, setUser] = useState(null);
  const [legalDocs, setLegalDocs] = useState({ terms: null, privacy: null });
  const [uploadingType, setUploadingType] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    loadLegalDocs();
  }, []);

  const loadLegalDocs = async () => {
    const results = await base44.entities.LegalContent.list();
    const terms = results.find(r => r.type === 'terms') || null;
    const privacy = results.find(r => r.type === 'privacy') || null;
    setLegalDocs({ terms, privacy });
  };

  const handlePdfUpload = async (type, file) => {
    if (!file) return;
    setUploadingType(type);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const existing = legalDocs[type];
    if (existing?.id) {
      await base44.entities.LegalContent.update(existing.id, { pdf_url: file_url });
    } else {
      await base44.entities.LegalContent.create({
        type,
        title: type === 'terms' ? t.termsTitle : t.privacyTitle,
        content: '',
        pdf_url: file_url,
      });
    }
    await loadLegalDocs();
    toast.success(`${t.myDataPdfUploadedFor} ${type === 'terms' ? t.myDataTermsLower : t.myDataPrivacyLower}`);
    setUploadingType(null);
  };

  const handleExport = async () => {
    setLoading('export');
    const res = await base44.functions.invoke('gdprExportData', {});
    const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lalatoto-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success(t.myDataExported);
    setLoading(null);
  };

  const handleDelete = async (type) => {
    setConfirmDialog(null);
    setLoading(type);
    await base44.functions.invoke('gdprDeleteData', { type });
    toast.success(type === 'all' ? t.myDataAccountDeleted : type === 'chat' ? t.myDataChatDeleted : t.myDataLocationDeleted);
    setLoading(null);
    if (type === 'all') {
      base44.auth.logout(createPageUrl('Home'));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
        <Link to={createPageUrl('Profile')} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </Link>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.myDataPrivacy}</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Export */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <Download className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.myDataExportTitle}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.myDataExportDesc}</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl"
            variant="outline"
            disabled={loading === 'export'}
            onClick={handleExport}
          >
            {loading === 'export' ? t.myDataExporting : t.myDataDownloadJson}
          </Button>
        </div>

        {/* Delete chat */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <MessageSquareX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.myDataDeleteChatTitle}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.myDataDeleteChatDesc}</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl"
            variant="outline"
            disabled={loading === 'chat'}
            onClick={() => setConfirmDialog('chat')}
          >
            {loading === 'chat' ? t.myDataDeleting : t.myDataDeleteChatBtn}
          </Button>
        </div>

        {/* Delete location */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <Trash2 className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.myDataDeleteLocationTitle}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.myDataDeleteLocationDesc}</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl"
            variant="outline"
            disabled={loading === 'location'}
            onClick={() => setConfirmDialog('location')}
          >
            {loading === 'location' ? t.myDataDeleting : t.myDataDeleteLocationBtn}
          </Button>
        </div>

        {/* Delete account */}
        <div className="rounded-2xl p-5 border border-red-200 space-y-3" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-red-600">{t.myDataDeleteAccountTitle}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.myDataDeleteAccountDesc}</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white"
            disabled={loading === 'all'}
            onClick={() => setConfirmDialog('all')}
          >
            {loading === 'all' ? t.myDataDeleting : t.myDataDeleteAccountBtn}
          </Button>
        </div>

        <p className="text-xs text-center pb-8" style={{ color: 'var(--color-text-muted)' }}>
          {t.myDataGdprNote}
        </p>

        {/* Admin: PDF upload til juridiske dokumenter */}
        {user?.role === 'admin' && (
          <div className="rounded-2xl p-5 border space-y-4" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.myDataLegalDocsAdmin}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.myDataUploadPdfDesc}</p>
              </div>
            </div>

            {[
              { type: 'terms', label: t.termsTitle },
              { type: 'privacy', label: t.privacyTitle },
            ].map(({ type, label }) => (
              <div key={type} className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                {legalDocs[type]?.pdf_url && (
                  <a
                    href={legalDocs[type].pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg w-fit"
                    style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t.myDataViewCurrentPdf}
                  </a>
                )}
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm w-fit"
                  style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <Upload className="w-4 h-4" />
                  {uploadingType === type ? t.uploadingLabel : legalDocs[type]?.pdf_url ? t.myDataReplacePdf : t.myDataUploadPdf}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={uploadingType === type}
                    onChange={(e) => handlePdfUpload(type, e.target.files?.[0])}
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.myDataAreYouSure}</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {confirmDialog === 'all'
              ? t.myDataConfirmDeleteAccount
              : confirmDialog === 'chat'
              ? t.myDataConfirmDeleteChat
              : t.myDataConfirmDeleteLocation}
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDialog(null)}>{t.aboutUsCancel}</Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleDelete(confirmDialog)}
            >
              {t.myDataYesDelete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}