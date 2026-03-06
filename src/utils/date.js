export function monthIdFromDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function parseMonthId(monthId) {
  const [yearStr, monthStr] = monthId.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return new Date()
  }

  return new Date(year, month - 1, 1)
}

export function monthLabelFromId(monthId, locale = 'en-US') {
  const date = parseMonthId(monthId)
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function addMonths(monthId, amount) {
  const date = parseMonthId(monthId)
  date.setMonth(date.getMonth() + amount)
  return monthIdFromDate(date)
}
