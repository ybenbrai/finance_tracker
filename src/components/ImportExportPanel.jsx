import { DownloadIcon, TrashIcon, UploadIcon } from './Icons'

export default function ImportExportPanel({
  onExportJson,
  onExportCsv,
  onImportFile,
  onResetData,
  labels,
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{labels.importExport}</h3>
      <p className="mt-1 text-sm text-slate-400">
        {labels.importExportSub}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onExportJson}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          <DownloadIcon className="h-4 w-4" /> {labels.exportJson}
        </button>
        <button
          onClick={onExportCsv}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          <DownloadIcon className="h-4 w-4" /> {labels.exportCsv}
        </button>
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-teal-400/60 px-3 py-2 text-sm text-teal-300 hover:bg-teal-500/10">
          <UploadIcon className="h-4 w-4" /> {labels.importJsonCsv}
          <input
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={(event) => onImportFile(event.target.files?.[0])}
          />
        </label>
        <button
          onClick={onResetData}
          className="inline-flex items-center gap-2 rounded-lg border border-rose-400/70 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
        >
          <TrashIcon className="h-4 w-4" /> {labels.resetAllData}
        </button>
      </div>
    </div>
  )
}
