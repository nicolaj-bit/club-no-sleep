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
export const AGE_MILESTONES = [
  { months: 1, label: '1 måned', emoji: '🌙' },
  { months: 2, label: '2 måneder', emoji: '🌙' },
  { months: 3, label: '3 måneder', emoji: '🌙' },
  { months: 4, label: '4 måneder', emoji: '🌙' },
  { months: 5, label: '5 måneder', emoji: '🌙' },
  { months: 6, label: '6 måneder', emoji: '🌟' },
  { months: 7, label: '7 måneder', emoji: '🌙' },
  { months: 8, label: '8 måneder', emoji: '🌙' },
  { months: 9, label: '9 måneder', emoji: '🌙' },
  { months: 10, label: '10 måneder', emoji: '🌙' },
  { months: 11, label: '11 måneder', emoji: '🌙' },
  { months: 13, label: '13 måneder', emoji: '🌙' },
  { months: 14, label: '14 måneder', emoji: '🌙' },
  { months: 15, label: '15 måneder', emoji: '🌙' },
  { months: 16, label: '16 måneder', emoji: '🌙' },
  { months: 17, label: '17 måneder', emoji: '🌙' },
  { months: 18, label: '18 måneder', emoji: '🌙' },
  { months: 19, label: '19 måneder', emoji: '🌙' },
  { months: 20, label: '20 måneder', emoji: '🌙' },
  { months: 21, label: '21 måneder', emoji: '🌙' },
  { months: 22, label: '22 måneder', emoji: '🌙' },
  { months: 23, label: '23 måneder', emoji: '🌙' },
];

export const BIRTHDAY_MILESTONES = [
  { years: 1, label: '1 år', emoji: '🎂' },
  { years: 2, label: '2 år', emoji: '🎂' },
  { years: 3, label: '3 år', emoji: '🎂' },
];

// Check if a given day is an age milestone
export function getAgeMilestoneForDay(birthDateStr, day) {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  birthDate.setHours(0, 0, 0, 0);
  const target = new Date(day);
  target.setHours(0, 0, 0, 0);

  for (const m of AGE_MILESTONES) {
    const milestoneDate = addMonths(birthDate, m.months);
    milestoneDate.setHours(0, 0, 0, 0);
    if (isSameDay(milestoneDate, target)) {
      return {
        type: 'age_milestone',
        milestone_id: `age-${m.months}m`,
        title: m.label,
        emoji: m.emoji,
        headline: `${m.label} i dag`,
        message: m.months === 6
          ? 'Baby er et halvt år! Der ligger nye milepæle klar i appen.'
          : `Baby er ${m.label} i dag. Måske er der en milepæl, du har lyst til at gemme.`,
        link: '/Milestones',
      };
    }
  }

  for (const b of BIRTHDAY_MILESTONES) {
    const milestoneDate = addYears(birthDate, b.years);
    milestoneDate.setHours(0, 0, 0, 0);
    if (isSameDay(milestoneDate, target)) {
      return {
        type: 'birthday',
        milestone_id: `age-${b.years}y`,
        title: b.label,
        emoji: b.emoji,
        headline: `${b.label} i dag`,
        message: `Tillykke med ${b.label}-fødselsdagen! Gem dagen med en milepæl, hvis du har lyst.`,
        link: '/Milestones',
      };
    }
  }

  return null;
}

// Check if a given day is the start of a wonder week
export function getWonderWeekForDay(dueDateStr, day) {
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
        emoji: ww.emoji,
        title: `Tigerspring ${ww.number}`,
        headline: `Tigerspring ${ww.number} – ${ww.name}`,
        message: 'Et nyt tigerspring nærmer sig. Læs mere, hvis du har brug for lidt overblik.',
        link: '/Knowledge',
      };
    }
  }

  return null;
}

// Get all dynamic (calculated) items for a given day
export function getDynamicItemsForDay(dueDate, birthDate, day) {
  const items = [];
  const mode = getCalendarMode(dueDate, birthDate);

  // Pregnancy weeks (only in pregnancy mode — no birth date yet)
  if (mode === 'pregnancy' && isPregnancyWeekStart(dueDate, day)) {
    const week = getPregnancyWeek(dueDate, day);
    if (week >= 4 && week <= 42) {
      items.push({
        type: 'pregnancy_week',
        title: `Graviditetsuge ${week}`,
        emoji: '🤰',
        headline: `Uge ${week}`,
        message: 'Der ligger en lille opdatering klar til dig.',
        link: '/PregnancyWeeks',
      });
    }
  }

  // Age milestones (only in baby mode)
  if (mode === 'baby') {
    const milestone = getAgeMilestoneForDay(birthDate, day);
    if (milestone) items.push(milestone);
  }

  // Wonder weeks (always, based on due date — never birth date)
  const wonderWeek = getWonderWeekForDay(dueDate, day);
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