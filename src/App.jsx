import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GardenView from './components/GardenView';
import RelationshipTwin from './components/RelationshipTwin';
import ContactModal from './components/ContactModal';
import CheckInModal from './components/CheckInModal';
import GardenCoachView from './components/GardenCoachView';
import DateSafetyCheck from './components/DateSafetyCheck';
import SettingsModal from './components/SettingsModal';
import {
  initializeStorage,
  getStoredContacts,
  saveStoredContacts,
  getStoredCheckIns,
  saveStoredCheckIn,
  updateStoredCheckIn,
  deleteStoredCheckIn,
  getStoredTwins,
  saveTwinSnapshot,
  resetToDemo
} from './services/storage';
import { generateRelationshipTwin } from './services/gemini';
import { Sparkles, Lock, Trees, Shield, Compass, AlertCircle, Wrench, RefreshCw, X, Key } from 'lucide-react';
import LeafSprig from './components/LeafSprig';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [twinSnapshots, setTwinSnapshots] = useState({});
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('garden'); // 'garden' | 'coach' | 'safety'

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [checkInContact, setCheckInContact] = useState(null);
  const [editingCheckIn, setEditingCheckIn] = useState(null);

  // Error & Fallback Confirmation State
  const [generationError, setGenerationError] = useState(null);

  // Phone preview frame toggle for desktop demoing
  const [isPhonePreview, setIsPhonePreview] = useState(false);
  const [isGeneratingTwin, setIsGeneratingTwin] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    initializeStorage();
    refreshData();
  }, []);

  const refreshData = () => {
    setContacts(getStoredContacts());
    setCheckIns(getStoredCheckIns());
    setTwinSnapshots(getStoredTwins());
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all data to the 8-week demo baseline?')) {
      resetToDemo();
      refreshData();
      setSelectedContactId(null);
    }
  };

  const handleSaveContact = (newContact) => {
    const updated = [...contacts, newContact];
    saveStoredContacts(updated);
    setContacts(updated);
    setSelectedContactId(newContact.id);
  };

  const triggerTwinGeneration = async (targetContact, allForContact, latestPrevSnapshot, options = {}) => {
    setIsGeneratingTwin(true);
    setGenerationError(null);

    try {
      const generated = await generateRelationshipTwin(targetContact, allForContact, latestPrevSnapshot, options);
      const newSnapshot = {
        id: `twin-snap-${Date.now()}`,
        contactId: targetContact.id,
        checkInId: allForContact[allForContact.length - 1]?.id || '',
        date: allForContact[allForContact.length - 1]?.date || new Date().toISOString().split('T')[0],
        weekLabel: `Check-in ${allForContact.length}`,
        ...generated
      };

      saveTwinSnapshot(targetContact.id, newSnapshot);
      refreshData();
      setSelectedContactId(targetContact.id);
    } catch (err) {
      console.warn('Relationship twin generation failed:', err);
      setGenerationError({
        message: err.message || 'Gemini API call failed.',
        targetContact,
        allForContact,
        latestPrevSnapshot
      });
    } finally {
      setIsGeneratingTwin(false);
    }
  };

  const handleSaveCheckIn = async (checkInData, isEdit = false) => {
    if (isEdit) {
      updateStoredCheckIn(checkInData);
    } else {
      saveStoredCheckIn(checkInData);
    }
    refreshData();

    // Identify contact & full check-in timeline
    const targetContact = contacts.find((c) => c.id === checkInData.contactId) || {
      id: checkInData.contactId,
      nickname: 'Contact',
      intent: 'dating'
    };

    const currentCheckIns = isEdit
      ? getStoredCheckIns().filter(c => c.contactId === checkInData.contactId)
      : [...checkIns.filter((c) => c.contactId === checkInData.contactId), checkInData];

    const sortedAll = [...currentCheckIns].sort((a, b) => new Date(a.date) - new Date(b.date));

    const previousSnapshots = twinSnapshots[checkInData.contactId] || [];
    const latestPrevSnapshot = previousSnapshots.length > 0 ? previousSnapshots[previousSnapshots.length - 1] : null;

    await triggerTwinGeneration(targetContact, sortedAll, latestPrevSnapshot);
  };

  const handleRegenerateTwin = async (targetContact) => {
    const contactCheckIns = checkIns
      .filter((c) => c.contactId === targetContact.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (contactCheckIns.length === 0) {
      alert('Add at least one check-in first to analyze patterns.');
      return;
    }

    const existingSnapshots = twinSnapshots[targetContact.id] || [];
    const prevSnapshot = existingSnapshots.length > 1 ? existingSnapshots[existingSnapshots.length - 2] : null;

    await triggerTwinGeneration(targetContact, contactCheckIns, prevSnapshot);
  };

  const handleEditCheckIn = (checkInItem) => {
    setEditingCheckIn(checkInItem);
    const contact = contacts.find(c => c.id === checkInItem.contactId) || selectedContact;
    setCheckInContact(contact);
    setIsCheckInModalOpen(true);
  };

  const handleDeleteCheckIn = async (checkInId) => {
    if (!window.confirm('Delete this check-in? The Relationship Twin will be updated.')) {
      return;
    }
    deleteStoredCheckIn(checkInId);
    refreshData();

    if (selectedContact) {
      const remainingForContact = getStoredCheckIns()
        .filter(c => c.contactId === selectedContact.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (remainingForContact.length > 0) {
        await triggerTwinGeneration(selectedContact, remainingForContact, null);
      } else {
        const currentTwins = getStoredTwins();
        delete currentTwins[selectedContact.id];
        localStorage.setItem('wiseher_twins_v2', JSON.stringify(currentTwins));
        refreshData();
      }
    }
  };

  const handleRetryTwinGeneration = () => {
    if (!generationError) return;
    const { targetContact, allForContact, latestPrevSnapshot } = generationError;
    setGenerationError(null);
    triggerTwinGeneration(targetContact, allForContact, latestPrevSnapshot);
  };

  const handleConfirmTwinFallback = () => {
    if (!generationError) return;
    const { targetContact, allForContact, latestPrevSnapshot } = generationError;
    setGenerationError(null);
    triggerTwinGeneration(targetContact, allForContact, latestPrevSnapshot, { forceFallback: true });
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || null;
  const activeContactCheckIns = selectedContact
    ? checkIns.filter((c) => c.contactId === selectedContact.id)
    : [];
  const activeTwinSnapshots = selectedContact
    ? twinSnapshots[selectedContact.id] || []
    : [];

  return (
    <div className={`min-h-screen bg-sand-100 flex flex-col ${isPhonePreview ? 'py-6 px-2 sm:px-4 items-center justify-center' : ''}`}>
      {/* Outer Shell: Phone mockup on desktop if toggled, otherwise fluid mobile-first */}
      <div
        className={`w-full flex-1 flex flex-col bg-sand-100 ${
          isPhonePreview
            ? 'max-w-[420px] max-h-[880px] h-[880px] rounded-[44px] border-[10px] border-sand-800 shadow-2xl overflow-hidden relative'
            : 'max-w-md mx-auto min-h-screen border-x border-sand-200/50'
        }`}
      >
        {/* Header */}
        <Header
          onResetDemo={handleResetDemo}
          onOpenAddContact={() => setIsContactModalOpen(true)}
          isPhonePreview={isPhonePreview}
          onTogglePhonePreview={() => setIsPhonePreview((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {selectedContact ? (
            <RelationshipTwin
              contact={selectedContact}
              checkIns={activeContactCheckIns}
              twinSnapshots={activeTwinSnapshots}
              onBack={() => setSelectedContactId(null)}
              onOpenNewCheckIn={() => {
                setEditingCheckIn(null);
                setCheckInContact(selectedContact);
                setIsCheckInModalOpen(true);
              }}
              onEditCheckIn={handleEditCheckIn}
              onDeleteCheckIn={handleDeleteCheckIn}
              onRegenerate={handleRegenerateTwin}
              isRegenerating={isGeneratingTwin}
            />
          ) : activeMainTab === 'coach' ? (
            <GardenCoachView
              contacts={contacts}
              checkIns={checkIns}
              twinSnapshots={twinSnapshots}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ) : activeMainTab === 'safety' ? (
            <DateSafetyCheck />
          ) : (
            <GardenView
              contacts={contacts}
              checkIns={checkIns}
              twinSnapshots={twinSnapshots}
              onSelectContact={(contact) => setSelectedContactId(contact.id)}
              onOpenAddContact={() => setIsContactModalOpen(true)}
              onOpenQuickCheckIn={(contact) => {
                setEditingCheckIn(null);
                setCheckInContact(contact || (contacts[0] || null));
                setIsCheckInModalOpen(true);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </main>

        {/* Docked Bottom Navigation Bar */}
        <nav className="border-t border-sand-200/90 bg-white/95 backdrop-blur-md px-4 py-2 flex items-center justify-around z-20 shrink-0">
          <button
            onClick={() => {
              setSelectedContactId(null);
              setActiveMainTab('garden');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeMainTab === 'garden' && !selectedContact
                ? 'text-terracotta-600 font-bold'
                : 'text-sand-500 hover:text-sand-800'
            }`}
          >
            <LeafSprig size={18} />
            <span className="text-[11px]">My Garden</span>
          </button>

          <button
            onClick={() => {
              setSelectedContactId(null);
              setActiveMainTab('coach');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeMainTab === 'coach' && !selectedContact
                ? 'text-terracotta-600 font-bold'
                : 'text-sand-500 hover:text-sand-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px]">Coach Constanze</span>
          </button>

          <button
            onClick={() => {
              setSelectedContactId(null);
              setActiveMainTab('safety');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeMainTab === 'safety' && !selectedContact
                ? 'text-terracotta-600 font-bold'
                : 'text-sand-500 hover:text-sand-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[11px]">Date Safety</span>
          </button>
        </nav>
      </div>

      {/* Add Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
      />

      {/* Guided Check-In Modal (handles new and edit) */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setCheckInContact(null);
          setEditingCheckIn(null);
        }}
        contacts={contacts}
        selectedContact={checkInContact}
        initialCheckIn={editingCheckIn}
        onSaveCheckIn={handleSaveCheckIn}
      />

      {/* Production Key Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={() => refreshData()}
      />

      {/* Gemini AI Generation Failure Modal with explicit Fallback Confirmation */}
      {generationError && (
        <div className="fixed inset-0 z-50 bg-sand-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sand-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-700 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-serif font-bold text-base text-sand-900">
                  AI Generation Failed
                </h4>
                <p className="text-xs text-sand-600 mt-1 leading-relaxed">
                  {generationError.message}
                </p>
              </div>
            </div>

            <div className="p-3 bg-sand-50 rounded-2xl text-[11px] text-sand-600 border border-sand-200/60 leading-relaxed">
              You can retry Gemini, enter an API key in Settings, or confirm using the offline rule-based fallback. A fallback is completely transparent and never presents as AI output.
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleRetryTwinGeneration}
                className="w-full py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry with Gemini</span>
              </button>

              <button
                onClick={handleConfirmTwinFallback}
                className="w-full py-2.5 px-4 bg-white hover:bg-sand-50 text-sand-800 border border-sand-300 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-sand-500" />
                <span>Use Offline Fallback (Rule-based)</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-terracotta-700 hover:text-terracotta-800 font-medium underline flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>Configure API Key</span>
                </button>
                <button
                  onClick={() => setGenerationError(null)}
                  className="text-sand-500 hover:text-sand-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generating Twin Overlay */}
      {isGeneratingTwin && (
        <div className="fixed inset-0 z-50 bg-sand-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sand-200 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3 max-w-xs text-center animate-fadeIn">
            <div className="p-3 bg-terracotta-50 rounded-2xl text-terracotta-600 animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-sm text-sand-900">
              Updating Relationship Twin
            </h4>
            <p className="text-xs text-sand-500">
              Synthesizing check-in history into living observations & patterns...
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-sage-700 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
              <Lock className="w-3 h-3 text-sage-600" />
              <span>Anonymized before AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
