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
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full sm:max-w-2xl flex flex-col"
          style={{
            backgroundColor: '#FFFDF9',
            maxHeight: '90vh',
            borderRadius: '20px 20px 0 0',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Sticky header */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
            style={{ borderColor: '#EDE4DB' }}
          >
            <h2
              className="text-lg font-semibold tracking-wide"
              style={{ color: '#2B1F16', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ backgroundColor: '#F0E8DF', color: '#5B3F2B' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div className="flex justify-center py-12">
                <div
                  className="w-6 h-6 rounded-full border-2 animate-spin"
                  style={{ borderColor: '#EDE4DB', borderTopColor: '#C8A882' }}
                />
              </div>
            ) : content?.content ? (
              <div
                className="legal-content"
                style={{ color: '#2B1F16' }}
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            ) : (
              <p className="text-center py-12 text-sm" style={{ color: '#9A7A6A' }}>
                Indholdet er endnu ikke tilgængeligt.
              </p>
            )}
          </div>

          {/* Safe area bottom */}
          <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
        </motion.div>
      </div>

      <style>{`
        .legal-content {
          font-size: 15px;
          line-height: 1.75;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .legal-content p {
          margin-bottom: 1rem;
          color: #3A2A1A;
        }
        .legal-content h1, .legal-content h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #2B1F16;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #2B1F16;
          margin-top: 1.25rem;
          margin-bottom: 0.4rem;
        }
        .legal-content ul, .legal-content ol {
          padding-left: 1.4rem;
          margin-bottom: 1rem;
        }
        .legal-content li {
          margin-bottom: 0.4rem;
          color: #3A2A1A;
        }
        .legal-content strong {
          font-weight: 600;
          color: #2B1F16;
        }
        .legal-content a {
          color: #8B6348;
          text-decoration: underline;
        }
      `}</style>
    </AnimatePresence>
  );
}