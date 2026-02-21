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
    <>
      <div className="card-top-row">
        <span className="badge">Final Exam</span>
        <span className="badge ghost">24 questions · pass 80%</span>
      </div>
      <h1>Final Exam</h1>
      <section className="exam-grid">
        {finalExamQuestions.map((question, index) => (
          <article key={question.id} className="challenge-item">
            <p className="challenge-question">{index + 1}. {question.question}</p>
            <div className="option-grid">
              {question.options.map((option) => {
                const selected = finalExamAnswers[question.id] === option
                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${selected ? 'selected' : ''}`}
                    onClick={() => onSelectAnswer(question.id, option)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </article>
        ))}
      </section>
      <div className="challenge-actions">
        <button type="button" className="secondary" disabled={!qaDebugMode && !finalExamFullyAnswered} onClick={onSubmit}>
          Submit Final Exam
        </button>
        <button type="button" className="secondary" onClick={onReset}>
          Reset Exam
        </button>
      </div>
      {finalExamSubmitted ? (
        <section className="recap-panel">
          <p className="recap-title">Score: {finalExamScore}% · {finalExamPassed ? 'Pass' : 'Needs remediation'}</p>
          <p>{missedCount ? 'Review missed-question screen next for targeted card links.' : 'No missed questions. Proceed to completion.'}</p>
        </section>
      ) : null}
    </>
  )
}
