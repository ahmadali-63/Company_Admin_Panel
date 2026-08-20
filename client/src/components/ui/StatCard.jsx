import React from "react";
import { TrendingUp } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color = "indigo", subtitle, trend = "+12%" }) => {
  const colorStyles = {
    indigo: {
      bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      glow: "shadow-indigo-500/10",
      accent: "text-indigo-400",
    },
    blue: {
      bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      glow: "shadow-blue-500/10",
      accent: "text-blue-400",
    },
    emerald: {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      glow: "shadow-emerald-500/10",
      accent: "text-emerald-400",
    },
    purple: {
      bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      glow: "shadow-purple-500/10",
      accent: "text-purple-400",
    },
    amber: {
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      glow: "shadow-amber-500/10",
      accent: "text-amber-400",
    },
    rose: {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      glow: "shadow-rose-500/10",
      accent: "text-rose-400",
    },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div className={`glass-card glass-card-hover rounded-3xl p-5 border border-slate-800/80 relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-2xl border transition-transform duration-300 group-hover:scale-110 ${style.bg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-blue-500 tracking-tight">
          {value !== undefined ? value : 0}
        </span>
        {subtitle ? (
          <span className="text-[11px] text-slate-400 font-medium">{subtitle}</span>
        ) : (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
