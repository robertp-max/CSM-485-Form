# CSM-485 Training App — Non-Technical Overview

## What this system is
CSM-485 is an online training course experience for home health staff. Learners move through short content cards, complete challenges, and finish with an assessment.

## How it is built (plain language)
- The learner-facing experience is a modern web app.
- It is packaged so Moodle can launch it as SCORM training content.
- Moodle receives and stores completion and grading outcomes.

## Simple architecture statement
Frontend experience: React + Vite + Tailwind.
Learning record and grades: Moodle LMS (through SCORM tracking).

## Why this architecture was chosen
- Uses Moodle’s native grading and completion workflows.
- Avoids building a separate backend just to track basic course completion.
- Makes rollout faster while keeping reporting in the LMS where administrators already work.

## What Moodle stores
When launched from Moodle, the system records key outcomes in Moodle’s LMS database, such as:
- Completion status
- Pass/fail status
- Final score

## What the training app itself stores
The app is mostly presentation and interaction logic. It does not require its own dedicated database for core grading.

## Learner journey (business view)
1. Learner opens course in Moodle.
2. Learner completes modules and challenges.
3. Learner completes final assessment.
4. Course sends completion/score to Moodle.
5. Moodle gradebook and reports reflect the results.

## Delivery options
- **Primary:** SCORM package in Moodle (production learning record).
- **Secondary:** direct web hosting (example: Vercel) for demos and QA.

## Governance and ownership
- Course content/experience: project team
- Learning records and gradebook: Moodle administrators/LMS governance
- Optional analytics destinations (if enabled): xAPI LRS and/or webhook endpoint

## Known constraints (non-technical)
- Different browsers and LMS players can behave slightly differently with media playback.
- Some media behavior (especially autoplay with sound) is restricted by browser policy.

## Success criteria
- Learners can complete training end-to-end.
- Completion and score reliably appear in Moodle.
- Business stakeholders can report progress directly from LMS dashboards.

## One-paragraph summary for presentations
The CSM-485 course is a web-based learning experience packaged for Moodle through SCORM. The app delivers the interactive training flow, while Moodle acts as the official source of truth for completion and grading. This design keeps operations simple: the training team ships content quickly, and administrators continue to manage learner reporting in familiar LMS tools.
