import { useMemo, useState } from 'react'

export default function IconPicker({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return options
    }

    return options.filter(
      (item) =>
        item.icon.includes(normalizedQuery) ||
        item.keywords.toLowerCase().includes(normalizedQuery),
    )
  }, [options, query])

  const handlePick = (icon) => {
    onChange(icon)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-lg text-slate-100 outline-none ring-teal-400/40 focus:ring"
        aria-label="Choose icon"
        title="Choose icon"
      >
        {value || '✨'}
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-30 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search icons"
            className="mb-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-teal-400/40 focus:ring"
          />

          <div className="grid max-h-48 grid-cols-7 gap-1 overflow-y-auto">
            {filteredOptions.map((item) => (
              <button
                key={`${item.icon}-${item.keywords}`}
                type="button"
                onClick={() => handlePick(item.icon)}
                title={item.keywords}
                className={`rounded-md p-2 text-lg transition ${
                  item.icon === value
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.icon}
              </button>
            ))}
          </div>

          {!filteredOptions.length ? (
            <p className="mt-2 text-xs text-slate-400">No icon found for that search.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
