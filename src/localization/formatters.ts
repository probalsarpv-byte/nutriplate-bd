import { Language } from './translations';

const BENGALI_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '.': '.',
};

export function formatNumber(
  value: number | string | null | undefined,
  language: Language = 'bn',
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '—';
  }

  const num = Number(value);
  const maxDigits = options?.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 1;
  const minDigits = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;

  const formattedEn = num.toLocaleString('en-US', {
    maximumFractionDigits: maxDigits,
    minimumFractionDigits: minDigits,
  });

  if (language === 'en') {
    return formattedEn;
  }

  return formattedEn
    .split('')
    .map((char) => BENGALI_DIGITS[char] || char)
    .join('');
}

export function formatEnergy(kcal: number | null | undefined, language: Language = 'bn'): string {
  if (kcal === null || kcal === undefined) return '—';
  const val = formatNumber(Math.round(kcal), language);
  return language === 'bn' ? `${val} ক্যালরি` : `${val} kcal`;
}

export function formatGrams(grams: number | null | undefined, language: Language = 'bn'): string {
  if (grams === null || grams === undefined) return '—';
  const val = formatNumber(grams, language, { maximumFractionDigits: 1 });
  return language === 'bn' ? `${val} গ্রাম` : `${val} g`;
}
