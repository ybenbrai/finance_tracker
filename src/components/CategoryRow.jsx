import NumberInput from './NumberInput'
import { TrashIcon } from './Icons'

export default function CategoryRow({
  category,
  value,
  onChange,
  isCustom = false,
  canDelete = true,
  onDelete,
  currencyLabel,
  locale,
  categoryIcon,
  categoryTag,
  labels,
}) {
  const normalizedTag = (categoryTag || '').toLowerCase()
  const tagText =
    normalizedTag === 'default'
      ? labels.default
      : normalizedTag === 'custom'
        ? labels.custom
        : categoryTag || (isCustom ? labels.custom : labels.default)

  return (
    <tr className="border-b border-slate-800/80">
      <td className="py-2 pr-3 text-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-base leading-none">{categoryIcon || '•'}</span>
            <span>{category}</span>
            <span className="ml-2 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {tagText}
            </span>
          </div>
          {canDelete ? (
            <button
              onClick={onDelete}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-300"
              title={`${labels.deleteMonth} ${category}`}
              aria-label={`${labels.deleteMonth} ${category}`}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </td>
      <td className="py-2">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
            {currencyLabel}
          </span>
          <NumberInput
            min={0}
            value={value}
            onValueChange={onChange}
            locale={locale}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-slate-100 outline-none ring-teal-400/40 focus:ring"
          />
        </div>
      </td>
    </tr>
  )
}
