import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await authApi.post("/auth/login/", { email, password });
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* Animated gradient orbs - Dark theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] animate-float"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[128px] animate-float animation-delay-1000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-900/15 rounded-full blur-[128px] animate-float animation-delay-2000"></div>
      </div>

      {/* Grid pattern overlay - Darker */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-[fadeIn_0.6s_ease-out]">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl shadow-purple-500/30 relative group">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-blue-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <span className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">🔐</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-lg">Sign in to continue your journey</p>
        </div>

        {/* Login Card */}
        <div className="relative group">
          {/* Glow effect - Dark theme */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-500"></div>
          
          <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl shadow-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400 ml-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600/10 to-blue-600/10 rounded-2xl blur-sm opacity-0 group-hover/input:opacity-100 transition-opacity duration-300"></div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="relative w-full px-5 py-4 bg-gray-900/70 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400 ml-1">
                  Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600/10 to-blue-600/10 rounded-2xl blur-sm opacity-0 group-hover/input:opacity-100 transition-opacity duration-300"></div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="relative w-full px-5 py-4 bg-gray-900/70 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm animate-[shake_0.5s_ease-in-out]">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500/15 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                  <span className="text-red-500 text-sm font-medium">{error}</span>
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="relative w-full group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-purple-700 to-blue-700 rounded-2xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                <div className="relative px-6 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-purple-500/30 group-hover/btn:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full motion-safe:animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-900 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{" "}
                <button 
                  onClick={() => !loading && navigate("/register")}
                  disabled={loading}
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative group/link"
                >
                  <span className="relative z-10">Create account</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-purple-400 to-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Additional decorative element */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-700 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Secure connection established</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}