import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, PlusCircle, Clock, Bell } from 'lucide-react';

interface NotificationBannerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: () => void;
  title?: string;
  message?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  title = 'Daily Transaction Reminder',
  message = "It's 10:00 PM! Don't forget to record all of today's income, expenses, and loans to keep your books balanced.",
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Auto dismiss after 20 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 20000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-full px-2 sm:px-0 pointer-events-none transition-all duration-300">
      <div
        className={`pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/60 transition-all duration-500 transform ${
          visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
        }`}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300 tracking-wider uppercase text-[11px]">
              Affan Accounting
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 flex items-center space-x-1">
              <Clock className="w-3 h-3 inline" />
              <span>10:00 PM</span>
            </span>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Body (Phone Push Style) */}
        <div className="py-2.5">
          <div className="flex items-start space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(() => {
                onClose();
                onAddTransaction();
              }, 200);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Entry Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

