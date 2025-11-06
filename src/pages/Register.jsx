import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) return;

    try {
      await authApi.post("/auth/register/", { full_name, email, password });
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/30 rounded-full blur-[128px] animate-float"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-[128px] animate-float animation-delay-1000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px] animate-float animation-delay-2000"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Register Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8 animate-[fadeIn_0.6s_ease-out]">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-primary-500 to-secondary-500 rounded-3xl mb-6 shadow-2xl shadow-primary-500/50 relative group">
            <div className="absolute inset-0 bg-linear-to-br from-primary-400 to-secondary-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">🪄</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-400 text-lg">Join our journey today</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-linear-to-r from-primary-500 to-secondary-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-3xl shadow-2xl p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 ml-1">Full Name</label>
                <input
                  type="text"
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:border-gray-600"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:border-gray-600"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  required
                  className={`w-full px-5 py-4 bg-gray-800/50 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    passwordError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:ring-primary-500"
                  }`}
                  placeholder="Minimum 8 characters"
                />
                {passwordError && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    {passwordError}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm animate-[shake_0.5s_ease-in-out]">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  <span className="text-red-400 text-sm font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!!passwordError}
                className="relative w-full group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-primary-600 to-secondary-600 rounded-2xl blur-lg opacity-50 group-hover/btn:opacity-75 transition-opacity duration-300"></div>
                <div className="relative px-6 py-4 bg-linear-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3 transition-all duration-300 group-hover/btn:scale-[1.02] active:scale-[0.98]">
                  <span>Create Account</span>
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5m5-5H6"/></svg>
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-primary-400 hover:text-primary-300 font-bold transition-colors relative group/link"
                >
                  <span className="relative z-10">Sign In</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-primary-400 to-secondary-400 group-hover/link:w-full transition-all duration-300"></span>
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
