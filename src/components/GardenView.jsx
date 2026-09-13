import React from 'react';
import { Plus, Sparkles, ChevronRight, Calendar, Info, Key } from 'lucide-react';
import TreeVisualizer from './TreeVisualizer';
import LeafSprig from './LeafSprig';
import { INTENTS, getStreakInfo, TREE_STAGES } from '../constants';
import { hasApiKey } from '../services/gemini';

/**
 * GardenView: Overview showing one tree card per contact.
 * Each contact is represented strictly as a tree (no human faces/avatars).
 */
export default function GardenView({
  contacts = [],
  checkIns = [],
  twinSnapshots = {},
  onSelectContact,
  onOpenAddContact,
  onOpenQuickCheckIn,
  onOpenSettings
}) {
  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* Garden Intro */}
      <div className="bg-white/80 border border-sand-200/90 rounded-2xl p-4 shadow-sm backdrop-blur-xs flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-lg text-sand-900">
            My Relationship Garden
          </h2>
          <p className="text-xs text-sand-500 mt-0.5">
            Each person is a tree. Watch how connection quality shapes their growth.
          </p>
        </div>
        <button
          onClick={onOpenAddContact}
          className="flex items-center gap-1.5 px-3 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl text-xs font-medium transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Person</span>
        </button>
      </div>

      {/* Production Key Hint if no key set */}
      {!hasApiKey() && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold">Gemini AI key not configured</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Add your Gemini API key in Settings to activate live AI synthesis.
              </p>
            </div>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 transition"
            >
              Add Key
            </button>
          )}
        </div>
      )}

      {/* Cards List / Grid */}
      {contacts.length === 0 ? (
        <div className="bg-white border border-sand-200 rounded-3xl p-10 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mx-auto">
            <LeafSprig size={36} />
          </div>
          <h3 className="font-serif font-semibold text-sand-800">Your garden is empty</h3>
          <p className="text-xs text-sand-500 max-w-xs mx-auto">
            Add a contact with a nickname and your intent (dating, friendship, unsure, distance) to begin reflecting.
          </p>
          <button
            onClick={onOpenAddContact}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-600 text-white rounded-xl text-xs font-medium hover:bg-terracotta-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add your first person</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {contacts.map((contact) => {
            const contactCheckIns = checkIns.filter((c) => c.contactId === contact.id);
            const snapshots = twinSnapshots[contact.id] || [];
            const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
            const currentStage = latestSnapshot ? latestSnapshot.stage : 'budding';
            const streak = getStreakInfo(contactCheckIns);
            const intent = INTENTS[contact.intent] || INTENTS.dating;

            // Last check-in date formatted
            const lastCheckIn = contactCheckIns.length > 0
              ? [...contactCheckIns].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              : null;

            return (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className="bg-white border border-sand-200/90 hover:border-terracotta-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden"
              >
                {/* Demo Badge */}
                {contact.isDemo && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-warmamber-700 border border-warmamber-200">
                      Demo
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Tree Visualizer Preview (No human faces!) */}
                  <div className="w-24 h-24 bg-sand-50 rounded-2xl border border-sand-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <TreeVisualizer
                      stage={currentStage}
                      size="sm"
                      animated={false}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-base text-sand-900 truncate">
                        {contact.nickname}
                      </h3>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${intent.color}`}>
                        {intent.icon} {intent.label}
                      </span>
                    </div>

                    {/* Streak & Frequency */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-sand-600">
                      <span className="font-medium">{streak.emoji}</span>
                      <span>{streak.label}</span>
                    </div>

                    {/* Tree Status & Last Check-In */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-sand-500">
                      <span className="capitalize">
                        Stage: <strong className="text-sand-700">{TREE_STAGES[currentStage]?.label || currentStage}</strong>
                      </span>
                      <span>
                        {lastCheckIn ? `Last: ${lastCheckIn.date}` : 'No check-ins yet'}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="text-sand-300 group-hover:text-terracotta-500 transition-colors pl-1">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Subtitle / latest snapshot snippet */}
                {latestSnapshot && latestSnapshot.headline && (
                  <div className="mt-3 pt-2.5 border-t border-sand-100/80 flex items-center justify-between text-xs text-sand-600">
                    <span className="italic truncate pr-2">
                      "{latestSnapshot.headline}"
                    </span>
                    <span className="text-[10px] text-terracotta-600 font-medium uppercase tracking-wider flex-shrink-0">
                      View Twin →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button for Quick Check-in */}
      {contacts.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-20">
          <button
            onClick={() => onOpenQuickCheckIn(contacts[0])}
            className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium py-3 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Guided Check-In</span>
          </button>
        </div>
      )}
    </div>
  );
}
