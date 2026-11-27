import React, { useState } from 'react';
import { Upload, Download, Database, CheckCircle2, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { ImportDatasetType } from '../../types';
import { IMPORT_DATASET_CONFIGS, downloadTemplateFile } from '../../utils/dataImportExport';
import { ImportDataModal } from '../common/ImportDataModal';
import { useAppState } from '../../context/AppStateContext';
import { getRolePolicy } from '../../utils/rbac';

export const ImportCenterView: React.FC = () => {
  const state = useAppState();
  const policy = getRolePolicy(state.userRole);
  const allowedDatasets = Object.values(IMPORT_DATASET_CONFIGS).filter((cfg) =>
    policy.allowedImportTypes.includes(cfg.type)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDataset, setActiveDataset] = useState<ImportDatasetType>(
    policy.allowedImportTypes[0] || 'rkap'
  );

  const openImport = (type: ImportDatasetType) => {
    setActiveDataset(type);
    setModalOpen(true);
  };

  const countByType: Record<ImportDatasetType, number> = {
    social_mapping: state.socialMapping.length,
    rkap: state.rkapList.length,
    proposal: state.proposals.length,
    sbr: state.sbrDatabase.length,
    pumk: state.pumkLoans.length,
    mitra: state.partners.length
  };

  const migrationSteps = [
    { title: 'Inventarisasi Data', desc: 'Identifikasi berkas Excel/CSV historis antar bidang' },
    { title: 'Data Cleansing', desc: 'Normalisasi NIK 16 digit, format rupiah, & kolom wajib' },
    { title: 'Deduplikasi SBR', desc: 'Deteksi NIK/kode ganda sebelum masuk sistem' },
    { title: 'Uji Migrasi (Dry Run)', desc: 'Pratinjau status valid/error & rekonsiliasi saldo' },
    { title: 'Cut-Over & Audit', desc: 'Sign-off pemilik data & tercatat di Audit Trail' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pusat Import & Migrasi Data Terpadu</h2>
          <p className="text-sm text-slate-600 mt-1">
            Mendukung unggah berkas <strong>Excel (.xlsx / .xls), CSV, dan JSON</strong> sesuai prosedur Migrasi Data Bab 13 KAK — lengkap dengan template, data cleansing, deduplikasi NIK otomatis, dan rekonsiliasi saldo.
          </p>
        </div>
        <button
          onClick={() => openImport(policy.allowedImportTypes[0] || 'rkap')}
          className="px-4 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-2 shadow-xs flex-shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Mulai Import Data Baru ({allowedDatasets.length} Dataset)</span>
        </button>
      </div>

      {/* Bab 13 KAK Migration Pipeline Visual */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="font-bold text-slate-900 mb-3">Alur Tata Kelola Migrasi Data (Bab 13 KAK)</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {migrationSteps.map((st, idx) => (
            <div key={idx} className="relative p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sky-800">{st.title}</span>
                {idx < migrationSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
                )}
              </div>
              <p className="text-slate-600">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role-Scoped Importable Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {allowedDatasets.map((cfg) => (
          <div
            key={cfg.type}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                  {cfg.kakRef}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                  <Database className="w-4 h-4 text-slate-400" />
                  {countByType[cfg.type]} Data Aktif
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{cfg.label}</h3>
              <p className="text-slate-600 mt-1">{cfg.description}</p>

              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-slate-500 font-semibold mb-1">Kolom Skema:</div>
                <div className="font-mono text-slate-700 break-words">{cfg.columns.join(', ')}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => openImport(cfg.type)}
                className="flex-1 px-3 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </button>
              <button
                onClick={() => downloadTemplateFile(cfg.type, 'xlsx')}
                className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1"
                title="Unduh Template Excel (.xlsx)"
              >
                <Download className="w-4 h-4" />
                <span>XLSX</span>
              </button>
              <button
                onClick={() => downloadTemplateFile(cfg.type, 'csv')}
                className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1"
                title="Unduh Template CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Import Logs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-900 mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Riwayat Aktivitas Import & Migrasi Data</span>
        </div>
        <div className="space-y-2">
          {state.auditLogs.filter((l) => l.action.toLowerCase().includes('impor') || l.action.toLowerCase().includes('migrasi')).length === 0 ? (
            <p className="text-slate-500">Belum ada sesi import pada sesi ini. Klik <strong>Import Data</strong> pada kartu dataset di atas untuk menguji migrasi (atau muat contoh data dry-run).</p>
          ) : (
            state.auditLogs
              .filter((l) => l.action.toLowerCase().includes('impor') || l.action.toLowerCase().includes('migrasi'))
              .map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-600 ml-2">oleh {log.user}</span>
                  </div>
                  <div className="font-mono text-emerald-800 font-semibold">{log.timestamp} &bull; {log.objectRef}</div>
                </div>
              ))
          )}
        </div>
      </div>

      <ImportDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={activeDataset}
        allowSwitchType={true}
      />
    </div>
  );
};
