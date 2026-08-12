import React, { useEffect, useState } from 'react';
import { MdCloudUpload, MdHourglassEmpty, MdCheckCircle } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';

/**
 * Full-screen overlay shown while an Excel file is uploading.
 *
 * Two distinct phases:
 *   1. uploading   → real % from axios `onUploadProgress`
 *   2. processing  → indeterminate animation (server is parsing + persisting),
 *                    elapsed-time counter so the user knows it's not stuck.
 *
 * Visually shares the gradient blob aesthetic used by the marketing pages.
 */
const UploadProgressOverlay = ({ open, phase, progress, fileName, fileSize }) => {
  const [elapsed, setElapsed] = useState(0);

  // Reset + run the elapsed-seconds timer whenever the overlay opens.
  useEffect(() => {
    if (!open) {
      setElapsed(0);
      return undefined;
    }
    setElapsed(0);
    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [open]);

  if (!open) return null;

  const isUploading = phase === 'uploading';
  const isProcessing = phase === 'processing';

  // Phase-specific text + iconography
  const phaseTitle = isUploading ? 'Uploading file…' : 'Processing on server…';
  const phaseSubtitle = isUploading
    ? 'Streaming bytes to the server. Please keep this tab open.'
    : 'Validating schema, deduplicating rows, persisting candidates.';

  const PhaseIcon = isUploading ? MdCloudUpload : MdHourglassEmpty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes pulseDot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes overlayIn  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .upload-card { animation: overlayIn 0.35s ease-out both; }
        .shimmer-bar::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
          animation: shimmer 1.5s infinite;
        }
        .dot-pulse > span { animation: pulseDot 1.4s ease-in-out infinite; }
        .dot-pulse > span:nth-child(2) { animation-delay: 0.2s; }
        .dot-pulse > span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="upload-card relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-indigo-200/40 ring-1 ring-gray-200/60 p-7">
        {/* Phase header */}
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isProcessing ? 'bg-amber-100' : 'bg-indigo-100'
            }`}
          >
            <PhaseIcon
              className={isProcessing ? 'text-amber-600' : 'text-indigo-600'}
              size="1.6em"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              {phaseTitle}
              {isProcessing && (
                <span className="dot-pulse inline-flex gap-0.5 text-amber-600">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{phaseSubtitle}</p>
          </div>
        </div>

        {/* File chip */}
        {fileName && (
          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 flex items-center gap-3">
            <FaFileExcel className="text-emerald-600 shrink-0" size="1.4em" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>{fileName}</p>
              {fileSize !== undefined && (
                <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
              )}
            </div>
          </div>
        )}

        {/* Progress bar — determinate while uploading, indeterminate shimmer while processing */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              {isUploading ? 'Upload progress' : 'Server processing'}
            </span>
            <span className="font-bold tabular-nums text-indigo-700">
              {isUploading ? `${progress}%` : `${formatElapsed(elapsed)} elapsed`}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
            {isUploading ? (
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-200 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            ) : (
              <div className="shimmer-bar relative h-full w-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200" />
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <Step
            label="Upload"
            active={isUploading}
            done={isProcessing}
            Icon={MdCloudUpload}
            accent="indigo"
          />
          <Step
            label="Process"
            active={isProcessing}
            done={false}
            Icon={MdHourglassEmpty}
            accent="amber"
          />
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          {isProcessing
            ? 'Large files may take a minute. Please don\'t close this window.'
            : 'Tip: make sure your Excel matches the canonical column headers.'}
        </p>
      </div>
    </div>
  );
};

const Step = ({ label, active, done, Icon, accent }) => {
  const bg = done
    ? 'bg-emerald-100 text-emerald-700'
    : active
      ? `bg-${accent}-100 text-${accent}-700`
      : 'bg-gray-100 text-gray-500';
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${bg}`}>
      {done ? <MdCheckCircle size="1.1em" /> : <Icon size="1.1em" />}
      <span className="font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatElapsed = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

export default UploadProgressOverlay;
