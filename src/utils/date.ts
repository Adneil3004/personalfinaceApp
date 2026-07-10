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

// Viernes de pago confirmado, usado como ancla del ciclo catorcenal (nómina cada 14 días, viernes).
const PAYDAY_ANCHOR = new Date(2026, 4, 1); // 1 mayo 2026
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calcula el inicio (YYYY-MM-DD) del periodo catorcenal de nómina vigente para una fecha dada,
 * asumiendo depósitos cada 14 días exactos a partir de PAYDAY_ANCHOR (un viernes de pago confirmado).
 */
export const getCurrentPayPeriodStart = (today: Date): string => {
  const daysSinceAnchor = Math.floor((today.getTime() - PAYDAY_ANCHOR.getTime()) / MS_PER_DAY);
  const periodsElapsed = Math.floor(daysSinceAnchor / 14);
  const periodStart = new Date(PAYDAY_ANCHOR.getTime() + periodsElapsed * 14 * MS_PER_DAY);
  return formatLocalDate(periodStart);
};
