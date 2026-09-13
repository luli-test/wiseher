import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, AlertCircle, Eye, EyeOff, ExternalLink, Check, Trash2 } from 'lucide-react';
import { getApiKey, setApiKey, GEMINI_MODEL } from '../services/gemini';

export default function SettingsModal({ isOpen, onClose, onKeyUpdated }) {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getApiKey();
      setKeyInput(current);
      setHasStoredKey(Boolean(localStorage.getItem('wiseher_gemini_key')));
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(keyInput.trim());
    setHasStoredKey(Boolean(keyInput.trim()));
    setSavedSuccess(true);
    if (onKeyUpdated) onKeyUpdated(keyInput.trim());
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setApiKey('');
    setKeyInput('');
    setHasStoredKey(false);
    if (onKeyUpdated) onKeyUpdated('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-sand-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-sand-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-sand-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sage-50 text-sage-700 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-sand-900">Settings & API Key</h2>
              <p className="text-xs text-sand-500">Configure your Gemini AI connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-sand-400 hover:text-sand-700 hover:bg-sand-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
          keyInput.trim()
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
            : 'bg-amber-50/80 border-amber-200 text-amber-800'
        }`}>
          {keyInput.trim() ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {keyInput.trim()
                ? `Gemini Active (${GEMINI_MODEL})`
                : 'No Gemini API Key Configured'}
            </p>
            <p className="text-[11px] mt-0.5 opacity-90">
              {keyInput.trim()
                ? hasStoredKey
                  ? 'Key is saved in browser localStorage for this device.'
                  : 'Key is provided by local environment variable (.env).'
                : 'Enter your Gemini key below. Without a key, WiseHer will ask before using offline rule-based fallbacks.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand-700 uppercase tracking-wider mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-10 text-xs bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-mono text-sand-800"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-sand-400 hover:text-sand-700"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-sand-500 mt-1.5 flex items-center gap-1">
              <span>Get a free key from</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-terracotta-600 font-medium underline inline-flex items-center gap-0.5 hover:text-terracotta-700"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="p-3 bg-sand-50 border border-sand-200/60 rounded-xl text-[11px] text-sand-600 leading-relaxed">
            🔒 <strong>Privacy Assurance:</strong> Your key is stored solely in your browser's <code>localStorage</code> on this device. It is never logged to any server, sent to any backend, or shared.
          </div>

          <div className="flex items-center gap-2 pt-1">
            {hasStoredKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition flex items-center gap-1 font-medium"
                title="Remove key from localStorage"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
