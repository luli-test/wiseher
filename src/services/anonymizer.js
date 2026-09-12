// Anonymization Adapter for WiseHer
// Implements anonymize(text) -> { text, mapping } and deanonymize(text, mapping)
// If VITE_ANYMIZE_API_KEY is configured in .env, calls the Anymize API;
// otherwise uses a local privacy engine replacing names, places, and dates with [PERSON_1], [PLACE_1], [DATE_1].

const ANYMIZE_API_KEY = import.meta.env.VITE_ANYMIZE_API_KEY || '';

/**
 * Anonymize input text before sending to AI
 * @param {string} text - Raw user or check-in text
 * @param {Array<string>} [knownEntities=[]] - Optional known names/places to strictly mask (e.g. contact nickname)
 * @returns {Promise<{ text: string, mapping: Record<string, string> }>}
 */
export async function anonymize(text, knownEntities = []) {
  if (!text || typeof text !== 'string') {
    return { text: '', mapping: {} };
  }

  // 1. If Anymize API Key is present in .env, attempt Anymize API integration
  if (ANYMIZE_API_KEY && ANYMIZE_API_KEY.trim() !== '') {
    try {
      const response = await fetch('https://api.anymize.io/v1/anonymize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANYMIZE_API_KEY}`
        },
        body: JSON.stringify({
          text: text,
          entities: ['PERSON', 'LOCATION', 'DATE_TIME', 'PHONE_NUMBER', 'EMAIL']
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.anonymizedText && data.mapping) {
          return {
            text: data.anonymizedText,
            mapping: data.mapping
          };
        }
      } else {
        console.warn('Anymize API returned status', response.status, '- falling back to local anonymizer');
      }
    } catch (err) {
      console.warn('Anymize API request failed, falling back to local anonymizer:', err);
    }
  }

  // 2. Local rule-based anonymizer placeholder
  return localAnonymize(text, knownEntities);
}

/**
 * Local rule-based privacy anonymizer
 */
function localAnonymize(text, knownEntities = []) {
  let anonymized = text;
  const mapping = {}; // e.g. { "[PERSON_1]": "Alex", "[PLACE_1]": "Café Flora" }
  let personCount = 1;
  let placeCount = 1;
  let dateCount = 1;

  // Helper to register token
  const registerToken = (tokenPrefix, originalValue) => {
    // Check if originalValue is already mapped to avoid duplicate tokens for same entity
    for (const [token, orig] of Object.entries(mapping)) {
      if (orig.toLowerCase() === originalValue.toLowerCase()) {
        return token;
      }
    }

    let token = '';
    if (tokenPrefix === 'PERSON') {
      token = `[PERSON_${personCount++}]`;
    } else if (tokenPrefix === 'PLACE') {
      token = `[PLACE_${placeCount++}]`;
    } else if (tokenPrefix === 'DATE') {
      token = `[DATE_${dateCount++}]`;
    } else {
      token = `[ENTITY_${Object.keys(mapping).length + 1}]`;
    }

    mapping[token] = originalValue;
    return token;
  };

  // Mask known entities passed explicitly (e.g., contact nickname like "Alex", "M.")
  for (const entity of knownEntities) {
    if (entity && entity.trim().length > 1) {
      const cleanEntity = entity.trim();
      const escaped = cleanEntity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      if (regex.test(anonymized)) {
        const token = registerToken('PERSON', cleanEntity);
        anonymized = anonymized.replace(regex, token);
      }
    }
  }

  // Mask dates (e.g. 2026-10-10, 10/10/2026, 10.10.2026, Oct 10, October 24th, Friday evening)
  const datePatterns = [
    /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/g,
    /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[.,]?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?\b/gi,
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{4})?\b/gi
  ];

  for (const pattern of datePatterns) {
    anonymized = anonymized.replace(pattern, (match) => {
      return registerToken('DATE', match);
    });
  }

  // Mask locations & venues (e.g. "at Café Flora", "in Berlin", "at Starbucks")
  const placePatterns = [
    /\b(?:at|in|near|to)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)\b/g,
    /\b(?:Café|Cafe|Bar|Restaurant|Bistro|Hotel|Club|Park)\s+([A-ZÄÖÜ][a-zäöüß]+)\b/gi
  ];

  for (const pattern of placePatterns) {
    anonymized = anonymized.replace(pattern, (fullMatch, placeName) => {
      if (!placeName || placeName.length <= 2) return fullMatch;
      // Exclude common lowercase words that might follow "at/in/to"
      if (/^(the|a|an|his|her|my|our|home|work|night|noon)$/i.test(placeName)) return fullMatch;
      const token = registerToken('PLACE', placeName);
      return fullMatch.replace(placeName, token);
    });
  }

  // Mask common personal names if capitalized
  const commonNames = [
    'Alex', 'Alexander', 'Alexandra', 'Sam', 'Samuel', 'Samantha', 'Chris', 'David',
    'Michael', 'Daniel', 'Sarah', 'Anna', 'Emma', 'Lisa', 'Laura', 'Maximilian', 'Max',
    'Lukas', 'Felix', 'Jonas', 'Leon', 'Paul', 'Julian', 'Tim', 'Tom', 'Ben', 'Niklas',
    'Florian', 'Sebastian', 'Jan', 'Stefan', 'Tobias', 'Christian', 'Martin', 'Thomas'
  ];

  for (const name of commonNames) {
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    if (regex.test(anonymized)) {
      const token = registerToken('PERSON', name);
      anonymized = anonymized.replace(regex, token);
    }
  }

  return {
    text: anonymized,
    mapping
  };
}

/**
 * Deanonymize AI response back to human-readable form before displaying
 * @param {string} text - Anonymized response containing [PERSON_1], etc.
 * @param {Record<string, string>} mapping - Mapping dictionary
 * @returns {string} Restored text
 */
export function deanonymize(text, mapping = {}) {
  if (!text || typeof text !== 'string') return '';
  if (!mapping || Object.keys(mapping).length === 0) return text;

  let restored = text;
  // Replace tokens in reverse order of length to avoid prefix collisions
  const sortedTokens = Object.keys(mapping).sort((a, b) => b.length - a.length);

  for (const token of sortedTokens) {
    const originalValue = mapping[token];
    if (originalValue) {
      // Escape token for RegExp
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedToken, 'g');
      restored = restored.replace(regex, originalValue);
    }
  }

  return restored;
}
