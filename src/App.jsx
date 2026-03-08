import { useEffect, useMemo, useReducer, useState } from 'react'
import MonthTabs from './components/MonthTabs'
import CategoryRow from './components/CategoryRow'
import SummaryCards from './components/SummaryCards'
import ExpensePieChart from './components/charts/ExpensePieChart'
import SavingsLineChart from './components/charts/SavingsLineChart'
import BenefitBreakdownPieChart from './components/charts/BenefitBreakdownPieChart'
import BenefitTrendLineChart from './components/charts/BenefitTrendLineChart'
import ImportExportPanel from './components/ImportExportPanel'
import NumberInput from './components/NumberInput'
import IconPicker from './components/IconPicker'
import ConfirmModal from './components/ConfirmModal'
import {
  BENEFIT_WALLETS,
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_META,
  DEFAULT_FORECAST_HORIZON,
  LANGUAGE_OPTIONS,
  STORAGE_KEY,
  THEME_OPTIONS,
} from './constants'
import { addMonths, monthIdFromDate, monthLabelFromId } from './utils/date'
import { CURRENCY_OPTIONS, formatCurrency, toNumber } from './utils/format'
import { forecastSeriesValue, generateForecastMonths } from './utils/forecast'
import { getTranslation } from './i18n'

function getAllCategoriesFromState(stateLike) {
  const removedDefaults = Array.isArray(stateLike?.removedDefaultCategories)
    ? stateLike.removedDefaultCategories
    : []
  const customCategories = Array.isArray(stateLike?.customCategories)
    ? stateLike.customCategories
    : []

  const defaultCategories = DEFAULT_CATEGORIES.filter(
    (category) => !removedDefaults.includes(category),
  )

  return [...defaultCategories, ...customCategories]
}

function buildCategoryMetaMap(allCategories, customCategories, incomingMeta = {}) {
  return allCategories.reduce((acc, category) => {
    const baseMeta = DEFAULT_CATEGORY_META[category] || {}
    const savedMeta = incomingMeta?.[category] || {}
    acc[category] = {
      icon: String(savedMeta.icon || baseMeta.icon || '•').trim() || '•',
      label:
        String(savedMeta.label || baseMeta.label || (customCategories.includes(category) ? 'custom' : 'default')).trim() ||
        (customCategories.includes(category) ? 'custom' : 'default'),
    }
    return acc
  }, {})
}

function buildBenefitSettingsMap(incoming = {}) {
  return Object.entries(BENEFIT_WALLETS).reduce((acc, [key, config]) => {
    const source = incoming?.[key] || {}
    acc[key] = {
      enabled:
        typeof source.enabled === 'boolean' ? source.enabled : true,
      monthlyCredit: Math.max(0, toNumber(source.monthlyCredit ?? config.defaultCredit)),
      rollover:
        typeof source.rollover === 'boolean' ? source.rollover : config.rollover,
    }
    return acc
  }, {})
}

function buildBenefitUsageMap(incoming = {}) {
  return Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
    acc[key] = Math.max(0, toNumber(incoming?.[key]))
    return acc
  }, {})
}

function buildBenefitOpeningBalancesMap(incoming = {}) {
  return Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
    acc[key] = Math.max(0, toNumber(incoming?.[key]))
    return acc
  }, {})
}

function titleCase(value) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function buildCategoryMap(categories) {
  return categories.reduce((acc, category) => {
    acc[category] = 0
    return acc
  }, {})
}

function buildMonth(id, categories) {
  return {
    id,
    label: monthLabelFromId(id),
    income: 0,
    extraIncome: 0,
    categories: buildCategoryMap(categories),
    benefitUsage: buildBenefitUsageMap(),
  }
}

function createDefaultState() {
  const todayId = monthIdFromDate(new Date())
  return {
    months: [buildMonth(todayId, DEFAULT_CATEGORIES)],
    activeMonthId: todayId,
    customCategories: [],
    removedDefaultCategories: [],
    categoryMeta: buildCategoryMetaMap(DEFAULT_CATEGORIES, []),
    benefitsSettings: buildBenefitSettingsMap(),
    benefitOpeningBalances: buildBenefitOpeningBalancesMap(),
    includeBenefitsInNet: false,
    openingBalance: 0,
    language: 'en',
    theme: 'midnight',
    forecastHorizon: DEFAULT_FORECAST_HORIZON,
    currency: 'USD',
  }
}

function normalizeState(rawState) {
  const customCategories = Array.isArray(rawState?.customCategories)
    ? rawState.customCategories.filter(Boolean)
    : []
  let removedDefaultCategories = Array.isArray(rawState?.removedDefaultCategories)
    ? rawState.removedDefaultCategories.filter((category) =>
        DEFAULT_CATEGORIES.includes(category),
      )
    : []

  let allCategories = getAllCategoriesFromState({
    customCategories,
    removedDefaultCategories,
  })
  if (!allCategories.length) {
    removedDefaultCategories = DEFAULT_CATEGORIES.slice(1)
    allCategories = [DEFAULT_CATEGORIES[0]]
  }
  const categoryMeta = buildCategoryMetaMap(
    allCategories,
    customCategories,
    rawState?.categoryMeta,
  )
  const benefitsSettings = buildBenefitSettingsMap(rawState?.benefitsSettings)
  const benefitOpeningBalances = buildBenefitOpeningBalancesMap(
    rawState?.benefitOpeningBalances,
  )

  const monthsFromState = Array.isArray(rawState?.months) ? rawState.months : []
  const months = monthsFromState.map((month) => {
    const categories = allCategories.reduce((acc, category) => {
      acc[category] = toNumber(month?.categories?.[category])
      return acc
    }, {})

    return {
      id: month?.id || monthIdFromDate(new Date()),
      label: month?.label || monthLabelFromId(month?.id || monthIdFromDate(new Date())),
      income: toNumber(month?.income),
      extraIncome: toNumber(month?.extraIncome),
      categories,
      benefitUsage: buildBenefitUsageMap(month?.benefitUsage),
    }
  })

  const safeMonths = months.length ? months : [buildMonth(monthIdFromDate(new Date()), allCategories)]

  const activeMonthId = safeMonths.some((month) => month.id === rawState?.activeMonthId)
    ? rawState.activeMonthId
    : safeMonths[safeMonths.length - 1].id

  return {
    months: safeMonths,
    activeMonthId,
    customCategories,
    removedDefaultCategories,
    categoryMeta,
    benefitsSettings,
    benefitOpeningBalances,
    includeBenefitsInNet: Boolean(rawState?.includeBenefitsInNet),
    openingBalance: Math.max(0, toNumber(rawState?.openingBalance)),
    language: LANGUAGE_OPTIONS.some((option) => option.code === rawState?.language)
      ? rawState.language
      : 'en',
    theme: THEME_OPTIONS.some((option) => option.code === rawState?.theme)
      ? rawState.theme
      : 'midnight',
    currency: CURRENCY_OPTIONS.some((option) => option.code === rawState?.currency)
      ? rawState.currency
      : 'USD',
    forecastHorizon:
      Number.isInteger(rawState?.forecastHorizon) && rawState.forecastHorizon > 0
        ? rawState.forecastHorizon
        : DEFAULT_FORECAST_HORIZON,
  }
}

function createInitialState() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (saved) {
    try {
      return normalizeState(JSON.parse(saved))
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return normalizeState(createDefaultState())
}

function financeReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_MONTH':
      return {
        ...state,
        activeMonthId: action.payload,
      }

    case 'ADD_MONTH': {
      const allCategories = getAllCategoriesFromState(state)
      const lastMonth = state.months[state.months.length - 1]
      const newMonthId = addMonths(lastMonth.id, 1)
      const month = buildMonth(newMonthId, allCategories)

      return {
        ...state,
        months: [...state.months, month],
        activeMonthId: month.id,
      }
    }

    case 'DUPLICATE_ACTIVE_MONTH': {
      const activeMonth = state.months.find((month) => month.id === state.activeMonthId)
      if (!activeMonth) {
        return state
      }

      const lastMonth = state.months[state.months.length - 1]
      const newMonthId = addMonths(lastMonth.id, 1)
      const duplicate = {
        ...activeMonth,
        id: newMonthId,
        label: monthLabelFromId(newMonthId),
        categories: { ...activeMonth.categories },
        benefitUsage: buildBenefitUsageMap(activeMonth.benefitUsage),
      }

      return {
        ...state,
        months: [...state.months, duplicate],
        activeMonthId: duplicate.id,
      }
    }

    case 'REMOVE_MONTH': {
      if (state.months.length <= 1) {
        return state
      }

      const monthId = action.payload
      const monthIndex = state.months.findIndex((month) => month.id === monthId)
      if (monthIndex < 0) {
        return state
      }

      const months = state.months.filter((month) => month.id !== monthId)
      const fallbackMonth = months[Math.max(0, monthIndex - 1)]

      return {
        ...state,
        months,
        activeMonthId:
          state.activeMonthId === monthId ? fallbackMonth.id : state.activeMonthId,
      }
    }

    case 'UPDATE_MONTH_FIELD': {
      const { monthId, field, value } = action.payload
      return {
        ...state,
        months: state.months.map((month) =>
          month.id === monthId ? { ...month, [field]: toNumber(value) } : month,
        ),
      }
    }

    case 'UPDATE_CATEGORY_VALUE': {
      const { monthId, category, value } = action.payload
      return {
        ...state,
        months: state.months.map((month) =>
          month.id === monthId
            ? {
                ...month,
                categories: {
                  ...month.categories,
                  [category]: toNumber(value),
                },
              }
            : month,
        ),
      }
    }

    case 'UPDATE_BENEFIT_USAGE': {
      const { monthId, benefitKey, value } = action.payload
      if (!BENEFIT_WALLETS[benefitKey]) {
        return state
      }

      return {
        ...state,
        months: state.months.map((month) =>
          month.id === monthId
            ? {
                ...month,
                benefitUsage: {
                  ...month.benefitUsage,
                  [benefitKey]: Math.max(0, toNumber(value)),
                },
              }
            : month,
        ),
      }
    }

    case 'UPDATE_BENEFIT_SETTING': {
      const { benefitKey, field, value } = action.payload
      if (!BENEFIT_WALLETS[benefitKey]) {
        return state
      }

      const current = state.benefitsSettings[benefitKey]
      const nextSetting = {
        ...current,
        [field]:
          field === 'monthlyCredit'
            ? Math.max(0, toNumber(value))
            : field === 'rollover' || field === 'enabled'
              ? Boolean(value)
              : value,
      }

      return {
        ...state,
        benefitsSettings: {
          ...state.benefitsSettings,
          [benefitKey]: nextSetting,
        },
      }
    }

    case 'UPDATE_BENEFIT_OPENING_BALANCE': {
      const { benefitKey, value } = action.payload
      if (!BENEFIT_WALLETS[benefitKey]) {
        return state
      }

      return {
        ...state,
        benefitOpeningBalances: {
          ...state.benefitOpeningBalances,
          [benefitKey]: Math.max(0, toNumber(value)),
        },
      }
    }

    case 'ADD_CUSTOM_CATEGORY': {
      const payload =
        typeof action.payload === 'string' ? { name: action.payload } : action.payload || {}
      const category = String(payload.name || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
      const allCategories = getAllCategoriesFromState(state)

      if (!category || allCategories.includes(category)) {
        return state
      }

      const icon = String(payload.icon || '').trim() || '✨'
      const label = String(payload.label || '').trim() || 'custom'

      return {
        ...state,
        customCategories: [...state.customCategories, category],
        categoryMeta: {
          ...state.categoryMeta,
          [category]: {
            icon,
            label,
          },
        },
        months: state.months.map((month) => ({
          ...month,
          categories: {
            ...month.categories,
            [category]: 0,
          },
        })),
      }
    }

    case 'REMOVE_CATEGORY': {
      const category = action.payload
      const allCategories = getAllCategoriesFromState(state)
      if (!allCategories.includes(category) || allCategories.length <= 1) {
        return state
      }

      const isDefault = DEFAULT_CATEGORIES.includes(category)
      const nextCustomCategories = isDefault
        ? state.customCategories
        : state.customCategories.filter((name) => name !== category)
      const nextRemovedDefaults = isDefault
        ? [...state.removedDefaultCategories, category]
        : state.removedDefaultCategories

      return {
        ...state,
        customCategories: nextCustomCategories,
        removedDefaultCategories: nextRemovedDefaults,
        categoryMeta: Object.fromEntries(
          Object.entries(state.categoryMeta).filter(([name]) => name !== category),
        ),
        months: state.months.map((month) => {
          const nextCategories = { ...month.categories }
          delete nextCategories[category]
          return {
            ...month,
            categories: nextCategories,
          }
        }),
      }
    }

    case 'SET_CURRENCY':
      return {
        ...state,
        currency: CURRENCY_OPTIONS.some((option) => option.code === action.payload)
          ? action.payload
          : state.currency,
      }

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: LANGUAGE_OPTIONS.some((option) => option.code === action.payload)
          ? action.payload
          : state.language,
      }

    case 'SET_THEME':
      return {
        ...state,
        theme: THEME_OPTIONS.some((option) => option.code === action.payload)
          ? action.payload
          : state.theme,
      }

    case 'TOGGLE_INCLUDE_BENEFITS':
      return {
        ...state,
        includeBenefitsInNet: !state.includeBenefitsInNet,
      }

    case 'SET_OPENING_BALANCE':
      return {
        ...state,
        openingBalance: Math.max(0, toNumber(action.payload)),
      }

    case 'SET_FORECAST_HORIZON':
      return {
        ...state,
        forecastHorizon: Math.max(1, toNumber(action.payload)),
      }

    case 'RESET_ALL_DATA':
      return normalizeState(createDefaultState())

    case 'IMPORT_STATE':
      return normalizeState(action.payload)

    default:
      return state
  }
}

function computeRows(months, benefitsSettings, benefitOpeningBalances) {
  const runningBalances = Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  return months.map((month) => {
    const totalExpenses = Object.values(month.categories).reduce(
      (sum, value) => sum + toNumber(value),
      0,
    )
    const cashRemaining = toNumber(month.income) + toNumber(month.extraIncome) - totalExpenses

    const benefits = Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
      const settings = benefitsSettings[key]
      const credited = settings.enabled ? toNumber(settings.monthlyCredit) : 0
      const configuredOpening = Math.max(0, toNumber(benefitOpeningBalances?.[key]))
      const startBalance =
        settings.rollover
          ? toNumber(runningBalances[key])
          : Math.max(0, configuredOpening - credited)
      const used = Math.max(0, toNumber(month.benefitUsage?.[key]))
      const endBalance = Math.max(0, startBalance + credited - used)

      runningBalances[key] = endBalance
      acc[key] = {
        credited,
        used,
        startBalance,
        endBalance,
      }
      return acc
    }, {})

    const benefitNet = Object.values(benefits).reduce(
      (sum, item) => sum + item.credited - item.used,
      0,
    )

    return {
      ...month,
      totalExpenses,
      cashRemaining,
      benefitNet,
      remainingWithBenefits: cashRemaining + benefitNet,
      benefits,
      isForecast: false,
    }
  })
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function toCsvValue(value) {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function appStateToCsv(state) {
  const allCategories = getAllCategoriesFromState(state)
  const benefitKeys = Object.keys(BENEFIT_WALLETS)
  const header = [
    'id',
    'label',
    'currency',
    'includeBenefitsInNet',
    'openingBalance',
    'income',
    'extraIncome',
    ...allCategories.map((category) => `category:${category}`),
    ...benefitKeys.map((key) => `benefitUsage:${key}`),
    ...benefitKeys.map((key) => `benefitOpening:${key}`),
    ...benefitKeys.map((key) => `benefitCredit:${key}`),
    ...benefitKeys.map((key) => `benefitRollover:${key}`),
    ...benefitKeys.map((key) => `benefitEnabled:${key}`),
  ]

  const lines = state.months.map((month) => {
    const row = [
      month.id,
      month.label,
      state.currency,
      state.includeBenefitsInNet,
      state.openingBalance,
      month.income,
      month.extraIncome,
    ]
    allCategories.forEach((category) => {
      row.push(toNumber(month.categories[category]))
    })
    benefitKeys.forEach((key) => {
      row.push(toNumber(month.benefitUsage?.[key]))
    })
    benefitKeys.forEach((key) => {
      row.push(toNumber(state.benefitOpeningBalances?.[key]))
    })
    benefitKeys.forEach((key) => {
      row.push(toNumber(state.benefitsSettings?.[key]?.monthlyCredit))
    })
    benefitKeys.forEach((key) => {
      row.push(Boolean(state.benefitsSettings?.[key]?.rollover))
    })
    benefitKeys.forEach((key) => {
      row.push(Boolean(state.benefitsSettings?.[key]?.enabled))
    })
    return row.map(toCsvValue).join(',')
  })

  return [header.join(','), ...lines].join('\n')
}

function csvToAppState(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error('CSV is empty or missing data rows.')
  }

  const header = parseCsvLine(lines[0])
  const categoryColumns = header
    .map((name, index) => ({ name, index }))
    .filter((item) => item.name.startsWith('category:'))
    .map((item) => ({
      index: item.index,
      category: item.name.replace('category:', ''),
    }))
  const benefitUsageColumns = header
    .map((name, index) => ({ name, index }))
    .filter((item) => item.name.startsWith('benefitUsage:'))
    .map((item) => ({
      index: item.index,
      key: item.name.replace('benefitUsage:', ''),
    }))
  const benefitCreditColumns = header
    .map((name, index) => ({ name, index }))
    .filter((item) => item.name.startsWith('benefitCredit:'))
    .map((item) => ({
      index: item.index,
      key: item.name.replace('benefitCredit:', ''),
    }))
  const benefitOpeningColumns = header
    .map((name, index) => ({ name, index }))
    .filter((item) => item.name.startsWith('benefitOpening:'))
    .map((item) => ({
      index: item.index,
      key: item.name.replace('benefitOpening:', ''),
    }))
  const benefitRolloverColumns = header
    .map((name, index) => ({ name, index }))
    .filter((item) => item.name.startsWith('benefitRollover:'))
    .map((item) => ({
      index: item.index,
      key: item.name.replace('benefitRollover:', ''),
    }))
  const benefitEnabledColumns = header
    .map((name, index) => ({ name, index }))
    .filter((item) => item.name.startsWith('benefitEnabled:'))
    .map((item) => ({
      index: item.index,
      key: item.name.replace('benefitEnabled:', ''),
    }))

  const categories = categoryColumns.map((item) => item.category)
  const customCategories = categories.filter((category) => !DEFAULT_CATEGORIES.includes(category))
  const removedDefaultCategories = DEFAULT_CATEGORIES.filter(
    (category) => !categories.includes(category),
  )

  const months = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const id = values[0]
    const label = values[1] || monthLabelFromId(id)
    const currency = values[2]
    const includeBenefitsInNet = String(values[3]).toLowerCase() === 'true'
    const openingBalance = toNumber(values[4])
    const income = toNumber(values[5])
    const extraIncome = toNumber(values[6])

    const monthCategories = categories.reduce((acc, category, idx) => {
      const sourceIndex = categoryColumns[idx].index
      acc[category] = toNumber(values[sourceIndex])
      return acc
    }, {})

    const benefitUsage = Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
      const column = benefitUsageColumns.find((item) => item.key === key)
      acc[key] = column ? toNumber(values[column.index]) : 0
      return acc
    }, {})

    return {
      id,
      label,
      income,
      extraIncome,
      categories: monthCategories,
      benefitUsage,
      currency,
      includeBenefitsInNet,
      openingBalance,
    }
  })

  const fileCurrency = months.find((month) => month.currency)?.currency
  const includeBenefitsInNet = months.find((month) => month.includeBenefitsInNet)?.includeBenefitsInNet
  const openingBalance = months.find((month) => Number.isFinite(month.openingBalance))?.openingBalance
  const firstRow = parseCsvLine(lines[1] || '')
  const benefitsSettings = buildBenefitSettingsMap(
    Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
      const creditColumn = benefitCreditColumns.find((item) => item.key === key)
      const rolloverColumn = benefitRolloverColumns.find((item) => item.key === key)
      const enabledColumn = benefitEnabledColumns.find((item) => item.key === key)
      acc[key] = {
        monthlyCredit: creditColumn ? toNumber(firstRow[creditColumn.index]) : 0,
        rollover: rolloverColumn
          ? String(firstRow[rolloverColumn.index]).toLowerCase() === 'true'
          : BENEFIT_WALLETS[key].rollover,
        enabled: enabledColumn
          ? String(firstRow[enabledColumn.index]).toLowerCase() === 'true'
          : true,
      }
      return acc
    }, {}),
  )
  const benefitOpeningBalances = buildBenefitOpeningBalancesMap(
    Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
      const openingColumn = benefitOpeningColumns.find((item) => item.key === key)
      acc[key] = openingColumn ? toNumber(firstRow[openingColumn.index]) : 0
      return acc
    }, {}),
  )

  return normalizeState({
    months,
    activeMonthId: months[months.length - 1]?.id,
    customCategories,
    removedDefaultCategories,
    benefitsSettings,
    benefitOpeningBalances,
    includeBenefitsInNet,
    openingBalance,
    forecastHorizon: DEFAULT_FORECAST_HORIZON,
    currency: fileCurrency,
  })
}

function App() {
  const [state, dispatch] = useReducer(financeReducer, undefined, createInitialState)
  const [activePage, setActivePage] = useState('tracker')
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  })
  const [newCategory, setNewCategory] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('✨')
  const [newCategoryLabel, setNewCategoryLabel] = useState('')

  const allCategories = useMemo(
    () =>
      getAllCategoriesFromState({
        customCategories: state.customCategories,
        removedDefaultCategories: state.removedDefaultCategories,
      }),
    [state.customCategories, state.removedDefaultCategories],
  )
  const selectedLanguage =
    LANGUAGE_OPTIONS.find((option) => option.code === state.language) || LANGUAGE_OPTIONS[0]
  const selectedLocale = selectedLanguage?.locale || 'en-US'
  const labels = getTranslation(state.language)

  const actualRows = useMemo(
    () =>
      computeRows(
        state.months,
        state.benefitsSettings,
        state.benefitOpeningBalances,
      ),
    [state.benefitOpeningBalances, state.benefitsSettings, state.months],
  )

  const displayActualRows = useMemo(() => {
    return actualRows.reduce(
      (acc, row) => {
        const remaining = row.cashRemaining
        const cumulative = acc.lastCumulative + remaining

        return {
          lastCumulative: cumulative,
          rows: [
            ...acc.rows,
            {
              ...row,
              label: monthLabelFromId(row.id, selectedLocale),
              remaining,
              cumulative,
            },
          ],
        }
      },
      { lastCumulative: state.openingBalance, rows: [] },
    ).rows
  }, [actualRows, selectedLocale, state.openingBalance])

  const forecastRows = useMemo(() => {
    const forecast = generateForecastMonths({
      months: state.months,
      categories: allCategories,
      horizon: state.forecastHorizon,
      locale: selectedLocale,
    })

    const baseBalances = Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
      const lastActual = actualRows[actualRows.length - 1]
      acc[key] = lastActual?.benefits?.[key]?.endBalance ?? 0
      return acc
    }, {})

    const rows = forecast.map((month, index) => {
      const stepAhead = index + 1
      const usageByBenefit = Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
        const history = state.months.map((item) => toNumber(item.benefitUsage?.[key]))
        acc[key] = forecastSeriesValue(history, stepAhead)
        return acc
      }, {})

      const benefits = Object.keys(BENEFIT_WALLETS).reduce((acc, key) => {
        const settings = state.benefitsSettings[key]
        const credited = settings.enabled ? toNumber(settings.monthlyCredit) : 0
        const startBalance = settings.rollover ? toNumber(baseBalances[key]) : 0
        const used = toNumber(usageByBenefit[key])
        const endBalance = Math.max(0, startBalance + credited - used)

        baseBalances[key] = endBalance
        acc[key] = {
          credited,
          used,
          startBalance,
          endBalance,
        }
        return acc
      }, {})

      const benefitNet = Object.values(benefits).reduce(
        (sum, item) => sum + item.credited - item.used,
        0,
      )

      return {
        ...month,
        benefitUsage: usageByBenefit,
        benefits,
        cashRemaining: month.remaining,
        benefitNet,
        remainingWithBenefits: month.remaining + benefitNet,
      }
    })

    const startCumulative = displayActualRows[displayActualRows.length - 1]?.cumulative ?? 0
    return rows.reduce(
      (acc, row) => {
        const remaining = row.cashRemaining
        const cumulative = acc.lastCumulative + remaining

        return {
          lastCumulative: cumulative,
          rows: [
            ...acc.rows,
            {
              ...row,
              remaining,
              cumulative,
            },
          ],
        }
      },
      { lastCumulative: startCumulative, rows: [] },
    ).rows
  }, [
    allCategories,
    actualRows,
    displayActualRows,
    selectedLocale,
    state.benefitsSettings,
    state.forecastHorizon,
    state.months,
  ])

  const activeMonth =
    displayActualRows.find((month) => month.id === state.activeMonthId) ||
    displayActualRows[0]
  const hasForecastData =
    displayActualRows.some(
      (month) =>
        month.income > 0 ||
        month.extraIncome > 0 ||
        month.totalExpenses > 0,
    )
  const displayForecastRows = hasForecastData ? forecastRows : []
  const benefitEntries = Object.entries(BENEFIT_WALLETS)
  const benefitBreakdownData = benefitEntries.map(([key, config]) => ({
    name: `${config.icon} ${config.name}`,
    value: toNumber(activeMonth?.benefits?.[key]?.used),
  }))
  const benefitTrendRows = [...displayActualRows, ...displayForecastRows].map((row) => ({
    ...row,
    totalBenefitsBalance: Object.values(row.benefits || {}).reduce(
      (sum, item) => sum + toNumber(item.endBalance),
      0,
    ),
  }))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const handleAddCustomCategory = () => {
    dispatch({
      type: 'ADD_CUSTOM_CATEGORY',
      payload: {
        name: newCategory,
        icon: newCategoryIcon,
        label: newCategoryLabel,
      },
    })
    setNewCategory('')
    setNewCategoryIcon('✨')
    setNewCategoryLabel('')
  }

  const handleExportJson = () => {
    downloadFile('finance-tracker.json', JSON.stringify(state, null, 2), 'application/json')
  }

  const handleExportCsv = () => {
    downloadFile('finance-tracker.csv', appStateToCsv(state), 'text/csv')
  }

  const handleImportFile = async (file) => {
    if (!file) {
      return
    }

    const text = await file.text()

    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        dispatch({ type: 'IMPORT_STATE', payload: JSON.parse(text) })
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        dispatch({ type: 'IMPORT_STATE', payload: csvToAppState(text) })
      }
    } catch (error) {
      window.alert(error.message || labels.importError)
    }
  }

  const handleDeleteMonth = (monthId) => {
    const month = state.months.find((item) => item.id === monthId)
    if (!month) {
      return
    }

    const monthName = monthLabelFromId(month.id, selectedLocale)
    setConfirmModal({
      open: true,
      title: labels.confirmActionTitle,
      message: labels.confirmDeleteMonth(monthName),
      onConfirm: () => dispatch({ type: 'REMOVE_MONTH', payload: monthId }),
    })
  }

  const handleResetData = () => {
    setConfirmModal({
      open: true,
      title: labels.confirmActionTitle,
      message: labels.confirmReset,
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEY)
        dispatch({ type: 'RESET_ALL_DATA' })
      },
    })
  }

  const handleDeleteCategory = (category) => {
    if (allCategories.length <= 1) {
      window.alert(labels.oneCategoryMin)
      return
    }

    const label = titleCase(category)
    setConfirmModal({
      open: true,
      title: labels.confirmActionTitle,
      message: labels.confirmDeleteCategory(label),
      onConfirm: () => dispatch({ type: 'REMOVE_CATEGORY', payload: category }),
    })
  }

  const currencyLabel =
    CURRENCY_OPTIONS.find((option) => option.code === state.currency)?.label.split(' ')[0] ||
    '$'
  const modeLabel = labels.cashOnly

  useEffect(() => {
    document.documentElement.lang = state.language
    document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr'
  }, [state.language])

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme
  }, [state.theme])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <header className="app-header-card rounded-3xl border border-slate-700/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{labels.appTitle}</h1>
              <p className="mt-1 text-sm text-slate-300">
                {labels.appSubtitle}
              </p>
            </div>
            <label className="text-sm text-slate-300">
              {labels.currency}
              <select
                value={state.currency}
                onChange={(event) =>
                  dispatch({
                    type: 'SET_CURRENCY',
                    payload: event.target.value,
                  })
                }
                className="ml-2 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-slate-100"
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-300">
              {labels.language}
              <select
                value={state.language}
                onChange={(event) =>
                  dispatch({
                    type: 'SET_LANGUAGE',
                    payload: event.target.value,
                  })
                }
                className="ml-2 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-slate-100"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-300">
              {labels.theme}
              <select
                value={state.theme}
                onChange={(event) =>
                  dispatch({
                    type: 'SET_THEME',
                    payload: event.target.value,
                  })
                }
                className="ml-2 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-slate-100"
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-300">
              {labels.startingSavings}
              <div className="relative ml-2 inline-block align-middle">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                  {currencyLabel}
                </span>
                <NumberInput
                  min={0}
                  value={state.openingBalance}
                  locale={selectedLocale}
                  onValueChange={(value) =>
                    dispatch({
                      type: 'SET_OPENING_BALANCE',
                      payload: value,
                    })
                  }
                  className="h-9 w-36 rounded-lg border border-slate-600 bg-slate-900 pl-10 pr-3 text-sm text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                />
              </div>
            </label>
          </div>

          <div className="mt-4 inline-flex rounded-xl border border-slate-700 bg-slate-900/60 p-1">
            <button
              onClick={() => setActivePage('tracker')}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                activePage === 'tracker'
                  ? 'bg-indigo-500 text-slate-50'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {labels.trackerPage}
            </button>
            <button
              onClick={() => setActivePage('data')}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                activePage === 'data'
                  ? 'bg-indigo-500 text-slate-50'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {labels.dataPage}
            </button>
          </div>
        </header>

        {activePage === 'tracker' ? (
          <>
            <MonthTabs
              months={displayActualRows}
              activeMonthId={state.activeMonthId}
              onSelectMonth={(monthId) =>
                dispatch({
                  type: 'SET_ACTIVE_MONTH',
                  payload: monthId,
                })
              }
              onAddMonth={() => dispatch({ type: 'ADD_MONTH' })}
              onDuplicateMonth={() => dispatch({ type: 'DUPLICATE_ACTIVE_MONTH' })}
              onDeleteMonth={handleDeleteMonth}
              labels={labels}
            />

            {activeMonth ? (
              <>
                <SummaryCards
                  totalExpenses={activeMonth.totalExpenses}
                  remaining={activeMonth.remaining}
                  cumulative={activeMonth.cumulative}
                  currency={state.currency}
                  locale={selectedLocale}
                  modeLabel={modeLabel}
                  labels={labels}
                />

                <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <h2 className="text-sm font-semibold text-slate-100">{labels.monthlyInputs}</h2>

                <div className="mx-auto mt-3 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-300">{labels.baseIncome}</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                        {currencyLabel}
                      </span>
                      <NumberInput
                        min={0}
                        value={activeMonth.income}
                        locale={selectedLocale}
                        onValueChange={(value) =>
                          dispatch({
                            type: 'UPDATE_MONTH_FIELD',
                            payload: {
                              monthId: activeMonth.id,
                              field: 'income',
                              value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 pl-10 pr-3 py-2 text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-300">{labels.extraIncome}</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                        {currencyLabel}
                      </span>
                      <NumberInput
                        min={0}
                        value={activeMonth.extraIncome}
                        locale={selectedLocale}
                        onValueChange={(value) =>
                          dispatch({
                            type: 'UPDATE_MONTH_FIELD',
                            payload: {
                              monthId: activeMonth.id,
                              field: 'extraIncome',
                              value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 pl-10 pr-3 py-2 text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                      />
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-4 w-full max-w-3xl overflow-x-auto">
                  <table className="w-full min-w-[300px] table-fixed text-left text-sm">
                    <colgroup>
                      <col className="w-[34%]" />
                      <col className="w-[66%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-2 pr-3">{labels.category}</th>
                        <th className="py-2">{labels.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCategories.map((category) => (
                        <CategoryRow
                          key={category}
                          category={titleCase(category)}
                          value={activeMonth.categories[category]}
                          isCustom={state.customCategories.includes(category)}
                          categoryIcon={state.categoryMeta?.[category]?.icon}
                          categoryTag={state.categoryMeta?.[category]?.label}
                          canDelete={allCategories.length > 1}
                          currencyLabel={currencyLabel}
                          locale={selectedLocale}
                          labels={labels}
                          onDelete={() => handleDeleteCategory(category)}
                          onChange={(value) =>
                            dispatch({
                              type: 'UPDATE_CATEGORY_VALUE',
                              payload: {
                                monthId: activeMonth.id,
                                category,
                                value,
                              },
                            })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mx-auto mt-4 grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-[1.2fr_0.5fr_0.8fr_auto]">
                  <input
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    placeholder={labels.categoryNamePlaceholder}
                    aria-label={labels.categoryNamePlaceholder}
                    className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                  />
                  <IconPicker
                    value={newCategoryIcon}
                    onChange={setNewCategoryIcon}
                    options={CATEGORY_ICON_OPTIONS}
                  />
                  <input
                    value={newCategoryLabel}
                    onChange={(event) => setNewCategoryLabel(event.target.value)}
                    placeholder={labels.labelOptionalPlaceholder}
                    className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500 text-lg font-semibold text-indigo-50 hover:bg-indigo-400"
                    aria-label={labels.addCategory}
                    title={labels.addCategory}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <ExpensePieChart
                  categories={activeMonth.categories}
                  currency={state.currency}
                  locale={selectedLocale}
                  labels={labels}
                />
              </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <h2 className="text-sm font-semibold text-slate-100">{labels.recurringBenefits}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {labels.recurringBenefitsSub}
                </p>
                <div className="mt-3 space-y-3">
                  {benefitEntries.map(([key, config]) => {
                    const settings = state.benefitsSettings[key]
                    const benefitMonth = activeMonth.benefits?.[key]
                    return (
                      <div
                        key={key}
                        className="grid gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2 sm:grid-cols-[1.1fr_1fr_1fr_1fr_auto]"
                      >
                        <div>
                          <p className="text-sm text-slate-200">
                            <span className="mr-2">{config.icon}</span>
                            {config.name}
                          </p>
                            <label className="mt-1 inline-flex items-center gap-2 text-xs text-slate-400">
                            <input
                              type="checkbox"
                              checked={settings.rollover}
                              onChange={(event) =>
                                dispatch({
                                  type: 'UPDATE_BENEFIT_SETTING',
                                  payload: {
                                    benefitKey: key,
                                    field: 'rollover',
                                    value: event.target.checked,
                                  },
                                })
                              }
                            />
                              {labels.rollover}
                          </label>
                        </div>

                        <div>
                            <p className="mb-1 text-xs text-slate-400">{labels.currentAmount}</p>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                              {currencyLabel}
                            </span>
                            <NumberInput
                              min={0}
                              value={state.benefitOpeningBalances?.[key] ?? 0}
                              locale={selectedLocale}
                              onValueChange={(value) =>
                                dispatch({
                                  type: 'UPDATE_BENEFIT_OPENING_BALANCE',
                                  payload: {
                                    benefitKey: key,
                                    value,
                                  },
                                })
                              }
                              className="h-10 w-full rounded-lg border border-slate-600 bg-slate-900 pl-10 pr-3 text-sm text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                            />
                          </div>
                        </div>

                        <div>
                            <p className="mb-1 text-xs text-slate-400">{labels.refill}</p>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                              {currencyLabel}
                            </span>
                            <NumberInput
                              min={0}
                              value={settings.monthlyCredit}
                              locale={selectedLocale}
                              onValueChange={(value) =>
                                dispatch({
                                  type: 'UPDATE_BENEFIT_SETTING',
                                  payload: {
                                    benefitKey: key,
                                    field: 'monthlyCredit',
                                    value,
                                  },
                                })
                              }
                              className="h-10 w-full rounded-lg border border-slate-600 bg-slate-900 pl-10 pr-3 text-sm text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                            />
                          </div>
                        </div>

                        <div>
                            <p className="mb-1 text-xs text-slate-400">{labels.balanceNow}</p>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                              {currencyLabel}
                            </span>
                            <NumberInput
                              min={0}
                              value={benefitMonth?.endBalance ?? 0}
                              locale={selectedLocale}
                              onValueChange={(balanceNow) =>
                                dispatch({
                                  type: 'UPDATE_BENEFIT_USAGE',
                                  payload: {
                                    monthId: activeMonth.id,
                                    benefitKey: key,
                                    value: Math.max(
                                      0,
                                      toNumber(benefitMonth?.startBalance) +
                                        toNumber(benefitMonth?.credited) -
                                        toNumber(balanceNow),
                                    ),
                                  },
                                })
                              }
                              className="h-10 w-full rounded-lg border border-slate-600 bg-slate-900 pl-10 pr-3 text-sm text-slate-100 outline-none ring-indigo-400/40 focus:ring"
                            />
                          </div>
                        </div>

                        <div className="self-center text-right">
                          <p className="text-[11px] text-slate-400">{labels.usedThisMonth}</p>
                          <p className="text-sm font-semibold text-cyan-300">
                            {formatCurrency(benefitMonth?.used ?? 0, state.currency, selectedLocale)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <BenefitBreakdownPieChart
                  data={benefitBreakdownData}
                  currency={state.currency}
                  locale={selectedLocale}
                  labels={labels}
                />
                <BenefitTrendLineChart
                  rows={benefitTrendRows}
                  currency={state.currency}
                  locale={selectedLocale}
                  labels={labels}
                />
              </div>
                </section>
              </>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-[1.1fr_1.3fr]">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-100">{labels.forecast}</h2>
                  <label className="text-xs text-slate-400">
                    {labels.months}
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={state.forecastHorizon}
                      onChange={(event) =>
                        dispatch({
                          type: 'SET_FORECAST_HORIZON',
                          payload: event.target.value,
                        })
                      }
                      className="ml-2 w-14 rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
                    />
                  </label>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {labels.forecastSub}
                </p>

                {hasForecastData ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[460px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 text-left text-slate-400">
                          <th className="py-2 pr-2">{labels.month}</th>
                          <th className="py-2 pr-2">{labels.expectedIncome}</th>
                          <th className="py-2 pr-2">{labels.expectedExpenses}</th>
                          <th className="py-2">{labels.expectedRemaining} ({modeLabel})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayForecastRows.map((month) => (
                          <tr key={month.id} className="border-b border-slate-800/80">
                            <td className="py-2 pr-2 text-slate-200">{month.label}</td>
                            <td className="py-2 pr-2 text-slate-300">
                              {formatCurrency(month.income, state.currency, selectedLocale)}
                            </td>
                            <td className="py-2 pr-2 text-slate-300">
                              {formatCurrency(month.totalExpenses, state.currency, selectedLocale)}
                            </td>
                            <td
                              className={`py-2 ${
                                month.remaining >= 0 ? 'text-cyan-300' : 'text-rose-300'
                              }`}
                            >
                              {formatCurrency(month.remaining, state.currency, selectedLocale)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-400">
                    {labels.forecastEmpty}
                  </p>
                )}
              </div>

              <SavingsLineChart
                actualRows={displayActualRows}
                forecastRows={displayForecastRows}
                currency={state.currency}
                locale={selectedLocale}
                labels={labels}
              />
            </section>
          </>
        ) : (
          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <h2 className="text-sm font-semibold text-slate-100">{labels.dataManagementTitle}</h2>
              <p className="mt-1 text-sm text-slate-400">{labels.dataManagementSub}</p>
            </div>

            <ImportExportPanel
              onExportJson={handleExportJson}
              onExportCsv={handleExportCsv}
              onImportFile={handleImportFile}
              onResetData={handleResetData}
              labels={labels}
            />
          </section>
        )}
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        labels={labels}
        onCancel={() =>
          setConfirmModal({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
          })
        }
        onConfirm={() => {
          const action = confirmModal.onConfirm
          setConfirmModal({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
          })
          if (typeof action === 'function') {
            action()
          }
        }}
      />
    </main>
  )
}

export default App
