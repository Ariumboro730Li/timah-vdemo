import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { ImportDatasetType } from '../../types';
import {
  IMPORT_DATASET_CONFIGS,
  ParsedImportRow,
  parseUploadedFile,
  downloadTemplateFile,
  validateDryRun,
  transformValidatedRows
} from '../../utils/dataImportExport';
import { useAppState } from '../../context/AppStateContext';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType: ImportDatasetType;
  allowSwitchType?: boolean;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  defaultType,
  allowSwitchType = false
}) => {
  const state = useAppState();
  const [selectedType, setSelectedType] = useState<ImportDatasetType>(defaultType);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[] | null>(null);
  const [parseError, setParseError] = useState<string>('');
  const [ownerApproved, setOwnerApproved] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSelectedType(defaultType);
    setParsedRows(null);
    setFileName('');
    setParseError('');
    setOwnerApproved(false);
  }, [defaultType, isOpen]);

  const config = IMPORT_DATASET_CONFIGS[selectedType];

  const getExistingKeys = () => ({
    sbrNiks: new Set(state.sbrDatabase.map((b) => b.nik)),
    rkapCodes: new Set(state.rkapList.map((r) => r.code)),
    pumkContracts: new Set(state.pumkLoans.map((l) => l.contractNo)),
    partnerCodes: new Set(state.partners.map((p) => p.code))
  });

  const runDryRun = (rows: Record<string, any>[], sourceName: string) => {
    setParseError('');
    setFileName(sourceName);
    const validated = validateDryRun(selectedType, rows, getExistingKeys());
    setParsedRows(validated);
    setOwnerApproved(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseUploadedFile(file);
      if (rows.length === 0) {
        setParseError('File kosong atau tidak memiliki baris data.');
        return;
      }
      runDryRun(rows, file.name);
    } catch (err: any) {
      setParseError(`Gagal membaca file: ${err?.message || 'Format tidak dikenali'}`);
    }
  };

  const handleLoadSample = () => {
    runDryRun(config.sampleRows, `contoh_data_${selectedType}.xlsx`);
  };

  const validCount = parsedRows?.filter((r) => r.status === 'valid').length ?? 0;
  const duplicateCount = parsedRows?.filter((r) => r.status === 'duplicate').length ?? 0;
  const errorCount = parsedRows?.filter((r) => r.status === 'error').length ?? 0;
  const totalReconciled =
    parsedRows
      ?.filter((r) => r.status === 'valid')
      .reduce((acc, r) => acc + (r.reconciledAmount || 0), 0) ?? 0;

  const committableCount = selectedType === 'proposal' ? validCount + duplicateCount : validCount;

  const handleCommit = () => {
    if (!parsedRows || committableCount === 0) return;
    const transformed = transformValidatedRows(selectedType, parsedRows, true);

    if (selectedType === 'social_mapping') {
      state.addSocialMappingRegions(transformed as any, fileName || 'Import File');
    } else if (selectedType === 'rkap') {
      state.addRkapItems(transformed as any, fileName || 'Import File');
    } else if (selectedType === 'proposal') {
      state.importProposalsBatch(transformed as any);
    } else if (selectedType === 'sbr') {
      state.importSbrBatch(transformed as any);
    } else if (selectedType === 'pumk') {
      state.importPumkLoansBatch(transformed as any);
    } else if (selectedType === 'mitra') {
      state.importPartnersBatch(transformed as any);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import & Migrasi Data — ${config.label}`}
      maxWidth="max-w-4xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            disabled={!parsedRows || committableCount === 0 || !ownerApproved}
            onClick={handleCommit}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
              !parsedRows || committableCount === 0 || !ownerApproved
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-sky-700 hover:bg-sky-800 shadow-xs'
            }`}
          >
            Commit {committableCount} Data Valid ke Sistem (Cut-Over)
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {allowSwitchType && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="font-semibold text-slate-700">Target Dataset Migrasi:</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as ImportDatasetType);
                setParsedRows(null);
                setFileName('');
                setOwnerApproved(false);
              }}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800 outline-none focus:border-sky-500"
            >
              {Object.values(IMPORT_DATASET_CONFIGS).map((c) => (
                <option key={c.type} value={c.type}>
                  {c.label} ({c.kakRef})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-sky-950">{config.label} &bull; {config.kakRef}</div>
            <p className="text-sky-800 mt-0.5">{config.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => downloadTemplateFile(selectedType, 'xlsx')}
              className="px-3 py-1.5 rounded-lg bg-white border border-sky-200 hover:bg-sky-100 text-sky-900 font-semibold inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Template .XLSX</span>
            </button>
            <button
              type="button"
              onClick={() => downloadTemplateFile(selectedType, 'csv')}
              className="px-3 py-1.5 rounded-lg bg-white border border-sky-200 hover:bg-sky-100 text-sky-900 font-semibold inline-flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Template .CSV</span>
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/70 hover:border-sky-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-sky-600 mx-auto mb-2" />
          <div className="font-bold text-slate-800">
            {fileName ? `File Terbaca: ${fileName}` : 'Unggah Berkas Excel (.xlsx / .xls), CSV, atau JSON'}
          </div>
          <p className="text-slate-500 mt-1">
            Kolom standar: <span className="font-mono text-slate-700">{config.columns.join(', ')}</span>
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File dari Komputer</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Uji dengan Contoh Data (Dry Run)</span>
            </button>
          </div>
          {parseError && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {parseError}
            </div>
          )}
        </div>

        {/* Dry Run Validation Results */}
        {parsedRows && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-semibold">Total Baris</div>
                <div className="text-xl font-bold text-slate-900">{parsedRows.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-emerald-700 font-semibold">Lolos Cleansing</div>
                <div className="text-xl font-bold text-emerald-700">{validCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-amber-700 font-semibold">Duplikasi / Flag</div>
                <div className="text-xl font-bold text-amber-700">{duplicateCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <div className="text-rose-700 font-semibold">Error Format</div>
                <div className="text-xl font-bold text-rose-700">{errorCount}</div>
              </div>
            </div>

            {totalReconciled > 0 && (
              <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between">
                <span className="font-semibold">Rekonsiliasi Total Nilai Valid (Dry Run):</span>
                <span className="font-bold text-sky-300">Rp {totalReconciled.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Baris</th>
                    <th className="py-2.5 px-3">Ringkasan Data</th>
                    <th className="py-2.5 px-3">Status Validasi</th>
                    <th className="py-2.5 px-3">Keterangan Cleansing & Deduplikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {parsedRows.map((r) => (
                    <tr key={r.rowIndex}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">#{r.rowIndex}</td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {Object.values(r.raw).slice(0, 3).join(' • ')}
                      </td>
                      <td className="py-2.5 px-3">
                        {r.status === 'valid' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        )}
                        {r.status === 'duplicate' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Duplikat
                          </span>
                        )}
                        {r.status === 'error' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={ownerApproved}
                onChange={(e) => setOwnerApproved(e.target.checked)}
                className="mt-1 w-4 h-4 accent-sky-700"
              />
              <span className="text-amber-950 font-medium">
                <strong>Persetujuan Pemilik Data (Data Steward Sign-Off):</strong> Saya menyatakan hasil uji migrasi (dry run), deduplikasi, dan rekonsiliasi saldo telah diperiksa dan siap dilakukan cut-over ke basis data aktif.
              </span>
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
};
