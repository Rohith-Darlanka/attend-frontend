import React, { useState, useEffect } from 'react';
import authApi from '../api/authApi';
import AnalyticsDashboard from './AnalyticsDashboard';
import SessionAnalytics from './SessionAnalytics';
import { MLModelsDashboard } from './MLModelsDashboard';
import * as XLSX from "xlsx";

export default function TeacherDashboard({ user }) {
  const [view, setView] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await authApi.get('/courses/');
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
      alert('Failed to load courses');
    }
    setLoading(false);
  };

  const loadSessions = async (courseId) => {
    setLoading(true);
    try {
      const res = await authApi.get('/sessions/');
      const courseSessions = res.data.filter(s => s.course_id_copy === courseId);
      setSessions(courseSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      alert('Failed to load sessions');
    }
    setLoading(false);
  };

  const loadSessionDetail = async (sessionId) => {
    setLoading(true);
    try {
      const res = await authApi.get(`/sessions/${sessionId}/`);
      setSelectedSession(res.data);
      setView('sessionDetail');
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Failed to load session details');
    }
    setLoading(false);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    loadSessions(course.course_id);
    setView('sessions');
  };

  const handleCreateCourse = async (courseData) => {
    try {
      await authApi.post('/courses/create/', courseData);
      loadCourses();
      setShowCourseModal(false);
      alert('Course created successfully!');
    } catch (error) {
      console.error('Failed to create course:', error);
      alert(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleCreateSession = async () => {
    try {
      await authApi.post('/sessions/create/', { 
        course_id: selectedCourse.course_id 
      });
      loadSessions(selectedCourse.course_id);
      setShowSessionModal(false);
      alert('Session created successfully! Attendance portal is now ON.');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert(error.response?.data?.error || 'Failed to create session');
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!confirm('Are you sure you want to end this session? Students will no longer be able to mark attendance.')) return;
    
    try {
      await authApi.post(`/sessions/${sessionId}/end/`);
      if (view === 'sessions') {
        loadSessions(selectedCourse.course_id);
      } else if (view === 'sessionDetail' || view === 'sessionAnalytics') {
        loadSessionDetail(sessionId);
      }
      alert('Session ended successfully!');
    } catch (error) {
      console.error('Failed to end session:', error);
      alert(error.response?.data?.error || 'Failed to end session');
    }
  };

  const handleBack = () => {
    if (view === 'sessionAnalytics') {
      setView('sessionDetail');
    } else if (view === 'sessionDetail') {
      setView('sessions');
    } else if (view === 'sessions') {
      setView('courses');
      setSelectedCourse(null);
    }
     else if (view === 'ml-models') {
    setView('courses');
  }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Main Navigation - Only this navigation remains */}
   <div className="relative bg-black/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-5">
{(view === 'sessions' || view === 'sessionDetail' || view === 'sessionAnalytics' || view === 'ml-models') && (
                <button 
                  onClick={handleBack}
                  className="relative group/btn overflow-hidden flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-15 group-hover/btn:opacity-25 transition duration-500"></div>
                  <div className="relative px-5 py-2.5 bg-black/90 border border-gray-700 text-gray-300 rounded-xl transition-all duration-300 group-hover/btn:text-white group-hover/btn:border-gray-600 flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm">Back</span>
                  </div>
                </button>
              )}
<h1 className="text-3xl font-bold text-white tracking-tight" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
  {view === 'courses' && 'My Courses'}
  {view === 'analytics' && 'Data Analytics'}
  {view === 'ml-models' && 'ML Models'}
  {view === 'sessions' && selectedCourse?.course_name}
  {view === 'sessionDetail' && `Session ${selectedSession?.session_id}`}
  {view === 'sessionAnalytics' && `Session ${selectedSession?.session_id} Analytics`}
</h1>
            </div>
            
<div className="flex items-center gap-5">
              {/* View Navigation Tabs */}
              <div className="flex items-center gap-3 bg-black/90 border border-gray-800 rounded-xl p-1.5">
                <NavTab
                  active={view === 'courses'}
                  onClick={() => {
                    setView('courses');
                    setSelectedCourse(null);
                    setSelectedSession(null);
                  }}
                  icon=""
                  label="Courses"
                />
                <NavTab
  active={view === 'ml-models'}
  onClick={() => setView('ml-models')}
  icon=""
  label="ML Models"
/>
                <NavTab
                  active={view === 'analytics'}
                  onClick={() => setView('analytics')}
                  icon=""
                  label="Analytics"
                />
                  {/* <NavTab
    active={view === 'ml-models'}
    onClick={() => setView('ml-models')}
    icon=""
    label="ML Models"
  /> */}
              </div>

              {/* Action Buttons */}
              {view === 'courses' && (
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="relative group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
<div className="relative flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-xl shadow-purple-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-purple-500/30 group-hover/btn:scale-105 active:scale-95 text-sm" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                    <span className="text-lg">+</span>
                    <span>Create Course</span>
                  </div>
                </button>
              )}
              
              {view === 'sessions' && (
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="relative group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-purple-500/30 group-hover/btn:scale-105 active:scale-95">
                    <span className="text-xl">+</span>
                    <span>New Session</span>
                  </div>
                </button>
              )}

              {view === 'sessionDetail' && (
                <button
                  onClick={() => setView('sessionAnalytics')}
                  className="relative group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-purple-500/30 group-hover/btn:scale-105 active:scale-95">
                    <span className="text-xl">📊</span>
                    <span>View Analytics</span>
                  </div>
                </button>
              )}

              {view === 'sessionAnalytics' && selectedSession?.attendance_portal_status === 'ON' && (
                <button
                  onClick={() => handleEndSession(selectedSession.session_id)}
                  className="relative group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl shadow-xl shadow-red-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-red-500/30 group-hover/btn:scale-105 active:scale-95">
                    <span className="text-xl">⏻</span>
                    <span>End Session</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-[1600px] mx-auto px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-600/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 text-lg font-medium">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'courses' && (
              <CoursesView courses={courses} onCourseClick={handleCourseClick} />
            )}
            {view === 'ml-models' && <MLModelsDashboard sessions={sessions} courses={courses} />}
            {view === 'analytics' && <AnalyticsDashboard />}
{view === 'sessions' && (
  <SessionsView
    sessions={sessions}
    onSessionClick={loadSessionDetail}
    onEndSession={handleEndSession}
  />
)}
   
            {view === 'sessionDetail' && selectedSession && (
              <SessionDetailView
                session={selectedSession}
                onEndSession={handleEndSession}
              />
            )}
            {view === 'sessionAnalytics' && selectedSession && (
              <SessionAnalytics session={selectedSession} />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCourseModal && (
        <CreateCourseModal
          onClose={() => setShowCourseModal(false)}
          onCreate={handleCreateCourse}
        />
      )}
      {showSessionModal && (
        <CreateSessionModal
          course={selectedCourse}
          onClose={() => setShowSessionModal(false)}
          onCreate={handleCreateSession}
        />
      )}
    </div>
  );
}

function NavTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`relative group/tab overflow-hidden flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
        active
          ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25'
          : 'text-gray-400 hover:text-white bg-transparent hover:bg-gray-800/50'
      }`}
      style={{fontFamily: 'Inter, system-ui, sans-serif'}}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function CoursesView({ courses, onCourseClick }) {
  if (courses.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
        <div className="relative text-center py-24 bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl">
          <div className="text-7xl mb-6"></div>
          <h3 className="text-2xl font-bold text-white mb-3">No courses yet</h3>
          <p className="text-gray-500 text-lg">Create your first course to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <div
          key={course.course_id}
          onClick={() => onCourseClick(course)}
          className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          
          <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-gray-800">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-white truncate mb-2">
                  {course.course_name}
                </h3>
                <p className="text-sm text-gray-500 font-mono bg-gray-900/50 px-3 py-1 rounded-lg inline-block border border-gray-800">
                  ID: {course.course_id}
                </p>
              </div>
              
              <div className="flex-shrink-0 ml-4 transform transition-transform duration-300 group-hover:translate-x-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <span className="text-xl text-purple-400 group-hover:text-white transition-colors duration-300">→</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 group-hover:bg-gray-900/70 transition-all duration-300">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <span className="text-2xl">👥</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 font-medium mb-1">Total Students</p>
                <p className="text-2xl font-bold text-white">
                  {course.num_students_registered}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionsView({ sessions, onSessionClick, onEndSession }) {
  if (sessions.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
        <div className="relative text-center py-24 bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl">
          <div className="text-7xl mb-6">📝</div>
          <h3 className="text-2xl font-bold text-white mb-3">No sessions yet</h3>
          <p className="text-gray-500 text-lg">Create your first session!</p>
        </div>
      </div>
    );
  } 
console.log("Sessions received:", sessions);
  return (
    <div className="space-y-6">
      {sessions.map((session) => (
        <div
          key={session.session_id}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-15 transition duration-500"></div>
          <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-2xl p-8 transition-all duration-300 group-hover:border-gray-800">
            <div className="flex justify-between items-start flex-wrap gap-6">
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-3xl font-bold text-white">
                    Session {session.session_id}
                  </h3>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    session.attendance_portal_status === 'ON' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20' 
                      : 'bg-gray-900 text-gray-400 border border-gray-800'
                  }`}>
                    {session.attendance_portal_status === 'ON' ? '● Live' : 'Ended'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative group/card">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition"></div>
                    <div className="relative flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-xl p-5 group-hover/card:border-green-500/30">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
                        <span className="text-3xl font-bold text-green-400">{session.num_students_attended}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Present</p>
                        <p className="text-sm font-bold text-white">Students</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition"></div>
                    <div className="relative flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-xl p-5 group-hover/card:border-red-500/30">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-600/20 to-rose-600/20 rounded-xl flex items-center justify-center border border-red-500/30">
                        <span className="text-3xl font-bold text-red-400">{session.num_students_absent}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Absent</p>
                        <p className="text-sm font-bold text-white">Students</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{new Date(session.session_created).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🕐</span>
                    <span>{new Date(session.session_created).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onSessionClick(session.session_id)}
                  className="relative group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-purple-500/30 group-hover/btn:scale-105 active:scale-95">
                    View Details
                  </div>
                </button>
                {session.attendance_portal_status === 'ON' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEndSession(session.session_id);
                    }}
                    className="relative group/btn overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl shadow-xl shadow-red-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-red-500/30 group-hover/btn:scale-105 active:scale-95">
                      ⏻ End
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionDetailView({ session, onEndSession }) {
  const total = session.num_students_attended + session.num_students_absent;
  const attendanceRate =
    total > 0
      ? ((session.num_students_attended / total) * 100).toFixed(1)
      : 0;

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-15 transition duration-500"></div>
      <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-10">
        <div className="flex justify-between items-start mb-10 flex-wrap gap-6">
          <div>
            <h2 className="text-5xl text-white mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Session {session.session_id}
            </h2>
            <p className="text-gray-500 text-lg mb-2">{session.course_name}</p>
            <p className="text-sm text-gray-600">
              Teacher: {session.teacher_name}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-5 py-2.5 rounded-xl text-sm mb-4 ${
                session.attendance_portal_status === "ON"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20"
                  : "bg-gray-900 text-gray-400 border border-gray-800"
              }`}
            >
              {session.attendance_portal_status === "ON"
                ? "● Portal Active"
                : "Session Ended"}
            </span>
            {session.attendance_portal_status === "ON" && (
              <button
                onClick={() => onEndSession(session.session_id)}
                className="relative group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl shadow-xl shadow-red-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-red-500/30 group-hover/btn:scale-105 active:scale-95">
                  ⏻ End Session
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Attendance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="relative group/card">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover/card:opacity-30 transition"></div>
            <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 group-hover/card:border-green-500/30">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl text-green-400">Present</h3>
                <span className="text-6xl text-green-400">
                  {session.num_students_attended}
                </span>
              </div>
              <p className="text-sm text-green-400/80">
                {attendanceRate}% Attendance
              </p>
            </div>
          </div>

          <div className="relative group/card">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-20 group-hover/card:opacity-30 transition"></div>
            <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 group-hover/card:border-red-500/30">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl text-red-400">Absent</h3>
                <span className="text-6xl text-red-400">
                  {session.num_students_absent}
                </span>
              </div>
              <p className="text-sm text-red-400/80">Students missing</p>
            </div>
          </div>
        </div>

        {/* Student Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <h3 className="text-xl text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Present Students ({session.present_roll_numbers.length})
            </h3>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 max-h-96 overflow-y-auto group-hover:border-green-500/30 transition-all duration-300">
              {session.present_roll_numbers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No students present yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {session.present_roll_numbers.map((roll) => (
                    <span
                      key={roll}
                      className="px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 rounded-lg text-sm border border-green-500/40"
                    >
                      {roll}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl text-white mb-4 flex items-center gap-2">
              <span className="text-red-400">✗</span>
              Absent Students ({session.absent_roll_numbers.length})
            </h3>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 max-h-96 overflow-y-auto group-hover:border-red-500/30 transition-all duration-300">
              {session.absent_roll_numbers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  All students present! 🎉
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {session.absent_roll_numbers.map((roll) => (
                    <span
                      key={roll}
                      className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-400 rounded-lg text-sm border border-red-500/40"
                    >
                      {roll}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Session Timestamps */}
        <div className="pt-8 border-t border-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-500 mb-2 text-sm">Session Started</p>
              <p className="text-white">
                {new Date(session.session_created).toLocaleString()}
              </p>
            </div>
            {session.session_ended && (
              <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-500 mb-2 text-sm">Session Ended</p>
                <p className="text-white">
                  {new Date(session.session_ended).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// export default SessionDetailView;


function CreateCourseModal({ onClose, onCreate }) {
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [rollNumbers, setRollNumbers] = useState('');
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Parse Excel file and extract roll numbers from the first column
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Extract first column (ignoring empty cells)
      const rolls = jsonData
        .map((row) => row[0])
        .filter((val) => val !== undefined && val !== null && val !== "")
        .map((val) => String(val).trim());

      if (rolls.length === 0) {
        alert("Excel file seems empty or invalid!");
        return;
      }

      // Show preview and also update rollNumbers field
      setRollNumbers(rolls.join(", "));
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (!courseId.trim() || !courseName.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const rolls = rollNumbers.split(",").map((r) => r.trim()).filter((r) => r);

    if (rolls.length === 0) {
      alert("Please add at least one student roll number");
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        course_id: courseId.trim(),
        course_name: courseName.trim(),
        student_roll_numbers: rolls,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative group" onClick={(e) => e.stopPropagation()}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-30"></div>
        <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-8 w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Create New Course
            </h2>
            <p className="text-gray-500">Add a new course to start tracking attendance</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Course ID */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-400 ml-1">Course ID</label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-5 py-4 bg-gray-900/70 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., CS101"
              />
            </div>

            {/* Course Name */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-400 ml-1">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-900/70 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>

            {/* Roll Numbers / Excel Upload */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-400 ml-1">
                Student Roll Numbers
              </label>

              {/* Textarea Input */}
              <textarea
                value={rollNumbers}
                onChange={(e) => setRollNumbers(e.target.value)}
                rows={4}
                className="w-full px-5 py-4 bg-gray-900/70 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Enter roll numbers separated by commas (e.g., 101, 102, 103)"
              />

              <p className="text-xs text-gray-600">OR upload an Excel file (.xlsx, .xls) with roll numbers in the first column.</p>

              {/* Excel Upload */}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="w-full text-sm text-gray-300 bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-600 transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gray-900 text-gray-400 rounded-xl hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default CreateCourseModal;

function CreateSessionModal({ course, onClose, onCreate }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onCreate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative group" onClick={(e) => e.stopPropagation()}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-30"></div>
        <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Start New Session</h2>
            <p className="text-gray-500">Begin attendance tracking for this course</p>
          </div>

          {/* Course Info */}
          <div className="bg-gray-900/50 rounded-2xl p-6 mb-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-2">{course?.course_name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>ID:</span>
              <span className="text-purple-400 font-mono font-semibold">{course?.course_id}</span>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <span className="text-purple-400">⏰</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-400">Session will start immediately</p>
                <p className="text-xs text-gray-500">Attendance portal will be activated right away</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <span className="text-purple-400">👥</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-400">Students can mark attendance</p>
                <p className="text-xs text-gray-500">They'll use the course ID and their roll number</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="relative group/btn flex-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl blur opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
              <div className="relative px-6 py-4 bg-gray-900 text-gray-400 font-bold rounded-xl transition-all duration-300 group-hover/btn:text-white group-hover/btn:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </div>
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="relative group/btn flex-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/20 transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-purple-500/30 group-hover/btn:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <span>Start Session</span>
                    <span className="text-xl">▶</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}