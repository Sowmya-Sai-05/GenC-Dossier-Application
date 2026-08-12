import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { FaCalendarCheck } from 'react-icons/fa';
import { MdCheckCircle, MdWarning, MdCancel } from 'react-icons/md';
import { BsStar } from 'react-icons/bs';

const getAttendanceConfig = (score) => {
  if (score >= 90) return { label: 'Excellent', arcColor: '#16a34a', bg: 'bg-green-50', border: 'border-green-200', textColor: 'text-green-700', Icon: MdCheckCircle };
  if (score >= 75) return { label: 'Good', arcColor: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-200', textColor: 'text-blue-700', Icon: BsStar };
  if (score >= 60) return { label: 'Average', arcColor: '#d97706', bg: 'bg-yellow-50', border: 'border-yellow-200', textColor: 'text-yellow-700', Icon: MdWarning };
  return { label: 'Needs Improvement', arcColor: '#dc2626', bg: 'bg-red-50', border: 'border-red-200', textColor: 'text-red-700', Icon: MdCancel };
};

const AttendanceScore = ({ attendanceScore, className = '' }) => {
  const score = attendanceScore ?? 0;
  const config = getAttendanceConfig(score);
  const StatusIcon = config.Icon;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <h2 className="font-semibold flex items-center gap-2 text-gray-700">
        <FaCalendarCheck className="text-indigo-500" size="1.15em" />
        Attendance Score
      </h2>

      {/* Gauge Card */}
      <div className={`border ${config.border} ${config.bg} rounded-xl px-3 pt-3 pb-2 flex flex-col items-center justify-center flex-1`}>
        <div className="w-full" style={{ height: '152px' }}>
          <Gauge
            value={score}
            startAngle={-110}
            endAngle={110}
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 32,
                fontWeight: 700,
                fill: config.arcColor,
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: config.arcColor,
              },
            }}
            text={({ value }) => `${value}%`}
          />
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.textColor} ${config.bg} ${config.border}`}>
          <StatusIcon size="1em" />
          {config.label}
        </div>

        <p className="text-xs text-gray-400 mt-1.5">{score} / 100 attendance points</p>
      </div>
    </div>
  );
};

export default AttendanceScore;
