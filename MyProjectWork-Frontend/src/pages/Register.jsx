import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack, MdError, MdCheckCircle } from 'react-icons/md';
import { FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ROLE_ADMIN',
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/40 flex items-center justify-center px-4 py-10">
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%      { transform: translate(40px, -50px) scale(1.1); }
          66%      { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .blob         { animation: blob 18s ease-in-out infinite; }
        .blob-delay   { animation-delay: -6s; }
        .blob-delay-2 { animation-delay: -12s; }
        .fade-in-up   { animation: fadeInUp 0.7s ease-out both; }
      `}</style>

      {/* Decorative blobs — same as Landing */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-300/40 mix-blend-multiply blur-3xl blob" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-300/40 mix-blend-multiply blur-3xl blob blob-delay" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full bg-pink-200/40 mix-blend-multiply blur-3xl blob blob-delay-2" />

      {/* Back-to-home link */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-700 transition-colors"
      >
        <MdArrowBack /> Back to home
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md fade-in-up">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 ring-1 ring-gray-200/60 p-8 sm:p-10">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-7">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Genc <span className="text-indigo-600">Dossier</span>
            </span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full">
              <HiSparkles className="text-indigo-500" /> Get started
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Create your{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                admin account
              </span>
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Spin up an Admin login in seconds.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="1.25em" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white/70 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="you@cognizant.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="1.25em" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-lg bg-white/70 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <MdVisibilityOff size="1.25em" /> : <MdVisibility size="1.25em" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                <MdCheckCircle className="text-emerald-500" /> Minimum 6 characters
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <div className="flex items-start gap-2">
                  <MdError className="text-red-500 shrink-0 mt-0.5" size="1.1em" />
                  <div className="text-sm text-red-700">
                    {typeof error === 'string'
                      ? error
                      : (error?.message || JSON.stringify(error))}
                  </div>
                </div>
                {Array.isArray(error?.errors) && error.errors.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-red-700 mt-2 ml-6 space-y-0.5">
                    {error.errors.map((e, i) => (
                      <li key={i}>{typeof e === 'string' ? e : (e?.message || JSON.stringify(e))}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Secondary link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </button>
          </p>

          {/* Trust line */}
          <div className="mt-6 pt-5 border-t border-gray-200/70 flex items-center justify-center gap-2 text-xs text-gray-500">
            <FaShieldAlt className="text-emerald-500" />
            Passwords hashed with BCrypt — never stored in plain text
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
