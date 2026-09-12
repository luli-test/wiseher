import React, { useState } from 'react';
import { X, Heart, Users, HelpCircle, Shield, Sparkles } from 'lucide-react';
import { INTENTS } from '../constants';

/**
 * ContactModal: Dialog to add a new person with nickname only and intent.
 */
export default function ContactModal({ isOpen, onClose, onSave }) {
  const [nickname, setNickname] = useState('');
  const [intent, setIntent] = useState('dating');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Please provide a nickname or initials.');
      return;
    }

    onSave({
      id: `contact-${Date.now()}`,
      nickname: nickname.trim(),
      intent,
      createdAt: new Date().toISOString(),
      isDemo: false
    });

    setNickname('');
    setIntent('dating');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-sand-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-sand-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-sand-400 hover:text-sand-700 hover:bg-sand-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 mb-5">
          <span className="text-xl">🌱</span>
          <h3 className="font-serif font-bold text-lg text-sand-900">
            Plant a New Tree
          </h3>
          <p className="text-xs text-sand-500">
            Add a person to reflect upon. Use only a nickname or initial for privacy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nickname input */}
          <div>
            <label className="block text-xs font-semibold text-sand-700 uppercase tracking-wider mb-1.5">
              Nickname or Initials
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. M., Alex, Sam"
              maxLength={24}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sand-200 focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 text-sm bg-sand-50/50"
              autoFocus
            />
            {error && <p className="text-xs text-warmred-600 mt-1">{error}</p>}
          </div>

          {/* Intent selection */}
          <div>
            <label className="block text-xs font-semibold text-sand-700 uppercase tracking-wider mb-1.5">
              What do I want with this person?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(INTENTS).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setIntent(item.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    intent === item.id
                      ? 'border-terracotta-500 bg-terracotta-50/70 text-terracotta-900 ring-1 ring-terracotta-500'
                      : 'border-sand-200 bg-white hover:bg-sand-50 text-sand-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-sand-500 mt-1 line-clamp-1">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm active:scale-98"
            >
              Add to My Garden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
