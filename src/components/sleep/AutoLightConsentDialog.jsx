import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Blid samtykke-forespørgsel der vises første gang funktionen ville tænde et lys.
// onAccept: bruger siger ja → gem true + tænd lys
// onDecline: bruger siger nej → gem false, spørg ikke igen
// onClose: bruger lukker dialogen uden at svare → spørg igen næste gang
export default function AutoLightConsentDialog({ open, onAccept, onDecline, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && onClose) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">🕯</span>
            Tænde dit lys?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Må vi tænde dit lys, når du er vågen? Så kan andre vågne mødre se, at de ikke er alene.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Vi viser aldrig dit navn eller din præcise placering.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onDecline}
              className="flex-1 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Nej tak
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Ja, tænd mit lys
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}