// Gemini LLM Service for WiseHer
// Living Relationship Twin and Pattern Generator
// Uses VITE_GEMINI_API_KEY from .env (git-ignored)
// Every text is anonymized before leaving the browser and deanonymized before display.

import { anonymize, deanonymize } from './anonymizer';
import { evaluateSafety } from './safety';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
      headline: 'Safety Protection Active',
      observations: ['Safety concerns detected in recent check-ins.'],
      whatChanged: 'Pattern analysis is paused due to safety flags.',
      patterns: { green: [], yellow: [], red: [] },
      reflectionQuestion: 'How can you best protect your safety and peace right now?',
      nextStep: 'Please reach out to the 116 016 helpline or a trusted professional.',
      isSafetyTriggered: true,
      safetyCheck
    };
  }

  // Prepare input text for anonymization
  const formattedHistory = allCheckIns.map((c, index) => {
    return `[Check-in ${index + 1}: ${c.date}]
- What happened: ${c.whatHappened}
- Feeling & Rating: ${c.feeling} (Rating: ${c.rating}/5)
- Standout moment: ${c.standout}
- Communication & Tone: ${c.communicationDynamics}`;
  }).join('\n\n');

  const rawPromptContent = `
Contact Intent: ${contact.intent}
Relationship History:
${formattedHistory}

Previous State:
${previousSnapshot ? `Headline: ${previousSnapshot.headline}\nObservations: ${previousSnapshot.observations.join('; ')}` : 'None (First check-in)'}
`;

  // 1. ANONYMIZE BEFORE AI
  const { text: anonymizedContent, mapping } = await anonymize(rawPromptContent, [contact.nickname]);

  // If Gemini API Key is available, call the Gemini API
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
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
                  text: `You are WiseHer, an empathetic relationship reflection coach for women.
Tagline: "Know your patterns, trust your perception."
Goal: Synthesize all check-ins into a living "Relationship Twin" profile and detect communication patterns.

RULES:
1. Ground every observation in the check-ins and quote or link to the specific check-in date (e.g. "[Check-in: DATE]"). Provide 3-5 observations.
2. Provide a "what changed since last time" line comparing to the previous interaction.
3. Categorize communication patterns into:
   - green: healthy, respectful, mutual signals
   - yellow: potential mixed signals, ambivalence, pace mismatch
   - red: unreliability, emotional withdrawal, boundary crossing, deflection
4. CRITICAL: Every pattern MUST be phrased strictly as "can be a sign of", NEVER as a verdict or diagnosis (e.g. "Cancelling plans last minute can be a sign of fluctuating priority", NOT "He is inconsiderate").
5. Suggest one empowering reflection question that fosters self-trust (never self-blame).
6. Suggest one calm next step aligned with the user's intent: ${contact.intent}.
7. Determine the tree health stage: "bare" (tension, unreliability, distress), "budding" (new, tender, exploration), "leafy" (steady, consistent, balanced), "blooming" (warm, mutual, respectful), or "flourishing" (exceptional deep mutual care, joy, safety).

Respond strictly with valid JSON conforming to this structure:
{
  "stage": "bare" | "budding" | "leafy" | "blooming" | "flourishing",
  "headline": "Short title describing current relationship state",
  "observations": ["observation 1 [Check-in: DATE]", "observation 2 [Check-in: DATE]", "observation 3 [Check-in: DATE]"],
  "whatChanged": "Summary of what shifted since the previous check-in",
  "patterns": {
    "green": ["... can be a sign of ... [Check-in: DATE]"],
    "yellow": ["... can be a sign of ... [Check-in: DATE]"],
    "red": ["... can be a sign of ... [Check-in: DATE]"]
  },
  "reflectionQuestion": "Empowering reflection question...",
  "nextStep": "Constructive next step aligned with intent..."
}

Input data to analyze:
${anonymizedContent}
`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const parsed = JSON.parse(candidate);
          // 2. DE-ANONYMIZE BEFORE DISPLAY
          return deanonymizeSnapshot(parsed, mapping);
        }
      } else {
        console.warn('Gemini API call returned non-OK status:', response.status);
      }
    } catch (err) {
      console.error('Failed to fetch from Gemini API, using client-side fallback:', err);
    }
  }

  // Fallback: Client-side intelligent reflection generator (works without API key)
  return generateLocalTwinFallback(contact, allCheckIns, previousSnapshot, mapping);
}

/**
 * De-anonymize all text properties inside a snapshot object
 */
function deanonymizeSnapshot(snapshot, mapping) {
  return {
    ...snapshot,
    headline: deanonymize(snapshot.headline, mapping),
    whatChanged: deanonymize(snapshot.whatChanged, mapping),
    observations: (snapshot.observations || []).map(obs => deanonymize(obs, mapping)),
    patterns: {
      green: (snapshot.patterns?.green || []).map(p => deanonymize(p, mapping)),
      yellow: (snapshot.patterns?.yellow || []).map(p => deanonymize(p, mapping)),
      red: (snapshot.patterns?.red || []).map(p => deanonymize(p, mapping))
    },
    reflectionQuestion: deanonymize(snapshot.reflectionQuestion, mapping),
    nextStep: deanonymize(snapshot.nextStep, mapping)
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
    `Event on ${latest.date}: ${latest.whatHappened.slice(0, 80)}... [Check-in: ${latest.date}]`,
    `Self-reported feelings: ${latest.feeling} (Rating: ${latest.rating}/5). [Check-in: ${latest.date}]`,
    `Noticed communication: ${latest.communicationDynamics}. [Check-in: ${latest.date}]`
  ];

  if (latest.standout) {
    observations.push(`Standout moment noted: "${latest.standout}". [Check-in: ${latest.date}]`);
  }

  const greenPatterns = [];
  const yellowPatterns = [];
  const redPatterns = [];

  if (latest.rating >= 4) {
    greenPatterns.push(`Attentive, reciprocal communication can be a sign of mutual respect and genuine emotional safety. [Check-in: ${latest.date}]`);
  } else if (latest.rating === 3) {
    yellowPatterns.push(`Mixed emotional clarity after connecting can be a sign of differing communication expectations or pacing. [Check-in: ${latest.date}]`);
  } else {
    redPatterns.push(`Feeling drained or confused following communication can be a sign of inconsistency or boundary strain. [Check-in: ${latest.date}]`);
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
    ? 'Notice how your body felt during this interaction. What is your perception trying to tell you?'
    : 'How does this person\'s consistency match what you truly desire for this connection?';

  const nextStep = contact.intent === 'dating'
    ? 'Observe their responsiveness over the next few days without rushing to fill the silence.'
    : 'Honor your emotional boundaries and proceed at a pace that feels comfortable to you.';

  const rawSnapshot = {
    stage,
    headline,
    observations,
    whatChanged,
    patterns: { green: greenPatterns, yellow: yellowPatterns, red: redPatterns },
    reflectionQuestion,
    nextStep
  };

  return deanonymizeSnapshot(rawSnapshot, mapping);
}
