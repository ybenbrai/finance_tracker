function roundToTwo(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? roundToTwo(parsed) : 0
}

export const CURRENCY_OPTIONS = [
  { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: 'EUR €' },
  { code: 'MAD', label: 'MAD' },
]

export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value))
}

export function formatNumberInput(value, locale = 'en-US') {
  return toNumber(value).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parseFormattedNumber(value) {
  const normalized = String(value ?? '').replace(/,/g, '.').replace(/\s+/g, '')
  const cleaned = normalized.replace(/[^\d.-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.') {
    return 0
  }

  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed)) {
    return 0
  }

  return parsed
}
