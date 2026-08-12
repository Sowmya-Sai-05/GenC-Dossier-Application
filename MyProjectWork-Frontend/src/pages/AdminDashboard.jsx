import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { getAllCandidates, uploadExcel, uploadAIFluency, registerLeader, clearLeaderRegistration, deleteCandidate, getIngestionLogs, getIngestionLogDetails, clearIngestionLogDetails, getLeaders, deleteLeader, getAICatalogue, getAITracking } from '../store/slices/adminSlice';
import { FcComboChart, FcConferenceCall, FcDocument, FcUpload, FcBusinessman, FcDatabase } from 'react-icons/fc';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle, MdError, MdDelete, MdWarning, MdCloudUpload, MdClose, MdListAlt, MdAddCircleOutline, MdSync, MdBlock, MdRefresh, MdSchema, MdReportProblem, MdInfoOutline, MdAccessTime, MdMenu } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';
import ChangePasswordButton from '../components/ChangePasswordButton';
import Pagination from '../components/Pagination';
import UploadProgressOverlay from '../components/UploadProgressOverlay';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentPage, setCurrentPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { candidates, loading, pagination } = useSelector((state) => state.admin);
  const { role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (role !== 'ROLE_ADMIN') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (activeTab === 'trainees') {
      dispatch(getAllCandidates({ page: currentPage }));
    }
  }, [activeTab, dispatch, currentPage]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleViewTalentCard = (associateId) => {
    navigate(`/admin/talent-card/${associateId}`);
  };

  const handleDeleteCandidate = async (associateId) => {
    const result = await dispatch(deleteCandidate(associateId));
    if (result.meta.requestStatus === 'fulfilled') {
      // Refetch in case the current page is now empty / pagination shifted
      dispatch(getAllCandidates({ page: currentPage }));
    }
  };

  const menuItems = [
    { id: 'upload', label: 'Upload Excel' },
    { id: 'ai-learning', label: 'AI Learning Ingestion' },
    { id: 'trainees', label: 'All Trainees' },
    { id: 'register-leader', label: 'Register Leader' },
    { id: 'logs', label: 'Ingestion Logs' },
  ];

  const iconFor = (label) => {
    if (label === 'Upload Excel') return <FcUpload size="1.5em" />;
    if (label === 'AI Learning Ingestion') return <FcDatabase size="1.5em" />;
    if (label === 'All Trainees') return <FcConferenceCall size="1.5em" />;
    if (label === 'Register Leader') return <FcBusinessman size="1.5em" />;
    if (label === 'Ingestion Logs') return <FcComboChart size="1.5em" />;
    return null;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex">
      {/* Decorative blobs in the page background */}
      <div className="pointer-events-none fixed -top-32 -left-24 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 -right-24 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-white/90 backdrop-blur ring-1 ring-gray-200 shadow-md rounded-lg p-2 text-gray-700 hover:text-indigo-600"
        aria-label="Open menu"
      >
        <MdMenu size="1.5em" />
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/60 shadow-xl shadow-indigo-100/40 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-200/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage talent & ingestion</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-700"
            aria-label="Close menu"
          >
            <MdClose size="1.4em" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-700 hover:bg-indigo-50/60'
                }`}
              >
                <span className={`shrink-0 rounded-lg p-1 ${isActive ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                  {iconFor(item.label)}
                </span>
                <span className="text-left flex-1">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/70 space-y-2 bg-white/50">
          <ChangePasswordButton panelLabel="Admin Panel" />
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-2 px-4 rounded-lg shadow-md shadow-rose-200 transition-all font-semibold text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 relative z-10">
        {activeTab === 'upload' && <ExcelUpload onViewLogs={() => setActiveTab('logs')} />}
        {activeTab === 'ai-learning' && <AILearningUpload onViewLogs={() => setActiveTab('logs')} />}
        {activeTab === 'trainees' && (
          <TraineesList
            candidates={candidates}
            loading={loading}
            onViewTalentCard={handleViewTalentCard}
            onDeleteCandidate={handleDeleteCandidate}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {activeTab === 'register-leader' && <RegisterLeader />}
        {activeTab === 'logs' && <IngestionLogs />}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Excel Upload Component
// ─────────────────────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const isExcelFile = (f) => {
  if (!f) return false;
  const name = f.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls');
};

const StatCard = ({ Icon, label, value, color }) => (
  <div className={`rounded-xl border ${color.border} ${color.bg} p-4`}>
    <div className="flex items-center justify-between">
      <span className={`text-xs font-semibold uppercase tracking-wide ${color.text}`}>{label}</span>
      <Icon className={color.text} size="1.2em" />
    </div>
    <p className={`text-3xl font-bold mt-2 ${color.text}`}>{value ?? 0}</p>
  </div>
);

const ExcelUpload = ({ onViewLogs }) => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, error, uploadProgress, uploadPhase } = useSelector((state) => state.admin);

  const acceptFile = (f) => {
    if (!f) return;
    if (!isExcelFile(f)) {
      setLocalError('Only .xlsx and .xls files are supported.');
      return;
    }
    setFile(f);
    setUploadResult(null);
    setLocalError('');
  };

  const handleFileChange = (e) => acceptFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadResult(null);
    setLocalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    const result = await dispatch(uploadExcel(file));
    if (result.meta.requestStatus === 'fulfilled') {
      setUploadResult(result.payload);
    } else {
      setUploadResult(null);
    }
  };

  const apiErrorMessage =
    typeof error === 'string'
      ? error
      : error?.message || (error ? JSON.stringify(error) : null);
  const apiErrorList = Array.isArray(error?.errors) ? error.errors : [];

  return (
    <div className="max-w-3xl">
      {/* Full-screen progress overlay while uploading + processing */}
      <UploadProgressOverlay
        open={uploadPhase === 'uploading' || uploadPhase === 'processing'}
        phase={uploadPhase}
        progress={uploadProgress}
        fileName={file?.name}
        fileSize={file?.size}
      />

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FcUpload size="1.2em" /> Upload Excel File
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Import a candidate roster. New rows are inserted; existing rows are merged.
          Accepted formats: <span className="font-medium">.xlsx</span>, <span className="font-medium">.xls</span>.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        {/* Drop zone OR file preview */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all px-6 py-12 flex flex-col items-center justify-center text-center
              ${isDragging
                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
              <MdCloudUpload className={isDragging ? 'text-indigo-600' : 'text-indigo-500'} size="2.2em" />
            </div>
            <p className="text-base font-semibold text-gray-700">
              {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or <span className="text-indigo-600 font-medium underline-offset-2 hover:underline">browse from your computer</span>
            </p>
            <p className="text-xs text-gray-400 mt-3">XLSX or XLS</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <FaFileExcel className="text-emerald-600" size="1.6em" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatFileSize(file.size)} • Ready to upload
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              disabled={loading}
              className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors p-1"
              aria-label="Remove file"
              title="Remove file"
            >
              <MdClose size="1.4em" />
            </button>
          </div>
        )}

        {/* Local validation error (e.g. wrong file type) */}
        {localError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <MdError className="text-red-500 mt-0.5 shrink-0" size="1.2em" />
            <p className="text-sm text-red-700">{localError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClearFile}
            disabled={!file || loading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {uploadPhase === 'processing' ? 'Processing…' : `Uploading ${uploadProgress}%`}
              </>
            ) : (
              <>
                <MdCloudUpload size="1.2em" />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>

      {/* API error */}
      {error && apiErrorMessage && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <MdError className="text-red-600" size="1.3em" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Upload Failed</h4>
              <p className="text-sm text-red-700 mt-1">{apiErrorMessage}</p>
              {apiErrorList.length > 0 && (
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-0.5">
                  {apiErrorList.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success / processed result. Tone-of-voice adapts to the outcome:
            saved + merged > 0 with no rejects  → green "Upload Complete"
            saved + merged > 0 with some rejects → green "Upload Complete" (partial)
            saved + merged == 0 (all rejected)   → amber "Upload Processed — No New Records Added"
      */}
      {uploadResult && (() => {
        const succeeded = (uploadResult.savedRecords || 0) + (uploadResult.mergedRecords || 0);
        const hasRejects = (uploadResult.rejectedRecords || 0) > 0;
        const allRejected = succeeded === 0 && (uploadResult.totalRecords || 0) > 0;
        const headerCfg = allRejected
          ? { card: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
              Icon: MdWarning, title: 'Upload Processed — No New Records Added',
              subtitle: 'All rows already exist or were rejected. See the breakdown and reasons below.' }
          : hasRejects
            ? { card: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
                Icon: MdCheckCircle, title: 'Upload Complete (with issues)',
                subtitle: uploadResult.schemaValidationMessage || 'Some rows were saved; others were rejected.' }
            : { card: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
                Icon: MdCheckCircle, title: 'Upload Complete',
                subtitle: uploadResult.schemaValidationMessage || 'File processed successfully.' };
        const H = headerCfg.Icon;
        return (
        <div className={`mt-6 rounded-2xl border ${headerCfg.card} bg-white shadow-md p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-full ${headerCfg.iconBg} flex items-center justify-center`}>
              <H className={headerCfg.iconColor} size="1.5em" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{headerCfg.title}</h4>
              <p className="text-xs text-gray-500">{headerCfg.subtitle}</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              Icon={MdListAlt}
              label="Total"
              value={uploadResult.totalRecords}
              color={{ bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }}
            />
            <StatCard
              Icon={MdAddCircleOutline}
              label="New / Saved"
              value={uploadResult.savedRecords}
              color={{ bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' }}
            />
            <StatCard
              Icon={MdSync}
              label="Merged"
              value={uploadResult.mergedRecords}
              color={{ bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }}
            />
            <StatCard
              Icon={MdBlock}
              label="Rejected"
              value={uploadResult.rejectedRecords}
              color={{ bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' }}
            />
          </div>

          {/* Inline errors from the result (rows that failed) */}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <>
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MdWarning className="text-amber-600" size="1.1em" />
                  <h5 className="text-sm font-semibold text-amber-800">
                    {uploadResult.errors.length} row{uploadResult.errors.length > 1 ? 's' : ''} had issues
                  </h5>
                </div>
                <ul className="list-disc list-inside text-sm text-amber-900 space-y-0.5 max-h-48 overflow-y-auto">
                  {uploadResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>

              {onViewLogs && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={onViewLogs}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 transition-colors"
                  >
                    <MdListAlt size="1.1em" />
                    View full ingestion log
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        );
      })()}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Learning Upload Component
// One drop zone handles a single workbook containing both the Master Data
// (catalogue) sheet and the completion-tracking sheet; the backend processes
// both in one pass.
// ─────────────────────────────────────────────────────────────────────────────
const AILearningUpload = ({ onViewLogs }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, error, uploadResult, uploadProgress, uploadPhase, catalogueList, catalogueLoading, trackingList, trackingLoading } = useSelector((state) => state.admin);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const acceptFile = (f) => {
    if (!f) return;
    if (!isExcelFile(f)) {
      setLocalError('Only .xlsx and .xls files are supported.');
      return;
    }
    setFile(f);
    setLocalError('');
  };

  const handleFileChange = (e) => acceptFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleClearFile = () => {
    setFile(null);
    setLocalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    await dispatch(uploadAIFluency(file));
  };

  const fetchCatalogue = async () => {
    await dispatch(getAICatalogue());
    setShowCatalogue(true);
  };

  const fetchTracking = async () => {
    // Columns are driven by the full catalogue (every course, even ones an associate
    // has no record for yet), so make sure it's loaded alongside the tracking data.
    await Promise.all([dispatch(getAICatalogue()), dispatch(getAITracking())]);
    setShowTracking(true);
  };

  const apiErrorMessage = typeof error === 'string' ? error : error?.message || (error ? JSON.stringify(error) : null);
  const apiErrorList = Array.isArray(error?.errors) ? error.errors : [];

  return (
    <div className="max-w-3xl">
      <UploadProgressOverlay
        open={uploadPhase === 'uploading' || uploadPhase === 'processing'}
        phase={uploadPhase}
        progress={uploadProgress}
        fileName={file?.name}
        fileSize={file?.size}
      />
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FcDatabase size="1.2em" /> AI Learning Ingestion
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload one workbook containing the <span className="font-medium">Master Data</span> (course catalogue) sheet
          and the <span className="font-medium">completion tracking</span> sheet — both are processed together.
          Only courses present in the Master Data sheet are tracked. Accepted formats:{' '}
          <span className="font-medium">.xlsx</span>, <span className="font-medium">.xls</span>.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all px-6 py-12 flex flex-col items-center justify-center text-center
              ${isDragging
                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
              <MdCloudUpload className={isDragging ? 'text-indigo-600' : 'text-indigo-500'} size="2.2em" />
            </div>
            <p className="text-base font-semibold text-gray-700">
              {isDragging ? 'Drop your file here' : 'Drag & drop your AI Learning workbook here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or <span className="text-indigo-600 font-medium underline-offset-2 hover:underline">browse from your computer</span>
            </p>
            <p className="text-xs text-gray-400 mt-3">XLSX or XLS · Master Data + Tracking sheets</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <FaFileExcel className="text-emerald-600" size="1.6em" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatFileSize(file.size)} • Ready to upload
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              disabled={loading}
              className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors p-1"
              aria-label="Remove file"
              title="Remove file"
            >
              <MdClose size="1.4em" />
            </button>
          </div>
        )}

        {localError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <MdError className="text-red-500 mt-0.5 shrink-0" size="1.2em" />
            <p className="text-sm text-red-700">{localError}</p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClearFile}
            disabled={!file || loading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {uploadPhase === 'processing' ? 'Processing…' : `Uploading ${uploadProgress}%`}
              </>
            ) : (
              <>
                <MdCloudUpload size="1.2em" />
                Upload Workbook
              </>
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={fetchCatalogue}
            disabled={catalogueLoading}
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 disabled:opacity-50"
          >
            View Catalogue
          </button>
          <button
            onClick={fetchTracking}
            disabled={trackingLoading}
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 disabled:opacity-50"
          >
            View Tracking
          </button>
        </div>
      </div>

      {error && apiErrorMessage && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <MdError className="text-red-600" size="1.3em" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Upload Failed</h4>
              <p className="text-sm text-red-700 mt-1">{apiErrorMessage}</p>
              {apiErrorList.length > 0 && (
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-0.5">
                  {apiErrorList.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {uploadResult && (() => {
        const succeeded = (uploadResult.savedRecords || 0) + (uploadResult.mergedRecords || 0);
        const hasRejects = (uploadResult.rejectedRecords || 0) > 0;
        const allRejected = succeeded === 0 && (uploadResult.totalRecords || 0) > 0;
        const headerCfg = allRejected
          ? { card: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
              Icon: MdWarning, title: 'Upload Processed — No New Records Added',
              subtitle: 'All rows already exist or were rejected. See the notes below.' }
          : hasRejects
            ? { card: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
                Icon: MdCheckCircle, title: 'Upload Complete (with issues)',
                subtitle: uploadResult.schemaValidationMessage || 'Some rows were saved; others were rejected or skipped.' }
            : { card: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
                Icon: MdCheckCircle, title: 'Upload Complete',
                subtitle: uploadResult.schemaValidationMessage || 'Workbook processed successfully.' };
        const H = headerCfg.Icon;
        return (
        <div className={`mt-6 rounded-2xl border ${headerCfg.card} bg-white shadow-md p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-full ${headerCfg.iconBg} flex items-center justify-center`}>
              <H className={headerCfg.iconColor} size="1.5em" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{headerCfg.title}</h4>
              <p className="text-xs text-gray-500">{headerCfg.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              Icon={MdListAlt}
              label="Total"
              value={uploadResult.totalRecords}
              color={{ bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }}
            />
            <StatCard
              Icon={MdAddCircleOutline}
              label="New / Saved"
              value={uploadResult.savedRecords}
              color={{ bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' }}
            />
            <StatCard
              Icon={MdSync}
              label="Merged"
              value={uploadResult.mergedRecords}
              color={{ bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }}
            />
            <StatCard
              Icon={MdBlock}
              label="Rejected"
              value={uploadResult.rejectedRecords}
              color={{ bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' }}
            />
          </div>

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <>
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MdWarning className="text-amber-600" size="1.1em" />
                  <h5 className="text-sm font-semibold text-amber-800">
                    {uploadResult.errors.length} note{uploadResult.errors.length > 1 ? 's' : ''}
                  </h5>
                </div>
                <ul className="list-disc list-inside text-sm text-amber-900 space-y-0.5 max-h-48 overflow-y-auto">
                  {uploadResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>

              {onViewLogs && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={onViewLogs}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 transition-colors"
                  >
                    <MdListAlt size="1.1em" />
                    View full ingestion log
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        );
      })()}

      {showCatalogue && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">AI Learning Catalogue</h4>
            <button onClick={() => setShowCatalogue(false)} className="text-sm text-gray-500">Close</button>
          </div>
          {catalogueLoading ? (
            <div>Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogueList.map((c) => (
                    <tr key={c.courseCode} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{c.courseCode}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.type}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.courseName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {showTracking && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">AI Learning Tracking</h4>
            <button onClick={() => setShowTracking(false)} className="text-sm text-gray-500">Close</button>
          </div>
          {trackingLoading ? (
            <div>Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              {trackingList.length > 0 ? (
                <TrackingPivotTable trackingData={trackingList} catalogue={catalogueList} />
              ) : (
                <div className="text-center py-8 text-gray-500">No tracking data available</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Tracking Pivot Table Component
// The backend already groups by associate (one entry per associate id, with a `courses`
// list) — this only lays that out as a grid. Columns come from the full catalogue (not
// just courses a given associate happens to have a status for), so every associate row
// shows the same set of course columns, matching the uploaded Excel layout.
const TrackingPivotTable = ({ trackingData, catalogue }) => {
  const courseCodes = catalogue && catalogue.length > 0
    ? catalogue.map((c) => c.courseCode)
    : Array.from(new Set(trackingData.flatMap((r) => (r.courses || []).map((c) => c.courseCode)))).sort();

  const rows = [...trackingData].sort((a, b) => (a.associateId || 0) - (b.associateId || 0));

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-yellow-100">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Associate ID</th>
          <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Name</th>
          {courseCodes.map((code) => (
            <th key={code} className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase bg-yellow-50">
              {code}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => {
          const statusByCode = {};
          (row.courses || []).forEach((c) => { statusByCode[c.courseCode] = c.status; });
          return (
            <tr key={row.associateId ?? idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2 text-sm font-semibold text-gray-900">{row.associateId}</td>
              <td className="px-4 py-2 text-sm text-gray-900">{row.candidateName}</td>
              {courseCodes.map((courseCode) => {
                const status = statusByCode[courseCode] || 'Not Tracked';
                return (
                  <td key={courseCode} className="px-4 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : status === 'Yet to Start'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {status}
                    </span>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};



// Trainees List Component
const TraineesList = ({ candidates, loading, onViewTalentCard, onDeleteCandidate, pagination, currentPage, onPageChange }) => {
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (loading) {
    return <div className="text-center py-8">Loading trainees...</div>;
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteCandidate(deleteTarget.associateId);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-6xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">All Trainees</h3>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <tr key={candidate.associateId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {candidate.associateId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.candidateName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.cognizantEmailID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.trackName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewTalentCard(candidate.associateId)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100"
                      >
                        View Talent Card
                      </button>
                      {/* <button
                        onClick={() => setDeleteTarget(candidate)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 flex items-center gap-1"
                        title="Delete talent card"
                      >
                        <MdDelete size="1.1em" /> Delete
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing {candidates.length > 0 ? currentPage * pagination.pageSize + 1 : 0} to{' '}
          {Math.min((currentPage + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
          {pagination.totalElements} trainees (Page {currentPage + 1} of {pagination.totalPages})
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          isLast={pagination.isLast}
        />
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2 shrink-0">
                <MdWarning className="text-red-600" size="1.6em" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">Delete Talent Card?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This will permanently delete <span className="font-medium">{deleteTarget.candidateName}</span>{' '}
                  (Associate ID {deleteTarget.associateId}) and all associated skills, projects, certifications,
                  achievements, and scores. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1.5"
              >
                <MdDelete size="1.1em" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Leader Management — list of leaders + register / delete actions
// ─────────────────────────────────────────────────────────────────────────────
const RegisterLeader = () => {
  const dispatch = useDispatch();
  const { leaders, leadersLoading } = useSelector((state) => state.admin);
  const [showRegister, setShowRegister] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(getLeaders());
  }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(deleteLeader(deleteTarget.userId));
    setDeleting(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FcBusinessman size="1.2em" /> Leader Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Create, view, and remove Leader accounts. Leaders can search and filter the candidate pool.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(getLeaders())}
            disabled={leadersLoading}
            className="flex items-center gap-1.5 text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <MdRefresh size="1.1em" /> Refresh
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm hover:shadow transition-all"
          >
            <MdAddCircleOutline size="1.2em" /> Register New Leader
          </button>
        </div>
      </div>

      {/* Leaders table */}
      {leadersLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">Loading leaders…</div>
      ) : leaders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
          <FcBusinessman size="3em" className="mx-auto mb-2" />
          <p className="font-medium text-gray-700">No leaders yet</p>
          <p className="text-sm mt-1">Click "Register New Leader" to create the first one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Id</th> */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                {/* <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaders.map((leader) => (
                <tr key={leader.userId} className="hover:bg-gray-50">
                  {/* <td className="px-4 py-3 text-sm text-gray-500 font-mono">{leader.userId}</td> */}
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                        {leader.email ? leader.email.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="font-medium">{leader.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      <FcBusinessman /> Leader
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {/* <button
                      onClick={() => setDeleteTarget(leader)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      <MdDelete size="1.1em" /> Delete
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register modal */}
      {showRegister && <RegisterLeaderModal onClose={() => setShowRegister(false)} />}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2 shrink-0">
                <MdWarning className="text-red-600" size="1.6em" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">Delete Leader?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This will permanently delete <span className="font-medium">{deleteTarget.email}</span>'s leader
                  account. They will no longer be able to log in.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? 'Deleting…' : (<><MdDelete size="1.1em" /> Delete Leader</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Register Leader modal — opened from Leader Management header
const RegisterLeaderModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { leaderRegistrationLoading, leaderRegistrationError, leaderRegistrationResult } = useSelector(
    (state) => state.admin
  );

  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    dispatch(clearLeaderRegistration());
    return () => {
      dispatch(clearLeaderRegistration());
    };
  }, [dispatch]);

  // Close-on-Escape + body scroll lock
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !leaderRegistrationLoading) onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, leaderRegistrationLoading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    if (leaderRegistrationError) dispatch(clearLeaderRegistration());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const { email, password, confirmPassword } = formData;

    if (!email || !password) {
      setValidationError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    const result = await dispatch(registerLeader({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      setFormData({ email: '', password: '', confirmPassword: '' });
      // Close the modal shortly after the success banner shows
      setTimeout(() => onClose(), 1100);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !leaderRegistrationLoading && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <FcBusinessman size="1.5em" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Register New Leader</h3>
              <p className="text-xs text-gray-500 mt-0.5">Creates a Leader-role account.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={leaderRegistrationLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <MdClose size="1.5em" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MdEmail className="text-indigo-500" size="1.1em" /> Leader Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="leader@cognizant.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MdLock className="text-indigo-500" size="1.1em" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <MdVisibilityOff size="1.3em" /> : <MdVisibility size="1.3em" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MdLock className="text-indigo-500" size="1.1em" /> Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <MdVisibilityOff size="1.3em" /> : <MdVisibility size="1.3em" />}
              </button>
            </div>
          </div>

          {(validationError || leaderRegistrationError) && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <MdError className="text-red-500 mt-0.5 shrink-0" size="1.2em" />
              <p className="text-sm text-red-700">
                {validationError || leaderRegistrationError}
              </p>
            </div>
          )}

          {leaderRegistrationResult && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <MdCheckCircle className="text-green-600 mt-0.5 shrink-0" size="1.2em" />
              <div className="text-sm text-green-700">
                <p className="font-semibold">Leader registered successfully.</p>
                <p className="text-xs mt-0.5">
                  Email: <span className="font-medium">{leaderRegistrationResult.email}</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={leaderRegistrationLoading}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={leaderRegistrationLoading}
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {leaderRegistrationLoading ? 'Creating…' : (<><MdAddCircleOutline size="1.2em" /> Create Leader</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Ingestion Logs — list of every upload attempt with drill-down on failure
// ─────────────────────────────────────────────────────────────────────────────
const formatLogTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const statusBadge = (status) => {
  switch (status) {
    case 'SUCCESS':
      return { text: 'Success', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: MdCheckCircle };
    case 'PARTIAL':
      return { text: 'Partial', cls: 'bg-amber-100 text-amber-700 border-amber-200', Icon: MdWarning };
    case 'FAILED':
      return { text: 'Failed', cls: 'bg-red-100 text-red-700 border-red-200', Icon: MdError };
    default:
      return { text: status || 'Unknown', cls: 'bg-gray-100 text-gray-600 border-gray-200', Icon: MdInfoOutline };
  }
};

const IngestionLogs = () => {
  const dispatch = useDispatch();
  const { ingestionLogs, ingestionLogsLoading, ingestionLogDetails, ingestionLogDetailsLoading } =
    useSelector((state) => state.admin);
  const [openLogId, setOpenLogId] = useState(null);

  useEffect(() => {
    dispatch(getIngestionLogs());
  }, [dispatch]);

  const openDetails = (id) => {
    setOpenLogId(id);
    dispatch(getIngestionLogDetails(id));
  };

  const closeDetails = () => {
    setOpenLogId(null);
    dispatch(clearIngestionLogDetails());
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FcComboChart size="1.2em" /> Ingestion Logs
        </h3>
        <button
          onClick={() => dispatch(getIngestionLogs())}
          disabled={ingestionLogsLoading}
          className="flex items-center gap-1.5 text-sm font-medium border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
          title="Refresh"
        >
          <MdRefresh size="1.1em" /> Refresh
        </button>
      </div>

      {ingestionLogsLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
          Loading ingestion logs…
        </div>
      ) : ingestionLogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
          <MdInfoOutline size="2.5em" className="mx-auto mb-2 text-gray-300" />
          <p>No upload attempts yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Saved</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Merged</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Rejected</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ingestionLogs.map((log) => {
                const b = statusBadge(log.status);
                const StatusIcon = b.Icon;
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <FaFileExcel className="text-emerald-600 shrink-0" />
                        <span className="font-medium truncate max-w-[260px]" title={log.fileName}>
                          {log.fileName}
                        </span>
                      </div>
                      {log.uploadedBy && (
                        <p className="text-xs text-gray-400 mt-0.5 ml-6">by {log.uploadedBy}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <MdAccessTime size="1em" className="text-gray-400" />
                        {formatLogTime(log.uploadedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${b.cls}`}>
                        <StatusIcon size="1em" />
                        {b.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{log.totalRecords}</td>
                    <td className="px-4 py-3 text-sm text-emerald-700 text-right font-medium">{log.savedRecords}</td>
                    <td className="px-4 py-3 text-sm text-amber-700 text-right font-medium">{log.mergedRecords}</td>
                    <td className="px-4 py-3 text-sm text-rose-700 text-right font-medium">{log.rejectedRecords}</td>
                    <td className="px-4 py-3 text-sm">
                      {log.status === 'SUCCESS' ? (
                        <span className="text-xs text-gray-400">No issues</span>
                      ) : (
                        <button
                          onClick={() => openDetails(log.id)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-medium"
                        >
                          <MdInfoOutline size="1.1em" /> View Reason
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drill-down modal */}
      {openLogId && (
        <IngestionLogDetailsModal
          loading={ingestionLogDetailsLoading}
          payload={ingestionLogDetails}
          onClose={closeDetails}
        />
      )}
    </div>
  );
};

const IngestionLogDetailsModal = ({ loading, payload, onClose }) => {
  const log = payload?.log;
  const errors = payload?.errors || [];

  // Partition errors into schema vs data vs processing for clearer presentation
  const schemaErrors = errors.filter((e) => e.errorType === 'SCHEMA');
  const dataErrors = errors.filter((e) => e.errorType === 'DATA');
  const processingErrors = errors.filter((e) => e.errorType === 'PROCESSING');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MdReportProblem className="text-rose-500" size="1.3em" /> Upload Failure Details
            </h3>
            {log && (
              <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1"><FaFileExcel className="text-emerald-600" /> {log.fileName}</span>
                <span>•</span>
                <span>{formatLogTime(log.uploadedAt)}</span>
                {log.uploadedBy && <><span>•</span><span>by {log.uploadedBy}</span></>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <MdClose size="1.5em" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading details…</div>
          ) : (
            <>
              {log && (
                <div className="grid grid-cols-4 gap-3">
                  <SummaryStat label="Total" value={log.totalRecords} color="text-blue-700 bg-blue-50 border-blue-200" />
                  <SummaryStat label="Saved" value={log.savedRecords} color="text-emerald-700 bg-emerald-50 border-emerald-200" />
                  <SummaryStat label="Merged" value={log.mergedRecords} color="text-amber-700 bg-amber-50 border-amber-200" />
                  <SummaryStat label="Rejected" value={log.rejectedRecords} color="text-rose-700 bg-rose-50 border-rose-200" />
                </div>
              )}

              {schemaErrors.length > 0 && (
                <ErrorGroup
                  title="Schema validation — missing column(s)"
                  Icon={MdSchema}
                  iconClass="text-rose-600"
                  containerClass="border-rose-200 bg-rose-50"
                >
                  <ul className="text-sm text-rose-900 space-y-1">
                    {schemaErrors.map((e) => (
                      <li key={e.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span className="font-medium">{e.columnName || '—'}</span>
                      </li>
                    ))}
                  </ul>
                </ErrorGroup>
              )}

              {dataErrors.length > 0 && (
                <ErrorGroup
                  title={`Data validation — ${dataErrors.length} row${dataErrors.length > 1 ? 's' : ''} rejected`}
                  Icon={MdReportProblem}
                  iconClass="text-amber-600"
                  containerClass="border-amber-200 bg-amber-50"
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-amber-900/70">
                          <th className="py-1.5 pr-3">Row</th>
                          <th className="py-1.5 pr-3">Associate ID</th>
                          <th className="py-1.5 pr-3">Name</th>
                          <th className="py-1.5 pr-3">Failing Column(s)</th>
                          <th className="py-1.5">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-200/60">
                        {dataErrors.map((e) => (
                          <tr key={e.id} className="text-amber-900">
                            <td className="py-1.5 pr-3 align-top font-mono text-xs">{e.rowNumber ?? '—'}</td>
                            <td className="py-1.5 pr-3 align-top">{e.associateId ?? '—'}</td>
                            <td className="py-1.5 pr-3 align-top">{e.candidateName ?? '—'}</td>
                            <td className="py-1.5 pr-3 align-top">
                              {e.columnName ? (
                                <div className="flex flex-wrap gap-1">
                                  {e.columnName.split(',').map((c) => (
                                    <span key={c} className="text-xs bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                                      {c.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : '—'}
                            </td>
                            <td className="py-1.5 align-top text-xs">{e.errorReason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ErrorGroup>
              )}

              {processingErrors.length > 0 && (
                <ErrorGroup
                  title="Unexpected processing errors"
                  Icon={MdError}
                  iconClass="text-red-600"
                  containerClass="border-red-200 bg-red-50"
                >
                  <ul className="text-sm text-red-900 space-y-1">
                    {processingErrors.map((e) => (
                      <li key={e.id}>
                        {e.rowNumber ? `Row ${e.rowNumber}: ` : ''}
                        {e.errorReason}
                      </li>
                    ))}
                  </ul>
                </ErrorGroup>
              )}

              {schemaErrors.length === 0 && dataErrors.length === 0 && processingErrors.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">No detailed errors recorded.</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryStat = ({ label, value, color }) => (
  <div className={`rounded-lg border p-2.5 text-center ${color}`}>
    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
    <p className="text-xl font-bold mt-0.5">{value ?? 0}</p>
  </div>
);

const ErrorGroup = ({ title, Icon, iconClass, containerClass, children }) => (
  <div className={`rounded-lg border ${containerClass} p-4`}>
    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
      <Icon className={iconClass} size="1.2em" />
      {title}
    </h4>
    {children}
  </div>
);

export default AdminDashboard;