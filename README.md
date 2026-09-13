# WiseHer 🌿
> *"Know your patterns, trust your perception."*

WiseHer is a single-page, privacy-first web application designed as a relationship reflection coach for women. It helps users capture grounded check-ins after meetings or chats, observe communication patterns over time without self-gaslighting, and visualize relationship health through an organic "tree in the garden" model.

---

## 🌐 Live Demo & Deployment
- **Live URL**: [https://luli-test.github.io/wiseher/](https://luli-test.github.io/wiseher/)
- **Hosting**: Deployed via GitHub Pages (SPA static routing with universal base path; fallback from GCP project `aiwomen26ham-4435` Firebase Hosting due to 403 caller permissions).

---

## Table of Contents
1. [What WiseHer Does](#what-wiseher-does)
2. [Key Features & Flow](#key-features--flow)
3. [Privacy & Anonymization Architecture](#privacy--anonymization-architecture)
4. [Tools & Tech Stack](#tools--tech-stack)
5. [Getting Started & Adding API Keys](#getting-started--adding-api-keys)
6. [Demo Dataset (8-Week Trajectory)](#demo-dataset-8-week-trajectory)
7. [Codebase Structure for Beginners](#codebase-structure-for-beginners)
8. [Safety & German Helpline 116 016](#safety--german-helpline-116-016)

---

## 1. What WiseHer Does

Early in dating or friendships, it is common to question one's own perception ("Am I overreacting?", "Did they really mean it like that?"). WiseHer provides a safe, grounded space to:
- Document what actually happened while it is fresh.
- Track communication patterns over weeks and months.
- Watch a visual reflection of relationship quality that evolves organically as check-ins are added.
- Receive supportive, non-judgmental coaching observations phrased strictly as *"can be a sign of"*, never as harsh verdicts.

---

## 2. Key Features & Flow

### 1. Contacts & Intent
Add a person with **nickname only** (for privacy) and declare your explicit intent:
- **Friendship** (`friendship`): Nurturing mutual care and companionship.
- **Dating** (`dating`): Exploring romantic compatibility.
- **Unsure** (`unsure`): Observing dynamics to clarify feelings.
- **Distance** (`distance`): Preserving energy and emotional boundaries.

### 2. Guided Check-In (Text or Voice)
After every meeting, call, or chat, answer four quick coaching questions:
1. **What happened?** (Objective description of events)
2. **How did I feel during and after, plus a 1–5 rating?** (Emotional state & rating)
3. **What did they do or say that stood out, positive or negative?** (Key quotes or behaviors)
4. **Who initiated, and how did they communicate?** (Tone, response time, reliability)

*Voice Dictation:* Uses the browser's built-in **Web Speech API** to transcribe your voice directly into text. Audio is **never recorded or stored**.

### 3. The Relationship Twin (Living Profile)
Whenever a new check-in is logged, WiseHer regenerates a living profile synthesized from **all** check-ins up to that date:
- 3 to 5 observations, each linked directly to its check-in date (`[Check-in: Oct 10]`).
- A **"What changed since last time"** line comparing the interaction to prior baseline.
- Full snapshot history preserved across time.

### 4. The Timeline Scrubber (The Heart of the App)
An interactive timeline slider allows you to scrub back and forth through the weeks to see how your perception and the person's communication evolved (e.g., Week 1 *"Polite"* $\to$ Week 3 *"Very attentive"* $\to$ Week 5 *"Mostly reaches out when he needs something"* $\to$ Week 8 *"Recurring pattern visible"*).

### 5. Green / Yellow / Red Pattern Signals
- **🟢 Green Signals**: Evidence of mutual respect, active listening, and reliability.
- **🟡 Yellow Signals**: Ambivalence, sudden pace acceleration, or fluctuating priority.
- **🔴 Red Signals**: Disrespect, hot-and-cold withdrawal, emotional invalidation, or boundary strain.
- **Rule**: Every signal is phrased strictly as *"can be a sign of"*, never as a diagnosis.
- Includes one empowering **reflection question** and one practical **next step** aligned with your stated intent.

### 6. The Tree Garden & Escalating Streak
- **Zero human faces or avatars anywhere.**
- Each contact is represented as an organic tree in your garden.
- **Tree Stages** reflect relationship quality:
  1. `bare` (dormancy, strain, recurring boundary issues)
  2. `budding` (early tender growth, new exploration)
  3. `leafy` (balanced, steady communication)
  4. `blooming` (warmth, mutual investment, shared affection)
  5. `flourishing` (blooming with birds & fluttering butterflies; exceptional mutual safety & joy)
- **Escalating Emoji Streak**: Tracks contact frequency and duration (🌱 $\to$ 🌿 $\to$ 🪴 $\to$ 🌳 $\to$ 🌳🔥) separately from quality.

---

## 3. Privacy & Anonymization Architecture

WiseHer was built with privacy as the core foundation:
1. **100% Client-Side**: All contacts, check-ins, and snapshots reside exclusively in `localStorage` in your device's browser. No backend server, no cloud database.
2. **Anonymization Adapter (`src/services/anonymizer.js`)**:
   - Before any text is submitted to the Gemini API, it runs through `anonymize(text)`.
   - Names, locations, and dates are converted into tokens (`[PERSON_1]`, `[PLACE_1]`, `[DATE_1]`).
   - If an optional `VITE_ANYMIZE_API_KEY` is provided, it calls the Anymize API; otherwise, it uses the built-in local rule-based entity anonymizer.
   - Once Gemini responds, `deanonymize(text, mapping)` restores the text before displaying it in your browser.
   - A reassuring **"🔒 Anonymized before AI"** badge is shown.

---

## 4. Tools & Tech Stack

- **React 18** + **Vite 6**: Fast, lightweight single-page application framework.
- **Tailwind CSS**: Warm, calming color palette (`sand`, `terracotta`, `sage`).
- **Lucide React**: Clean, accessible UI icons.
- **Browser Web Speech API**: Native client-side voice-to-text dictation.
- **Google Gemini API** (`gemini-2.5-flash`): Structured coaching analysis and pattern synthesis.
- **LocalStorage API**: Zero-cloud data persistence.

---

## 5. Getting Started & Adding API Keys

### Prerequisites
- Node.js (v18+ or v20 LTS)
- npm (v9+)
- git

### Installation
```bash
# Clone or navigate to the repository
cd wiseher

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Adding API Keys
WiseHer works out-of-the-box with a built-in local fallback engine. To connect real AI generation:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in your text editor:
   ```env
   # Obtain your key at: https://aistudio.google.com/
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Anymize API Key
   VITE_ANYMIZE_API_KEY=
   ```
3. Restart the dev server (`npm run dev`).
4. **Security Note**: `.env` is listed in `.gitignore`. **Never commit API keys to git or share them in public chats.**

---

## 6. Demo Dataset (8-Week Trajectory)

To allow immediate exploration, WiseHer comes pre-seeded with an 8-week demo contact:
- **Contact**: "Alex" (Intent: Dating, labeled `DEMO`).
- **Check-ins**:
  - **Week 1 (Oct 10)**: First date, polite conversation, active listening. (`budding` tree)
  - **Week 2 (Oct 18)**: Dinner date, enthusiastic morning texts. (`leafy` tree)
  - **Week 3 (Oct 26)**: Cooking dinner, intense romantic declarations. (`blooming` tree)
  - **Week 4 (Nov 04)**: Last-minute cancellation, 24 hours of silence. (`leafy` tree)
  - **Week 5 (Nov 14)**: Texts at 11:30 PM asking for a work favor. (`budding` tree)
  - **Week 8 (Dec 05)**: Defensiveness, calls calm boundaries "dramatic". (`bare` tree with full pattern review)

Click the **"Reset Demo"** button in the header at any time to restore this baseline.

---

## 7. Codebase Structure for Beginners

```
wiseher/
├── .env.example             # Template for API keys
├── .gitignore               # Ensures .env and node_modules are never committed
├── index.html               # Main HTML with fonts and mobile viewport
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Warm, calming design token configuration
├── src/
│   ├── main.jsx             # React entrypoint
│   ├── App.jsx              # Main app controller & modal state
│   ├── index.css            # Tailwind directives and subtle animations
│   ├── constants.js         # Tree stages, intents, and streak calculations
│   ├── data/
│   │   └── demoData.js      # 6 dated check-ins over 8 weeks & initial snapshots
│   ├── services/
│   │   ├── storage.js       # localStorage getter/setter utilities
│   │   ├── speech.js        # Web Speech API voice dictation helper
│   │   ├── safety.js        # Detection for threats, violence, and coercive control
│   │   ├── anonymizer.js    # anonymize() and deanonymize() adapter
│   │   └── gemini.js        # Gemini API synthesis with coaching prompt rules
│   └── components/
│       ├── Header.jsx           # App title, tagline, reset & phone preview toggle
│       ├── LeafSprig.jsx        # Delicate brand vector sprig icon
│       ├── GardenView.jsx       # Overview cards with mini trees & streaks
│       ├── RelationshipTwin.jsx # Living profile & timeline scrubber
│       ├── TreeVisualizer.jsx   # Organic SVG tree stages (no human avatars)
│       ├── PatternCheck.jsx     # Green / Yellow / Red communication patterns
│       ├── CheckInModal.jsx     # 4 coaching questions with voice-to-text
│       ├── ContactModal.jsx     # Add person & intent
│       └── SafetyBanner.jsx     # German helpline 116 016 calm banner
```

---

## 8. Safety & German Helpline 116 016

Relationship reflection apps must recognize the boundary between communication differences and danger. If any check-in mentions indicators of physical violence, threats, intimidation, stalking, or coercive control, WiseHer **immediately pauses pattern analysis** and displays a supportive, calm emergency banner:

- **Hilfetelefon "Gewalt gegen Frauen" (Germany)**:
  - **Phone**: `116 016`
  - **Cost**: Free, anonymous, confidential.
  - **Availability**: 24/7, 365 days a year.
  - **Support**: Available in 18 languages, German Sign Language, and via online chat at [hilfetelefon.de](https://www.hilfetelefon.de).

---

*Know your patterns, trust your perception.*
