import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GardenView from './components/GardenView';
import RelationshipTwin from './components/RelationshipTwin';
import ContactModal from './components/ContactModal';
import CheckInModal from './components/CheckInModal';
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

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [twinSnapshots, setTwinSnapshots] = useState({});
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInContact, setCheckInContact] = useState(null);

  // Phone preview frame toggle for desktop demoing
  const [isPhonePreview, setIsPhonePreview] = useState(false);

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

  const handleSaveCheckIn = (newCheckIn) => {
    saveStoredCheckIn(newCheckIn);
    
    // For step 2 (static / local state), construct a local snapshot update
    // In step 3, this will be enriched with Gemini API generation
    const contactSnapshots = twinSnapshots[newCheckIn.contactId] || [];
    const count = contactSnapshots.length + 1;
    
    // Determine stage based on rating or progression
    let stage = 'budding';
    if (newCheckIn.rating >= 4) stage = 'leafy';
    if (newCheckIn.rating === 5 && count >= 3) stage = 'blooming';
    if (newCheckIn.rating <= 2) stage = 'bare';

    const localSnapshot = {
      id: `twin-snap-${Date.now()}`,
      contactId: newCheckIn.contactId,
      checkInId: newCheckIn.id,
      date: newCheckIn.date,
      weekLabel: `Check-in ${count}`,
      stage: stage,
      headline: `Reflection after interaction`,
      observations: [
        `Summary of event: ${newCheckIn.whatHappened || 'Interaction logged'}. [Check-in: ${newCheckIn.date}]`,
        `Standout moment: ${newCheckIn.standout || 'None noted'}. [Check-in: ${newCheckIn.date}]`,
        `Communication dynamic: ${newCheckIn.communicationDynamics || 'Self-reported'}. [Check-in: ${newCheckIn.date}]`
      ],
      whatChanged: `Logged new reflection on ${newCheckIn.date} (Feeling rating: ${newCheckIn.rating}/5).`,
      patterns: {
        green: newCheckIn.rating >= 4 ? [`Positive engagement can be a sign of respect and mutual interest. [Check-in: ${newCheckIn.date}]`] : [],
        yellow: newCheckIn.rating === 3 ? [`Uncertain feelings can be a sign to stay observant of ongoing consistency. [Check-in: ${newCheckIn.date}]`] : [],
        red: newCheckIn.rating <= 2 ? [`Discomfort or confusion can be a sign to check personal boundaries. [Check-in: ${newCheckIn.date}]`] : []
      },
      reflectionQuestion: 'How does your body feel when you remember this interaction?',
      nextStep: 'Give yourself time to process before deciding your next move.'
    };

    saveTwinSnapshot(newCheckIn.contactId, localSnapshot);
    refreshData();
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
            />
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
    </div>
  );
}
