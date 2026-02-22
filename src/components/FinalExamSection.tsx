import { finalExamQuestions } from '../courseData'

type FinalExamSectionProps = {
  finalExamAnswers: Record<string, string>
  qaDebugMode: boolean
  finalExamFullyAnswered: boolean
  finalExamSubmitted: boolean
  finalExamScore: number
  finalExamPassed: boolean
  missedCount: number
  onSelectAnswer: (questionId: string, answer: string) => void
  onSubmit: () => void
  onReset: () => void
}

export default function FinalExamSection({
  finalExamAnswers,
  qaDebugMode,
  finalExamFullyAnswered,
  finalExamSubmitted,
  finalExamScore,
  finalExamPassed,
  missedCount,
  onSelectAnswer,
  onSubmit,
  onReset,
}: FinalExamSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-3 py-1 text-sm font-medium text-brand-teal dark:bg-brand-teal/20 dark:text-brand-tealLight">
          Final Exam
        </span>
        <span className="inline-flex items-center rounded-full bg-bg-card-muted px-3 py-1 text-sm font-medium text-text-muted">
          24 questions · pass 80%
        </span>
      </div>
      
      <h1 className="text-3xl font-bold text-text-primary mt-4 mb-6">Final Exam</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {finalExamQuestions.map((question, index) => (
          <div key={question.id} className="interactive-card p-6 rounded-2xl bg-bg-card">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal font-bold">
                {index + 1}
              </div>
              <p className="text-lg font-medium text-text-primary mt-0.5">{question.question}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option) => {
                const selected = finalExamAnswers[question.id] === option
                const isCorrect = option === question.correctAnswer
                const showResult = finalExamSubmitted
                
                let btnClass = "w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm "
                
                if (!showResult) {
                  if (selected) {
                    btnClass += "border-brand-teal bg-brand-teal/10 text-brand-teal"
                  } else {
                    btnClass += "border-subtle bg-bg-page hover:border-brand-teal/50 hover:bg-brand-teal/5 text-text-primary"
                  }
                } else if (selected && isCorrect) {
                  btnClass += "border-status-success-border bg-status-success-bg text-status-success-text"
                } else if (selected && !isCorrect) {
                  btnClass += "border-status-danger-border bg-status-danger-bg text-status-danger-text"
                } else if (isCorrect) {
                  btnClass += "border-status-success-border/50 bg-status-success-bg/50 text-status-success-text"
                } else {
                  btnClass += "border-subtle bg-bg-page opacity-50 text-text-muted"
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={showResult}
                    className={btnClass}
                    onClick={() => onSelectAnswer(question.id, option)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && selected && isCorrect && <span>✅</span>}
                      {showResult && selected && !isCorrect && <span>❌</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4">
        <button 
          type="button" 
          className="premium-btn px-8 py-3 rounded-xl font-bold bg-brand-teal text-white shadow-lg hover:bg-brand-tealDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={!qaDebugMode && !finalExamFullyAnswered} 
          onClick={onSubmit}
        >
          Submit Final Exam
        </button>
        <button 
          type="button" 
          className="px-6 py-3 rounded-xl font-bold border-2 border-subtle text-text-primary hover:bg-bg-page transition-colors" 
          onClick={onReset}
        >
          Reset Exam
        </button>
      </div>
      
      {finalExamSubmitted ? (
        <div className={`mt-6 p-6 rounded-2xl border-2 ${finalExamPassed ? 'bg-status-success-bg border-status-success-border text-status-success-text' : 'bg-status-danger-bg border-status-danger-border text-status-danger-text'}`}>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-3xl">{finalExamPassed ? '🎉' : '⚠️'}</div>
            <h3 className="text-2xl font-bold">Score: {finalExamScore}% · {finalExamPassed ? 'Pass' : 'Needs remediation'}</h3>
          </div>
          <p className="text-lg ml-12">{missedCount ? 'Review missed-question screen next for targeted card links.' : 'No missed questions. Proceed to completion.'}</p>
        </div>
      ) : null}
    </div>
  )
}
