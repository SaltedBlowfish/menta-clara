import { getISOWeek } from 'date-fns/getISOWeek';
import { getISOWeekYear } from 'date-fns/getISOWeekYear';

export function getWeekId(date: Date): string {
  const week = getISOWeek(date);
  const year = getISOWeekYear(date);

  return `weekly:${String(year)}-W${String(week).padStart(2, '0')}`;
}

export function getWeekNumber(date: Date): number {
  return getISOWeek(date);
}
