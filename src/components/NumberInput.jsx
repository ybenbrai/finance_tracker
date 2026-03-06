import { useState } from 'react'
import { formatNumberInput, parseFormattedNumber } from '../utils/format'

function toEditableText(value) {
  const parsed = parseFormattedNumber(value)
  if (!Number.isFinite(parsed)) {
    return '0'
  }

  const fixed = parsed.toFixed(2)
  return fixed.replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

export default function NumberInput({
  value,
  onValueChange,
  className,
  min = 0,
  locale = 'en-US',
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [text, setText] = useState('')
  const displayValue = isFocused ? text : formatNumberInput(value, locale)

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onFocus={() => {
        setIsFocused(true)
        setText(toEditableText(value))
      }}
      onChange={(event) => {
        const next = event.target.value

        if (!/^[-]?\d*([.,]\d{0,2})?$/.test(next) && next !== '') {
          return
        }

        setText(next)
        const parsed = parseFormattedNumber(next)
        onValueChange(Math.max(min, parsed))
      }}
      onBlur={() => {
        setIsFocused(false)
        const parsed = parseFormattedNumber(text)
        const clamped = Math.max(min, parsed)
        onValueChange(clamped)
        setText(formatNumberInput(clamped, locale))
      }}
      className={className}
    />
  )
}
