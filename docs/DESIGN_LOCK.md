# Design Lock — CMS-485 Training UI

> **Authority:** `CSM-485 Form - Copy` (backup folder)
> **Last verified:** byte-for-byte comparison via `fc.exe`
> **Lock status:** ACTIVE — all values frozen

---

## Locked Design Tokens

All visual constants are centralized in [`src/design-tokens.ts`](../src/design-tokens.ts).
Components must import from this file instead of hardcoding values.

### Color Palette (frozen)

| Token            | Light Mode | Dark Mode  |
|------------------|-----------|------------|
| Primary accent   | `#007970` | `#64F4F5`  |
| Secondary accent | `#C74601` | `#E56E2E`  |
| Text primary     | `#1F1C1B` | `#FAFBF8`  |
| Text muted       | `#747474` | `#D9D6D5`  |
| Border / stroke  | `#E5E4E3` | `#004142`  |
| Surface          | `#FFFFFF` | `#010808`  |
| Panel BG         | —         | `#031213`  |
| Deep stroke      | —         | `#07282A`  |

### Pattern — Glass Card Shell

```
bg-white/0 dark:bg-[#010808]/55 backdrop-blur-2xl rounded-[32px] border-l-[4.3px]
borderLeftColor: isDark ? '#64F4F5' : '#C74601'
boxShadow light: 0 24px 60px rgba(31, 28, 27, 0.12)
boxShadow dark:  0 24px 90px rgba(0, 10, 10, 0.82)
```

### Pattern — Glass Sub-Panel

```
backdrop-blur-sm bg-white/[0.06] dark:bg-white/[0.04] rounded-[24px] p-5 border-l-[3.3px]
shadow light: 0 7px 17px -5px rgba(31,28,27,0.15), 0 0 16px -10px rgba(0,121,112,0.3)
shadow dark:  0 7px 17px -5px rgba(0,0,0,0.4), 0 0 16px -10px rgba(100,244,245,0.15)
hover: bg-white/[0.33] -translate-y-[2px]
```

### Pattern — CTA Button

```
bg-[#007970] hover:bg-[#006059] text-white font-bold rounded-2xl
shadow:       0 12px 40px rgba(0,121,112,0.25)
shadow hover: 0 18px 50px rgba(0,121,112,0.35)
hover:-translate-y-1
font-family: Montserrat
```

### Typography

| Role    | Font        | Weights       |
|---------|-------------|---------------|
| Heading | Montserrat  | 400–800       |
| Body    | Roboto      | 300 400 500   |

---

## Locked Components

| Component               | File                                     | Lock Level |
|-------------------------|------------------------------------------|------------|
| WelcomeOrientationCard  | `components/WelcomeOrientationCard.tsx`   | FULL       |
| OnboardingCardFlow      | `components/OnboardingCardFlow.tsx`        | FULL       |
| LayoutChallenge         | `components/LayoutChallenge.tsx`           | FULL       |
| HendersonChallenge      | `components/HendersonChallenge.tsx`        | FULL       |
| Interactive485Form      | `components/Interactive485Form.tsx`        | FULL       |
| HelpCenter              | `components/HelpCenter.tsx`               | FULL       |
| CourseSelectionPage      | `components/CourseSelectionPage.tsx`       | FULL       |
| CIHHLightCard           | `components/design/CIHHLightCard.tsx`     | FULL       |
| CIHHNightCard           | `components/design/CIHHNightCard.tsx`     | FULL       |
| CIHHLightWeb            | `components/design/CIHHLightWeb.tsx`      | FULL       |
| CIHHNightWeb            | `components/design/CIHHNightWeb.tsx`      | FULL       |
| FinalExamWeb            | `components/FinalExamWeb.tsx`             | FULL       |
| NavigationTraining      | `components/NavigationTraining.tsx`        | FULL       |
| PreChallengeCoursePage  | `components/PreChallengeCoursePage.tsx`    | FULL       |
| SummaryPage             | `components/SummaryPage.tsx`              | FULL       |

---

## UI Primitives

Reusable design-locked primitives in `src/components/ui/`:

| Primitive      | Purpose                        |
|----------------|--------------------------------|
| `GlassCard`    | Outer frosted card shell       |
| `GlassPanel`   | Inner frosted sub-panel        |
| `PrimaryButton`| Teal CTA button                |
| `PageFrame`    | Full-page gradient wrapper     |
| `ProgressDots` | Onboarding step dots           |
| `SectionLabel` | Onboarding section header      |

Import via `import { GlassCard, PrimaryButton } from './components/ui'`

---

## Rules

1. **No inline color hardcoding** — use `design-tokens.ts` or Tailwind config tokens.
2. **No shadow/radius changes** — use the locked patterns above.
3. **Visual regression = revert** — any change that doesn't match backup is a bug.
4. **New pages** must use primitives from `components/ui/`.
5. **Test visually** against backup on every PR.
