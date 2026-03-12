import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Trash2, MessageSquareX, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function MyData() {
  const [loading, setLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const handleExport = async () => {
    setLoading('export');
    const res = await base44.functions.invoke('gdprExportData', {});
    const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lalatoto-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data eksporteret');
    setLoading(null);
  };

  const handleDelete = async (type) => {
    setConfirmDialog(null);
    setLoading(type);
    await base44.functions.invoke('gdprDeleteData', { type });
    toast.success(type === 'all' ? 'Konto og data slettet' : type === 'chat' ? 'Chathistorik slettet' : 'Lokationsdata slettet');
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
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Mine data & privatliv</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Export */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <Download className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Eksporter mine data</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Download alt data vi har gemt om dig</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl"
            variant="outline"
            disabled={loading === 'export'}
            onClick={handleExport}
          >
            {loading === 'export' ? 'Eksporterer...' : 'Download data (JSON)'}
          </Button>
        </div>

        {/* Delete chat */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <MessageSquareX className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Slet chathistorik</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sletter alle dine sendte beskeder</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl"
            variant="outline"
            disabled={loading === 'chat'}
            onClick={() => setConfirmDialog('chat')}
          >
            {loading === 'chat' ? 'Sletter...' : 'Slet chathistorik'}
          </Button>
        </div>

        {/* Delete location */}
        <div className="rounded-2xl p-5 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <Trash2 className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Slet lokationsdata</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Fjerner din gemt lokation og deaktiverer nærheds-funktionen</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl"
            variant="outline"
            disabled={loading === 'location'}
            onClick={() => setConfirmDialog('location')}
          >
            {loading === 'location' ? 'Sletter...' : 'Slet lokationsdata'}
          </Button>
        </div>

        {/* Delete account */}
        <div className="rounded-2xl p-5 border border-red-200 space-y-3" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-red-600">Slet min konto</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sletter al din data permanent — kan ikke fortrydes</p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white"
            disabled={loading === 'all'}
            onClick={() => setConfirmDialog('all')}
          >
            {loading === 'all' ? 'Sletter...' : 'Slet konto og al data'}
          </Button>
        </div>

        <p className="text-xs text-center pb-8" style={{ color: 'var(--color-text-muted)' }}>
          I henhold til GDPR har du ret til at tilgå, rette og slette dine personoplysninger.
        </p>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Er du sikker?</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {confirmDialog === 'all'
              ? 'Dette sletter din konto og al tilknyttet data permanent. Handlingen kan ikke fortrydes.'
              : confirmDialog === 'chat'
              ? 'Dette sletter alle dine sendte beskeder permanent.'
              : 'Dette fjerner din gemte lokation og deaktiverer nærheds-funktionen.'}
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDialog(null)}>Annuller</Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleDelete(confirmDialog)}
            >
              Ja, slet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}