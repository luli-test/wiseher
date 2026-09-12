// Safety Module: Violence, Threats, and Coercive Control Detection
// If any check-in indicates danger, show the German helpline 116 016 instead of pattern analysis.

export const HELPLINE_INFO = {
  number: '116 016',
  name: 'Hilfetelefon "Gewalt gegen Frauen"',
  description: 'Free, confidential, anonymous support available 24/7 in 18 languages.',
  website: 'https://www.hilfetelefon.de',
  germanyOnlyNote: 'National helpline for Germany (kostenlos & anonym rund um die Uhr erreichbar).'
};

// Indicators of violence, physical threats, stalking, destruction of property, or extreme coercive control
const SAFETY_PATTERNS = [
  /\b(hit|slap|beat|strangle|choke|punch|grabbed me|shoved me|pushed me|bruise|hurt me physically|schlagen|geschlagen|gewürgt|getreten|körperliche gewalt)\b/i,
  /\b(threatened to|threatened me|kill|destroy my|break my things|gedroht|bedroht|umbringen|etwas antun)\b/i,
  /\b(locked me in|wouldn't let me leave|would not let me leave|blocked the door|took my keys|took my phone|eingesperrt|schlüssel weggenommen|handy weggenommen)\b/i,
  /\b(following me|tracked my phone|stalking|watching my house|spying on me|verfolgt|überwacht|gestalkt)\b/i,
  /\b(forced me|blackmailed|forced sexual|sexuelle gewalt|erpresst|gezwungen)\b/i,
  /\b(scared for my life|afraid he will hurt me|angst um mein leben|angst vor ihm)\b/i
];

/**
 * Checks a check-in or list of check-ins for red flag danger / coercive control triggers.
 * @param {Array|Object} checkIns - One check-in or an array of check-ins
 * @returns {{ isTriggered: boolean, detectedTrigger?: string, helpline: typeof HELPLINE_INFO }}
 */
export function evaluateSafety(checkIns) {
  const items = Array.isArray(checkIns) ? checkIns : [checkIns];
  
  for (const item of items) {
    if (!item) continue;
    const combinedText = [
      item.whatHappened || '',
      item.feeling || '',
      item.standout || '',
      item.communicationDynamics || ''
    ].join(' ');

    for (const pattern of SAFETY_PATTERNS) {
      if (pattern.test(combinedText)) {
        return {
          isTriggered: true,
          detectedTrigger: 'Threat, violence, or coercive control indicators detected',
          helpline: HELPLINE_INFO
        };
      }
    }
  }

  return {
    isTriggered: false,
    helpline: HELPLINE_INFO
  };
}
