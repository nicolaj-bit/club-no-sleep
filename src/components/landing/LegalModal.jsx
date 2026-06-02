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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
          style={{ backgroundColor: '#FFFDF9' }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b"
            style={{ backgroundColor: '#FFFDF9', borderColor: '#EDE4DB' }}>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
              {title}
            </h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: '#F3E9E1', color: '#5B3F2B' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C8A882', borderTopColor: 'transparent' }} />
              </div>
            ) : content?.content ? (
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed"
                style={{ color: '#3A2A1A' }}
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            ) : (
              <p className="text-center py-12 text-sm" style={{ color: '#9A7A6A' }}>
                Indholdet er endnu ikke tilgængeligt.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}