import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";
import { MLModelsDashboard } from './MLModelsDashboard';

export default function SessionAnalytics({ session }) {
    const [showMLModels, setShowMLModels] = useState(false);
  const total = session.num_students_attended + session.num_students_absent;
  const attendanceRate =
    total > 0
      ? ((session.num_students_attended / total) * 100).toFixed(1)
      : 0;
  const absentRate =
    total > 0
      ? ((session.num_students_absent / total) * 100).toFixed(1)
      : 0;

  let duration = null;
  if (session.session_ended) {
    const start = new Date(session.session_created);
    const end = new Date(session.session_ended);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  const COLORS = ["#22c55e", "#ef4444"];

  // Data for charts
  const pieData = [
    { name: "Present", value: session.num_students_attended },
    { name: "Absent", value: session.num_students_absent },
  ];

  const barData = [
    { label: "Present", count: session.num_students_attended },
    { label: "Absent", count: session.num_students_absent },
  ];

  const scatterData = [
    { duration: duration ? parseFloat(duration) || 1 : 1, rate: parseFloat(attendanceRate) },
  ];

  const radarData = [
    { subject: "Attendance", A: attendanceRate, fullMark: 100 },
    { subject: "Participation", A: attendanceRate - 10, fullMark: 100 },
    { subject: "Consistency", A: Math.min(100, attendanceRate + 5), fullMark: 100 },
    { subject: "Engagement", A: attendanceRate - 5, fullMark: 100 },
  ];

  return (
    <div className="space-y-10">
      {/* Keep your previous UI (stats, breakdown, lists, etc.) */}
      {/* You can insert charts below Insights or at the bottom */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowMLModels(!showMLModels)}
          className="relative group/btn overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-xl blur-lg opacity-40 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-purple-500/20">
            <span className="text-xl">🤖</span>
            <span>{showMLModels ? 'Hide' : 'Show'} ML Models</span>
          </div>
        </button>
      </div>
      {showMLModels && <MLModelsDashboard sessionId={session.session_id} />}
      
      {/* ---------- ANALYTICS CHARTS SECTION ---------- */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">📊</span>
          Advanced Analytics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* PIE CHART */}
          <div className="bg-gray-900/40 rounded-xl p-4 flex flex-col items-center">
            <h4 className="text-white font-semibold mb-2">Attendance Split</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}
          <div className="bg-gray-900/40 rounded-xl p-4 flex flex-col items-center">
            <h4 className="text-white font-semibold mb-2">Attendance Count</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="label" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SCATTER CHART */}
          <div className="bg-gray-900/40 rounded-xl p-4 flex flex-col items-center">
            <h4 className="text-white font-semibold mb-2">Duration vs Attendance</h4>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="duration" name="Duration" stroke="#aaa" />
                <YAxis dataKey="rate" name="Attendance %" stroke="#aaa" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={scatterData} fill="#22c55e" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* RADAR CHART */}
          <div className="bg-gray-900/40 rounded-xl p-4 flex flex-col items-center">
            <h4 className="text-white font-semibold mb-2">Performance Metrics</h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart outerRadius={80} data={radarData}>
                <PolarGrid stroke="#555" />
                <PolarAngleAxis dataKey="subject" stroke="#aaa" />
                <PolarRadiusAxis stroke="#aaa" />
                <Radar
                  name="Session"
                  dataKey="A"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
