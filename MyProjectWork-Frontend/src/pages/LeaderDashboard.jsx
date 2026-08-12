import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import {
  filterCandidates,
  exportFilteredCandidates,
  fetchAllTalentCardsData,
  addSkillChip,
  removeSkillChip,
  setFilterField,
  clearFilters,
  clearTalentCardsData,
} from '../store/slices/leaderSlice';
import TalentCard from '../components/talent-card/TalentCard';
import { FcConferenceCall, FcFilledFilter } from 'react-icons/fc';
import ChangePasswordButton from '../components/ChangePasswordButton';
import Pagination from '../components/Pagination';
import { FaCode, FaTools, FaLayerGroup, FaCertificate, FaUsers, FaIdBadge, FaBuilding } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdClose, MdSearch, MdRestartAlt, MdFileDownload, MdPictureAsPdf, MdMenu } from 'react-icons/md';

const SKILL_TYPES = [
  { key: 'programmingSkills', label: 'Programming', Icon: FaCode, color: 'bg-blue-100 text-blue-700 border-blue-300', dot: 'bg-blue-500' },
  { key: 'toolSkills', label: 'Tools', Icon: FaTools, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
  { key: 'frameworkSkills', label: 'Framework', Icon: FaLayerGroup, color: 'bg-purple-100 text-purple-700 border-purple-300', dot: 'bg-purple-500' },
];

const LeaderDashboard = () => {
  // Tab state lives in the URL (?tab=all) so `navigate(-1)` from a talent card
  // brings the leader back to the same tab they came from.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'search';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  const [currentPage, setCurrentPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardsContainerRef = useRef(null);
  const [generatingZip, setGeneratingZip] = useState(false);
  const { candidates, filters, loading, exporting, downloadingCards, allTalentCardsData, pagination } = useSelector((state) => state.leader);
  const { role } = useSelector((state) => state.auth);

  // A filter is "active" only when at least one chip / text field is populated.
  // Used to gate the bulk export actions — without a filter the leader would be
  // bulk-downloading the entire candidate database, which is rarely the intent.
  const hasActiveFilter =
    filters.programmingSkills.length > 0 ||
    filters.toolSkills.length > 0 ||
    filters.frameworkSkills.length > 0 ||
    filters.associateId.length > 0 ||
    (filters.sls && filters.sls.length > 0) ||
    Boolean(filters.certificate && filters.certificate.trim()) ||
    Boolean(filters.cohortCode && filters.cohortCode.trim()) ||
    Boolean(filters.deploymentLocation && filters.deploymentLocation.trim());

  const generateZip = useCallback(async () => {
    if (!cardsContainerRef.current || allTalentCardsData.length === 0) return;
    setGeneratingZip(true);
    try {
      const [{ default: html2canvas }, { jsPDF }, { default: JSZip }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
        import('jszip'),
      ]);

      // Replace all cross-origin images with local fallback before capture
      const container = cardsContainerRef.current;
      const images = container.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                if (img.naturalWidth === 0) img.src = '/profile_photos/profile1.avif';
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = () => {
                  img.src = '/profile_photos/profile1.avif';
                  resolve();
                };
              }
            })
        )
      );

      const zip = new JSZip();
      const cardElements = container.querySelectorAll('[data-talent-card]');
      let generated = 0;

      for (let i = 0; i < cardElements.length; i++) {
        const el = cardElements[i];
        const associateId = el.getAttribute('data-talent-card');
        const name = allTalentCardsData[i]?.candidateName || associateId;

        try {
          const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.8);

          const pdfWidth = 210;
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          const pdf = new jsPDF({
            orientation: pdfHeight > pdfWidth ? 'p' : 'l',
            unit: 'mm',
            format: [pdfWidth, pdfHeight],
          });
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

          const fileName = `${associateId}_${name.replace(/[^a-zA-Z0-9]/g, '_')}_Talent_Card.pdf`;
          zip.file(fileName, pdf.output('blob'));
          generated++;
        } catch (cardErr) {
          console.warn(`Skipped card for ${associateId}:`, cardErr);
        }
      }

      if (generated === 0) {
        alert('Could not generate any talent card PDFs.');
        return;
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Talent_Cards_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate talent card PDFs:', err);
      alert('Failed to generate talent card PDFs. Check console for details.');
    } finally {
      setGeneratingZip(false);
      dispatch(clearTalentCardsData());
    }
  }, [allTalentCardsData, dispatch]);

  useEffect(() => {
    if (role !== 'ROLE_LEADER' && role !== 'ROLE_ADMIN') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (activeTab === 'search') {
      dispatch(filterCandidates({ filters, page: currentPage }));
    }
  }, [activeTab, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilters = () => {
    setCurrentPage(0);
    dispatch(filterCandidates({ filters, page: 0 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setCurrentPage(0);
    dispatch(filterCandidates({ filters: {}, page: 0 }));
  };

  const handleExportCSV = () => {
    dispatch(exportFilteredCandidates({ filters }));
  };

  const handleDownloadAllTalentCards = () => {
    console.log('Download Talent Cards clicked, candidates:', candidates.length);
    dispatch(fetchAllTalentCardsData({ filters }));
  };

  useEffect(() => {
    if (allTalentCardsData.length > 0 && !downloadingCards) {
      const timer = setTimeout(() => generateZip(), 1500);
      return () => clearTimeout(timer);
    }
  }, [allTalentCardsData, downloadingCards, generateZip]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex">
      {/* Decorative blobs */}
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/60 shadow-xl shadow-indigo-100/40 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:sticky lg:top-0 lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-200/70 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Leader Panel
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Search & export talent</p>
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
          <button
            onClick={() => { setActiveTab('search'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-700 hover:bg-indigo-50/60'
            }`}
          >
            <span className={`shrink-0 rounded-lg p-1 ${activeTab === 'search' ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
              <FcFilledFilter size="1.4em" />
            </span>
            <span className="text-left flex-1">Search Candidates</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200/70 space-y-2 bg-white/50">
          <ChangePasswordButton panelLabel="Leader Panel" />
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-2 px-4 rounded-lg shadow-md shadow-rose-200 transition-all font-semibold text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-y-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FcFilledFilter size="1.2em" /> Candidate Search & Filter
          </h3>
          <div className="flex items-center gap-2">
            {!hasActiveFilter && (
              <span className="hidden md:inline text-xs text-gray-500 mr-1">
                Apply at least one filter to enable export
              </span>
            )}
            <button
              onClick={handleDownloadAllTalentCards}
              disabled={!hasActiveFilter || downloadingCards || generatingZip || candidates.length === 0}
              title={
                !hasActiveFilter
                  ? 'Apply at least one filter first'
                  : candidates.length === 0
                  ? 'No candidates to download'
                  : 'Download all matching talent cards as individual PDFs in a ZIP'
              }
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <MdPictureAsPdf size="1.2em" />
              {downloadingCards ? 'Fetching Data…' : generatingZip ? 'Generating PDFs…' : 'Download Talent Cards'}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!hasActiveFilter || exporting || candidates.length === 0}
              title={
                !hasActiveFilter
                  ? 'Apply at least one filter first'
                  : candidates.length === 0
                  ? 'No candidates to export'
                  : 'Download CSV of all matching candidates'
              }
              className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <MdFileDownload size="1.2em" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>

        <FilterPanel
          filters={filters}
          onAddSkill={(type, value) => dispatch(addSkillChip({ type, value }))}
          onRemoveSkill={(type, value) => dispatch(removeSkillChip({ type, value }))}
          onSetField={(field, value) => dispatch(setFilterField({ field, value }))}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          loading={loading}
        />

        <CandidatesTable
          candidates={candidates}
          loading={loading}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onView={(id) => navigate(`/leader/talent-card/${id}`)}
        />
      </div>

      {/* Off-screen container for html2canvas capture */}
      {allTalentCardsData.length > 0 && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1280px' }}>
          <div ref={cardsContainerRef}>
            {allTalentCardsData.map((candidate) => (
              <div key={candidate.associateId} data-talent-card={candidate.associateId}>
                <TalentCard
                  role="leader"
                  associateId={candidate.associateId}
                  candidate={candidate}
                  loading={false}
                  error={null}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Filter Panel
// ──────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, onAddSkill, onRemoveSkill, onSetField, onApply, onClear, loading }) => {
  const [skillType, setSkillType] = useState('programmingSkills');
  const [skillInput, setSkillInput] = useState('');
  const [associateIdInput, setAssociateIdInput] = useState('');
  const [slInput, setSlInput] = useState('');

  const handleAddSl = () => {
    const v = slInput.trim();
    if (!v) return;
    onAddSkill('sls', v);
    setSlInput('');
  };

  const handleSlKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSl();
    }
  };

  const handleAddAssociateId = () => {
    const v = associateIdInput.trim();
    if (!v) return;
    onAddSkill('associateId', v);
    setAssociateIdInput('');
  };

  const handleAssociateIdKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAssociateId();
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    onAddSkill(skillType, skillInput.trim());
    setSkillInput('');
  };

  const handleSkillKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const activeFilterCount =
    filters.programmingSkills.length +
    filters.toolSkills.length +
    filters.frameworkSkills.length +
    (filters.certificate ? 1 : 0) +
    (filters.cohortCode ? 1 : 0) +
    (filters.deploymentLocation ? 1 : 0) +
    filters.associateId.length +
    (filters.sls ? filters.sls.length : 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
          <MdSearch className="text-indigo-500" size="1.4em" /> Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </h4>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
        >
          <MdRestartAlt size="1.1em" /> Reset all
        </button>
      </div>

      {/* Primary filter — quick lookup by Associate ID(s) */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <FaIdBadge className="text-indigo-600" size="1.05em" /> Associate ID
          <span className="text-xs font-normal text-gray-400 ml-1">
            (add one or more — press Enter to add, finds any of them)
          </span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size="1.1em" />
            <input
              type="text"
              inputMode="numeric"
              value={associateIdInput}
              onChange={(e) => setAssociateIdInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={handleAssociateIdKey}
              placeholder="Enter Associate ID and press Enter (e.g. 200023)"
              className="w-full border-2 border-indigo-200 rounded-lg pl-10 pr-3 py-3 text-base bg-indigo-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={handleAddAssociateId}
            className="bg-indigo-600 text-white px-5 rounded-lg font-medium hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Chips */}
        {filters.associateId.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.associateId.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-full px-3 py-1"
              >
                <FaIdBadge className="text-indigo-500" size="0.9em" />
                {id}
                <button
                  type="button"
                  onClick={() => onRemoveSkill('associateId', id)}
                  className="hover:text-red-600"
                  aria-label={`Remove ${id}`}
                >
                  <MdClose size="1em" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 -mx-6 mb-5"></div>

      {/* Skills filter */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <FaCode className="text-indigo-500" /> Skills
          <span className="text-xs font-normal text-gray-400 ml-1">
            (add multiple — candidate must have all)
          </span>
        </label>

        <div className="flex gap-2">
          <select
            value={skillType}
            onChange={(e) => setSkillType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {SKILL_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKey}
            placeholder="e.g. Java, Docker, React — press Enter to add"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Chips grouped by type */}
        <div className="mt-3 space-y-2">
          {SKILL_TYPES.map((t) => {
            const items = filters[t.key];
            if (!items || items.length === 0) return null;
            const Icon = t.Icon;
            return (
              <div key={t.key} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1 min-w-[90px]">
                  <Icon size="0.9em" /> {t.label}:
                </span>
                {items.map((s) => (
                  <span
                    key={s}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1 ${t.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                    {s}
                    <button
                      type="button"
                      onClick={() => onRemoveSkill(t.key, s)}
                      className="hover:text-red-600"
                      aria-label={`Remove ${s}`}
                    >
                      <MdClose size="1em" />
                    </button>
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Line (SL) — multi-value chip filter */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <FaBuilding className="text-orange-500" /> Service Line (SL)
          <span className="text-xs font-normal text-gray-400 ml-1">
            (add one or more — press Enter to add, finds any of them)
          </span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={slInput}
            onChange={(e) => setSlInput(e.target.value)}
            onKeyDown={handleSlKey}
            placeholder="e.g. BFS, TMT, MLEU — press Enter to add"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={handleAddSl}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Chips */}
        {filters.sls && filters.sls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.sls.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300 rounded-full px-2.5 py-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                {s}
                <button
                  type="button"
                  onClick={() => onRemoveSkill('sls', s)}
                  className="hover:text-red-600"
                  aria-label={`Remove ${s}`}
                >
                  <MdClose size="1em" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Other filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterField
          icon={<FaCertificate className="text-amber-500" />}
          label="Certificate"
          placeholder="Name or provider"
          value={filters.certificate}
          onChange={(v) => onSetField('certificate', v)}
        />
        <FilterField
          icon={<FaUsers className="text-blue-500" />}
          label="Cohort Code"
          placeholder="e.g. GENC-2024-12"
          value={filters.cohortCode}
          onChange={(v) => onSetField('cohortCode', v)}
        />
        <FilterField
          icon={<FaLocationDot className="text-rose-500" />}
          label="Deployment Location"
          placeholder="e.g. Bangalore"
          value={filters.deploymentLocation}
          onChange={(v) => onSetField('deploymentLocation', v)}
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          onClick={onApply}
          disabled={loading}
          className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          <MdSearch size="1.1em" />
          {loading ? 'Searching…' : 'Apply Filters'}
        </button>
      </div>
    </div>
  );
};

const FilterField = ({ icon, label, placeholder, value, onChange, inputMode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
      {icon} {label}
    </label>
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  </div>
);

// ──────────────────────────────────────────────────────────────
// Candidates Table
// ──────────────────────────────────────────────────────────────
const CandidatesTable = ({ candidates, loading, pagination, currentPage, onPageChange, onView }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading candidates…</div>;
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
        No candidates match the current filters.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohort</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((c) => (
                <tr key={c.associateId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.associateId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.candidateName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.cognizantEmailID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.trackName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.cohortCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.deploymentLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onView(c.associateId)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100"
                    >
                      View Talent Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing {candidates.length > 0 ? currentPage * pagination.pageSize + 1 : 0} to{' '}
          {Math.min((currentPage + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
          {pagination.totalElements} candidates (Page {currentPage + 1} of {Math.max(pagination.totalPages, 1)})
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          isLast={pagination.isLast}
        />
      </div>
    </div>
  );
};

export default LeaderDashboard;
 