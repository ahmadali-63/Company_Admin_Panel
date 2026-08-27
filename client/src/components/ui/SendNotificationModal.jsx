import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { Send, AlertCircle } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import API from "../../services/api";

const SendNotificationModal = ({ isOpen, onClose, initialData = null }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ receiverId: "", title: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          receiverId: initialData.receiverId || "",
          title: initialData.title || "",
          message: ""
        });
      } else {
        setFormData({ receiverId: "", title: "", message: "" });
      }
      
      API.get("/users/directory").then((res) => {
        setUsers(res.data.users || []);
      }).catch(console.error);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await notificationService.sendNotification(formData);
      setFormData({ receiverId: "", title: "", message: "" });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Notification" icon={Send}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300">Recipient *</label>
          <select
            required
            value={formData.receiverId}
            onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select an employee or admin</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300">Title *</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="Notification Subject"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300">Message *</label>
          <textarea
            required
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="Write your message here..."
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 font-bold text-slate-300">Cancel</button>
          <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2">
            <Send className="w-4 h-4" /> {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SendNotificationModal;
