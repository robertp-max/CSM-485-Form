/* Vercel Serverless Function — POST /api/send-results
 * Sends challenge results to the configured email via
 * Vercel's built-in Node.js runtime. Uses a simple
 * fetch to an SMTP relay or can be swapped for any
 * transactional email provider (SendGrid, Resend, etc.).
 *
 * For now, this logs the payload and returns success.
 * To enable real email delivery:
 *   1. npm i @sendgrid/mail   (or resend, nodemailer, etc.)
 *   2. Set SENDGRID_API_KEY in Vercel Environment Variables
 *   3. Uncomment the email sending block below
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const RECIPIENT = 'robertp@careindeed.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { learnerName, timestamp, correct, incorrect, safetyFirst, totalBoxes, prize } = req.body ?? {}

    const score = correct?.length ?? 0
    const total = totalBoxes ?? 5
    const pass = score === total && safetyFirst

    // ── Log for monitoring ────────────────────────────────
    console.log('[CMS-485 Result]', {
      to: RECIPIENT,
      learner: learnerName || 'Anonymous',
      score: `${score}/${total}`,
      safetyFirst,
      pass,
      prize,
      timestamp,
    })

    // ── Email sending (uncomment when email provider is configured) ──
    // import sgMail from '@sendgrid/mail'
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
    // await sgMail.send({
    //   to: RECIPIENT,
    //   from: 'noreply@careindeed.com',
    //   subject: `CMS-485 Challenge Result: ${pass ? 'PASS' : 'NEEDS REVIEW'} — ${learnerName || 'Learner'}`,
    //   html: `
    //     <h2>CMS-485 Master Challenge Result</h2>
    //     <p><strong>Learner:</strong> ${learnerName || 'Anonymous'}</p>
    //     <p><strong>Score:</strong> ${score}/${total}</p>
    //     <p><strong>Safety-First Sequence:</strong> ${safetyFirst ? '✅ Yes' : '❌ No'}</p>
    //     <p><strong>Result:</strong> ${pass ? '🏆 PASS' : '⚠️ NEEDS REVIEW'}</p>
    //     <p><strong>Incorrect Boxes:</strong> ${incorrect?.join(', ') || 'None'}</p>
    //     <p><strong>Prize Selected:</strong> ${prize || 'N/A'}</p>
    //     <p><strong>Timestamp:</strong> ${timestamp || new Date().toISOString()}</p>
    //   `,
    // })

    return res.status(200).json({ success: true, message: 'Result recorded' })
  } catch (err: any) {
    console.error('[send-results error]', err)
    return res.status(500).json({ error: 'Failed to process result', detail: err.message })
  }
}
