# CMS-485 Hotspot Update Guide

Update hotspot configuration in:
- `src/data/cms485Hotspots.ts`

## Single Source of Truth
Each hotspot is defined as one object in `CMS485_HOTSPOTS` with:
- `id`
- `label`
- `bbox` (`x`, `y`, `width`, `height`) in **percent of page size**
- `shortTooltip`
- `detail`
- `guidedStep`
- `tryInput`

## Adjusting Bounding Boxes
1. Open the virtual form (`Virtual CMS-485` button in the top-right links).
2. Turn on `Calibrate` toggle.
3. Adjust `bbox` values for the hotspot in `src/data/cms485Hotspots.ts`.
4. Rebuild and preview.

### BBox Notes
- Values are percentages (0–100), so hotspots scale with responsive image resizing.
- `x`, `y` = top-left corner.
- `width`, `height` = box size.

## Updating Guided Content
For each hotspot, update:
- `guidedStep.stepTitle`
- `guidedStep.stepInstruction`
- `guidedStep.source`
- `guidedStep.defensibleForAudit`
- `guidedStep.checkQuestion`
- `guidedStep.choices`
- `guidedStep.correctIndex`
- `guidedStep.rationale`

## Try-It Validation
Validation/coaching logic is in:
- `src/components/Cms485VirtualForm.tsx` (`validateTryInput`)

Update this function if field validation rules change (for example, signature date rules or diagnosis specificity requirements).
