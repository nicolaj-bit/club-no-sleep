import { addMonths, addYears, isSameDay } from 'date-fns';
import { WONDER_WEEKS } from '@/components/wonderweeks/wonderweeksData';

// Determine calendar mode based on dates
export function getCalendarMode(dueDate, birthDate) {
  if (birthDate) return 'baby';
  if (dueDate) return 'pregnancy';
  return 'none';
}

// Calculate pregnancy week from due date (week 40 = due date)
export function getPregnancyWeek(dueDateStr, onDate = new Date()) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const target = new Date(onDate);
  target.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((due - target) / (24 * 60 * 60 * 1000));
  return 40 - Math.floor(daysUntilDue / 7);
}

// Check if a given date is the start of a new pregnancy week
export function isPregnancyWeekStart(dueDateStr, onDate = new Date()) {
  if (!dueDateStr) return false;
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const target = new Date(onDate);
  target.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((due - target) / (24 * 60 * 60 * 1000));
  return daysUntilDue % 7 === 0;
}

// Age milestones (months 1-23, skip 12 = birthday)
// Sproget vælges her i filen frem for med oversættelsesnøgler, fordi teksterne
// bygges af tal. 25 nøgler fra «1 måned» til «23 måneder» skulle holdes i sync
// i hånden, og de to sprog bøjer ikke ens: dansk år hedder år i både éntal og
// flertal, engelsk year bliver til years.
const L = (lang, da, en) => (lang === 'en' ? en : da);

// 12 måneder mangler med vilje — det er 1 år og håndteres som fødselsdag.
export const AGE_MILESTONES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
].map((months) => ({ months }));

export const BIRTHDAY_MILESTONES = [1, 2, 3].map((years) => ({ years }));

/** «1 måned» / «3 måneder» — «1 month» / «3 months». */
export function formatAgeLabel(months, lang) {
  if (lang === 'en') return `${months} ${months === 1 ? 'month' : 'months'}`;
  return `${months} ${months === 1 ? 'måned' : 'måneder'}`;
}

/** «1 år» / «3 år» — «1 year» / «3 years». */
export function formatBirthdayLabel(years, lang) {
  if (lang === 'en') return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years} år`;
}

// Check if a given day is an age milestone
export function getAgeMilestoneForDay(birthDateStr, day, lang) {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  birthDate.setHours(0, 0, 0, 0);
  const target = new Date(day);
  target.setHours(0, 0, 0, 0);

  for (const m of AGE_MILESTONES) {
    const milestoneDate = addMonths(birthDate, m.months);
    milestoneDate.setHours(0, 0, 0, 0);
    if (isSameDay(milestoneDate, target)) {
      const label = formatAgeLabel(m.months, lang);
      return {
        type: 'age_milestone',
        milestone_id: `age-${m.months}m`,
        title: label,
        headline: L(lang, `${label} i dag`, `${label} today`),
        message: m.months === 6
          ? L(
              lang,
              'Baby er et halvt år! Der ligger nye milepæle klar i appen.',
              'Baby is six months old! New milestones are ready in the app.'
            )
          : L(
              lang,
              `Baby er ${label} i dag. Måske er der en milepæl, du har lyst til at gemme.`,
              `Baby is ${label} today. Perhaps there is a milestone you would like to save.`
            ),
        link: '/Milestones',
      };
    }
  }

  for (const b of BIRTHDAY_MILESTONES) {
    const milestoneDate = addYears(birthDate, b.years);
    milestoneDate.setHours(0, 0, 0, 0);
    if (isSameDay(milestoneDate, target)) {
      const label = formatBirthdayLabel(b.years, lang);
      return {
        type: 'birthday',
        milestone_id: `age-${b.years}y`,
        title: label,
        headline: L(lang, `${label} i dag`, `${label} today`),
        message: L(
          lang,
          `Tillykke med ${label}-fødselsdagen! Gem dagen med en milepæl, hvis du har lyst.`,
          `Happy ${label} birthday! Save the day with a milestone if you like.`
        ),
        link: '/Milestones',
      };
    }
  }

  return null;
}

// Check if a given day is the start of a wonder week
export function getWonderWeekForDay(dueDateStr, day, lang) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const target = new Date(day);
  target.setHours(0, 0, 0, 0);

  const daysSinceDue = Math.round((target - due) / (24 * 60 * 60 * 1000));
  if (daysSinceDue < 0) return null;

  const weeksSinceDue = Math.floor(daysSinceDue / 7);

  for (const ww of WONDER_WEEKS) {
    if (weeksSinceDue === ww.weekStart) {
      return {
        type: 'wonder_week',
        milestone_id: `ww-${ww.number}`,
        number: ww.number,
        name: ww.name,
        // ww.name kommer fra tigerspringsindholdet og er stadig dansk — det
        // oversættes sammen med resten af de store indholdssæt.
        title: L(lang, `Tigerspring ${ww.number}`, `Leap ${ww.number}`),
        headline: L(
          lang,
          `Tigerspring ${ww.number} – ${ww.name}`,
          `Leap ${ww.number} – ${ww.name}`
        ),
        message: L(
          lang,
          'Et nyt tigerspring nærmer sig. Læs mere, hvis du har brug for lidt overblik.',
          'A new leap is coming up. Read more if you would like an overview.'
        ),
        link: '/Knowledge',
      };
    }
  }

  return null;
}

// Get all dynamic (calculated) items for a given day
export function getDynamicItemsForDay(dueDate, birthDate, day, lang) {
  const items = [];
  const mode = getCalendarMode(dueDate, birthDate);

  // Pregnancy weeks (only in pregnancy mode — no birth date yet)
  if (mode === 'pregnancy' && isPregnancyWeekStart(dueDate, day)) {
    const week = getPregnancyWeek(dueDate, day);
    if (week >= 4 && week <= 42) {
      items.push({
        type: 'pregnancy_week',
        week,
        title: L(lang, `Graviditetsuge ${week}`, `Pregnancy week ${week}`),
        headline: L(lang, `Uge ${week}`, `Week ${week}`),
        message: L(
          lang,
          'Der ligger en lille opdatering klar til dig.',
          'A small update is ready for you.'
        ),
        link: `/PregnancyWeekDetail?week=${week}`,
      });
    }
  }

  // Age milestones (only in baby mode)
  if (mode === 'baby') {
    const milestone = getAgeMilestoneForDay(birthDate, day, lang);
    if (milestone) items.push(milestone);
  }

  // Wonder weeks (always, based on due date — never birth date)
  const wonderWeek = getWonderWeekForDay(dueDate, day, lang);
  if (wonderWeek) items.push(wonderWeek);

  return items;
}

// Get baby's age in months
export function getBabyAgeInMonths(birthDateStr) {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  const now = new Date();
  let months = (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());
  if (now.getDate() < birthDate.getDate()) months--;
  return Math.max(0, months);
}