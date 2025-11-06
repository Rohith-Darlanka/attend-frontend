// StatCard.jsx
import React from "react";

function StatCard({ title, value, subtitle, color = "blue" }) {
  const colorMap = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    orange: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  };

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${colorMap[color]} 
          rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500`}
      ></div>

      <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-2xl p-6 transition-all duration-300 group-hover:border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium tracking-wide mb-2 uppercase">
          {title}
        </h3>
        <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-gray-500 text-sm mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

export default StatCard;
