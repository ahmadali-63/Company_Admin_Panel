import React from "react";
import { TrendingUp } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "azure",
  subtitle,
  trend = "+12%",
  onClick,
}) => {
  const colorStyles = {
    purple: {
      bg: "bg-[#845EC2]/20 text-[#845EC2] border-[#845EC2]/40",
      hoverGlow: "group-hover:border-[#845EC2]/80 group-hover:shadow-glow-purple-lg",
      gradient: "from-[#845EC2]/35 via-[#845EC2]/10 to-transparent",
      iconGlow: "bg-[#845EC2]/30 text-purple-200 border-[#845EC2]/60 shadow-lg shadow-[#845EC2]/40",
      valueColor: "text-[#d8b4fe] text-purple-glow",
      titleColor: "text-purple-200/80 group-hover:text-purple-100",
    },
    royal: {
      bg: "bg-[#2C73D2]/20 text-[#2C73D2] border-[#2C73D2]/40",
      hoverGlow: "group-hover:border-[#2C73D2]/80 group-hover:shadow-glow-royal",
      gradient: "from-[#2C73D2]/35 via-[#2C73D2]/10 to-transparent",
      iconGlow: "bg-[#2C73D2]/30 text-blue-200 border-[#2C73D2]/60 shadow-lg shadow-[#2C73D2]/40",
      valueColor: "text-[#93c5fd] text-cyan-glow",
      titleColor: "text-blue-200/80 group-hover:text-blue-100",
    },
    azure: {
      bg: "bg-[#0081CF]/20 text-[#0081CF] border-[#0081CF]/40",
      hoverGlow: "group-hover:border-[#0081CF]/80 group-hover:shadow-glow-azure",
      gradient: "from-[#0081CF]/35 via-[#0081CF]/10 to-transparent",
      iconGlow: "bg-[#0081CF]/30 text-sky-200 border-[#0081CF]/60 shadow-lg shadow-[#0081CF]/40",
      valueColor: "text-[#7dd3fc] text-cyan-glow",
      titleColor: "text-sky-200/80 group-hover:text-sky-100",
    },
    ocean: {
      bg: "bg-[#0089BA]/20 text-[#0089BA] border-[#0089BA]/40",
      hoverGlow: "group-hover:border-[#0089BA]/80 group-hover:shadow-glow-azure",
      gradient: "from-[#0089BA]/35 via-[#0089BA]/10 to-transparent",
      iconGlow: "bg-[#0089BA]/30 text-cyan-200 border-[#0089BA]/60 shadow-lg shadow-[#0089BA]/40",
      valueColor: "text-[#67e8f9] text-cyan-glow",
      titleColor: "text-cyan-200/80 group-hover:text-cyan-100",
    },
    teal: {
      bg: "bg-[#008E9B]/20 text-[#008E9B] border-[#008E9B]/40",
      hoverGlow: "group-hover:border-[#008E9B]/80 group-hover:shadow-glow-emerald",
      gradient: "from-[#008E9B]/35 via-[#008E9B]/10 to-transparent",
      iconGlow: "bg-[#008E9B]/30 text-teal-200 border-[#008E9B]/60 shadow-lg shadow-[#008E9B]/40",
      valueColor: "text-[#5eead4] text-emerald-glow",
      titleColor: "text-teal-200/80 group-hover:text-teal-100",
    },
    emerald: {
      bg: "bg-[#008F7A]/20 text-[#008F7A] border-[#008F7A]/40",
      hoverGlow: "group-hover:border-[#008F7A]/80 group-hover:shadow-glow-emerald",
      gradient: "from-[#008F7A]/35 via-[#008F7A]/10 to-transparent",
      iconGlow: "bg-[#008F7A]/30 text-emerald-200 border-[#008F7A]/60 shadow-lg shadow-[#008F7A]/40",
      valueColor: "text-[#6ee7b7] text-emerald-glow",
      titleColor: "text-emerald-200/80 group-hover:text-emerald-100",
    },
  };

  const style =
    colorStyles[color] ||
    (color === "indigo" ? colorStyles.purple : colorStyles.azure);

  return (
    <div
      onClick={onClick}
      className={`glass-card glass-card-hover rounded-3xl p-5 border border-white/10 relative overflow-hidden group cursor-pointer ${
        style.hoverGlow
      } ${onClick ? "active:scale-[0.98]" : ""}`}
    >
      {/* Background radial glow */}
      <div
        className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${style.gradient} rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-center justify-between relative z-10">
        <span className={`text-[11px] font-extrabold uppercase tracking-wider transition-colors ${style.titleColor}`}>
          {title}
        </span>
        <div
          className={`p-2.5 rounded-2xl border transition-all duration-300 group-hover:scale-110 shadow-lg ${style.iconGlow}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between relative z-10">
        <span className={`text-3xl font-extrabold tracking-tight transition-colors ${style.valueColor}`}>
          {value !== undefined ? value : 0}
        </span>
        {subtitle ? (
          <span className="text-[11px] text-slate-300 font-semibold">{subtitle}</span>
        ) : (
          <span className="text-[11px] font-bold text-[#6ee7b7] bg-[#008F7A]/25 px-2.5 py-0.5 rounded-full border border-[#008F7A]/40 flex items-center gap-1 shadow-sm">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
