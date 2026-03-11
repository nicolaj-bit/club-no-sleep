import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { base44 } from '@/api/base44Client';

export function useTranslation(items) {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState({});
  const cacheRef = useRef({});

  useEffect(() => {
    if (lang !== 'en' || !items || items.length === 0) {
      setTranslated({});
      return;
    }

    // Build cache key from items
    const cacheKey = JSON.stringify(items);
    if (cacheRef.current[cacheKey]) {
      setTranslated(cacheRef.current[cacheKey]);
      return;
    }

    // Prepare translation request
    const prompt = `Translate these Danish items to English. Return ONLY valid JSON with the same structure.
${JSON.stringify(items)}

Return exactly the same structure but with translated text fields (title, content, label, category, excerpt, etc).`;

    base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        additionalProperties: true
      }
    }).then(result => {
      cacheRef.current[cacheKey] = result;
      setTranslated(result);
    }).catch(() => {
      setTranslated({});
    });
  }, [items, lang]);

  return translated;
}