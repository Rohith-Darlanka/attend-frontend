import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import TeacherDashboard from "../components/TeacherDashboard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.get("/auth/user/");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

const handleLogout = async () => {
  setLogoutLoading(true);
  try {
    await authApi.post("/auth/logout/", {}, { withCredentials: true });
    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  } catch (err) {
    console.error("Logout failed:", err);
    window.location.href = "/";
  }
};



  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] animate-pulse"></div>
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[128px] animate-pulse animation-delay-2000"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          {/* <h1 className="text-2xl text-white mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-normal">
            Loading Dashboard
          </h1> */}
          {/* <p className="text-gray-500 text-lg font-normal">
            Please wait while we load your data
          </p> */}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[128px] animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-900/15 rounded-full blur-[128px] animate-pulse animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Header */}
      <div className="relative bg-black/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              </div>

              {/* User Info */}
              <div className="text-center font-normal">
                <h1
                  className="text-2xl text-white mb-1 font-normal"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {user.full_name || user.email}
                </h1>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-400 font-normal">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>{user.email}</span>
                  </div>
                  <span className="text-gray-700">•</span>
                  <span className="font-mono bg-gray-900/70 px-3 py-1 rounded-lg border border-gray-800 text-gray-400 font-normal">
                    UID: {user.uid}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="absolute right-8">
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="relative group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                <div
                  className="relative flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-normal rounded-xl shadow-xl shadow-red-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-red-500/30 group-hover/btn:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {logoutLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      <span>Logout</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Dashboard */}
      <TeacherDashboard user={user} />
    </div>
  );
}
