import type { DemoState, StudentView } from "../models/types";
import { previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";

export function StudentProgress({
  state,
  setView,
}: {
  state: DemoState;
  setView: (v: StudentView) => void;
}) {
  const exams = state.published
    ? [
        ...previousResults,
        {
          name: "Fractions Check-in",
          date: "21 Oct",
          score: state.questions.reduce((a, q) => a + q.final, 0),
          total: 10,
          topic: "Fractions",
        },
      ]
    : previousResults;
  return (
    <div className="page student-page">
      <div className="page-heading">
        <p className="eyebrow student-blue">MY PROGRESS</p>
        <h1>Look how far you’ve come!</h1>
        <p>Only results confirmed by your teacher appear here.</p>
      </div>
      <div className="progress-summary">
        <div>
          <span className="card-icon green">
            <Icon name="chart" />
          </span>
          <div>
            <small>YOUR PROGRESS</small>
            <strong>Up 10%</strong>
            <p>Across your last 2 published exams</p>
          </div>
        </div>
        <div>
          <span className="card-icon purple">
            <Icon name="spark" />
          </span>
          <div>
            <small>GETTING BETTER AT</small>
            <strong>Showing working</strong>
            <p>Great habit!</p>
          </div>
        </div>
      </div>
      <section className="chart-card">
        <div className="chart-head">
          <div>
            <h2>Mathematics results</h2>
            <p>Grade 4 • Confirmed marks</p>
          </div>
          <select aria-label="Choose subject">
            <option>Mathematics</option>
            <option>English</option>
            <option>Deutsch</option>
          </select>
        </div>
        <div className="bar-chart">
          {exams.map((e, i) => (
            <button key={e.name} onClick={() => setView("results")}>
              <span className="bar-value">
                {e.score}/{e.total}
              </span>
              <i
                style={{ height: `${e.score * 8}%` }}
                className={i === exams.length - 1 ? "latest" : ""}
              />
              <small>{e.date}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="history-list">
        <div className="section-title">
          <div>
            <h2>Exam history</h2>
            <p>Open an exam to revisit your feedback.</p>
          </div>
        </div>
        {exams
          .slice()
          .reverse()
          .map((e) => (
            <button key={e.name} onClick={() => setView("results")}>
              <span className="history-score">
                {e.score}
                <small>/{e.total}</small>
              </span>
              <div>
                <strong>{e.name}</strong>
                <small>
                  {e.topic} • {e.date}
                </small>
              </div>
              <Badge tone="green">Published</Badge>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        {state.submitted && !state.published && (
          <div className="pending-history">
            <span className="history-score pending">
              <Icon name="history" />
            </span>
            <div>
              <strong>Fractions Check-in</strong>
              <small>21 Oct • Your teacher is reviewing it</small>
            </div>
            <Badge tone="amber">Waiting</Badge>
          </div>
        )}
      </section>
    </div>
  );
}
