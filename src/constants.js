export const DEFAULT_CATEGORIES = [
  'rent',
  'internet',
  'insurance',
  'food',
  'transport',
  'misc',
]

export const DEFAULT_CATEGORY_META = {
  rent: { icon: '🏠', label: 'default' },
  internet: { icon: '🌐', label: 'default' },
  insurance: { icon: '🛡️', label: 'default' },
  food: { icon: '🍽️', label: 'default' },
  transport: { icon: '🚌', label: 'default' },
  misc: { icon: '📦', label: 'default' },
}

export const BENEFIT_WALLETS = {
  fuelCard: {
    name: 'Fuel Card',
    icon: '⛽',
    defaultCredit: 0,
    rollover: false,
  },
  chequeRepas: {
    name: 'Cheque Repas',
    icon: '🍽️',
    defaultCredit: 0,
    rollover: false,
  },
}

export const CATEGORY_ICON_OPTIONS = [
  { icon: '✨', keywords: 'sparkles star special' },
  { icon: '🏠', keywords: 'home rent house apartment' },
  { icon: '🌐', keywords: 'internet web network wifi' },
  { icon: '🛡️', keywords: 'insurance protection shield secure' },
  { icon: '🍽️', keywords: 'food meal dining restaurant' },
  { icon: '🚌', keywords: 'transport bus commute travel' },
  { icon: '🚗', keywords: 'car transport driving fuel' },
  { icon: '⛽', keywords: 'fuel gas petrol transport' },
  { icon: '📦', keywords: 'misc package other box' },
  { icon: '🧾', keywords: 'bill invoice receipt payment' },
  { icon: '💡', keywords: 'electricity utilities power light' },
  { icon: '💧', keywords: 'water utilities bill' },
  { icon: '🏥', keywords: 'health hospital medical doctor' },
  { icon: '💊', keywords: 'medicine pharmacy health' },
  { icon: '🎓', keywords: 'education school course learning' },
  { icon: '📚', keywords: 'books study education' },
  { icon: '📱', keywords: 'phone mobile telecom' },
  { icon: '🛒', keywords: 'shopping groceries market' },
  { icon: '🧹', keywords: 'home cleaning supplies' },
  { icon: '🎬', keywords: 'movies entertainment cinema' },
  { icon: '🎮', keywords: 'games gaming entertainment' },
  { icon: '🎵', keywords: 'music audio subscription' },
  { icon: '✈️', keywords: 'travel flight vacation trip' },
  { icon: '🏨', keywords: 'hotel travel stay' },
  { icon: '🎁', keywords: 'gift present celebration' },
  { icon: '🐶', keywords: 'pet dog animal care' },
  { icon: '👶', keywords: 'child baby kids family' },
  { icon: '💼', keywords: 'work business office' },
  { icon: '💰', keywords: 'money cash savings income' },
  { icon: '📈', keywords: 'investments stocks finance' },
  { icon: '🏦', keywords: 'bank finance account' },
  { icon: '🧳', keywords: 'luggage travel move' },
  { icon: '🍎', keywords: 'food fruit groceries healthy' },
  { icon: '☕', keywords: 'coffee drinks cafe' },
  { icon: '🍕', keywords: 'pizza fast food meal' },
]

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', locale: 'en-US' },
  { code: 'fr', label: 'French', locale: 'fr-FR' },
  { code: 'ar', label: 'Arabic', locale: 'ar-MA' },
  { code: 'es', label: 'Spanish', locale: 'es-ES' },
  { code: 'ru', label: 'Russian', locale: 'ru-RU' },
]

export const THEME_OPTIONS = [
  { code: 'midnight', label: 'Midnight' },
  { code: 'ocean', label: 'Ocean' },
  { code: 'forest', label: 'Forest' },
  { code: 'sunset', label: 'Sunset' },
  { code: 'graphite', label: 'Graphite' },
]

export const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const STORAGE_KEY = 'finance-tracker-v1'
export const DEFAULT_FORECAST_HORIZON = 4
