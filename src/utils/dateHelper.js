// Date utility functions for Stoic Companion app

// Azerbaijani month names
const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];

// Azerbaijani weekday names
const AZ_WEEKDAYS = [
  'Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə',
  'Cümə axşamı', 'Cümə', 'Şənbə',
];

/**
 * Returns today's date as a YYYY-MM-DD string (used as storage key)
 */
export function getTodayKey() {
  const now = new Date();
  return formatDateKey(now);
}

/**
 * Formats a Date object as YYYY-MM-DD
 */
export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns a Date object for a given YYYY-MM-DD string
 */
export function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns the Azerbaijani-formatted date string for today
 * e.g. "Çərşənbə, 23 Mart 2026"
 */
export function getAzerbaijaniDateString(date = new Date()) {
  const weekday = AZ_WEEKDAYS[date.getDay()];
  const day = date.getDate();
  const month = AZ_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

/**
 * Returns the appropriate Azerbaijani greeting based on current hour
 */
export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Səhəriniz xeyir';
  if (hour < 17) return 'Günortanız xeyir';
  return 'Axşamınız xeyir';
}

/**
 * Returns an integer representing the day-of-year (1-366)
 * Used for seeding the daily quote/challenge selection
 */
export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Returns an array of the last N days as YYYY-MM-DD strings (including today)
 * Ordered oldest → newest
 */
export function getLastNDays(n = 7) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDateKey(d));
  }
  return days;
}

/**
 * Formats a YYYY-MM-DD string as "D MMM" (short Azerbaijani format)
 * e.g. "23 Mar"
 */
export function formatShortDate(dateKey) {
  const date = parseDateKey(dateKey);
  const day = date.getDate();
  const month = AZ_MONTHS[date.getMonth()].slice(0, 3);
  return `${day} ${month}`;
}

/**
 * Returns true if the given dateKey is today
 */
export function isToday(dateKey) {
  return dateKey === getTodayKey();
}

/**
 * Returns true if date a is before date b (both YYYY-MM-DD strings)
 */
export function isBefore(a, b) {
  return a < b;
}

/**
 * Returns the difference in days between two YYYY-MM-DD strings
 */
export function daysBetween(dateKeyA, dateKeyB) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const dateA = parseDateKey(dateKeyA);
  const dateB = parseDateKey(dateKeyB);
  return Math.round((dateB - dateA) / msPerDay);
}
