import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LegalModal({ type, title, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.LegalContent.filter({ type })
      .then(results => setContent(results[0] || null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-lg"
          style={{ backgroundColor: '#FFFDF9' }}
          onClick={e => e.stopPropagation()}>

          {/* Close Button */}
          <button onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
            style={{ backgroundColor: '#F3E9E1', color: '#5B3F2B' }}>
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="px-12 py-12 sm:px-16 sm:py-14">
            {/* Title */}
            <h1 className="text-center mb-12 text-3xl tracking-wider uppercase"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16', letterSpacing: '0.08em' }}>
              {title}
            </h1>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C8A882', borderTopColor: 'transparent' }} />
              </div>
            ) : content?.content ? (
              <div
                className="text-base leading-relaxed space-y-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-justify [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:mb-2 [&_strong]:font-semibold"
                style={{ color: '#3A2A1A' }}
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            ) : (
              <p className="text-center py-16 text-sm" style={{ color: '#9A7A6A' }}>
                Indholdet er endnu ikke tilgængeligt.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}