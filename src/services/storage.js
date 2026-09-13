// LocalStorage persistence service for WiseHer
// All user data stays in localStorage on the device - no backend, no cloud database.

import { DEMO_CONTACT, DEMO_CHECKINS, DEMO_TWIN_SNAPSHOTS } from '../data/demoData';

const KEYS = {
  CONTACTS: 'wiseher_contacts_v2',
  CHECKINS: 'wiseher_checkins_v2',
  TWINS: 'wiseher_twins_v2',
  INIT_FLAG: 'wiseher_initialized_v2'
};

/**
 * Initializes localStorage with the Demo contact and 6 check-ins if not already seeded
 */
export function initializeStorage(forceReset = false) {
  try {
    const isInitialized = localStorage.getItem(KEYS.INIT_FLAG);
    if (!isInitialized || forceReset) {
      localStorage.setItem(KEYS.CONTACTS, JSON.stringify([DEMO_CONTACT]));
      localStorage.setItem(KEYS.CHECKINS, JSON.stringify(DEMO_CHECKINS));
      localStorage.setItem(KEYS.TWINS, JSON.stringify({ [DEMO_CONTACT.id]: DEMO_TWIN_SNAPSHOTS }));
      localStorage.setItem(KEYS.INIT_FLAG, 'true');
    }
  } catch (err) {
    console.error('Error initializing storage:', err);
  }
}

/**
 * Reset data back to demo baseline
 */
export function resetToDemo() {
  initializeStorage(true);
}

// Contacts
export function getStoredContacts() {
  try {
    const raw = localStorage.getItem(KEYS.CONTACTS);
    return raw ? JSON.parse(raw) : [DEMO_CONTACT];
  } catch (e) {
    console.error('Failed to read contacts:', e);
    return [DEMO_CONTACT];
  }
}

export function saveStoredContacts(contacts) {
  try {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save contacts:', e);
  }
}

// Check-ins
export function getStoredCheckIns(contactId = null) {
  try {
    const raw = localStorage.getItem(KEYS.CHECKINS);
    const all = raw ? JSON.parse(raw) : DEMO_CHECKINS;
    if (contactId) {
      return all.filter(c => c.contactId === contactId);
    }
    return all;
  } catch (e) {
    console.error('Failed to read check-ins:', e);
    return DEMO_CHECKINS;
  }
}

export function saveStoredCheckIn(newCheckIn) {
  try {
    const all = getStoredCheckIns();
    const updated = [...all, newCheckIn];
    localStorage.setItem(KEYS.CHECKINS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save check-in:', e);
    return [];
  }
}

export function updateStoredCheckIn(updatedCheckIn) {
  try {
    const all = getStoredCheckIns();
    const updated = all.map(c => c.id === updatedCheckIn.id ? updatedCheckIn : c);
    localStorage.setItem(KEYS.CHECKINS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update check-in:', e);
    return [];
  }
}

export function deleteStoredCheckIn(checkInId) {
  try {
    const all = getStoredCheckIns();
    const updated = all.filter(c => c.id !== checkInId);
    localStorage.setItem(KEYS.CHECKINS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete check-in:', e);
    return [];
  }
}


// Relationship Twin Snapshots
export function getStoredTwins() {
  try {
    const raw = localStorage.getItem(KEYS.TWINS);
    return raw ? JSON.parse(raw) : { [DEMO_CONTACT.id]: DEMO_TWIN_SNAPSHOTS };
  } catch (e) {
    console.error('Failed to read twins:', e);
    return { [DEMO_CONTACT.id]: DEMO_TWIN_SNAPSHOTS };
  }
}

export function getTwinSnapshotsForContact(contactId) {
  const twins = getStoredTwins();
  return twins[contactId] || [];
}

export function saveTwinSnapshot(contactId, snapshot) {
  try {
    const twins = getStoredTwins();
    const current = twins[contactId] || [];
    twins[contactId] = [...current, snapshot];
    localStorage.setItem(KEYS.TWINS, JSON.stringify(twins));
    return twins[contactId];
  } catch (e) {
    console.error('Failed to save twin snapshot:', e);
    return [];
  }
}
