import { useEffect } from 'react'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, labels }) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onCancel])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            {labels.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg border border-indigo-400/70 bg-indigo-500 px-3 py-2 text-sm font-medium text-indigo-50 hover:bg-indigo-400"
          >
            {labels.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
