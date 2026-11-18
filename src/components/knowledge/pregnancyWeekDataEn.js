// Samler de engelske graviditetsuger og laegger dem oven paa de danske.
//
// Teksten er delt i to filer, fordi hele saettet er for stort til én.
// Tallene (ugenummer) og linkUrl staar kun i den danske pregnancyWeekData.jsx,
// saa de to sprog ikke kan pege forskellige steder hen.

import { PREGNANCY_WEEKS_EN_1 } from './pregnancyWeekDataEn1';
import { PREGNANCY_WEEKS_EN_2 } from './pregnancyWeekDataEn2';

export const PREGNANCY_WEEKS_EN = {
  ...PREGNANCY_WEEKS_EN_1,
  ...PREGNANCY_WEEKS_EN_2,
};

/**
 * Giv ugens tekst paa det valgte sprog.
 * Paa dansk returneres ugen uaendret. Mangler den engelske udgave for en uge,
 * vises den danske — saa bliver ugen ikke tom.
 */
export function localizePregnancyWeek(data, week, lang) {
  if (!data || lang !== 'en') return data;
  const en = PREGNANCY_WEEKS_EN[week];
  if (!en) return data;
  return { ...data, ...en, linkUrl: data.linkUrl };
}

export default PREGNANCY_WEEKS_EN;
