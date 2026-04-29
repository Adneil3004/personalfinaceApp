/**
 * Formats a Date object to YYYY-MM-DD string in local time.
 * This avoids the timezone shift issue common with .toISOString()
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
