import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import authApi from '../api/authApi';
import { MLModelsDashboard } from './MLModelsDashboard';
import StatCard from "../HelperComponents/StatCard";




export default function AnalyticsDashboard() {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
 const [showMLModels, setShowMLModels] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [coursesRes, sessionsRes] = await Promise.all([
        authApi.get('/courses/'),
        authApi.get('/sessions/')
      ]);

      setCourses(coursesRes.data);
      setSessions(sessionsRes.data);
      calculateAnalytics(coursesRes.data, sessionsRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    setLoading(false);
  };

  const calculateAnalytics = (coursesData, sessionsData) => {
    const allStudents = new Set();
    coursesData.forEach(course => {
      course.student_roll_numbers.forEach(roll => allStudents.add(roll));
    });

    const totalSessions = sessionsData.length;
    const activeSessions = sessionsData.filter(s => s.attendance_portal_status === 'ON').length;
    const completedSessions = sessionsData.filter(s => s.attendance_portal_status === 'OFF').length;

    const totalAttendances = sessionsData.reduce((sum, s) => sum + s.num_students_attended, 0);
    const totalPossible = sessionsData.reduce((sum, s) => sum + s.num_students_attended + s.num_students_absent, 0);
    const overallAttendanceRate = totalPossible > 0 ? (totalAttendances / totalPossible * 100).toFixed(1) : 0;

    const courseAnalytics = coursesData.map(course => {
      const courseSessions = sessionsData.filter(s => s.course_id_copy === course.course_id);
      const attended = courseSessions.reduce((sum, s) => sum + s.num_students_attended, 0);
      const possible = courseSessions.reduce((sum, s) => sum + s.num_students_attended + s.num_students_absent, 0);
      const rate = possible > 0 ? (attended / possible * 100).toFixed(1) : 0;
      return {
        courseId: course.course_id,
        courseName: course.course_name,
        sessions: courseSessions.length,
        attendanceRate: parseFloat(rate),
        totalStudents: course.num_students_registered
      };
    });

    const studentAttendance = {};
    sessionsData.forEach(session => {
      session.present_roll_numbers.forEach(roll => {
        if (!studentAttendance[roll]) studentAttendance[roll] = { present: 0, total: 0 };
        studentAttendance[roll].present++;
        studentAttendance[roll].total++;
      });
      session.absent_roll_numbers.forEach(roll => {
        if (!studentAttendance[roll]) studentAttendance[roll] = { present: 0, total: 0 };
        studentAttendance[roll].total++;
      });
    });

    const studentStats = Object.entries(studentAttendance).map(([roll, stats]) => ({
      rollNumber: roll,
      attendanceRate: stats.total > 0 ? (stats.present / stats.total * 100).toFixed(1) : 0,
      present: stats.present,
      total: stats.total
    }));

    const attendanceTrend = sessionsData.map(s => ({
      date: new Date(s.session_created).toLocaleDateString(),
      attendanceRate: s.num_students_attended + s.num_students_absent > 0
        ? ((s.num_students_attended / (s.num_students_attended + s.num_students_absent)) * 100).toFixed(1)
        : 0
    }));

    setAnalytics({
      totalCourses: coursesData.length,
      totalStudents: allStudents.size,
      totalSessions,
      activeSessions,
      completedSessions,
      overallAttendanceRate,
      courseAnalytics,
      studentStats,
      attendanceTrend
    });
  };

  if (loading) return (
<div className="flex flex-col items-center justify-center min-h-screen">
  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
  <p className="text-gray-400 text-lg text-center">Loading analytics...</p>
</div>
  );

  if (!analytics) return (
    <div className="text-center py-16 bg-gray-800/30 rounded-2xl">
      <p className="text-gray-400 text-lg">No data available yet</p>
    </div>
  );

  return (
    <div className="space-y-10 p-6">
      {/* Overview */}
            <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10"></div>
        <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Advanced Analytics</h3>
            <button
              onClick={() => setShowMLModels(!showMLModels)}
              className="relative group/btn overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/20">
                <span className="text-xl"></span>
                <span>{showMLModels ? 'Hide' : 'Show'} ML Models</span>
              </div>
            </button>
          </div>
        </div>
      </div>
            {showMLModels && <MLModelsDashboard />}
            
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatCard title="Courses" value={analytics.totalCourses} color="blue" />
  <StatCard title="Students" value={analytics.totalStudents} color="green" />
  <StatCard
    title="Sessions"
    value={analytics.totalSessions}
    subtitle={`${analytics.activeSessions} active`}
    color="purple"
  />
  <StatCard
    title="Overall Attendance"
    value={`${analytics.overallAttendanceRate}%`}
    color="orange"
  />
</div>


      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Line Chart: Attendance Over Time */}
        <ChartCard title="Attendance Trend (Last Sessions)" icon="">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line type="monotone" dataKey="attendanceRate" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar Chart: Course Comparison */}
        <ChartCard title="Course Attendance Comparison" icon="">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.courseAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="courseName" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="attendanceRate" fill="#8884d8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter Plot: Student Performance */}
        <ChartCard title="Student Attendance Scatter Plot" icon="">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="total" name="Sessions" stroke="#aaa" />
              <YAxis dataKey="attendanceRate" name="Attendance %" stroke="#aaa" />
              <ZAxis dataKey="present" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={analytics.studentStats} fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Box Plot Style (Distribution) */}
        <ChartCard title="Attendance Distribution Summary" icon="">
          <BoxPlotLikeChart studentStats={analytics.studentStats} />
        </ChartCard>
      </div>
    </div>
  );
}

// === Helper Components ===



function ChartCard({ title, icon, children }) {
  return (
    <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

// Mimic a Box Plot Summary
function BoxPlotLikeChart({ studentStats }) {
  const rates = studentStats.map(s => parseFloat(s.attendanceRate)).sort((a, b) => a - b);
  const q1 = rates[Math.floor(rates.length * 0.25)];
  const median = rates[Math.floor(rates.length * 0.5)];
  const q3 = rates[Math.floor(rates.length * 0.75)];
  const min = rates[0];
  const max = rates[rates.length - 1];

  return (
    <div className="flex flex-col items-center justify-center h-[280px] text-white">
      <div className="w-full flex justify-between text-sm text-gray-400 mb-4">
        <span>Min: {min}%</span>
        <span>Q1: {q1}%</span>
        <span>Median: {median}%</span>
        <span>Q3: {q3}%</span>
        <span>Max: {max}%</span>
      </div>
      <div className="relative w-full h-3 bg-gray-700/50 rounded-full">
        <div
          className="absolute h-3 bg-green-500/70 rounded-full"
          style={{
            left: `${min}%`,
            width: `${q3 - min}%`
          }}
        />
        <div
          className="absolute top-[-4px] w-1 h-5 bg-yellow-400 left-[50%]"
          style={{ left: `${median}%` }}
        />
      </div>
    </div>
  );
}
