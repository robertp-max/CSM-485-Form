/**
 * glossary-static.js – Vanilla-JS glossary hovercard for static HTML pages.
 * Self-contained: includes glossary data, persistence, DOM scanning, and
 * hovercard rendering.  Drop a <script src="glossary-static.js"></script>
 * at the end of <body>.
 *
 * Shares the same localStorage key as the React SPA so seen-terms persist
 * across both contexts within the same SCORM attempt.
 */
;(function () {
  'use strict'

  /* ── Glossary Data (mirrors src/glossary.ts) ─────────────── */
  var ENTRIES = [
    { key:'poc', term:'Plan of Care', aliases:['POC','plan of care','485','CMS-485'], def:'A patient-specific clinical roadmap documented on CMS-485 that details measurable goals, interventions, disciplines, and visit frequencies for the home health episode.', why:'Every service billed must trace back to an active, signed Plan of Care.' },
    { key:'cert', term:'Certification', aliases:['certification','certification period','cert period'], def:'The initial 60-day period during which the physician certifies that the patient meets home health eligibility criteria including homebound status and skilled need.', why:'Services outside a valid certification period are not covered by Medicare.' },
    { key:'rcrt', term:'Recertification', aliases:['recertification','recert'], def:'Subsequent 60-day episode renewals requiring a physician to re-attest that the patient continues to meet home health eligibility criteria.', why:'Missed or late recertification creates a gap in coverage that cannot be billed retroactively.' },
    { key:'sknd', term:'Skilled Need', aliases:['skilled need','skilled nursing','skilled service'], def:'A clinical requirement that the services provided demand the judgment or expertise of a licensed professional (RN, PT, OT, SLP) and are reasonable and necessary.', why:'Without documented skilled need, services may be denied as non-covered.' },
    { key:'hbnd', term:'Homebound', aliases:['homebound','homebound status','home-bound'], def:'A Medicare eligibility criterion requiring that leaving home demands considerable and taxing effort due to illness or injury, and absences are infrequent or for medical care.', why:'Homebound status must be clinically supported in every assessment and visit note.' },
    { key:'ftf', term:'Face-to-Face Encounter', aliases:['FTF','face-to-face','face to face encounter','F2F'], def:'A physician or allowed NPP visit that documents the clinical findings supporting home health eligibility, required within specific timeframes relative to SOC.', why:'A missing or non-compliant FTF is a top reason for claim denials and ADR failures.' },
    { key:'ordr', term:'Orders', aliases:['orders','physician orders','MD orders'], def:'Written directives from the certifying physician specifying treatments, medications, services, and frequencies that comprise the Plan of Care.', why:'All provided services must be supported by signed orders; unauthorized services are not billable.' },
    { key:'vo', term:'Verbal Order', aliases:['VO','verbal order','telephone order','TO'], def:'A spoken physician directive that must be documented immediately in the record and authenticated by the physician within the required timeframe.', why:'Unsigned verbal orders are a common survey deficiency and audit trigger.' },
    { key:'adr', term:'ADR', aliases:['ADR','Additional Documentation Request'], def:'A request from a Medicare contractor for supporting documentation to validate a claim before or after payment, triggered by targeted or random review.', why:'A well-documented chart resolves ADRs quickly; gaps lead to denials and appeals.' },
    { key:'cop', term:'Conditions of Participation', aliases:['CoP','CoPs','Conditions of Participation','conditions of participation'], def:'Federal regulatory requirements (42 CFR §484) that home health agencies must meet to participate in Medicare and Medicaid programs.', why:'Non-compliance can result in citations, sanctions, or termination from Medicare.' },
    { key:'oass', term:'OASIS', aliases:['OASIS','OASIS-E','OASIS assessment'], def:'Outcome and Assessment Information Set — a standardized patient assessment instrument required at specific time points to measure outcomes and determine payment grouping.', why:'OASIS accuracy directly affects reimbursement, quality scores, and Star Ratings.' },
    { key:'mned', term:'Medical Necessity', aliases:['medical necessity','medically necessary'], def:'The clinical justification that services are reasonable and necessary for the diagnosis and treatment of the patient\'s condition, as required for Medicare coverage.', why:'Every visit note must reflect medical necessity or the service risks denial.' },
    { key:'psig', term:'Physician Signature', aliases:['physician signature','MD signature','signing physician'], def:'The certifying physician\'s authentication of the Plan of Care, verbal orders, and FTF documentation, required within regulatory timeframes.', why:'Unsigned or late-signed documents are a leading cause of claim denials.' },
    { key:'dfrq', term:'Discipline Frequency', aliases:['discipline frequency','visit frequency','frequency and duration'], def:'The specific number and type of visits per discipline (SN, PT, OT, SLP, MSW, HHA) ordered on the Plan of Care for each certification period.', why:'Under/over-utilization relative to ordered frequencies triggers audit scrutiny.' },
    { key:'vpat', term:'Visit Pattern', aliases:['visit pattern','visit schedule'], def:'The clinical rationale-driven schedule of visits reflecting front-loading when appropriate and tapering as patient improves.', why:'Visit patterns must match clinical acuity; mismatches signal potential compliance risk.' },
    { key:'pdgm', term:'PDGM', aliases:['PDGM','Patient-Driven Groupings Model'], def:'The Medicare payment model effective January 2020 that classifies home health periods into payment groups based on clinical characteristics, functional levels, and comorbidities.', why:'Accurate coding and OASIS completion directly drive reimbursement under PDGM.' },
    { key:'soc', term:'Start of Care', aliases:['SOC','start of care','SOC date'], def:'The first billable visit date that establishes the initial assessment period, triggering OASIS completion and episode timing requirements.', why:'SOC timing errors cascade into certification, billing, and OASIS deadline violations.' },
    { key:'lupa', term:'LUPA', aliases:['LUPA','Low Utilization Payment Adjustment'], def:'A payment reduction applied when the number of visits in a 30-day period falls below the PDGM-determined threshold for that payment group.', why:'LUPA episodes pay per-visit instead of the full period rate, significantly reducing revenue.' },
    { key:'hha', term:'Home Health Aide', aliases:['HHA','home health aide','aide services'], def:'A paraprofessional who provides personal care and task-level support under the supervision and direction of a skilled discipline (RN, PT, OT, SLP).', why:'HHA services require an active skilled discipline and a documented supervisory plan.' },
    { key:'roc', term:'Resumption of Care', aliases:['ROC','resumption of care'], def:'An OASIS assessment completed when a patient returns to home health services after an inpatient facility stay during an existing episode.', why:'ROC triggers reassessment requirements and may change the PDGM payment group.' },
    { key:'dc', term:'Discharge', aliases:['discharge','DC','discharge summary'], def:'The formal end of a home health episode, requiring an OASIS transfer/discharge assessment and summary of goals met, outcomes, and follow-up plans.', why:'Incomplete discharge documentation creates audit vulnerabilities and gaps in continuity.' },
    { key:'qarp', term:'QAPI', aliases:['QAPI','Quality Assurance and Performance Improvement','QA','quality assurance'], def:'A required agency-wide program combining quality assurance (monitoring standards) and performance improvement (data-driven initiatives) under the CoPs.', why:'Active QAPI programs identify documentation deficiencies before they become survey findings.' },
    { key:'epis', term:'Episode', aliases:['episode','episode of care','30-day period'], def:'A 30-day billing period under PDGM (previously 60-day under PPS) that defines the payment unit for home health services.', why:'Episode management drives visit planning, LUPA avoidance, and revenue cycle performance.' },
    { key:'supv', term:'Supervisory Visit', aliases:['supervisory visit','supervision','aide supervision'], def:'A required visit by a registered nurse or therapist to evaluate aide performance and patient status, conducted every 14 days when HHA services are active.', why:'Missing supervisory visits is a frequent CoP deficiency finding during surveys.' },
    { key:'prn', term:'PRN Order', aliases:['PRN','as needed','PRN order'], def:'An as-needed order that specifies the conditions under which a visit may be made, including triggers, boundaries, and required follow-up documentation.', why:'Vague PRN orders without defined parameters are non-compliant and can be denied.' },
    { key:'tfer', term:'Transfer', aliases:['transfer','transfer to inpatient'], def:'The movement of a patient to an inpatient facility that requires an OASIS transfer assessment and may interrupt the current billing episode.', why:'Timely transfer documentation ensures accurate OASIS reporting and episode handling.' },
    { key:'clia', term:'CLIA Waiver', aliases:['CLIA','CLIA waiver','point-of-care testing'], def:'A certificate under the Clinical Laboratory Improvement Amendments allowing agencies to perform waived point-of-care tests (e.g., blood glucose) in the home.', why:'Performing lab tests without a valid CLIA waiver violates federal regulations.' },
    { key:'icd', term:'ICD-10 Coding', aliases:['ICD-10','ICD-10 coding','diagnosis coding','ICD codes'], def:'The standardized classification system for diagnoses used on the CMS-485 and OASIS that determines clinical grouping and payment classification.', why:'Coding accuracy is the primary driver of PDGM payment group assignment.' },
    { key:'msw', term:'Medical Social Worker', aliases:['MSW','medical social worker','social work'], def:'A qualified social worker who provides services addressing psychosocial factors affecting the patient\'s health outcomes, ordered as part of the Plan of Care.', why:'MSW services require a skilled discipline to be active and must be tied to specific Plan of Care goals.' },
    { key:'npp', term:'Non-Physician Practitioner', aliases:['NPP','non-physician practitioner','nurse practitioner','NP','PA'], def:'A clinical provider (NP, PA, CNS) who may perform certain certification functions including the Face-to-Face encounter under physician collaboration.', why:'NPP FTF encounters must clearly document collaboration with the certifying physician.' },
    { key:'cchh', term:'Comprehensive Assessment', aliases:['comprehensive assessment','initial assessment'], def:'A thorough evaluation of the patient\'s medical, nursing, rehabilitative, social, and discharge planning needs completed at SOC, ROC, recert, or significant change.', why:'The comprehensive assessment drives the entire Plan of Care and must be clinically complete.' },
    { key:'strt', term:'Star Rating', aliases:['Star Rating','star ratings','quality star rating','CMS Star Rating'], def:'A CMS quality measure (1–5 stars) comparing agency outcomes, process measures, and patient experience against national benchmarks.', why:'Star Ratings affect referral patterns, value-based purchasing, and public perception of agency quality.' },
    { key:'cord', term:'Care Coordination', aliases:['care coordination','coordination of care','interdisciplinary coordination'], def:'The deliberate organization of patient care activities between disciplines and providers to ensure safe, effective, and efficient service delivery.', why:'Poor care coordination is a root cause of contradictory documentation and compliance failures.' },
    { key:'trc', term:'Trace Model', aliases:['trace model','one story rule','clinical trace'], def:'A documentation quality framework requiring one continuous clinical narrative from Face-to-Face through OASIS, Plan of Care, visit notes, and claim submission.', why:'Disconnected records across care artifacts are the primary trigger for audit denials.' },
    { key:'othr', term:'Order Tracking', aliases:['order tracking','order management','order aging'], def:'The systematic process of monitoring pending physician orders from issuance through authentication, ensuring timely signatures and compliance.', why:'Aged unsigned orders create billing delays, compliance gaps, and audit vulnerabilities.' },
  ]

  /* ── Build lookup ──────────────────────────────────────────── */
  var aliasMap = {} // lowercase alias → entry
  ENTRIES.forEach(function (e) {
    aliasMap[e.term.toLowerCase()] = e
    e.aliases.forEach(function (a) { aliasMap[a.toLowerCase()] = e })
  })

  // Sorted longest-first
  var forms = Object.keys(aliasMap).sort(function (a, b) { return b.length - a.length })
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
  var re = new RegExp('\\b(' + forms.map(esc).join('|') + ')\\b', 'gi')

  /* ── Persistence (shared localStorage key) ─────────────────── */
  var LS_KEY = 'cihh.glossary.suspend'
  var SCHEMA_V = 1

  function loadSeen() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
      if (d && d.v === SCHEMA_V && d.seen) return d.seen
    } catch (e) { /* corrupt */ }
    return {}
  }

  function saveSeen(key) {
    var d = { v: SCHEMA_V, seen: loadSeen() }
    d.seen[key] = 1
    try { localStorage.setItem(LS_KEY, JSON.stringify(d)) } catch (e) {}
  }

  var seen = loadSeen()

  /* ── Hovercard element (singleton, repositioned) ────────────── */
  var card = document.createElement('div')
  card.className = 'gl-hovercard'
  card.setAttribute('role', 'dialog')
  card.style.display = 'none'
  document.body.appendChild(card)

  var activeEntry = null
  var closeTmr = null

  function positionCard(trigger) {
    var r = trigger.getBoundingClientRect()
    var cw = 320, ch = 200
    var left = r.left + r.width / 2 - cw / 2
    var top = r.bottom + 8
    if (left < 8) left = 8
    if (left + cw > window.innerWidth - 8) left = window.innerWidth - cw - 8
    if (top + ch > window.innerHeight - 8) top = r.top - ch - 8
    card.style.left = left + 'px'
    card.style.top = top + 'px'
  }

  function showCard(trigger, entry) {
    clearTimeout(closeTmr)
    activeEntry = entry
    card.innerHTML =
      '<div class="gl-hc-title">' + entry.term + '</div>' +
      '<p class="gl-hc-def">' + entry.def + '</p>' +
      (entry.why ? '<p class="gl-hc-why"><span class="gl-hc-why-l">Why it matters:</span> ' + entry.why + '</p>' : '') +
      '<button class="gl-hc-gotit" type="button">Got it</button>'
    card.style.display = ''
    positionCard(trigger)

    card.querySelector('.gl-hc-gotit').onclick = function () {
      saveSeen(entry.key)
      seen[entry.key] = 1
      card.style.display = 'none'
      // Remove underline from all instances of this term
      document.querySelectorAll('[data-gl-key="' + entry.key + '"]').forEach(function (el) {
        el.classList.remove('gl-unseen')
        el.classList.add('gl-seen')
      })
    }
  }

  function scheduleClose(ms) {
    closeTmr = setTimeout(function () { card.style.display = 'none' }, ms || 150)
  }

  card.addEventListener('mouseenter', function () { clearTimeout(closeTmr) })
  card.addEventListener('mouseleave', function () { scheduleClose(200) })

  // Close on outside click
  document.addEventListener('mousedown', function (e) {
    if (card.style.display !== 'none' && !card.contains(e.target) && !(e.target && e.target.hasAttribute && e.target.hasAttribute('data-gl-key'))) {
      card.style.display = 'none'
    }
  })

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && card.style.display !== 'none') {
      card.style.display = 'none'
    }
  })

  /* ── DOM scanning ──────────────────────────────────────────── */
  // Only scan approved content selectors (skip nav, buttons, code, form fields)
  var CONTENT_SELECTORS = [
    'main', 'article', '.content', '.card-body', '.faq-answer',
    '.section-content', '.doc-content', 'section', '.prose',
    '[data-glossary-scan]',
  ]
  var SKIP_TAGS = { SCRIPT:1, STYLE:1, CODE:1, PRE:1, BUTTON:1, INPUT:1, TEXTAREA:1, SELECT:1, NAV:1, A:1 }
  var SKIP_CLASSES = ['gl-hovercard', 'gl-term', 'no-glossary']

  var claimed = {} // key → true : only show hovercard on first occurrence

  function shouldSkip(node) {
    if (!node || !node.tagName) return false
    if (SKIP_TAGS[node.tagName]) return true
    if (node.classList) {
      for (var i = 0; i < SKIP_CLASSES.length; i++) {
        if (node.classList.contains(SKIP_CLASSES[i])) return true
      }
    }
    return false
  }

  function walkTextNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (shouldSkip(node.parentElement)) return NodeFilter.FILTER_REJECT
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
      }
    })

    var textNodes = []
    while (walker.nextNode()) textNodes.push(walker.currentNode)

    textNodes.forEach(function (tn) {
      var parent = tn.parentNode
      if (!parent || shouldSkip(parent)) return

      var text = tn.textContent
      re.lastIndex = 0
      if (!re.test(text)) return
      re.lastIndex = 0

      var frag = document.createDocumentFragment()
      var lastIdx = 0
      var match

      while ((match = re.exec(text)) !== null) {
        var entry = aliasMap[match[0].toLowerCase()]
        if (!entry) continue

        // Text before match
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)))
        }

        var isFirst = !claimed[entry.key]
        if (isFirst) claimed[entry.key] = true

        var span = document.createElement('span')
        span.textContent = match[0]
        span.setAttribute('data-gl-key', entry.key)
        span.setAttribute('tabindex', '0')
        span.setAttribute('role', 'button')
        span.setAttribute('aria-label', 'Glossary: ' + entry.term)
        span.className = 'gl-term ' + (seen[entry.key] ? 'gl-seen' : 'gl-unseen')

        // Only attach hovercard to first unseen occurrence
        if (isFirst && !seen[entry.key]) {
          ;(function (sp, en) {
            sp.addEventListener('mouseenter', function () { showCard(sp, en) })
            sp.addEventListener('mouseleave', function () { scheduleClose(200) })
            sp.addEventListener('focus', function () { showCard(sp, en) })
          })(span, entry)
        }

        frag.appendChild(span)
        lastIdx = match.index + match[0].length
      }

      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)))
      }

      if (frag.childNodes.length > 0) {
        parent.replaceChild(frag, tn)
      }
    })
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init() {
    var roots = []
    CONTENT_SELECTORS.forEach(function (sel) {
      try {
        document.querySelectorAll(sel).forEach(function (el) {
          // Avoid duplicates
          if (roots.indexOf(el) === -1) roots.push(el)
        })
      } catch (e) {}
    })
    // Fallback: scan body if no roots matched
    if (roots.length === 0) roots = [document.body]

    roots.forEach(walkTextNodes)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  /* ── Inject CSS ───────────────────────────────────────────── */
  var isLight = document.documentElement.getAttribute('data-theme') === 'light'
  var style = document.createElement('style')
  style.textContent = [
    '.gl-unseen { text-decoration: underline; text-decoration-style: dotted; text-decoration-color: rgba(0,121,112,0.55); text-underline-offset: 3px; text-decoration-thickness: 1.5px; cursor: help; transition: text-decoration-color 180ms, text-decoration-style 180ms; }',
    '.gl-unseen:hover,.gl-unseen:focus-visible { text-decoration-style: solid; text-decoration-color: rgba(0,121,112,0.85); text-shadow: 0 0 8px rgba(0,121,112,0.12); }',
    '.gl-seen { text-decoration: none; cursor: default; }',
    '.gl-hovercard { position:fixed; z-index:9999; width:320px; max-width:calc(100vw - 16px); padding:16px 18px 14px; border-radius:12px; font-family:"Roboto",system-ui,sans-serif; font-size:13px; line-height:1.55; pointer-events:auto; animation:glFadeIn 160ms ease-out; background:linear-gradient(135deg,#1a2436,#162030); border:1px solid rgba(100,244,245,0.18); box-shadow:0 8px 32px rgba(0,0,0,0.45),0 0 0 1px rgba(100,244,245,0.06); color:#e2e8f0; }',
    '[data-theme="light"] .gl-hovercard { background:linear-gradient(135deg,#fff,#f8fafb); border-color:rgba(0,121,112,0.18); box-shadow:0 8px 32px rgba(0,0,0,0.10),0 0 0 1px rgba(0,121,112,0.06); color:#1f1c1b; }',
    '.gl-hc-title { font-family:"Montserrat",sans-serif; font-weight:700; font-size:14px; margin-bottom:6px; color:#64f4f5; }',
    '[data-theme="light"] .gl-hc-title { color:#007970; }',
    '.gl-hc-def { margin:0 0 8px; color:#cbd5e1; }',
    '[data-theme="light"] .gl-hc-def { color:#374151; }',
    '.gl-hc-why { margin:0 0 12px; font-size:12px; color:#94a3b8; border-left:2px solid rgba(197,160,89,0.4); padding-left:10px; }',
    '[data-theme="light"] .gl-hc-why { color:#6b7280; border-left-color:rgba(197,160,89,0.5); }',
    '.gl-hc-why-l { font-weight:600; color:#c5a059; }',
    '.gl-hc-gotit { display:inline-flex; align-items:center; padding:5px 14px; font-family:"Montserrat",sans-serif; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; border-radius:6px; border:1px solid rgba(100,244,245,0.25); background:rgba(100,244,245,0.08); color:#64f4f5; cursor:pointer; transition:background 160ms,border-color 160ms,transform 120ms; }',
    '.gl-hc-gotit:hover { background:rgba(100,244,245,0.16); border-color:rgba(100,244,245,0.4); transform:translateY(-1px); }',
    '[data-theme="light"] .gl-hc-gotit { border-color:rgba(0,121,112,0.3); background:rgba(0,121,112,0.06); color:#007970; }',
    '[data-theme="light"] .gl-hc-gotit:hover { background:rgba(0,121,112,0.12); border-color:rgba(0,121,112,0.45); }',
    '[data-theme="light"] .gl-unseen { text-decoration-color: rgba(0,121,112,0.45); }',
    '[data-theme="light"] .gl-unseen:hover,[data-theme="light"] .gl-unseen:focus-visible { text-decoration-color: rgba(0,121,112,0.75); text-shadow: 0 0 6px rgba(0,121,112,0.08); }',
    '@keyframes glFadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }',
  ].join('\n')
  document.head.appendChild(style)
})()
