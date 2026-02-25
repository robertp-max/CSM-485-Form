import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

type Props = {
  onClose: () => void
}

type TabMode = 'REVIEW' | 'LEARN' | 'TRY_IT'

type FieldKey =
  | 'patientHic'
  | 'socDate'
  | 'certPeriod'
  | 'medicalRecord'
  | 'providerNo'
  | 'patientInfo'
  | 'principalDx'
  | 'otherDx'
  | 'dmeSupplies'
  | 'functionalLimits'
  | 'mentalStatus'
  | 'nursingOrders'
  | 'visitFrequency'
  | 'goals'
  | 'safetyBehavioral'

const REVIEW_VALUES: Record<FieldKey, string> = {
  patientHic: 'XXX-XX-XXXX-A',
  socDate: '02/24/2026',
  certPeriod: '02/24/2026 - 04/23/2026',
  medicalRecord: 'MR-2026-0485',
  providerNo: '10-7654',
  patientInfo: 'Jane A. Sample 1234 Elm St, Sacramento, CA 95811 DOB 03/15/1942',
  principalDx: 'I50.9 Heart failure, unspecified',
  otherDx: 'N18.3 CKD Stage 3\nI10 Essential HTN\nE11.65 T2DM w/ hyperglycemia\nZ87.39 Hx urinary disease',
  dmeSupplies: 'Rolling walker, BP cuff, Scale, Compression stockings',
  functionalLimits: 'Ambulation, Endurance, Dyspnea, Paralysis',
  mentalStatus: 'Oriented, Confused, Depressed',
  nursingOrders: 'SN CHF monitoring, med titration, edema q visit 2x/wk x 3wk then 1x/wk x 3wk\nPT Therapeutic exercise, balance, transfers 2x/wk x 4wk\nMSW Community resources, psychosocial 1x/mo x 2mo',
  visitFrequency: 'SN 2W31W3 PT 2W4 MSW 1M2 | Total: 19 visits',
  goals: 'G1: Pt verbalizes 3 CHF red flags by visit 4\nG2: Daily wt/BP log 2lb variance x 2wk\nRehab: Good D/C when goals met',
  safetyBehavioral: 'Fall precautions, trip hazards, night lighting, emergency contacts',
}

const LABELS: Record<FieldKey, string> = {
  patientHic: '1. Patient HI #',
  socDate: '2. SOC Date',
  certPeriod: '3. Cert Period',
  medicalRecord: '4. Medical Rec #',
  providerNo: '5. Provider #',
  patientInfo: '6. Patient Name, Address, DOB',
  principalDx: '11. Principal DX',
  otherDx: '12. Other Pertinent DX',
  dmeSupplies: '14. DME / Supplies',
  functionalLimits: '15. Functional Limits',
  mentalStatus: '16. Mental Status',
  nursingOrders: '18. Skilled Nursing Orders',
  visitFrequency: '21. Visit Frequency',
  goals: '22. Goals / Rehab Potential',
  safetyBehavioral: '24. Safety / Behavioral',
}

export const Cms485VirtualForm = ({ onClose }: Props) => {
  const { isDarkMode, toggle } = useTheme()
  const [activeTab, setActiveTab] = useState<TabMode>('REVIEW')
  const [formValues, setFormValues] = useState<Record<FieldKey, string>>(() => ({ ...REVIEW_VALUES }))

  const shellClass = isDarkMode
    ? 'bg-[#010809] text-[#FAFBF8] border-[#004142]'
    : 'bg-[#FAFBF8] text-[#1F1C1B] border-[#D9D6D5]'

  const panelClass = isDarkMode
    ? 'bg-[#031213] border-[#004142]'
    : 'bg-white border-[#E5E4E3]'

  const muted = isDarkMode ? 'text-[#D9D6D5]' : 'text-[#747474]'
  const accent = isDarkMode ? 'text-[#64F4F5]' : 'text-[#007970]'

  const setField = (key: FieldKey, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const inputValue = useMemo(
    () => (key: FieldKey) => (activeTab === 'REVIEW' ? REVIEW_VALUES[key] : formValues[key]),
    [activeTab, formValues],
  )

  const renderField = (key: FieldKey, multiline = false) => {
    if (activeTab === 'REVIEW') {
      return <div className={`mt-1 text-xs font-medium whitespace-pre-wrap ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>{REVIEW_VALUES[key]}</div>
    }

    if (multiline) {
      return (
        <textarea
          className={`mt-1 w-full min-h-[56px] text-xs rounded-md border px-2 py-1 outline-none ${
            isDarkMode
              ? 'bg-[#010809] border-[#004142] text-[#FAFBF8] focus:border-[#007970]'
              : 'bg-white border-[#D9D6D5] text-[#1F1C1B] focus:border-[#007970]'
          }`}
          value={inputValue(key)}
          onChange={(event) => setField(key, event.target.value)}
        />
      )
    }

    return (
      <input
        className={`mt-1 w-full text-xs rounded-md border px-2 py-1 outline-none ${
          isDarkMode
            ? 'bg-[#010809] border-[#004142] text-[#FAFBF8] focus:border-[#007970]'
            : 'bg-white border-[#D9D6D5] text-[#1F1C1B] focus:border-[#007970]'
        }`}
        value={inputValue(key)}
        onChange={(event) => setField(key, event.target.value)}
      />
    )
  }

  return (
    <div className={`fixed inset-0 z-[70] p-0 md:p-2 ${isDarkMode ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/25 backdrop-blur-[2px]'}`}>
      <div className={`h-full w-full rounded-none md:rounded-2xl border ${shellClass}`}>
        <header className={`px-6 pt-4 pb-0 border-b ${panelClass}`}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h1 className={`font-semibold text-xl ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>Interactive CMS-485 Virtual Form</h1>
              <p className={`text-xs ${muted}`}>Page 1 (FAQ #65 sample) · Guided training + Try It simulation</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggle} className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${isDarkMode ? 'border-[#004142] text-[#64F4F5] hover:bg-[#002B2C]' : 'border-[#E5E4E3] text-[#007970] hover:bg-[#E5FEFF]'}`}>
                {isDarkMode ? 'Light' : 'Night'}
              </button>
              <button onClick={onClose} className={`px-3 py-1.5 rounded-md text-xs font-semibold border inline-flex items-center gap-1 ${isDarkMode ? 'border-[#004142] text-[#D9D6D5] hover:bg-[#002B2C]' : 'border-[#E5E4E3] text-[#524048] hover:bg-[#FAFBF8]'}`}>
                <X className="h-4 w-4" /> Close
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'REVIEW', label: 'Review Mode' },
              { id: 'LEARN', label: 'Start Learning' },
              { id: 'TRY_IT', label: 'Try It Mode' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`px-4 md:px-6 py-3 text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'border-[#C74601] text-[#C74601] bg-[#C74601]/10'
                      : 'border-[#C74601] text-[#C74601] bg-[#FFEEE5]/50'
                    : isDarkMode
                      ? 'border-transparent text-[#D9D6D5] hover:bg-[#002B2C]/50 hover:text-[#64F4F5]'
                      : 'border-transparent text-[#524048] hover:bg-[#FAFBF8] hover:text-[#007970]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid h-[calc(100%-110px)] min-h-0 grid-cols-1 lg:grid-cols-[1.45fr_0.95fr]">
          <section className={`p-4 lg:p-6 border-r ${panelClass} overflow-y-auto`}>
            <div className={`max-w-4xl mx-auto w-full border-2 shadow-xl relative ${isDarkMode ? 'border-[#004142] bg-[#020C0D]' : 'border-[#1F1C1B] bg-white'}`}>
              <div className={`${isDarkMode ? 'bg-[#002B2C] border-b border-[#004142]' : 'bg-[#004142]'} text-white flex justify-between p-3 font-bold`}>
                <span className="text-sm uppercase">Home Health Certification and Plan of Care</span>
                <span className={`text-xs ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#C4F4F5]'}`}>Form CMS-485</span>
              </div>

              <div className={`grid grid-cols-2 sm:grid-cols-5 border-b ${isDarkMode ? 'border-[#004142] bg-[#010809]' : 'border-[#1F1C1B] bg-[#FAFBF8]'}`}>
                {(['patientHic', 'socDate', 'certPeriod', 'medicalRecord', 'providerNo'] as FieldKey[]).map((key, index) => (
                  <div key={key} className={`p-2 ${index < 4 ? 'border-r' : ''} ${isDarkMode ? 'border-[#004142]' : 'border-[#1F1C1B]'}`}>
                    <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS[key]}</span>
                    {renderField(key)}
                  </div>
                ))}
              </div>

              <div className={`p-2 border-b ${isDarkMode ? 'border-[#004142] bg-[#010809]' : 'border-[#1F1C1B]'}`}>
                <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.patientInfo}</span>
                {renderField('patientInfo')}
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 border-b ${isDarkMode ? 'border-[#004142] bg-[#010809]' : 'border-[#1F1C1B]'}`}>
                <div className={`p-2 border-r ${isDarkMode ? 'border-[#004142]' : 'border-[#1F1C1B]'}`}>
                  <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.principalDx}</span>
                  {renderField('principalDx', true)}
                </div>
                <div className="p-2">
                  <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.otherDx}</span>
                  {renderField('otherDx', true)}
                </div>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-3 border-b ${isDarkMode ? 'border-[#004142] bg-[#010809]' : 'border-[#1F1C1B]'}`}>
                <div className={`p-2 border-r ${isDarkMode ? 'border-[#004142]' : 'border-[#1F1C1B]'}`}>
                  <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.dmeSupplies}</span>
                  {renderField('dmeSupplies', true)}
                </div>
                <div className={`p-2 border-r ${isDarkMode ? 'border-[#004142]' : 'border-[#1F1C1B]'}`}>
                  <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.functionalLimits}</span>
                  {renderField('functionalLimits', true)}
                </div>
                <div className="p-2">
                  <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.mentalStatus}</span>
                  {renderField('mentalStatus')}
                </div>
              </div>

              <div className={`p-2 border-b ${isDarkMode ? 'border-[#004142] bg-[#010809]' : 'border-[#1F1C1B]'}`}>
                <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.nursingOrders}</span>
                {renderField('nursingOrders', true)}
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 border-b ${isDarkMode ? 'border-[#004142] bg-[#010809]' : 'border-[#1F1C1B]'}`}>
                <div className={`p-2 border-r ${isDarkMode ? 'border-[#004142]' : 'border-[#1F1C1B]'}`}>
                  <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.visitFrequency}</span>
                  {renderField('visitFrequency', true)}
                </div>
                <div className="p-2">
                  <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.goals}</span>
                  {renderField('goals', true)}
                </div>
              </div>

              <div className={`p-2 border-b ${isDarkMode ? 'border-[#004142] bg-[#010809]' : 'border-[#1F1C1B]'}`}>
                <span className={`text-[9px] font-bold uppercase block ${isDarkMode ? 'text-[#64F4F5]' : 'text-[#524048]'}`}>{LABELS.safetyBehavioral}</span>
                {renderField('safetyBehavioral', true)}
              </div>

              <div className={`grid grid-cols-2 p-2 text-[10px] ${isDarkMode ? 'bg-[#020C0D] text-[#64F4F5]' : 'bg-[#FAFBF8] text-[#747474]'}`}>
                <div>26. Signature of Physician: ______________________</div>
                <div className="text-right">Date: __/__/____</div>
              </div>
            </div>
          </section>

          <aside className={`hidden lg:flex flex-col gap-6 p-6 border-l overflow-y-auto ${panelClass}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <input
                type="text"
                placeholder="Search CMS guidelines..."
                className={`w-full rounded-[8px] py-2 pl-9 pr-3 text-sm outline-none border ${
                  isDarkMode
                    ? 'bg-[#010809] border-[#004142] text-[#FAFBF8] placeholder:text-[#004142]'
                    : 'bg-[#FAFBF8] border-[#E5E4E3] text-[#1F1C1B]'
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className={`text-xs ${muted}`}>Guided progress</span>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#1F1C1B]'}`}>{activeTab === 'REVIEW' ? '12%' : activeTab === 'LEARN' ? '48%' : '73%'}</span>
              </div>
              <div className="flex gap-1.5">
                <div className={`w-4 h-4 rounded-full border-2 border-[#007970] flex items-center justify-center`}><div className="w-1.5 h-1.5 bg-[#007970] rounded-full"></div></div>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className={`w-4 h-4 rounded-full border-2 ${isDarkMode ? 'border-[#004142]' : 'border-[#E5E4E3]'}`}></div>)}
              </div>
            </div>

            <div className={`border-t pt-6 space-y-4 ${isDarkMode ? 'border-[#004142]' : 'border-[#E5E4E3]'}`}>
              <h3 className={`font-bold text-sm leading-snug uppercase tracking-wide ${accent}`}>Patient Identifiers & Certification Period</h3>
              <p className={`text-xs ${isDarkMode ? 'text-[#D9D6D5]' : 'text-[#524048]'}`}>Confirm patient identity and cert dates exactly match source orders.</p>

              <div>
                <h4 className="text-[10px] font-bold text-[#C74601] uppercase tracking-widest mb-1">Why It Matters</h4>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#D9D6D5]' : 'text-[#747474]'}`}>Identity/date mismatches break continuity, trigger claim edits, and weaken audit traceability.</p>
              </div>

              <div>
                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${accent}`}>How To Complete</h4>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#D9D6D5]' : 'text-[#747474]'}`}>Use the referral/order packet and certification dates approved by the physician. Keep identifiers exact across all forms.</p>
              </div>
            </div>

            {activeTab === 'TRY_IT' && (
              <div className={`${isDarkMode ? 'bg-[#C74601]/10 border-[#C74601]/30' : 'bg-[#FFEEE5] border-[#FFD5BF]'} p-4 rounded-[12px] border`}>
                <h4 className="text-[#C74601] font-bold text-[10px] uppercase tracking-widest mb-3">Try It input</h4>
                <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-[#FFD5BF]' : 'text-[#421700]'}`}>Certification Start Date</label>
                <input type="date" className={`w-full rounded-[6px] py-2 px-3 text-sm mb-2 border outline-none ${isDarkMode ? 'bg-[#010809] border-[#C74601]/50 text-[#FAFBF8]' : 'bg-white border-[#FFD5BF] text-[#1F1C1B]'}`} />
                <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-[#FFD5BF]/80' : 'text-[#C74601]/80'}`}>Use the exact physician-approved certification period start date.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

