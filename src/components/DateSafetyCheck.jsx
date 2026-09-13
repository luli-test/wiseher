import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Play,
  RotateCcw,
  Info,
  ExternalLink
} from 'lucide-react';

const STORAGE_KEY = 'wiseher_safety_timer_v1';

export default function DateSafetyCheck() {
  const [trustedName, setTrustedName] = useState('');
  const [trustedPhone, setTrustedPhone] = useState('');
  const [targetTime, setTargetTime] = useState(''); // ISO string
  const [isActive, setIsActive] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'fetching' | 'ready' | 'error'
  const [coords, setCoords] = useState(null);

  // Restore active timer from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTrustedName(parsed.name || '');
        setTrustedPhone(parsed.phone || '');
        setTargetTime(parsed.targetTime || '');
        setIsActive(Boolean(parsed.isActive));
      }
    } catch (e) {
      console.error('Failed to load safety timer:', e);
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (!isActive || !targetTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(targetTime).getTime();
      const diff = Math.floor((end - now) / 1000);

      if (diff <= 0) {
        setRemainingSeconds(0);
        setIsTriggered(true);
        // Attempt to fetch location quietly in advance if triggered
        fetchLocation();
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, targetTime]);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5)
        });
        setLocationStatus('ready');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationStatus('error');
      },
      { timeout: 8000 }
    );
  };

  const handleStartTimer = (hoursToAdd = 2) => {
    if (!trustedName.trim() || !trustedPhone.trim()) {
      alert('Please enter your trusted contact name and phone number.');
      return;
    }

    const end = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000).toISOString();
    setTargetTime(end);
    setIsActive(true);
    setIsTriggered(false);

    const state = {
      name: trustedName,
      phone: trustedPhone,
      targetTime: end,
      isActive: true
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const handleAddMinutes = (mins = 30) => {
    if (!targetTime) return;
    const currentEnd = new Date(targetTime).getTime();
    const newEnd = new Date(currentEnd + mins * 60 * 1000).toISOString();
    setTargetTime(newEnd);
    setIsTriggered(false);

    const state = {
      name: trustedName,
      phone: trustedPhone,
      targetTime: newEnd,
      isActive: true
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const handleMarkSafe = () => {
    setIsActive(false);
    setIsTriggered(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const cleanPhone = (phone) => phone.replace(/[^0-9+]/g, '');

  const getLocationUrl = () => {
    if (coords) {
      return `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    }
    return '';
  };

  const getEmergencyMessage = () => {
    const loc = getLocationUrl();
    if (loc) {
      return `Hi ${trustedName}, I haven't checked in from my date on WiseHer as scheduled. Here is my current location: ${loc}`;
    }
    return `Hi ${trustedName}, I haven't checked in from my date on WiseHer as scheduled. Please check on me.`;
  };

  const handleSendWhatsApp = () => {
    const phone = cleanPhone(trustedPhone).replace(/^\+/, '');
    const text = encodeURIComponent(getEmergencyMessage());
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleSendSms = () => {
    const phone = cleanPhone(trustedPhone);
    const text = encodeURIComponent(getEmergencyMessage());
    window.open(`sms:${phone}?body=${text}`, '_blank');
  };

  const handleCall = () => {
    const phone = cleanPhone(trustedPhone);
    window.location.href = `tel:${phone}`;
  };

  // Format seconds into HH:MM:SS
  const formatTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-xs space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-warmamber-100 text-warmamber-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-sand-900">
              Date Safety Check
            </h2>
            <p className="text-xs text-sand-500">
              Set an expected check-in time before meeting someone new
            </p>
          </div>
        </div>

        {/* Honest UI disclosure */}
        <div className="p-3 bg-sand-50 rounded-2xl border border-sand-200/60 flex items-start gap-2 text-[11px] text-sand-600 mt-2">
          <Info className="w-4 h-4 text-sand-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-sand-800">Client-side safety:</strong> WiseHer runs 100% on your device with no cloud server. If the timer passes, you can launch a location message or call in one tap. Automatic background sending without you touching the phone would require a future cloud backend.
          </p>
        </div>
      </div>

      {/* ACTIVE RUNNING TIMER */}
      {isActive && !isTriggered && (
        <div className="bg-white rounded-3xl p-6 border-2 border-sage-300 shadow-sm text-center space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 text-sage-700 text-xs font-semibold border border-sage-200">
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
            Safety Timer Active
          </div>

          <div>
            <div className="text-4xl font-mono font-bold text-sand-900 tracking-wider">
              {formatTime(remainingSeconds)}
            </div>
            <p className="text-xs text-sand-500 mt-1">
              Expected check-in by {new Date(targetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="p-3 bg-sand-50 rounded-2xl border border-sand-200/60 text-xs text-sand-700 text-left">
            <p><strong>Trusted Contact:</strong> {trustedName} ({trustedPhone})</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {/* Primary Action: I'm Safe */}
            <button
              onClick={handleMarkSafe}
              className="w-full py-3.5 px-4 bg-sage-600 hover:bg-sage-700 active:scale-98 text-white rounded-2xl font-serif font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I'm Safe (Stop Timer)</span>
            </button>

            {/* Extend +30 Mins */}
            <div className="flex gap-2">
              <button
                onClick={() => handleAddMinutes(30)}
                className="flex-1 py-2.5 px-3 bg-sand-100 hover:bg-sand-200 text-sand-800 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+30 Mins (Date Going Well)</span>
              </button>
              <button
                onClick={handleMarkSafe}
                className="py-2.5 px-3 bg-sand-100 hover:bg-sand-200 text-sand-600 rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETUP FORM (WHEN TIMER NOT ACTIVE) */}
      {!isActive && (
        <div className="bg-white rounded-3xl p-5 border border-sand-200/90 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-sand-900">
            Set Up Your Trusted Contact & Cadence
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-sand-700 mb-1">
                Trusted Contact Name
              </label>
              <input
                type="text"
                value={trustedName}
                onChange={(e) => setTrustedName(e.target.value)}
                placeholder="e.g. Maya or Sophie"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sand-700 mb-1">
                Phone Number (for SMS & WhatsApp)
              </label>
              <input
                type="tel"
                value={trustedPhone}
                onChange={(e) => setTrustedPhone(e.target.value)}
                placeholder="e.g. +49 170 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sand-700 mb-1.5">
                Expected Check-in Time Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStartTimer(1.5)}
                  className="py-2.5 px-3 bg-sand-100 hover:bg-terracotta-50 hover:border-terracotta-300 border border-sand-200 text-sand-800 rounded-xl text-xs font-medium transition flex flex-col items-center"
                >
                  <span className="font-bold text-sm">1.5 hrs</span>
                  <span className="text-[10px] text-sand-500">Coffee date</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartTimer(2.5)}
                  className="py-2.5 px-3 bg-sand-100 hover:bg-terracotta-50 hover:border-terracotta-300 border border-sand-200 text-sand-800 rounded-xl text-xs font-medium transition flex flex-col items-center"
                >
                  <span className="font-bold text-sm">2.5 hrs</span>
                  <span className="text-[10px] text-sand-500">Dinner / Drinks</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartTimer(4.0)}
                  className="py-2.5 px-3 bg-sand-100 hover:bg-terracotta-50 hover:border-terracotta-300 border border-sand-200 text-sand-800 rounded-xl text-xs font-medium transition flex flex-col items-center"
                >
                  <span className="font-bold text-sm">4.0 hrs</span>
                  <span className="text-[10px] text-sand-500">Long outing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN CALM ALERT (WHEN TIME HAS PASSED) */}
      {isTriggered && (
        <div className="fixed inset-0 z-50 bg-sand-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-warmamber-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-warmamber-100 text-warmamber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-sand-900">
                Safety Check-in Due
              </h3>
              <p className="text-xs text-sand-600">
                Your expected check-in time has passed. Are you safe?
              </p>
            </div>

            {/* One-tap actions */}
            <div className="space-y-2 pt-2">
              {/* WhatsApp Location Link */}
              <button
                onClick={handleSendWhatsApp}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp Location to {trustedName}</span>
              </button>

              {/* SMS Location Link */}
              <button
                onClick={handleSendSms}
                className="w-full py-3 px-4 bg-sand-800 hover:bg-sand-900 text-white rounded-2xl font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Send SMS Location to {trustedName}</span>
              </button>

              {/* Phone Call */}
              <button
                onClick={handleCall}
                className="w-full py-3 px-4 bg-warmamber-600 hover:bg-warmamber-700 text-white rounded-2xl font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call {trustedName} Now</span>
              </button>

              {/* I'm safe dismiss */}
              <button
                onClick={handleMarkSafe}
                className="w-full py-2.5 px-4 bg-sand-100 hover:bg-sand-200 text-sand-700 rounded-xl text-xs font-semibold transition mt-2"
              >
                I'm Safe (Dismiss Alert)
              </button>
            </div>

            <p className="text-[10px] text-center text-sand-400">
              Tapping an action will prefill your contact's number and current GPS coordinates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
