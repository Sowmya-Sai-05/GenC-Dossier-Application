import { useNavigate } from 'react-router-dom';
import {
  FcGraduationCap, FcBusinessman, FcManager, FcDoughnutChart, FcDocument,
  FcUpload, FcBullish, FcLock, FcInspection, FcKey, FcConferenceCall, FcFilledFilter,
} from 'react-icons/fc';
import { FaArrowRight, FaShieldAlt, FaRocket, FaGithub, FaChartLine } from 'react-icons/fa';
import { MdOutlineWorkspaces, MdVerifiedUser, MdSpeed } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';

/**
 * Genc Dossier — landing page. Public route at `/`. Logged-in users land
 * here too; they can navigate to their dashboard via Sign In.
 */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/40">
      {/* Inline keyframe for slow floating + blob animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%      { transform: translate(40px, -50px) scale(1.1); }
          66%      { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .blob       { animation: blob 18s ease-in-out infinite; }
        .blob-delay { animation-delay: -6s; }
        .blob-delay-2 { animation-delay: -12s; }
        .float      { animation: float 6s ease-in-out infinite; }
        .float-slow { animation: float 9s ease-in-out infinite; }
        .fade-in-up { animation: fadeInUp 0.7s ease-out both; }
      `}</style>

      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-300/40 mix-blend-multiply blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-300/40 mix-blend-multiply blur-3xl blob blob-delay" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full bg-pink-200/40 mix-blend-multiply blur-3xl blob blob-delay-2" />

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Genc <span className="text-indigo-600">Dossier</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-700 transition-colors rounded-md"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-in-up">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full">
            <HiSparkles className="text-indigo-500" /> Talent Management • Built for GenC
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Empower every{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              trainee journey
            </span>
          </h1>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-xl">
            A single, end-to-end platform for tracking talent, surfacing performance, and
            deploying the right people to the right projects — for Admins, Leaders, and
            Trainees alike.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/register')}
              className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all"
            >
              Get Started
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-lg font-semibold border border-gray-300 shadow-sm hover:shadow-md transition-all"
            >
              <FcLock /> Sign In
            </button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><MdVerifiedUser className="text-emerald-600" /> JWT-secured</span>
            <span className="flex items-center gap-1.5"><MdSpeed className="text-indigo-600" /> Real-time filters</span>
            <span className="flex items-center gap-1.5"><FaShieldAlt className="text-rose-500" /> Role-based access</span>
          </div>
        </div>

        {/* Floating illustration — composed of animated icon cards */}
        <div className="relative h-[420px] hidden md:block">
          {/* Center medallion */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-white shadow-2xl shadow-indigo-200/60 flex items-center justify-center ring-8 ring-indigo-50 float-slow">
            <FcDoughnutChart size="7em" />
          </div>
          {/* Orbit cards */}
          <FloatingCard className="left-2 top-6 float" delay="0s">
            <FcGraduationCap size="2em" />
            <div className="text-xs font-semibold text-gray-700">Trainee Talent Card</div>
          </FloatingCard>
          <FloatingCard className="right-0 top-20 float" delay="-2s">
            <FcFilledFilter size="2em" />
            <div className="text-xs font-semibold text-gray-700">Skill-based Filters</div>
          </FloatingCard>
          <FloatingCard className="left-6 bottom-16 float" delay="-4s">
            <FcUpload size="2em" />
            <div className="text-xs font-semibold text-gray-700">Excel Ingestion</div>
          </FloatingCard>
          <FloatingCard className="right-4 bottom-2 float" delay="-1s">
            <FcInspection size="2em" />
            <div className="text-xs font-semibold text-gray-700">Audit Logs</div>
          </FloatingCard>
          <FloatingCard className="left-1/2 -translate-x-1/2 top-0 float" delay="-3s">
            <FcBullish size="2em" />
            <div className="text-xs font-semibold text-gray-700">RAG Scores</div>
          </FloatingCard>
        </div>
      </section>

      {/* ── Role cards ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Built for every role</h2>
          <p className="mt-3 text-gray-600">
            Whether you're managing the pipeline, scouting talent for a project, or showing
            off your own work — there's a panel for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <RoleCard
            Icon={FcGraduationCap}
            title="Trainees"
            description="Manage your profile, update your skills, log certifications, projects, and achievements — and watch your talent card evolve."
            bullets={['Personal Talent Card', 'Edit skills & projects', 'Track certifications', 'See your RAG score']}
            ctaLabel="Trainee Sign In"
            onCta={() => navigate('/login')}
            gradient="from-indigo-500 to-blue-500"
            featured
          />
          <RoleCard
            Icon={FcBusinessman}
            title="Leaders"
            description="Search across the whole talent pool by skill, certification, cohort, or associate ID. Export to CSV for offline review."
            bullets={['Multi-skill chip filters', 'Multi-ID lookup', 'View any talent card', 'CSV export']}
            ctaLabel="Leader Sign In"
            onCta={() => navigate('/login')}
            gradient="from-purple-500 to-pink-500"
            // featured
          />
          <RoleCard
            Icon={FcManager}
            title="Admins"
            description="Upload rosters from Excel with full schema and data validation. Manage leaders, audit every ingestion attempt, and keep the system healthy."
            bullets={['Excel upload + merge', 'Ingestion logs', 'Register leaders', 'Manage trainees']}
            ctaLabel="Admin Sign In"
            onCta={() => navigate('/login')}
            gradient="from-emerald-500 to-teal-500"
          />
        </div>
      </section>

      {/* ── Capability grid ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything in one place</h2>
          <p className="mt-3 text-gray-600">
            One platform — six headline capabilities that replace the spreadsheet chaos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Capability Icon={FcUpload}     iconBg="bg-blue-50"    title="Smart Excel Ingestion"     desc="Strict 157-column schema check, per-row data validation, automatic merge for existing records." />
          <Capability Icon={FcDoughnutChart} iconBg="bg-purple-50" title="Performance Overview"     desc="Attendance gauge, RAG scores, readiness, and language proficiency at a glance." />
          <Capability Icon={FcFilledFilter}  iconBg="bg-emerald-50" title="Multi-criteria Search"   desc="Combine skill chips, certificates, cohorts, locations, and IDs in a single query." />
          <Capability Icon={FcInspection}   iconBg="bg-amber-50"  title="Full Audit Trail"          desc="Every upload attempt is logged with status, totals, and per-row failure reasons." />
          <Capability Icon={FcKey}          iconBg="bg-rose-50"   title="Secure by Default"          desc="JWT auth, BCrypt-hashed passwords, role-based access on every endpoint." />
          <Capability Icon={FcDocument}     iconBg="bg-indigo-50" title="PDF & CSV Export"           desc="Download printable Talent Cards or batch-export filtered candidate lists." />
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-14 text-white shadow-2xl">
          <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-90">
                <FaRocket /> Ready to dive in?
              </div>
              <h3 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
                Sign in to your panel — or get started in seconds.
              </h3>
              <p className="mt-3 text-white/85 max-w-xl">
                Admins, Leaders, and Trainees all use the same login. Don't have access yet?
                Ask your administrator to register your account.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-lg font-bold shadow hover:shadow-lg hover:bg-indigo-50 transition-all"
              >
                <FcLock /> Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 bg-indigo-900/40 hover:bg-indigo-900/60 border border-white/40 text-white px-6 py-3 rounded-lg font-bold backdrop-blur-sm transition-all"
              >
                <MdOutlineWorkspaces /> Register
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 border-t border-gray-200/70">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Genc Dossier</span>
            <span>· Talent Management Platform</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5"><FaChartLine className="text-indigo-500" /> Built on Spring + React</span>
            <a href="#" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <FaGithub /> Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const FloatingCard = ({ children, className = '', delay = '0s' }) => (
  <div
    className={`absolute bg-white shadow-xl shadow-indigo-100/60 ring-1 ring-gray-200/60 rounded-xl px-3 py-2 flex flex-col items-center gap-1 ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </div>
);

const RoleCard = ({ Icon, title, description, bullets, ctaLabel, onCta, gradient, featured }) => (
  <div
    className={`relative group rounded-2xl bg-white border ${featured ? 'border-indigo-300 shadow-xl shadow-indigo-100/60 md:scale-105' : 'border-gray-200 shadow-md'} p-6 transition-all hover:-translate-y-1 hover:shadow-xl`}
  >
    {featured && (
      <span className="absolute -top-3 right-4 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-md">
        Most Used
      </span>
    )}
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-md`}>
      <div className="bg-white rounded-xl p-2">
        <Icon size="1.8em" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
    <ul className="mt-4 space-y-1.5">
      {bullets.map((b) => (
        <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
          {b}
        </li>
      ))}
    </ul>
    <button
      onClick={onCta}
      className={`mt-6 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all group/cta
        ${featured
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
    >
      {ctaLabel}
      <FaArrowRight size="0.85em" className="transition-transform group-hover/cta:translate-x-1" />
    </button>
  </div>
); 

const Capability = ({ Icon, iconBg, title, desc }) => (
  <div className="group rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <Icon size="1.6em" />
    </div>
    <h4 className="font-semibold text-gray-900">{title}</h4>
    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
