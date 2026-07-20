import React from 'react';
import { MdCheckCircle, MdSchedule, MdVerified } from 'react-icons/md';

const AIFluencySection = ({ aiFluency }) => {
  if (!aiFluency || (!aiFluency.aiSkills?.length && !aiFluency.aiCertifications?.length)) {
    return null;
  }

  const { aiSkills, aiCertifications } = aiFluency;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100/50 p-6 sm:p-8 mt-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-900 to-purple-800 bg-clip-text text-transparent mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          ✨
        </span>
        AI Fluency
      </h3>

      <div className="space-y-8">
        {/* AI Skills Subsection */}
        {/* {aiSkills && aiSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              AI Skills
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSkills.map((skill) => {
                const isCompleted = skill.status === 'Completed';
                return (
                  <div key={skill.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    {isCompleted ? (
                      <MdCheckCircle className="text-emerald-500 shrink-0" size="1.4em" />
                    ) : (
                      <MdSchedule className="text-gray-400 shrink-0" size="1.4em" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{skill.courseName}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{skill.courseCode}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )} */}

        <div className="space-y-8">
        {/* AI Skills Subsection */}
        {aiSkills?.filter((skill) => skill.status === "Completed").length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              AI Skills
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSkills
                .filter((skill) => skill.status === "Completed")
                .map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                  >
                    <MdCheckCircle
                      className="text-emerald-500 shrink-0"
                      size="1.4em"
                    />

                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {skill.courseName}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {skill.courseCode}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

        {/* AI Certifications Subsection */}
        {aiCertifications && aiCertifications.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              AI Certifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiCertifications.map((cert) => {
                const isCompleted = cert.status === 'Completed';
                return (
                  <div key={cert.id} className={`p-4 rounded-xl border ${isCompleted ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200 bg-gray-50'} relative overflow-hidden group`}>
                     {/* Decorative background element */}
                     <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100/50 to-purple-100/50 blur-xl group-hover:scale-150 transition-transform duration-500" />
                     
                     <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 leading-tight">{cert.courseName}</h5>
                          <p className="text-xs text-gray-500 font-mono mt-1 mb-3">{cert.courseCode}</p>
                          
                          <div className="flex items-center gap-2">
                             {isCompleted ? (
                               <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                                 <MdVerified size="1.1em" /> Completed
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-gray-200 text-gray-600">
                                 <MdSchedule size="1.1em" /> Yet to Start
                               </span>
                             )}
                          </div>
                        </div>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFluencySection;
