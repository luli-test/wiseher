import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Star, Lock, Calendar, MessageSquare, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { isSpeechRecognitionSupported, createSpeechRecognizer } from '../services/speech';

/**
 * CheckInModal: Guided check-in after meeting or chat.
 * Four short coaching questions:
 * 1. What happened?
 * 2. How did I feel during and after, plus a 1-5 rating?
 * 3. What did they do or say that stood out, positive or negative?
 * 4. Who initiated, and how did they communicate (tone, response time, reliability)?
 *
 * Text or voice input via Web Speech API; stores text only, never audio.
 */
export default function CheckInModal({
  isOpen,
  onClose,
  contacts = [],
  selectedContact = null,
  onSaveCheckIn
}) {
  const [contactId, setContactId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [whatHappened, setWhatHappened] = useState('');
  const [feeling, setFeeling] = useState('');
  const [rating, setRating] = useState(3);
  const [standout, setStandout] = useState('');
  const [communicationDynamics, setCommunicationDynamics] = useState('');
  
  // Voice recording state
  const [activeRecordingField, setActiveRecordingField] = useState(null);
  const recognizerRef = useRef(null);
  const speechSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (selectedContact) {
      setContactId(selectedContact.id);
    } else if (contacts.length > 0 && !contactId) {
      setContactId(contacts[0].id);
    }
  }, [selectedContact, contacts]);

  // Clean up speech recognition on unmount or field change
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  const toggleVoice = (fieldName, currentSetter) => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. You can type directly.');
      return;
    }

    if (activeRecordingField === fieldName) {
      // Stop recording
      if (recognizerRef.current) {
        recognizerRef.current.stop();
        recognizerRef.current = null;
      }
      setActiveRecordingField(null);
    } else {
      // Stop existing if any
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }

      const recognizer = createSpeechRecognizer({
        onResult: (transcript) => {
          currentSetter((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: (err) => {
          console.warn('Voice recognition error:', err);
          setActiveRecordingField(null);
        },
        onEnd: () => {
          setActiveRecordingField(null);
        }
      });

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setActiveRecordingField(fieldName);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactId) return;

    // Build new check-in object
    const newCheckIn = {
      id: `checkin-${Date.now()}`,
      contactId,
      date,
      whatHappened: whatHappened.trim(),
      feeling: feeling.trim(),
      rating: Number(rating),
      standout: standout.trim(),
      communicationDynamics: communicationDynamics.trim(),
      createdAt: new Date().toISOString()
    };

    onSaveCheckIn(newCheckIn);

    // Reset fields
    setWhatHappened('');
    setFeeling('');
    setRating(3);
    setStandout('');
    setCommunicationDynamics('');
    onClose();
  };

  const activeContact = contacts.find((c) => c.id === contactId) || selectedContact;

  return (
    <div className="fixed inset-0 z-50 bg-sand-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-sand-200 rounded-3xl w-full max-w-lg my-6 p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-sand-400 hover:text-sand-700 hover:bg-sand-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h3 className="font-serif font-bold text-lg text-sand-900">
              Guided Check-In
            </h3>
          </div>
          <p className="text-xs text-sand-500">
            Pause, reflect, and document what you noticed. Voice is transcribed to text only; no audio is saved.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sage-700 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
              <Lock className="w-3 h-3 text-sage-600" />
              <span>Anonymized before AI</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact & Date selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-sand-50/60 p-3 rounded-2xl border border-sand-100">
            <div>
              <label className="block text-[11px] font-semibold text-sand-700 uppercase tracking-wider mb-1">
                Reflecting on
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-sand-200 bg-white text-xs font-medium text-sand-800 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nickname} ({c.intent})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-sand-700 uppercase tracking-wider mb-1">
                Date of Interaction
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-sand-200 bg-white text-xs text-sand-800 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          </div>

          {/* Question 1: What happened? */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-sand-800">
                1. What happened?
              </label>
              <button
                type="button"
                onClick={() => toggleVoice('whatHappened', setWhatHappened)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition ${
                  activeRecordingField === 'whatHappened'
                    ? 'bg-warmred-100 text-warmred-700 font-semibold animate-pulse'
                    : 'text-sand-500 hover:text-terracotta-600 hover:bg-sand-100'
                }`}
                title="Speak to dictate"
              >
                {activeRecordingField === 'whatHappened' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{activeRecordingField === 'whatHappened' ? 'Listening...' : 'Voice'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              placeholder="e.g. Coffee date at the station, or 20-min phone call before sleep..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-sand-200 text-xs text-sand-900 focus:outline-none focus:border-terracotta-500 bg-sand-50/30"
            />
          </div>

          {/* Question 2: How did I feel + rating */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-sand-800">
                2. How did I feel during and after?
              </label>
              <button
                type="button"
                onClick={() => toggleVoice('feeling', setFeeling)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition ${
                  activeRecordingField === 'feeling'
                    ? 'bg-warmred-100 text-warmred-700 font-semibold animate-pulse'
                    : 'text-sand-500 hover:text-terracotta-600 hover:bg-sand-100'
                }`}
              >
                {activeRecordingField === 'feeling' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{activeRecordingField === 'feeling' ? 'Listening...' : 'Voice'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="e.g. Felt energized and respected, or felt drained and second-guessing myself..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-sand-200 text-xs text-sand-900 focus:outline-none focus:border-terracotta-500 bg-sand-50/30"
            />

            {/* 1-5 Rating Selector */}
            <div className="mt-2 flex items-center justify-between bg-sand-50/70 p-2.5 rounded-xl border border-sand-100">
              <span className="text-xs text-sand-600">Emotional rating:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setRating(val)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                      rating === val
                        ? 'bg-terracotta-600 text-white shadow-xs'
                        : 'bg-white text-sand-600 hover:bg-sand-100 border border-sand-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question 3: What did they do or say that stood out? */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-sand-800">
                3. What did they do or say that stood out?
              </label>
              <button
                type="button"
                onClick={() => toggleVoice('standout', setStandout)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition ${
                  activeRecordingField === 'standout'
                    ? 'bg-warmred-100 text-warmred-700 font-semibold animate-pulse'
                    : 'text-sand-500 hover:text-terracotta-600 hover:bg-sand-100'
                }`}
              >
                {activeRecordingField === 'standout' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{activeRecordingField === 'standout' ? 'Listening...' : 'Voice'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={standout}
              onChange={(e) => setStandout(e.target.value)}
              placeholder="e.g. Remembered my doctor appointment, or made a sarcastic joke about my ambition..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-sand-200 text-xs text-sand-900 focus:outline-none focus:border-terracotta-500 bg-sand-50/30"
            />
          </div>

          {/* Question 4: Communication dynamics & initiation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-sand-800">
                4. Who initiated, and how did they communicate?
              </label>
              <button
                type="button"
                onClick={() => toggleVoice('dynamics', setCommunicationDynamics)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition ${
                  activeRecordingField === 'dynamics'
                    ? 'bg-warmred-100 text-warmred-700 font-semibold animate-pulse'
                    : 'text-sand-500 hover:text-terracotta-600 hover:bg-sand-100'
                }`}
              >
                {activeRecordingField === 'dynamics' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{activeRecordingField === 'dynamics' ? 'Listening...' : 'Voice'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={communicationDynamics}
              onChange={(e) => setCommunicationDynamics(e.target.value)}
              placeholder="e.g. They texted first thing in the morning; response time was quick; tone was warm and attentive..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-sand-200 text-xs text-sand-900 focus:outline-none focus:border-terracotta-500 bg-sand-50/30"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-sand-200 text-xs font-medium text-sand-600 hover:bg-sand-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-medium transition shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Update Twin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
