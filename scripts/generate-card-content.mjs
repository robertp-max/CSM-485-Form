import fs from 'node:fs'
import path from 'node:path'

const workspaceRoot = process.cwd()
const sourcePath = path.join(workspaceRoot, 'src', 'data', 'trainingCards.ts')
const outputPath = path.join(workspaceRoot, 'card-content.txt')

const source = fs.readFileSync(sourcePath, 'utf8')
const match = source.match(/export const TRAINING_CARDS:\s*TrainingCard\[\]\s*=\s*(\[[\s\S]*\])\s*$/)

if (!match) {
  throw new Error('Could not parse TRAINING_CARDS array from trainingCards.ts')
}

const cards = Function(`"use strict"; return (${match[1]});`)()

const lines = []
lines.push('CMS-485 TRAINING CARD CONTENT')
lines.push('')

cards.forEach((card, index) => {
  lines.push(`CARD ${index + 1}`)
  lines.push(`Header: ${card.title}`)
  lines.push(`Section: ${card.section}`)
  lines.push(`Objective: ${card.objective}`)
  lines.push('Bullet Points:')

  for (const bullet of card.bullets) {
    lines.push(`- ${bullet}`)
  }

  if (card.auditFocus) {
    lines.push(`Audit Focus: ${card.auditFocus}`)
  }

  lines.push('')
})

fs.writeFileSync(outputPath, lines.join('\n'), 'utf8')
console.log(`Created ${outputPath}`)
