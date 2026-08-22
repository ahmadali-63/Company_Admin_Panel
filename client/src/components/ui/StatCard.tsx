import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple" | "indigo" | "cyan";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  change,
  isPositive,
  color = "blue",
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "hover:border-blue-300",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "hover:border-emerald-300",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "hover:border-amber-300",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "hover:border-rose-300",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "hover:border-purple-300",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "hover:border-indigo-300",
    },
    cyan: {
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      border: "hover:border-cyan-300",
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${scheme.border} ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${scheme.bg} ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {(subtitle || change) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            {change && (
              <span
                className={`font-semibold ${
                  isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {change}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
