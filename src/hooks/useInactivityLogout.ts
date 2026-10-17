import { useEffect, useState, useRef, useCallback } from 'react';
import { CrmUser } from '../data/crmData';

interface InactivityConfig {
  user: CrmUser | null;
  timeoutMs?: number; // Default: 5 minutes (300,000 ms = 300 seconds)
  warningMs?: number; // Default: 4.5 minutes (270,000 ms) - 30 seconds warning countdown
  onTimeout: (user: CrmUser, reason: string) => void;
}

export function useInactivityLogout({
  user,
  timeoutMs = 5 * 60 * 1000, // 5 minutes strictly for all users
  warningMs = 4.5 * 60 * 1000, // 4 mins 30 secs
  onTimeout,
}: InactivityConfig) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleSeconds(0);
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  // Ability to trigger timeout immediately (for testing 5-min inactivity on employees)
  const simulateTimeout = useCallback(() => {
    if (!user || user.role === 'owner') return;
    setShowWarning(false);
    onTimeoutRef.current(user, 'Security Auto-Logout: User inactive for 5 minutes without any actions.');
  }, [user]);

  useEffect(() => {
    // Owner panel ALWAYS stays open - auto-logout is disabled for owner and only manual logout is permitted!
    if (!user || user.role === 'owner') {
      setShowWarning(false);
      setIdleSeconds(0);
      return;
    }

    lastActivityRef.current = Date.now();
    setIdleSeconds(0);

    const handleUserActivity = () => {
      // Throttle updating activity
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) {
        lastActivityRef.current = now;
        setIdleSeconds(0);
        setShowWarning(false);
      }
    };

    // Activity event listeners covering all user actions
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const currentIdleSecs = Math.floor(elapsed / 1000);
      setIdleSeconds(currentIdleSecs);

      if (elapsed >= timeoutMs) {
        clearInterval(interval);
        setShowWarning(false);
        onTimeoutRef.current(user, 'Security Auto-Logout: User inactive for 5 minutes without any keyboard/mouse actions.');
      } else if (elapsed >= warningMs) {
        setShowWarning(true);
        const remaining = Math.max(1, Math.ceil((timeoutMs - elapsed) / 1000));
        setSecondsRemaining(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [user, timeoutMs, warningMs]);

  return {
    showWarning,
    secondsRemaining,
    idleSeconds,
    resetTimer,
    simulateTimeout,
  };
}

