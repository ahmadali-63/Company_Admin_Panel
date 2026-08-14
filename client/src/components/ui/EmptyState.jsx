import React from "react";
import { FolderOpen } from "lucide-react";

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "There are no records matching your criteria.",
  actionButton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-slate-800/80 my-4">
      <div className="p-4 rounded-full bg-slate-800/80 text-slate-400 mb-4 border border-slate-700/50">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-slate-200">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
