import React, { useState } from 'react';
import { X, Bell, Volume2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { 
  NotificationSettings, 
  getNotificationSettings, 
  saveNotificationSettings, 
  playMobileNotificationSound, 
  triggerSystemNotification 
} from '../services/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestNotification: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onTestNotification,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [permissionState, setPermissionState] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (enabled: boolean) => {
    const updated = { ...settings, enabled };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...settings, time };
    setSettings(updated);
    saveNotificationSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setPermissionState(res);
    }
  };

  const handleTest = () => {
    playMobileNotificationSound();
    triggerSystemNotification(
      'Affan Accounting OS',
      "It's 10:00 PM! Time to add all today's transactions and keep your accounts balanced."
    );
    try {
      fetch('/api/notifications/test', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    onTestNotification();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Reminder Alert</h3>
              <p className="text-xs text-slate-500">Every day at 10:00 PM notification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Daily Night Reminder</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Notifies you to enter all day's transactions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Time Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Scheduled Reminder Time</span>
              {savedSuccess && (
                <span className="text-emerald-600 font-bold flex items-center space-x-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-800"
                />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 whitespace-nowrap">
                Default: 10:00 PM
              </span>
            </div>
          </div>

          {/* Browser Notification Permission Banner */}
          {permissionState !== 'granted' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex flex-col space-y-2">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Enable browser notification permission so alerts pop up on your mobile or desktop even when the tab is in the background.
                </span>
              </div>
              <button
                onClick={handleRequestPermission}
                className="self-start px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                Allow Notifications
              </button>
            </div>
          )}

          {/* Test Notification Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTest}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-700 text-xs font-bold transition-all flex items-center justify-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Mobile Phone Notification &amp; Chime Now</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-1.5">
              Plays the mobile phone dual-tone sound &amp; displays the pop-up notification.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
