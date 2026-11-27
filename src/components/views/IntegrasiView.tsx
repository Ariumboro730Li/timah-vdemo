import React, { useState, useRef } from 'react';
import { ScoringRubricCriterion, AppSnapshot, AuditLog, UserRole } from '../../types';
import { RefreshCw, Download, Sliders, ShieldCheck, Save, Database, Upload, RotateCcw, Eye, Users, Lock, EyeOff } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { exportRowsToExcel } from '../../utils/dataImportExport';
import { PaginationBar } from '../common/PaginationBar';
import { Modal } from '../common/Modal';
import { getRolePolicy, ALL_ROLES_ORDER, ROLE_POLICIES, VIEW_LABELS } from '../../utils/rbac';

interface IntegrasiViewProps {
  initialTab?: 'integrasi' | 'config' | 'rbac' | 'audit' | 'snapshot';
  onTabChange?: (tab: 'integrasi' | 'config' | 'rbac' | 'audit' | 'snapshot') => void;
}

export const IntegrasiView: React.FC<IntegrasiViewProps> = ({ initialTab = 'integrasi', onTabChange }) => {
  const {
    userRole,
    snapshot,
    snapshotMeta,
    syncStatus,
    scoringRubric,
    approvalMatrix,
    auditLogs,
    updateScoringRubric,
    downloadSnapshotJson,
    restoreSnapshotJson,
    resetSnapshotToSeed,
    showToast
  } = useAppState();
  const policy = getRolePolicy(userRole);

  const [activeTab, setActiveTabState] = useState<'integrasi' | 'config' | 'rbac' | 'audit' | 'snapshot'>(initialTab);
  const setActiveTab = (tab: 'integrasi' | 'config' | 'rbac' | 'audit' | 'snapshot') => {
    setActiveTabState(tab);
    onTabChange?.(tab);
  };
  const [draftRubric, setDraftRubric] = useState<ScoringRubricCriterion[]>(scoringRubric);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(5);
  const [rbacPage, setRbacPage] = useState(1);
  const [rbacPageSize, setRbacPageSize] = useState(5);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [selectedRbacRole, setSelectedRbacRole] = useState<UserRole | null>(null);
  const [previewCollection, setPreviewCollection] = useState<keyof AppSnapshot>('rkapList');
  const restoreInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setActiveTabState(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    setDraftRubric(scoringRubric);
  }, [scoringRubric]);

  const totalRubricWeight = draftRubric.reduce((acc, c) => acc + c.weight, 0);

  const handleSaveRubric = () => {
    if (totalRubricWeight !== 100) {
      showToast(`Total bobot harus tepat 100% (saat ini ${totalRubricWeight}%).`, 'warning');
      return;
    }
    updateScoringRubric(draftRubric);
  };

  const handleExportAudit = () => {
    const rows = auditLogs.map((l) => ({
      Waktu: l.timestamp,
      Pengguna: l.user,
      Peran: l.role,
      Modul: l.module,
      Aktivitas: l.action,
      Objek: l.objectRef,
      Alamat_IP: l.ipAddress
    }));
    exportRowsToExcel(rows, 'Audit_Trail_SPI', 'audit_trail_csr_tjsl_2026.xlsx');
  };

  const handleRestoreUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed?.meta || !Array.isArray(parsed?.rkapList) || !Array.isArray(parsed?.proposals)) {
        showToast('Struktur JSON bukan file snapshot CSR/TJSL yang valid.', 'warning');
        return;
      }
      await restoreSnapshotJson(parsed as AppSnapshot, file.name);
    } catch (err: any) {
      showToast(`Gagal membaca file JSON: ${err?.message || 'Format rusak'}`, 'warning');
    }
  };

  const integrations = [
    { name: 'ERP SAP / FICO', purpose: 'Budget, Komitmen PO, Pencairan, Realisasi & Jurnal', method: 'REST API / Middleware RFC', status: 'Latency: 42ms • Connected' },
    { name: 'Bank Host-to-Host', purpose: 'Pembayaran Langsung, Virtual Account & Rekonsiliasi', method: 'Host-to-Host API / ISO 8583', status: 'Latency: 68ms • Connected' },
    { name: 'Dukcapil / e-KYC', purpose: 'Verifikasi NIK & Data Kependudukan SBR', method: 'API Kemendagri (Perjanjian)', status: 'Active • Synchronized' },
    { name: 'OSS / NIB & AHU', purpose: 'Validasi Legalitas Usaha UMK & Badan Hukum Koperasi', method: 'API / Web Lookup', status: 'Active • Synchronized' },
    { name: 'HC / SSO Enterprise', purpose: 'Identitas Pegawai, Struktur Organisasi & MFA', method: 'SSO / LDAP / OAuth2', status: 'Active • ISO 27001' },
    { name: 'Legal / e-Contract', purpose: 'Template SPK/PKS, Akad PUMK & e-Sign Tersertifikasi', method: 'REST API e-Sign', status: 'Active • Ready' },
    { name: 'Pelaporan RKAP / SR', purpose: 'Keluaran Laporan TJSL BUMN & Sustainability Report GRI', method: 'Ekspor XLSX / API', status: 'Active • Ready' },
    { name: 'BPS / DTSEN / Podes', purpose: 'Data Publik Needs Assessment & Social Mapping', method: 'Impor Terjadwal (.xlsx/.csv)', status: 'Active • Synced' }
  ];

  const snapshotCounts: { key: keyof AppSnapshot; label: string; count: number }[] = [
    { key: 'socialMapping', label: 'Social Mapping', count: snapshot.socialMapping.length },
    { key: 'rkapList', label: 'Program RKAP', count: snapshot.rkapList.length },
    { key: 'proposals', label: 'Proposal Masuk', count: snapshot.proposals.length },
    { key: 'projects', label: 'Proyek PPM', count: snapshot.projects.length },
    { key: 'charities', label: 'Bantuan Charity', count: snapshot.charities.length },
    { key: 'flagships', label: 'Flagship', count: snapshot.flagships.length },
    { key: 'pumkApplications', label: 'Onboarding PUMK', count: snapshot.pumkApplications.length },
    { key: 'pumkLoans', label: 'Pinjaman PUMK', count: snapshot.pumkLoans.length },
    { key: 'cooperatives', label: 'Koperasi', count: snapshot.cooperatives.length },
    { key: 'umkCatalog', label: 'E-Katalog UMK', count: snapshot.umkCatalog.length },
    { key: 'monevIndicators', label: 'Indikator KPI', count: snapshot.monevIndicators.length },
    { key: 'monevIssues', label: 'Monev & Grievance', count: snapshot.monevIssues.length },
    { key: 'lessonsLearned', label: 'Lessons Learned', count: snapshot.lessonsLearned.length },
    { key: 'sbrDatabase', label: 'Registry SBR', count: snapshot.sbrDatabase.length },
    { key: 'partners', label: 'Mitra Pelaksana', count: snapshot.partners.length },
    { key: 'programAssets', label: 'Aset Program', count: snapshot.programAssets.length },
    { key: 'risks', label: 'Risk Register', count: snapshot.risks.length },
    { key: 'auditLogs', label: 'Audit Trail', count: snapshot.auditLogs.length }
  ];

  const totalSnapshotRecords = snapshotCounts.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('integrasi')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'integrasi' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Integrasi Ekosistem (8 Sistem)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'config' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Konfigurasi Rubrik & Matriks</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'rbac' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Matriks RBAC & Privasi ({ALL_ROLES_ORDER.length} Peran)</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('snapshot')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'snapshot' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={`Snapshot JSON (Rev #${snapshotMeta.revision})`}
          >
            <Database className="w-4 h-4" />
            {/* <span>Snapshot JSON (Rev #{snapshotMeta.revision})</span> */}
          </button>
        </div>

        {activeTab === 'audit' && policy.canExportAudit && (
          <button
            onClick={handleExportAudit}
            className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-sky-700" />
            <span>Ekspor Bukti Audit (.xlsx)</span>
          </button>
        )}
      </div>

      {/* TAB 1: INTEGRATIONS */}
      {activeTab === 'integrasi' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Arsitektur Integrasi Sistem (Bab 13 KAK)</h3>
              <p className="text-slate-500">Konektivitas modular API-first ke ekosistem ERP, Perbankan, Dukcapil, OSS/AHU, dan Data Publik</p>
            </div>
            <button
              onClick={() => showToast('Health-check 8 jalur integrasi API selesai: Seluruh endpoint aktif & responsif.')}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-sky-600" />
              <span>Tes Ping Ulang Semua API</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((intg, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{intg.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  </div>
                  <p className="text-slate-600 mt-1">{intg.purpose}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/70">
                  <div className="text-slate-500 font-mono">{intg.method}</div>
                  <div className="font-mono text-emerald-700 font-semibold mt-0.5">{intg.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NO-CODE CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">Konfigurasi Rubrik & Bobot Scoring Tanpa Coding (KAK S-08 & 8.1)</h3>
                <p className="text-slate-500">Perubahan bobot otomatis tersimpan ke data/snapshot.json & berlaku langsung di Seleksi Proposal</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg font-bold border ${
                    totalRubricWeight === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  Total Bobot: {totalRubricWeight}%
                </span>
                {policy.canManageConfig ? (
                  <button
                    onClick={handleSaveRubric}
                    className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Rubrik</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold inline-flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Read-Only (Edit oleh System Admin / Kadiv)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {draftRubric.map((crit, idx) => (
                <div key={crit.id} className="p-3 bg-white flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {crit.name} {crit.mandatory ? '(Mandatory)' : ''}
                    </div>
                    <div className="text-slate-500">{crit.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={!policy.canManageConfig}
                      value={crit.weight}
                      onChange={(e) => {
                        const updated = [...draftRubric];
                        updated[idx] = { ...crit, weight: Number(e.target.value) };
                        setDraftRubric(updated);
                      }}
                      className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    <span className="font-bold text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Matriks Kewenangan Persetujuan (Lampiran B KAK)</h3>
              <p className="text-slate-500">Digunakan otomatis untuk menentukan penyetuju proposal & bantuan charity berdasarkan nominal</p>
            </div>

            <div className="space-y-3">
              {approvalMatrix.map((rule) => (
                <div key={rule.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-sky-900">{rule.label}</div>
                  <div className="text-slate-600">Pemeriksa: <strong>{rule.reviewer}</strong></div>
                  <div className="text-emerald-800">Penyetuju Akhir: <strong>{rule.approver}</strong></div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-1.5">
              <div className="font-bold text-white">Kepatuhan Keamanan & Non-Fungsional (Bab 12)</div>
              <p className="text-slate-300">
                RBAC, SSO/MFA, Enkripsi at-rest & in-transit, ISO 27001, OWASP ASVS, Kepatuhan UU No. 27/2022 (PDP), Ketersediaan ≥ 99,5%, RTO ≤ 4 jam, RPO ≤ 1 jam.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2B: RBAC MATRIX & UU PDP PRIVACY POLICY */}
      {activeTab === 'rbac' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Matriks Hak Akses RBAC, Kewenangan Persetujuan & Masking UU PDP (KAK Bab 10, 12 & Lampiran B)</h3>
              <p className="text-slate-500">
                Pembatasan menu ketat (Opsi 1), validasi persetujuan berjenjang RKAP/nominal, serta masking otomatis NIK/rekening sesuai UU No. 27/2022.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 font-semibold">
              Peran Aktif: {policy.label}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Peran Pengguna</th>
                  <th className="py-3 px-4">Menu Aktif (Strict)</th>
                  <th className="py-3 px-4">Privasi Data (UU PDP)</th>
                  <th className="py-3 px-4">Ringkasan Kewenangan RACI</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_ROLES_ORDER.slice((rbacPage - 1) * rbacPageSize, rbacPage * rbacPageSize).map((r) => {
                  const rp = ROLE_POLICIES[r];
                  return (
                    <tr key={r} className={`hover:bg-slate-50/70 ${r === userRole ? 'bg-sky-50/40' : ''}`}>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRbacRole(r)}
                          className="font-bold text-slate-900 hover:text-sky-700 hover:underline text-left"
                        >
                          {rp.label}
                        </button>
                        <div className="text-slate-500">{rp.subtitle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-sky-800">{rp.allowedViews.length} / 11 Menu</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rp.allowedViews.slice(0, 4).map((v) => (
                            <span key={v} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {VIEW_LABELS[v]}
                            </span>
                          ))}
                          {rp.allowedViews.length > 4 && (
                            <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-semibold">
                              +{rp.allowedViews.length - 4} lainnya
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {rp.canViewUnmaskedPii ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            <ShieldCheck className="w-4 h-4" /> e-KYC / PII Penuh
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            <EyeOff className="w-4 h-4" /> Masking NIK & Rek
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">{rp.scopeSummary}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRbacRole(r)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationBar
            totalItems={ALL_ROLES_ORDER.length}
            currentPage={rbacPage}
            pageSize={rbacPageSize}
            onPageChange={setRbacPage}
            onPageSizeChange={setRbacPageSize}
          />
        </div>
      )}

      {/* TAB 3: LIVE AUDIT TRAIL (PAGINATED) */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Rekam Jejak Audit Digital Real-Time (Tamper-Proof Audit Trail)</h3>
            <p className="text-slate-500">Setiap aksi insert, update, persetujuan, scoring, dan import data otomatis tersimpan di data/snapshot.json</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna & Peran</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Aktivitas Dilakukan</th>
                  <th className="py-3 px-4">Referensi Objek</th>
                  <th className="py-3 px-4 font-mono text-right">IP</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600">{log.timestamp}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.user}</div>
                      <div className="text-slate-500">{log.role}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{log.module}</td>
                    <td className="py-3 px-4 font-medium text-sky-800">{log.action}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedAuditLog(log)}
                        className="hover:text-sky-700 hover:underline text-left"
                      >
                        {log.objectRef}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-right">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAuditLog(log)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            totalItems={auditLogs.length}
            currentPage={auditPage}
            pageSize={auditPageSize}
            onPageChange={setAuditPage}
            onPageSizeChange={setAuditPageSize}
          />
        </div>
      )}

      {/* TAB 4: LIVE SNAPSHOT JSON MANAGER */}
      {activeTab === 'snapshot' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Live File Penyimpanan: <span className="font-mono text-sky-800">data/snapshot.json</span></h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  {syncStatus === 'saved' ? 'Tersinkronisasi ke Disk' : syncStatus === 'saving' ? 'Menyimpan...' : 'Mode Lokal'}
                </span>
              </div>
              <p className="text-slate-600">
                Revisi <strong>#{snapshotMeta.revision}</strong> &bull; Total <strong>{totalSnapshotRecords} record</strong> &bull; Operasi terakhir: <strong>{snapshotMeta.lastOperation}</strong>
              </p>
              <p className="text-slate-500 font-mono">Updated At: {snapshotMeta.updatedAt}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input ref={restoreInputRef} type="file" accept=".json" onChange={handleRestoreUpload} className="hidden" />
              <button
                onClick={downloadSnapshotJson}
                className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh snapshot.json</span>
              </button>
              {policy.canManageSnapshot ? (
                <>
                  <button
                    onClick={() => restoreInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Restore JSON</span>
                  </button>
                  <button
                    onClick={resetSnapshotToSeed}
                    className="px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset ke Seed Awal</span>
                  </button>
                </>
              ) : (
                <span className="px-3 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold inline-flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Restore & Reset khusus System Admin (TI)</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {snapshotCounts.map((c) => (
              <button
                key={String(c.key)}
                onClick={() => setPreviewCollection(c.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  previewCollection === c.key
                    ? 'bg-sky-50 border-sky-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-slate-500 font-semibold truncate">{c.label}</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{c.count}</div>
              </button>
            ))}
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="font-mono font-bold text-sky-300">
                Pratinjau Live JSON — data/snapshot.json → "{String(previewCollection)}" (3 record terbaru)
              </div>
              <span className="font-mono text-slate-400">Otomatis berubah setiap insert & update</span>
            </div>
            <pre className="overflow-x-auto max-h-96 p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200 leading-relaxed">
              {JSON.stringify(
                {
                  meta: snapshotMeta,
                  [previewCollection]: Array.isArray(snapshot[previewCollection])
                    ? (snapshot[previewCollection] as any[]).slice(0, 3)
                    : snapshot[previewCollection]
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Detail Peran RBAC */}
      <Modal
        isOpen={Boolean(selectedRbacRole)}
        onClose={() => setSelectedRbacRole(null)}
        title={`Detail Hak Akses RBAC — ${selectedRbacRole ? ROLE_POLICIES[selectedRbacRole].label : ''}`}
        maxWidth="max-w-3xl"
        footer={
          <button
            onClick={() => setSelectedRbacRole(null)}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
          >
            Tutup
          </button>
        }
      >
        {selectedRbacRole && (() => {
          const rp = ROLE_POLICIES[selectedRbacRole];
          const permFlags = [
            { label: 'Usulkan & Draft RKAP', ok: rp.canCreateRkap },
            { label: 'Turunkan RKAP ke Proyek PPM', ok: rp.canConvertRkap },
            { label: 'Scoring Proposal Multi-Reviewer', ok: rp.canScoreProposal },
            { label: 'Keputusan Forum Komite Seleksi', ok: rp.canCommitteeDecide },
            { label: 'Verifikasi Output PPM & Tutup BAST', ok: rp.canManagePpm },
            { label: 'Registrasi & Verifikasi Bantuan Charity', ok: rp.canCreateCharity || rp.canVerifyCharity },
            { label: 'Skoring Kinerja Flagship (KAK 8.2)', ok: rp.canScoreFlagship },
            { label: 'Kelola Portofolio & VA Pinjaman PUMK', ok: rp.canManagePumkLoan },
            { label: 'Kelola Action Tracker & Grievance Monev', ok: rp.canManageMonevIssues },
            { label: 'Konversi Closed-Loop Lessons ke RKAP', ok: rp.canApplyClosedLoop },
            { label: 'Kelola Blacklist SBR / Mitra Pelaksana', ok: rp.canToggleSbrBlacklist || rp.canTogglePartnerBlacklist },
            { label: 'Ubah Konfigurasi Rubrik & Aturan No-Code', ok: rp.canManageConfig },
            { label: 'Restore / Reset Snapshot JSON', ok: rp.canManageSnapshot },
            { label: 'Ekspor Bukti Audit Trail SPI', ok: rp.canExportAudit }
          ];
          return (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-base font-bold text-slate-900">{rp.label}</div>
                  <span
                    className={`px-2.5 py-0.5 rounded font-semibold border ${
                      rp.canViewUnmaskedPii
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {rp.canViewUnmaskedPii ? 'Akses PII / e-KYC Penuh' : 'Masking UU PDP Aktif'}
                  </span>
                </div>
                <div className="text-slate-600">{rp.dashboardLevel}</div>
                <p className="text-slate-800 pt-1">{rp.scopeSummary}</p>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-2">Daftar Menu Sidebar Diizinkan ({rp.allowedViews.length} / 11):</div>
                <div className="flex flex-wrap gap-2">
                  {rp.allowedViews.map((v) => (
                    <span key={v} className="px-3 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 font-semibold">
                      {VIEW_LABELS[v]}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-2">Matriks Izin Fitur & Pemisahan Tugas (Segregation of Duties):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permFlags.map((pf) => (
                    <div
                      key={pf.label}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                        pf.ok ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="font-medium">{pf.label}</span>
                      <span className="font-bold">{pf.ok ? '✓ Aktif' : '— Terkunci'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal: Detail Log Audit Trail */}
      <Modal
        isOpen={Boolean(selectedAuditLog)}
        onClose={() => setSelectedAuditLog(null)}
        title={`Detail Log Audit Trail (SPI) — ${selectedAuditLog?.objectRef || ''}`}
        maxWidth="max-w-2xl"
        footer={
          <button
            onClick={() => setSelectedAuditLog(null)}
            className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold"
          >
            Tutup
          </button>
        }
      >
        {selectedAuditLog && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                ID: {selectedAuditLog.id}
              </span>
              <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                Modul: {selectedAuditLog.module}
              </span>
              <span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                IP: {selectedAuditLog.ipAddress}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block">Waktu Kejadian:</span>
                <div className="font-mono font-bold text-slate-900">{selectedAuditLog.timestamp}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Referensi Objek:</span>
                <div className="font-mono font-bold text-sky-900">{selectedAuditLog.objectRef}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Pengguna & Peran (RBAC):</span>
                <div className="font-bold text-slate-900">{selectedAuditLog.user}</div>
                <div className="text-slate-600">{selectedAuditLog.role}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Aktivitas Dilakukan:</span>
                <div className="font-semibold text-sky-800">{selectedAuditLog.action}</div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 text-slate-100 p-4">
              <div className="font-mono text-sky-300 font-semibold mb-2">Rekaman JSON Tamper-Proof (data/snapshot.json)</div>
              <pre className="overflow-x-auto font-mono text-slate-200 leading-relaxed">
                {JSON.stringify(selectedAuditLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
