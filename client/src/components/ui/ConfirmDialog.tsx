import React from "react";
import { AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}) => {
  const icons = {
    danger: <AlertCircle className="w-10 h-10 text-rose-600" />,
    warning: <AlertTriangle className="w-10 h-10 text-amber-600" />,
    info: <HelpCircle className="w-10 h-10 text-blue-600" />,
  };

  const buttonStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
    warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col items-center text-center p-2">
        <div className="mb-4 p-3 rounded-full bg-slate-50 border border-slate-100">
          {icons[type]}
        </div>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3 w-full border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${buttonStyles[type]}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
