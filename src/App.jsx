import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GardenView from './components/GardenView';
import RelationshipTwin from './components/RelationshipTwin';
import ContactModal from './components/ContactModal';
import CheckInModal from './components/CheckInModal';
import GardenCoachView from './components/GardenCoachView';
import DateSafetyCheck from './components/DateSafetyCheck';
import {
  initializeStorage,
  getStoredContacts,
  saveStoredContacts,
  getStoredCheckIns,
  saveStoredCheckIn,
  getStoredTwins,
  saveTwinSnapshot,
  resetToDemo
} from './services/storage';
import { generateRelationshipTwin } from './services/gemini';
import { Sparkles, Lock, Trees, Shield, Compass } from 'lucide-react';
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
  const [checkInContact, setCheckInContact] = useState(null);

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

  const handleSaveCheckIn = async (newCheckIn) => {
    // 1. Save check-in immediately to local store
    saveStoredCheckIn(newCheckIn);
    refreshData();

    // 2. Identify contact & full check-in timeline
    const targetContact = contacts.find((c) => c.id === newCheckIn.contactId) || {
      id: newCheckIn.contactId,
      nickname: 'Contact',
      intent: 'dating'
    };

    const allForContact = [...checkIns.filter((c) => c.contactId === newCheckIn.contactId), newCheckIn]
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const previousSnapshots = twinSnapshots[newCheckIn.contactId] || [];
    const latestPrevSnapshot = previousSnapshots.length > 0 ? previousSnapshots[previousSnapshots.length - 1] : null;

    setIsGeneratingTwin(true);

    try {
      // 3. AI synthesis with anonymization adapter
      const generated = await generateRelationshipTwin(targetContact, allForContact, latestPrevSnapshot);
      const newSnapshot = {
        id: `twin-snap-${Date.now()}`,
        contactId: newCheckIn.contactId,
        checkInId: newCheckIn.id,
        date: newCheckIn.date,
        weekLabel: `Check-in ${previousSnapshots.length + 1}`,
        ...generated
      };

      saveTwinSnapshot(newCheckIn.contactId, newSnapshot);
      refreshData();
      setSelectedContactId(newCheckIn.contactId);
    } catch (err) {
      console.error('Failed to generate relationship twin snapshot:', err);
    } finally {
      setIsGeneratingTwin(false);
    }
  };

  const handleRegenerateTwin = async (targetContact) => {
    const contactCheckIns = checkIns
      .filter((c) => c.contactId === targetContact.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (contactCheckIns.length === 0) {
      alert('Add at least one check-in first to analyze patterns.');
      return;
    }

    setIsGeneratingTwin(true);
    try {
      const existingSnapshots = twinSnapshots[targetContact.id] || [];
      const prevSnapshot = existingSnapshots.length > 1 ? existingSnapshots[existingSnapshots.length - 2] : null;
      const generated = await generateRelationshipTwin(targetContact, contactCheckIns, prevSnapshot);

      const latestCheckIn = contactCheckIns[contactCheckIns.length - 1];
      const newSnapshot = {
        id: `twin-snap-${Date.now()}`,
        contactId: targetContact.id,
        checkInId: latestCheckIn?.id || '',
        date: latestCheckIn?.date || new Date().toISOString().split('T')[0],
        weekLabel: `Reflection (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        ...generated
      };

      saveTwinSnapshot(targetContact.id, newSnapshot);
      refreshData();
    } catch (err) {
      console.error('Failed to regenerate twin:', err);
    } finally {
      setIsGeneratingTwin(false);
    }
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
                setCheckInContact(selectedContact);
                setIsCheckInModalOpen(true);
              }}
              onRegenerate={handleRegenerateTwin}
              isRegenerating={isGeneratingTwin}
            />
          ) : activeMainTab === 'coach' ? (
            <GardenCoachView
              contacts={contacts}
              checkIns={checkIns}
              twinSnapshots={twinSnapshots}
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
                setCheckInContact(contact || (contacts[0] || null));
                setIsCheckInModalOpen(true);
              }}
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

      {/* Guided Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setCheckInContact(null);
        }}
        contacts={contacts}
        selectedContact={checkInContact}
        onSaveCheckIn={handleSaveCheckIn}
      />

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
