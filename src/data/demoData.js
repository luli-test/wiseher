// Demo dataset for WiseHer: One contact "Alex" with 6 dated check-ins over 8 weeks
// Demonstrating: Week 1 "polite" -> Week 3 "very attentive" -> Week 5 "mostly reaches out when he needs something" -> Week 8 "recurring pattern visible"
// All dates are in the past, with the final check-in on 2026-09-12 (relative to today 2026-09-13).

export const DEMO_CONTACT_ID = 'demo-alex-1';

export const DEMO_CONTACT = {
  id: DEMO_CONTACT_ID,
  nickname: 'Alex',
  intent: 'dating', // 'dating' | 'friendship' | 'unsure' | 'distance'
  createdAt: '2026-07-18T14:00:00Z',
  isDemo: true,
  notes: 'Met at coffee shop downtown'
};

export const DEMO_CHECKINS = [
  {
    id: 'demo-checkin-1',
    contactId: DEMO_CONTACT_ID,
    date: '2026-07-18',
    weekLabel: 'Week 1',
    whatHappened: 'First coffee date at Café Flora. We talked for nearly two hours about books, travel, and how we spend our weekends.',
    feeling: 'Felt relaxed, heard, and quietly curious. No pressure or awkward silences.',
    rating: 4, // 1 - 5
    standout: 'He listened attentively without checking his phone and remembered a small detail I shared in our initial messages.',
    communicationDynamics: 'He initiated the invitation 3 days in advance. Tone was warm, polite, and respectful of my time.',
    createdAt: '2026-07-18T16:30:00Z'
  },
  {
    id: 'demo-checkin-2',
    contactId: DEMO_CONTACT_ID,
    date: '2026-07-26',
    weekLabel: 'Week 2',
    whatHappened: 'Second date: a walk along the river followed by dinner at a small Italian bistro he suggested.',
    feeling: 'Felt warmly valued and excited. The chemistry felt effortless.',
    rating: 5,
    standout: 'He reserved the table beforehand and asked thoughtful questions about my creative projects and goals.',
    communicationDynamics: 'He texted good morning the next day. Fast response times (minutes), enthusiastic and engaged tone.',
    createdAt: '2026-07-26T22:00:00Z'
  },
  {
    id: 'demo-checkin-3',
    contactId: DEMO_CONTACT_ID,
    date: '2026-08-03',
    weekLabel: 'Week 3',
    whatHappened: 'Dinner at his place. He cooked pasta and set a very romantic atmosphere with candles and music.',
    feeling: 'Flattered and swept up, though a quiet voice wondered if the romantic declarations were a bit fast.',
    rating: 4,
    standout: 'He told me: "I have never felt such an instant, intense connection with anyone in my entire life."',
    communicationDynamics: 'He initiated calls daily. Very attentive, sends voice notes throughout the day, showering compliments.',
    createdAt: '2026-08-03T21:45:00Z'
  },
  {
    id: 'demo-checkin-4',
    contactId: DEMO_CONTACT_ID,
    date: '2026-08-12',
    weekLabel: 'Week 4',
    whatHappened: 'We had planned to go to an art gallery exhibition on Friday evening. He cancelled 45 minutes beforehand citing sudden work stress.',
    feeling: 'Disappointed, confused, and second-guessing whether I had done or said something wrong.',
    rating: 2,
    standout: 'The cancellation message was surprisingly curt: "Something came up at work, cant make it tonight." No immediate offer to reschedule.',
    communicationDynamics: 'He went completely silent for over 24 hours. When I asked if everything was alright, he replied hours later with a one-word answer.',
    createdAt: '2026-08-12T20:15:00Z'
  },
  {
    id: 'demo-checkin-5',
    contactId: DEMO_CONTACT_ID,
    date: '2026-08-22',
    weekLabel: 'Week 5',
    whatHappened: 'After nearly 5 days of silence, he texted at 11:30 PM on a Wednesday asking if I was awake and could help review his client presentation.',
    feeling: 'Felt used, emotionally drained, and conflicted. It felt like connection on his terms only.',
    rating: 2,
    standout: 'No apology or mention of the canceled date or the days of silence; straight to his personal request.',
    communicationDynamics: 'He only initiated when he needed support. When I replied the next morning asking about our plans, he took 10 hours to respond.',
    createdAt: '2026-08-22T23:50:00Z'
  },
  {
    id: 'demo-checkin-6',
    contactId: DEMO_CONTACT_ID,
    date: '2026-09-12',
    weekLabel: 'Week 8',
    whatHappened: 'Met for a quick coffee. I calmly expressed that the hot-and-cold communication and unannounced disappearances felt confusing and hurtful to me.',
    feeling: 'Felt invalidated, unheard, and gaslit in the moment, but clear afterward that my instincts were right.',
    rating: 1,
    standout: 'He became defensive, crossed his arms, and said: "You are being overly dramatic and demanding. I am just really busy with my life."',
    communicationDynamics: 'He reluctantly agreed to meet after multiple reschedules. Tone was dismissive, defensive, and deflecting accountability.',
    createdAt: '2026-09-12T15:20:00Z'
  }
];

// Snapshot history corresponding to each check-in point in time
export const DEMO_TWIN_SNAPSHOTS = [
  {
    id: 'twin-snap-1',
    contactId: DEMO_CONTACT_ID,
    checkInId: 'demo-checkin-1',
    date: '2026-07-18',
    weekLabel: 'Week 1',
    stage: 'budding',
    headline: 'Polite & curious beginnings',
    observations: [
      'Showed active listening and asked thoughtful questions without interrupting. [Check-in: Jul 18]',
      'Retained specific details from earlier conversations. [Check-in: Jul 18]',
      'Maintained predictable, considerate messaging beforehand. [Check-in: Jul 18]'
    ],
    whatChanged: 'Initial baseline established: Respectful, paced interest with mutual curiosity.',
    patterns: {
      green: [
        'Active listening and punctual communication can be a sign of genuine interest and respect for personal boundaries. [Check-in: Jul 18]'
      ],
      yellow: [],
      red: []
    },
    reflectionQuestion: 'How does it feel to experience someone listening to you without needing to impress them?',
    nextStep: 'Continue observing whether this respectful pace remains steady as you both learn more about each other.'
  },
  {
    id: 'twin-snap-2',
    contactId: DEMO_CONTACT_ID,
    checkInId: 'demo-checkin-2',
    date: '2026-07-26',
    weekLabel: 'Week 2',
    stage: 'leafy',
    headline: 'Growing enthusiasm and mutual effort',
    observations: [
      'Proactively proposed and reserved plans around your mutual interests. [Check-in: Jul 26]',
      'Frequent, enthusiastic messaging from morning to evening. [Check-in: Jul 26]',
      'Expressed appreciation for your perspective and values. [Check-in: Jul 26]'
    ],
    whatChanged: 'Communication frequency and proactive initiative increased noticeably compared to Week 1.',
    patterns: {
      green: [
        'Planning thoughtful dates in advance can be a sign of intentionality and consideration. [Check-in: Jul 26]'
      ],
      yellow: [
        'A steep acceleration in messaging frequency early on can be a sign of rapid emotional projection before deep familiarity exists. [Check-in: Jul 26]'
      ],
      red: []
    },
    reflectionQuestion: 'Is the current pace of connection comfortable for your nervous system, or does it feel fast?',
    nextStep: 'Keep your own routine, friends, and hobbies prioritized so you maintain your personal center.'
  },
  {
    id: 'twin-snap-3',
    contactId: DEMO_CONTACT_ID,
    checkInId: 'demo-checkin-3',
    date: '2026-08-03',
    weekLabel: 'Week 3',
    stage: 'blooming',
    headline: 'Very attentive with high romantic intensity',
    observations: [
      'High level of attention, daily calls, and constant availability. [Check-in: Aug 03]',
      'Expressed intense declarations of a unique, instant bond. [Check-in: Aug 03]',
      'Strong romantic framing with generous verbal affirmation. [Check-in: Aug 03]'
    ],
    whatChanged: 'Shifted from balanced mutual curiosity into intense romantic acceleration and high declarations.',
    patterns: {
      green: [
        'Warm emotional availability can be a sign of openness and romantic affection. [Check-in: Aug 03]'
      ],
      yellow: [
        'Declaring an unprecedented connection within three weeks can be a sign of romantic idealization rather than seeing you as a real, nuanced person. [Check-in: Aug 03]'
      ],
      red: []
    },
    reflectionQuestion: 'Do his grand declarations reflect who you truly are together, or are they an idealized pedestal?',
    nextStep: 'Give yourself permission to slow things down slightly and observe how he responds to healthy pacing.'
  },
  {
    id: 'twin-snap-4',
    contactId: DEMO_CONTACT_ID,
    checkInId: 'demo-checkin-4',
    date: '2026-08-12',
    weekLabel: 'Week 4',
    stage: 'leafy',
    headline: 'Sudden cooldown and dropped commitments',
    observations: [
      'Cancelled a scheduled date on 45 minutes notice with a vague explanation. [Check-in: Aug 12]',
      'Followed cancellation with 24 hours of silence and terse one-word replies. [Check-in: Aug 12]',
      'Left you in the position of initiating to check on the status of plans. [Check-in: Aug 12]'
    ],
    whatChanged: 'Sharp break from the previous three weeks of intense communication; unexpected withdrawal and loss of reliability.',
    patterns: {
      green: [],
      yellow: [
        'Last-minute cancellations without offering an alternative date can be a sign of fluctuating priority or poor consideration. [Check-in: Aug 12]'
      ],
      red: [
        'A sudden shift from daily adoration to prolonged silence and cold responses can be a sign of hot-and-cold relational dynamics. [Check-in: Aug 12]'
      ]
    },
    reflectionQuestion: 'Notice that you immediately wondered if you did something wrong. Why do you take responsibility for his withdrawal?',
    nextStep: 'Refrain from over-texting or making excuses for him. Allow him the opportunity to show up and reschedule.'
  },
  {
    id: 'twin-snap-5',
    contactId: DEMO_CONTACT_ID,
    checkInId: 'demo-checkin-5',
    date: '2026-08-22',
    weekLabel: 'Week 5',
    stage: 'budding',
    headline: 'Mostly reaches out when he needs something',
    observations: [
      'Silence broken only late at night (11:30 PM) for a personal work favor. [Check-in: Aug 22]',
      'Did not acknowledge the previously cancelled date or the 5 days of silence. [Check-in: Aug 22]',
      'Slow response times resumed as soon as your emotional needs or plans were mentioned. [Check-in: Aug 22]'
    ],
    whatChanged: 'Communication has transitioned from mutual courting to transactional contact focused on his immediate convenience.',
    patterns: {
      green: [],
      yellow: [
        'Reaching out late at night primarily when seeking assistance can be a sign of viewing the relationship through convenience. [Check-in: Aug 22]'
      ],
      red: [
        'Ignoring past cancellations while expecting immediate availability for favors can be a sign of entitlement and unequal emotional investment. [Check-in: Aug 22]'
      ]
    },
    reflectionQuestion: 'If your closest friend described this exact dynamic, would you encourage her to keep investing?',
    nextStep: 'Decline late-night favor requests and protect your resting hours. Watch if he still makes effort when no favor is on the table.'
  },
  {
    id: 'twin-snap-6',
    contactId: DEMO_CONTACT_ID,
    checkInId: 'demo-checkin-6',
    date: '2026-09-12',
    weekLabel: 'Week 8',
    stage: 'bare',
    headline: 'Recurring pattern visible: Disrespect & deflection',
    observations: [
      'Dismissed honest communication about inconsistency by labeling it "dramatic and demanding". [Check-in: Sep 12]',
      'Cycle confirmed across 8 weeks: high praise followed by withdrawal and deflection when held accountable. [Check-in: Aug 03, Aug 12, Sep 12]',
      'Displays reluctance to invest equal time and emotional consideration. [Check-in: Aug 22, Sep 12]'
    ],
    whatChanged: 'The trajectory is now clear: from idealizing you in Week 3 to invalidating your feelings when you calmly set boundaries in Week 8.',
    patterns: {
      green: [],
      yellow: [
        'Defensiveness during calm relationship check-ins can be a sign of limited emotional maturity or discomfort with self-reflection. [Check-in: Sep 12]'
      ],
      red: [
        'Calling you "dramatic" or "demanding" when you articulate reasonable consistency can be a sign of emotional invalidation and tone policing. [Check-in: Sep 12]',
        'A repeating cycle of intense pursuit followed by cold withdrawal and blame can be a sign of intermittent reinforcement and emotional manipulation. [Check-in: Aug 03, Aug 12, Sep 12]'
      ]
    },
    reflectionQuestion: 'Your perception has been accurate from the start. What is your body telling you about whether this person can offer emotional safety?',
    nextStep: 'Given your dating intent (seeking a mutual, respectful partnership), consider stepping back. Trust your discernment over his excuses.'
  }
];
