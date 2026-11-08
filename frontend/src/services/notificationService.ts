export interface NotificationSettings {
  enabled: boolean;
  time: string; // "22:00"
  lastTriggeredDate?: string;
}

const SETTINGS_KEY = 'affan_accounting_notification_settings';

export function getNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading notification settings', e);
  }
  return {
    enabled: true,
    time: '22:00', // 10:00 PM default
  };
}

export function saveNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving notification settings', e);
  }
}

// Gentle mobile phone dual-tone chime using Web Audio API
export function playMobileNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: 659.25 Hz (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880 Hz (A5) - uplifting phone ding
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.error('Sound playback failed:', err);
  }
}

// Trigger native desktop / mobile system notification if permitted
export async function triggerSystemNotification(title: string, body: string) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    try {
      const options: any = {
        body,
        icon: '/favicon.svg',
        tag: 'daily-reminder',
        vibrate: [200, 100, 200],
      };
      new Notification(title, options);
    } catch (e) {
      console.error('Error dispatching system notification:', e);
    }
  }
}
