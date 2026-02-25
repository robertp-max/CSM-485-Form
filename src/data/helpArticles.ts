/* ── Help-Center knowledge base ──────────────────────────
   All content is derived from the actual training app
   behavior, CMS-485 course material, and Henderson specs.
   No external clinical claims.
   ──────────────────────────────────────────────────────── */

export type HelpCategory =
  | 'getting-started'
  | 'navigation'
  | 'audio-progress'
  | 'challenges'
  | 'virtual-cms485'
  | 'references'
  | 'troubleshooting'

export const HELP_CATEGORIES: { id: HelpCategory; label: string; description: string }[] = [
  { id: 'getting-started', label: 'Getting Started', description: 'First-time orientation and how the training works.' },
  { id: 'navigation', label: 'Navigation', description: 'Moving through cards, chapters, and panel states.' },
  { id: 'audio-progress', label: 'Audio & Progress', description: 'Playback controls, completion tracking, and session persistence.' },
  { id: 'challenges', label: 'Challenges', description: 'Knowledge checks, gating rules, and scoring.' },
  { id: 'virtual-cms485', label: 'Virtual CMS-485', description: 'The interactive form explorer, guided mode, and Try-It simulation.' },
  { id: 'references', label: 'References', description: 'Regulatory sources, CMS links, and research citations.' },
  { id: 'troubleshooting', label: 'Troubleshooting', description: 'Common issues and quick fixes.' },
]

export type HelpArticle = {
  id: string
  category: HelpCategory
  title: string
  summary: string
  body: string[]            // paragraphs
  tags: string[]
}

export const HELP_ARTICLES: HelpArticle[] = [
  /* ── Getting Started ──────────────────────────────────── */
  {
    id: 'gs-01',
    category: 'getting-started',
    title: 'What is this training?',
    summary: 'A card-based CMS-485 compliance course for CareIndeed Home Health clinicians.',
    body: [
      'This training is a self-paced, card-based learning experience covering all aspects of the CMS-485 Plan of Care form. It is designed for CareIndeed Home Health staff who document, review, or manage home health episodes.',
      'Each card includes a learning objective, key points, a clinical lens, expanded narration, and an interactive knowledge check.',
      'Progress is saved automatically. You can close the browser and return to the same card later.',
    ],
    tags: ['overview', 'introduction', 'cms-485', 'plan of care'],
  },
  {
    id: 'gs-02',
    category: 'getting-started',
    title: 'How do I start learning?',
    summary: 'Click "Start Learning" on the landing screen, then use the module selector or Advance button.',
    body: [
      'When you first open the course, you see a landing banner. Click "Start Learning" to enter the module selection screen.',
      'From the module selector, pick any unlocked topic. Topics unlock sequentially—complete the current one to unlock the next.',
      'Use the "Advance" button (bottom-right) to move forward through each card\'s panels: Main → Audio/Expanded Content → Challenge → Next Card.',
    ],
    tags: ['start', 'begin', 'advance', 'module selector'],
  },
  {
    id: 'gs-03',
    category: 'getting-started',
    title: 'What are the CareIndeed brand colors?',
    summary: 'Teal (#007970) for primary actions, Orange (#C74601) for alerts and clinical warnings.',
    body: [
      'The CareIndeed brand uses Teal (#007970) for primary UI elements, navigation, and positive states. Orange (#C74601) is used for warnings, clinical alerts, and emphasis.',
      'Montserrat is used for headings and Roboto for body text. Both light and night themes carry these brand tokens consistently.',
    ],
    tags: ['brand', 'teal', 'orange', 'colors', 'theme'],
  },
  {
    id: 'gs-04',
    category: 'getting-started',
    title: 'Light mode vs Night mode',
    summary: 'Toggle between light and dark themes. The choice persists across sessions.',
    body: [
      'Click the theme toggle in the top-left toolbar to switch between Light and Night modes. Your preference is stored in your browser and applied on every page, including Help Center, FAQ Hub, and Course Documentation.',
      'Night mode uses a dark background (#09090b) with light text. Light mode uses a warm white (#FAFBF8) background with dark text.',
      'Both themes maintain WCAG AA contrast ratios for all interactive elements.',
    ],
    tags: ['light', 'dark', 'night', 'theme', 'toggle', 'mode'],
  },

  /* ── Navigation ───────────────────────────────────────── */
  {
    id: 'nav-01',
    category: 'navigation',
    title: 'Moving between cards',
    summary: 'Use Advance (→) and Return (←) or keyboard arrows.',
    body: [
      'Advance (right arrow or button) moves forward through the panel sequence: Main view → Expanded Content → Challenge → Next card.',
      'Return (left arrow or button) reverses the sequence. If you are on the Challenge, it goes back to Expanded Content; from Expanded Content, back to Main view; from Main, to the previous card.',
      'Swipe gestures also work on touch devices: swipe left for advance, right for return.',
    ],
    tags: ['next', 'back', 'advance', 'return', 'arrow', 'swipe', 'keyboard'],
  },
  {
    id: 'nav-02',
    category: 'navigation',
    title: 'Module selector and chapter jumping',
    summary: 'Access the module grid from the cover screen to jump to any unlocked topic.',
    body: [
      'The module selector grid appears after you click "Start Learning" on the landing screen. It shows all training cards organized by number.',
      'Locked cards (those you haven\'t reached yet) appear dimmed and are not clickable unless QA mode is enabled.',
      'Completed cards show a green checkmark. You can revisit any completed card at any time.',
      'Chapters group cards by section (Foundation, Regulatory Authority, Certification, etc.). Use the carousel to browse chapters, then select a card within that chapter.',
    ],
    tags: ['module', 'selector', 'grid', 'chapter', 'jump', 'lock', 'unlock'],
  },
  {
    id: 'nav-03',
    category: 'navigation',
    title: 'The Help panel (in-card)',
    summary: 'Click "Help" in the top-left to open a quick-reference panel inside the current card.',
    body: [
      'The Help button in the top toolbar opens a two-column Learner Help Guide directly inside the training card.',
      'It covers: How the training works, Navigation basics, Audio controls, Challenge rules, Progress behavior, Troubleshooting, and Accessibility.',
      'Click Help again (or press Return) to close the panel and resume where you left off.',
    ],
    tags: ['help', 'panel', 'guide', 'in-card', 'learner'],
  },

  /* ── Audio & Progress ─────────────────────────────────── */
  {
    id: 'ap-01',
    category: 'audio-progress',
    title: 'Audio playback controls',
    summary: 'Play, Pause, Stop, and Restart controls are in the footer center.',
    body: [
      'The audio player appears in the center of the footer bar on training cards. It includes four controls:',
      '• Play — starts narration for the current topic and opens the Expanded Content panel.',
      '• Pause — freezes playback at the current position.',
      '• Stop — halts playback and resets to the beginning.',
      '• Restart — starts the narration over from the beginning.',
      'If no audio recording exists for a topic, the player shows "No recording for this card" and you can still advance.',
    ],
    tags: ['audio', 'play', 'pause', 'stop', 'restart', 'narration', 'recording'],
  },
  {
    id: 'ap-02',
    category: 'audio-progress',
    title: 'Why can\'t I advance to the challenge?',
    summary: 'The challenge is locked until the audio finishes playing (or no audio exists).',
    body: [
      'For each training card, the knowledge challenge unlocks only after the audio narration has completed at least once. This ensures you listen to (or at minimum reach the end of) the expanded content before testing.',
      'If the card has no audio recording, the challenge is available immediately.',
      'Audio completion is tracked per card. Once you finish listening, it stays unlocked even if you navigate away and come back.',
      'If QA mode is ON (the ⚡ button in the top toolbar), this requirement is bypassed for testing purposes.',
    ],
    tags: ['audio', 'gating', 'locked', 'challenge', 'advance', 'qa'],
  },
  {
    id: 'ap-03',
    category: 'audio-progress',
    title: 'Progress saving and resume',
    summary: 'Your position and completed cards are saved automatically in your browser.',
    body: [
      'Every time you navigate between cards, your current position and the set of viewed/completed cards are saved to browser localStorage.',
      'On your next visit, the course resumes from the last card you were on. Challenge attempts are session-based and reset on a fresh visit.',
      'If SCORM is available (e.g., inside an LMS), completion data and glossary state are also mirrored to the LMS.',
    ],
    tags: ['progress', 'save', 'resume', 'localStorage', 'scorm', 'session'],
  },

  /* ── Challenges ───────────────────────────────────────── */
  {
    id: 'ch-01',
    category: 'challenges',
    title: 'How challenges work',
    summary: 'Single-attempt knowledge checks per card with immediate feedback.',
    body: [
      'Each training card has a knowledge challenge with 3 options. One option is correct—it directly supports the learning objective for that card.',
      'Select an option to submit. Correct answers highlight in teal; incorrect answers highlight in red with the correct answer shown and a brief rationale.',
      'Challenge results persist for the session. On a new visit, they reset to allow fresh attempts.',
    ],
    tags: ['challenge', 'quiz', 'knowledge check', 'correct', 'incorrect', 'feedback'],
  },
  {
    id: 'ch-02',
    category: 'challenges',
    title: 'Final test details',
    summary: '10-question assessment based on the Key Takeaways expanded content.',
    body: [
      'After completing all training cards, you reach the Final Test—a 10-question assessment.',
      'Questions cover: daily documentation habits, leadership controls, self-audit behavior, defensibility standards, and the "clear, complete, clinically coherent" benchmark.',
      'You must select an answer for each question before advancing. Results are shown on the final page with your percentage score. 80% or higher is a pass.',
      'You can review your answers using the Return button.',
    ],
    tags: ['final test', 'assessment', 'score', 'pass', 'fail', 'takeaways'],
  },

  /* ── Virtual CMS-485 ─────────────────────────────────── */
  {
    id: 'vc-01',
    category: 'virtual-cms485',
    title: 'What is the Virtual CMS-485?',
    summary: 'An interactive replica of the CMS-485 form with guided learning and simulation.',
    body: [
      'The Virtual CMS-485 is an interactive training tool that lets you explore every field on the Home Health Certification and Plan of Care form (CMS-485).',
      'Three modes are available: Review Mode (click any field to learn), Start Learning (guided step-by-step with quizzes), and Try-It Mode (free-form data entry with validation).',
      'Progress in the Virtual CMS-485 is saved separately and mirrored to SCORM if available.',
    ],
    tags: ['virtual', 'cms-485', 'form', 'interactive', 'simulation', 'explore'],
  },
  {
    id: 'vc-02',
    category: 'virtual-cms485',
    title: 'Guided mode walkthrough',
    summary: 'Step-by-step instructions for each CMS-485 field with quiz checks.',
    body: [
      'In "Start Learning" mode, the form highlights one field at a time. The right panel shows: why the field matters, how to complete it, common mistakes, and an example.',
      'Each step includes a quiz question. Answering correctly marks the step as complete. You can also skip forward and return later.',
      'A progress bar at the top shows how many steps you have completed out of the total.',
    ],
    tags: ['guided', 'step', 'quiz', 'progress', 'walkthrough'],
  },
  {
    id: 'vc-03',
    category: 'virtual-cms485',
    title: 'Try-It mode',
    summary: 'Practice filling in CMS-485 fields with real-time validation feedback.',
    body: [
      'Try-It mode gives you a form input for each CMS-485 field. Type your entry and receive instant coaching feedback.',
      'High-risk fields (like Visit Frequency, Physician Signature Date) provide specific validation—for example, requiring numeric cadence notation.',
      'A summary panel tracks how many fields you have completed and flags any high-risk sections that are still empty.',
    ],
    tags: ['try it', 'practice', 'simulation', 'validation', 'input'],
  },
  {
    id: 'vc-04',
    category: 'virtual-cms485',
    title: 'Henderson Challenge: Clinical Simulator',
    summary: 'A high-fidelity CDS simulator for the George Henderson case.',
    body: [
      'The Henderson Challenge presents a complex multi-system patient (George Henderson) with cardiovascular, vascular, metabolic, and safety concerns.',
      'You must correctly populate CMS-485 Boxes 11, 15, 18, and 21 by analyzing the clinical narrative and dragging answer chips to the correct fields.',
      'Clinical Logic tooltips explain the audit rationale for each box. Critical alerts trigger if you ignore the bradycardia (HR 48) or the unsecured firearm.',
      'Correct completion (E11.621 for Box 11, exact schedule for Box 21, safety-first priority) unlocks a Clinical Logic Breakdown modal explaining each answer.',
    ],
    tags: ['henderson', 'challenge', 'simulator', 'drag', 'box 11', 'box 21', 'cds'],
  },

  /* ── References ───────────────────────────────────────── */
  {
    id: 'ref-01',
    category: 'references',
    title: 'CMS Program Integrity Manual — Chapter 6',
    summary: 'Federal guidance on home health claim review methodology and documentation requirements.',
    body: [
      'The CMS Program Integrity Manual (PIM), Chapter 6, defines the criteria and processes used by Medicare Administrative Contractors (MACs) for medical review of home health claims.',
      'Key topics: Additional Documentation Requests (ADRs), focused medical review triggers, and the documentation elements reviewers expect in the Plan of Care.',
      'URL: https://www.cms.gov/regulations-and-guidance/guidance/manuals/internet-only-manuals-ioms-items/cms019033',
    ],
    tags: ['cms', 'pim', 'chapter 6', 'integrity', 'medical review', 'adr'],
  },
  {
    id: 'ref-02',
    category: 'references',
    title: 'State Operations Manual — Appendix B (Home Health)',
    summary: 'Survey procedures and interpretive guidelines for home health Conditions of Participation.',
    body: [
      'Appendix B of the State Operations Manual (SOM) provides survey protocols for evaluating home health agency compliance with the Conditions of Participation (42 CFR Part 484).',
      'Surveyors use these guidelines to assess care planning, coordination, patient rights, QAPI, and clinical record requirements.',
      'URL: https://www.cms.gov/regulations-and-guidance/guidance/manuals/internet-only-manuals-ioms-items/cms1986118',
    ],
    tags: ['som', 'appendix b', 'survey', 'cops', 'conditions of participation'],
  },
  {
    id: 'ref-03',
    category: 'references',
    title: 'MLN Booklet: Home Health Prospective Payment System',
    summary: 'Medicare Learning Network overview of home health PPS, PDGM, and reimbursement.',
    body: [
      'The MLN Booklet is a provider-facing summary of the Home Health Prospective Payment System (HH PPS), including the Patient-Driven Groupings Model (PDGM).',
      'Covers payment period structure, LUPA thresholds, case-mix adjustments, consolidation billing, and the role of OASIS assessments in determining payment.',
      'URL: https://www.cms.gov/outreach-and-education/medicare-learning-network-mln/mlnproducts/mlnproducts-items/cms1243514',
    ],
    tags: ['mln', 'pps', 'pdgm', 'reimbursement', 'payment', 'lupa'],
  },
  {
    id: 'ref-04',
    category: 'references',
    title: 'OASIS-E Guidance Manual',
    summary: 'Official instructions for completing the Outcome and Assessment Information Set (OASIS).',
    body: [
      'The OASIS-E Guidance Manual provides item-by-item instructions for the comprehensive assessment used to measure patient outcomes and determine payment.',
      'Correct OASIS responses are critical because they feed into PDGM grouping, quality measures, and must align with the Plan of Care for defensibility.',
      'URL: https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments/HomeHealthQualityInits/HHQIOASISUserManual',
    ],
    tags: ['oasis', 'assessment', 'guidance', 'manual', 'quality'],
  },
  {
    id: 'ref-05',
    category: 'references',
    title: 'PDGM Technical Report',
    summary: 'Technical details of the Patient-Driven Groupings Model payment methodology.',
    body: [
      'This CMS technical report explains the development, calibration, and expected effects of the Patient-Driven Groupings Model (PDGM).',
      'Key impact: shifted payment from therapy volume to clinical characteristics, functional status, and comorbidity interactions.',
      'URL: https://www.cms.gov/Medicare/Medicare-Fee-for-Service-Payment/HomeHealthPPS/Downloads/PDGM-Technical-Report.pdf',
    ],
    tags: ['pdgm', 'technical', 'payment', 'grouping', 'model'],
  },
  {
    id: 'ref-06',
    category: 'references',
    title: 'Ordering and Certifying for Home Health Services',
    summary: 'CMS guidance on physician ordering, certification, and recertification requirements.',
    body: [
      'This CMS resource specifies who can order and certify home health services, acceptable signature types, and the timeline requirements for face-to-face encounters.',
      '42 CFR 424.22 requires that the certifying physician document the patient is homebound, in need of skilled services, and that a face-to-face encounter occurred within required timeframes.',
      'URL: https://www.cms.gov/Medicare/Medicare-Fee-for-Service-Payment/HomeHealthPPS/Ordering_and_Certifying',
    ],
    tags: ['ordering', 'certifying', 'physician', 'signature', 'face-to-face', 'f2f'],
  },
  {
    id: 'ref-07',
    category: 'references',
    title: '42 CFR Part 484 — Home Health Services',
    summary: 'Federal regulations defining Conditions of Participation for home health agencies.',
    body: [
      'Title 42 CFR Part 484 establishes the federal Conditions of Participation (CoPs) that home health agencies must meet to participate in Medicare and Medicaid.',
      'Key sections include: 484.55 (Comprehensive Assessment), 484.60 (Care Planning, Coordination, and Quality of Care), 484.110 (Clinical Records).',
      'These regulations are the legal foundation for everything in this training course — from POC content requirements to patient rights.',
    ],
    tags: ['cfr', 'regulations', 'cops', 'federal', 'requirements', 'law'],
  },

  /* ── Troubleshooting ──────────────────────────────────── */
  {
    id: 'ts-01',
    category: 'troubleshooting',
    title: 'Audio not playing',
    summary: 'Check browser permissions, device output, and volume settings.',
    body: [
      'If audio doesn\'t play when you click the Play button:',
      '1. Check that your browser allows audio playback for this site (look for a blocked-audio icon in the address bar).',
      '2. Verify your device volume and output (headphones vs. speakers).',
      '3. Try clicking Stop, then Play again to reset the audio element.',
      '4. Some browsers require a user interaction before allowing autoplay. Click the Play button directly rather than relying on auto-advance.',
    ],
    tags: ['audio', 'play', 'not working', 'silent', 'blocked', 'permissions'],
  },
  {
    id: 'ts-02',
    category: 'troubleshooting',
    title: 'Progress seems stuck or stale',
    summary: 'Refresh once and return to the same entry point.',
    body: [
      'If your progress appears out of date or the course resumes at the wrong card:',
      '1. Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).',
      '2. Return to the same URL you originally used to launch the course.',
      '3. If you are in an LMS, close the content window completely and relaunch from the LMS.',
      'Progress is stored in localStorage under the key "cms485.course.progress.v2". Clearing browser data will reset all progress.',
    ],
    tags: ['progress', 'stuck', 'stale', 'refresh', 'reset', 'localStorage'],
  },
  {
    id: 'ts-03',
    category: 'troubleshooting',
    title: 'Controls look locked unexpectedly',
    summary: 'Confirm whether audio and challenge prerequisites are met for the active card.',
    body: [
      'The Advance button and Test Knowledge button can appear locked for several reasons:',
      '• The card hasn\'t been viewed long enough (approximately 1 second auto-view timer).',
      '• Audio hasn\'t completed yet — listen to the full narration to unlock the challenge.',
      '• A challenge answer hasn\'t been submitted — select an option, then advance.',
      'If QA mode is ON (⚡ button), all locks are bypassed. Turn it off to test normal flow.',
    ],
    tags: ['locked', 'controls', 'advance', 'disabled', 'gating', 'prerequisite'],
  },
  {
    id: 'ts-04',
    category: 'troubleshooting',
    title: 'Theme not applying to all pages',
    summary: 'All pages share the same localStorage key for theme preference.',
    body: [
      'Both the React app and static HTML pages (FAQ Hub, Course Documentation, etc.) read the theme from localStorage under the key "cihh.theme".',
      'If a page looks wrong, it may have loaded before the theme was set. Toggle the theme once on any page to synchronize.',
      'Static pages load a self-contained theme script before rendering, so they should pick up your preference immediately on page load.',
    ],
    tags: ['theme', 'light', 'dark', 'sync', 'pages', 'localStorage'],
  },
]

/* ── FAQ entries (curated, searchable) ──────────────────── */

export type FAQEntry = {
  id: string
  question: string
  answer: string
  tags: string[]
}

export const FAQ_ENTRIES: FAQEntry[] = [
  {
    id: 'faq-01',
    question: 'What is CMS-485?',
    answer: 'CMS-485 is the Home Health Certification and Plan of Care form—the core document that communicates ordered services, diagnoses, visit frequency, and care goals from the physician to the home health agency. A defensible CMS-485 is essential for payment, survey compliance, and clinical coordination.',
    tags: ['cms-485', 'form', 'plan of care', 'definition'],
  },
  {
    id: 'faq-02',
    question: 'How long is this training?',
    answer: 'The core training deck has 36 cards with approximately 45 minutes of narrated content. Actual time varies based on your pace, challenge attempts, and use of the Virtual CMS-485 simulator.',
    tags: ['duration', 'time', 'length', 'cards'],
  },
  {
    id: 'faq-03',
    question: 'Can I retake the challenges?',
    answer: 'Challenge attempts are session-based. Close and reopen the course to reset all challenges. Your highest completion state is preserved for progress tracking.',
    tags: ['retake', 'challenge', 'reset', 'attempt'],
  },
  {
    id: 'faq-04',
    question: 'What happens if I fail the final test?',
    answer: 'If you score below 80%, you will see "Needs Review" on the results page. You can use the Return button to review questions, or navigate back to the Takeaways cards for a refresher before retaking.',
    tags: ['final test', 'fail', 'score', 'retake'],
  },
  {
    id: 'faq-05',
    question: 'Is my progress saved between sessions?',
    answer: 'Yes. Your current card position and viewed/completed card set are saved automatically in your browser\'s localStorage. If you\'re in an LMS, completion data is also mirrored via SCORM.',
    tags: ['progress', 'save', 'session', 'localStorage', 'scorm'],
  },
  {
    id: 'faq-06',
    question: 'How do I access the Virtual CMS-485?',
    answer: 'Click the "Virtual CMS-485" button in the top-right header bar on any training card. It opens as a full-screen overlay with three modes: Review, Start Learning, and Try It.',
    tags: ['virtual', 'cms-485', 'access', 'open', 'button'],
  },
  {
    id: 'faq-07',
    question: 'What is QA mode?',
    answer: 'QA mode (⚡ button in the top toolbar) unlocks all cards and bypasses audio-completion gating for development/testing purposes. In production, it should be turned off.',
    tags: ['qa', 'debug', 'testing', 'unlock', 'bypass'],
  },
  {
    id: 'faq-08',
    question: 'Can I use keyboard navigation?',
    answer: 'Yes. Use the right arrow key to advance and the left arrow key to go back. Tab and Enter work for interactive elements. Focus states are visible on all buttons and controls.',
    tags: ['keyboard', 'navigation', 'accessibility', 'arrow', 'tab'],
  },
  {
    id: 'faq-09',
    question: 'What is the Henderson case?',
    answer: 'George Henderson is a high-acuity clinical scenario used in the Master Challenge. It involves a multi-system patient (Wagner Grade 3 ulcer, bradycardia, vascular ischemia, unsecured firearm) requiring complex CMS-485 Plan of Care decisions across Boxes 11, 15, 18, and 21.',
    tags: ['henderson', 'case', 'challenge', 'simulation', 'clinical'],
  },
  {
    id: 'faq-10',
    question: 'Where are the course references?',
    answer: 'References are available in the Help Center under the "References" category, and in the Course Documentation page. All sources come from official CMS publications (Program Integrity Manual, State Operations Manual, OASIS-E Guidance, PDGM, CFR Part 484).',
    tags: ['references', 'sources', 'cms', 'documentation'],
  },
]
