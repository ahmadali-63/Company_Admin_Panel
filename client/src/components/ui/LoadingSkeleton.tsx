import React from "react";

export const LoadingSkeleton: React.FC<{ rows?: number; type?: "table" | "cards" | "dashboard" }> = ({
  rows = 5,
  type = "table",
}) => {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-100 rounded-xl" />
          <div className="h-72 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-slate-200/70 rounded-lg w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-lg w-full" />
      ))}
    </div>
  );
};
