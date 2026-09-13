// Gemini LLM Service for WiseHer
// Living Relationship Twin and Pattern Generator
// Uses VITE_GEMINI_API_KEY from .env (git-ignored)
// Every text is anonymized before leaving the browser and deanonymized before display.

import { anonymize, deanonymize } from './anonymizer';
import { evaluateSafety } from './safety';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Strict JSON schema matching the specifications
const RELATIONSHIP_TWIN_SCHEMA = {
  type: "OBJECT",
  properties: {
    tree_stage: {
      type: "STRING",
      enum: ["bare", "budding", "leafy", "blooming", "flourishing"]
    },
    headline: { type: "STRING" },
    observations: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    what_changed: { type: "STRING" },
    patterns: {
      type: "OBJECT",
      properties: {
        green: { type: "ARRAY", items: { type: "STRING" } },
        yellow: { type: "ARRAY", items: { type: "STRING" } },
        red: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["green", "yellow", "red"]
    },
    reflection_question: { type: "STRING" },
    next_step: { type: "STRING" }
  },
  required: [
    "tree_stage",
    "headline",
    "observations",
    "what_changed",
    "patterns",
    "reflection_question",
    "next_step"
  ]
};

/**
 * Generate a living Relationship Twin snapshot from all check-ins for a contact
 * @param {Object} contact - Contact { nickname, intent, ... }
 * @param {Array} allCheckIns - All check-ins up to the latest one, sorted chronologically
 * @param {Object|null} previousSnapshot - The preceding twin snapshot for comparison
 * @returns {Promise<Object>}
 */
export async function generateRelationshipTwin(contact, allCheckIns, previousSnapshot = null) {
  // Safety First: If indicators of violence, threats, or coercive control exist, halt analysis
  const safetyCheck = evaluateSafety(allCheckIns);
  if (safetyCheck.isTriggered) {
    return {
      stage: 'bare',
      tree_stage: 'bare',
      headline: 'Safety Protection Active',
      observations: ['Safety concerns detected in recent check-ins.'],
      whatChanged: 'Pattern analysis is paused due to safety flags.',
      what_changed: 'Pattern analysis is paused due to safety flags.',
      patterns: { green: [], yellow: [], red: [] },
      reflectionQuestion: 'How can you best protect your safety and peace right now?',
      reflection_question: 'How can you best protect your safety and peace right now?',
      nextStep: 'Please reach out to the 116 016 helpline or a trusted professional.',
      next_step: 'Please reach out to the 116 016 helpline or a trusted professional.',
      isSafetyTriggered: true,
      safetyCheck
    };
  }

  // Format all check-in history chronologically
  const formattedHistory = allCheckIns.map((c, index) => {
    return `[Check-in ${index + 1}: ${c.date}]
- What happened: ${c.whatHappened}
- Feeling & Rating: ${c.feeling} (Rating: ${c.rating}/5)
- Standout moment: ${c.standout || 'None noted'}
- Communication & Tone: ${c.communicationDynamics || 'None noted'}`;
  }).join('\n\n');

  const rawPromptContent = `
Contact Nickname: ${contact.nickname}
My Intent with this person: ${contact.intent}
Full Relationship History (all check-ins so far):
${formattedHistory}

Previous Living Twin State:
${previousSnapshot ? `Headline: ${previousSnapshot.headline}\nObservations: ${(previousSnapshot.observations || []).join('; ')}` : 'None (This is the baseline check-in)'}
`;

  // 1. PRIVACY ANONYMIZATION BEFORE AI
  const { text: anonymizedContent, mapping } = await anonymize(rawPromptContent, [contact.nickname]);

  // If Gemini API Key is available, call the Gemini API with retry logic
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
    let lastError = null;

    // Up to 2 attempts (one retry on invalid JSON or network failure)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are WiseHer, an empathetic, empowering relationship reflection coach for women.
Tagline: "Know your patterns, trust your perception."
Goal: Synthesize all check-ins into a living "Relationship Twin" profile and detect communication patterns without self-gaslighting.

STRICT COACHING RULES:
1. observations: 3-5 short, concrete observations grounded in what happened. Each MUST explicitly cite its check-in date (e.g. "[Check-in: 2026-09-12]").
2. what_changed: Exactly one concise line summarizing what shifted since the previous check-in.
3. patterns: Categorize communication patterns into green, yellow, and red.
   - green: Mutual respect, consistency, vulnerability, reliable actions.
   - yellow: Ambivalence, mixed signals, pace mismatch, or fluctuating priority.
   - red: Deflection, gaslighting, emotional withdrawal, disrespect, or repeated broken agreements.
   - MANDATORY PHRASING: Every single pattern MUST quote the check-in it is based on AND be phrased strictly as "can be a sign of", NEVER as a clinical diagnosis or definitive verdict (e.g., 'Cancelling last-minute ("...") can be a sign of inconsistent availability', NOT 'He is unreliable').
4. reflection_question: One empowering coaching question that helps her connect to her intuition, bodily feelings, and self-trust (never self-blame).
5. next_step: One calm, actionable next step that directly aligns with her intent: "${contact.intent}".
6. tree_stage: Choose one of:
   - "bare": strained connection, boundary violations, discomfort
   - "budding": early exploration, tender new beginnings
   - "leafy": steady consistency, balanced communication
   - "blooming": deep warmth, mutual romantic or friendship enthusiasm
   - "flourishing": exceptional mutual care, joy, safety, blossoming with harmony

Input check-in history to analyze:
${anonymizedContent}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: RELATIONSHIP_TWIN_SCHEMA,
              temperature: 0.2
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Gemini API returned status ${response.status}: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
          throw new Error('No candidate content received from Gemini API');
        }

        const parsed = JSON.parse(candidateText);

        // Standardize output shape
        const standardized = {
          stage: parsed.tree_stage || parsed.stage || 'budding',
          tree_stage: parsed.tree_stage || parsed.stage || 'budding',
          headline: parsed.headline || 'Relationship Reflection',
          observations: Array.isArray(parsed.observations) ? parsed.observations : [],
          whatChanged: parsed.what_changed || parsed.whatChanged || 'Interaction logged.',
          what_changed: parsed.what_changed || parsed.whatChanged || 'Interaction logged.',
          patterns: {
            green: Array.isArray(parsed.patterns?.green) ? parsed.patterns.green : [],
            yellow: Array.isArray(parsed.patterns?.yellow) ? parsed.patterns.yellow : [],
            red: Array.isArray(parsed.patterns?.red) ? parsed.patterns.red : []
          },
          reflectionQuestion: parsed.reflection_question || parsed.reflectionQuestion || '',
          reflection_question: parsed.reflection_question || parsed.reflectionQuestion || '',
          nextStep: parsed.next_step || parsed.nextStep || '',
          next_step: parsed.next_step || parsed.nextStep || '',
          isAIGenerated: true,
          generatedAt: new Date().toISOString()
        };

        // 2. PRIVACY DE-ANONYMIZATION BEFORE DISPLAY
        return deanonymizeSnapshot(standardized, mapping);
      } catch (err) {
        lastError = err;
        console.warn(`Gemini generation attempt ${attempt} failed:`, err.message);
        if (attempt < 2) {
          // Brief backoff before retry
          await new Promise(r => setTimeout(r, 600));
        }
      }
    }

    console.error('All Gemini API attempts failed. Falling back gracefully to local engine:', lastError);
  }

  // Fallback: Client-side intelligent reflection generator (works without API key or when offline)
  const fallback = generateLocalTwinFallback(contact, allCheckIns, previousSnapshot, mapping);
  fallback.apiError = 'Gemini API was temporarily unreachable. Showing local grounded reflection.';
  return fallback;
}

/**
 * De-anonymize all text properties inside a snapshot object
 */
function deanonymizeSnapshot(snapshot, mapping) {
  return {
    ...snapshot,
    headline: deanonymize(snapshot.headline, mapping),
    whatChanged: deanonymize(snapshot.whatChanged, mapping),
    what_changed: deanonymize(snapshot.what_changed, mapping),
    observations: (snapshot.observations || []).map(obs => deanonymize(obs, mapping)),
    patterns: {
      green: (snapshot.patterns?.green || []).map(p => deanonymize(p, mapping)),
      yellow: (snapshot.patterns?.yellow || []).map(p => deanonymize(p, mapping)),
      red: (snapshot.patterns?.red || []).map(p => deanonymize(p, mapping))
    },
    reflectionQuestion: deanonymize(snapshot.reflectionQuestion, mapping),
    reflection_question: deanonymize(snapshot.reflection_question, mapping),
    nextStep: deanonymize(snapshot.nextStep, mapping),
    next_step: deanonymize(snapshot.next_step, mapping)
  };
}

/**
 * Intelligent deterministic local generator for when VITE_GEMINI_API_KEY is not configured
 */
function generateLocalTwinFallback(contact, allCheckIns, previousSnapshot, mapping) {
  const latest = allCheckIns[allCheckIns.length - 1];
  const count = allCheckIns.length;
  const avgRating = allCheckIns.reduce((sum, c) => sum + (c.rating || 3), 0) / count;

  let stage = 'budding';
  if (latest.rating <= 2 || avgRating < 2.5) {
    stage = 'bare';
  } else if (latest.rating >= 4 && avgRating >= 4) {
    stage = count >= 4 ? 'blooming' : 'leafy';
    if (count >= 5 && avgRating >= 4.5) stage = 'flourishing';
  } else if (count >= 2) {
    stage = 'leafy';
  }

  const observations = [
    `[Check-in: ${latest.date}] ${latest.whatHappened.slice(0, 80)}`,
    `[Check-in: ${latest.date}] Self-reported feelings: ${latest.feeling} (Rating: ${latest.rating}/5)`,
    `[Check-in: ${latest.date}] Communication noted: ${latest.communicationDynamics}`
  ];

  if (latest.standout) {
    observations.push(`[Check-in: ${latest.date}] Standout moment: "${latest.standout}"`);
  }

  const greenPatterns = [];
  const yellowPatterns = [];
  const redPatterns = [];

  if (latest.rating >= 4) {
    greenPatterns.push(`Reciprocal, warm communication ("${latest.communicationDynamics}") can be a sign of genuine mutual respect. [Check-in: ${latest.date}]`);
  } else if (latest.rating === 3) {
    yellowPatterns.push(`Mixed emotional clarity after interacting can be a sign of differing paces or expectations. [Check-in: ${latest.date}]`);
  } else {
    redPatterns.push(`Feeling drained or invalidated following interaction can be a sign of boundary strain or unreliability. [Check-in: ${latest.date}]`);
  }

  const headline = latest.rating >= 4
    ? 'Positive & attentive connection'
    : latest.rating === 3
    ? 'Observing rhythm & consistency'
    : 'Boundary strain & mixed signals';

  const whatChanged = previousSnapshot
    ? `Shifted from rating ${previousSnapshot.headline} to ${latest.rating}/5 on ${latest.date}.`
    : `Initial baseline established with first check-in on ${latest.date}.`;

  const reflectionQuestion = latest.rating <= 2
    ? 'Notice how your body felt during this interaction. What is your intuition telling you?'
    : 'How does this person\'s consistency match what you truly desire for this connection?';

  const nextStep = contact.intent === 'dating'
    ? 'Observe their responsiveness over the next few days without rushing to fill the silence.'
    : 'Honor your emotional boundaries and proceed at a pace that feels comfortable to you.';

  const rawSnapshot = {
    stage,
    tree_stage: stage,
    headline,
    observations,
    whatChanged,
    what_changed: whatChanged,
    patterns: { green: greenPatterns, yellow: yellowPatterns, red: redPatterns },
    reflectionQuestion,
    reflection_question: reflectionQuestion,
    nextStep,
    next_step: nextStep,
    isAIGenerated: false,
    generatedAt: new Date().toISOString()
  };

  return deanonymizeSnapshot(rawSnapshot, mapping);
}
