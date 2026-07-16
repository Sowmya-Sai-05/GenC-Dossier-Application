import { FaLanguage } from 'react-icons/fa';

const LANGUAGE_GRADES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F'];

const GRADE_COLORS = {
  A1: '#059669', A2: '#16a34a', B1: '#0d9488', B2: '#0891b2',
  C1: '#0284c7', C2: '#2563eb', D1: '#ca8a04', D2: '#d97706',
  E1: '#ea580c', E2: '#dc2626', F: '#7f1d1d',
};

const GRADE_DESC = {
  A1: 'Expert Proficiency', A2: 'Advanced+', B1: 'Advanced',
  B2: 'Upper Intermediate', C1: 'Intermediate+', C2: 'Intermediate',
  D1: 'Pre-Intermediate', D2: 'Elementary+', E1: 'Elementary',
  E2: 'Beginner+', F: 'Fail',
};

const LanguageScore = ({ languageScore, className = '' }) => {
  const gradeColor = GRADE_COLORS[languageScore] || '#9ca3af';
  const gradeDesc = GRADE_DESC[languageScore] || 'Not Assessed';

  return (
    <div className={`border border-purple-200 bg-purple-50 rounded-xl p-3 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <FaLanguage className="text-purple-500" size="1.15em" />
          Language Score
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: gradeColor }}
        >
          {languageScore || 'N/A'}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-2">{gradeDesc}</p>

      {/* Grade scale bar — pinned to the bottom when the card is stretched */}
      <div className="mt-auto">
        <div className="flex gap-0.5">
          {LANGUAGE_GRADES.map((g) => (
            <div
              key={g}
              title={`${g} — ${GRADE_DESC[g]}`}
              className={`flex-1 rounded-sm transition-all ${g === languageScore ? 'h-3' : 'h-2 opacity-35'}`}
              style={{
                backgroundColor: GRADE_COLORS[g],
                outline: g === languageScore ? `2px solid ${GRADE_COLORS[g]}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>A1 — Best</span>
          <span>F — Fail</span>
        </div>
      </div>
    </div>
  );
};

export default LanguageScore;
