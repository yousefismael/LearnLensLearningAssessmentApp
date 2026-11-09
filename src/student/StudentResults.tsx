import { useState } from "react";
import * as React from "react";
import type { DemoState, StudentView } from "../models/types";
import { previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";

export function StudentResults({
  state,
  setView,
}: {
  state: DemoState;
  setView: (v: StudentView) => void;
}) {
  const [exam, setExam] = useState(state.published ? "Fractions Check-in" : "Number Skills");
  const isCurrent = exam === "Fractions Check-in";
  const total = state.questions.reduce((a, q) => a + q.final, 0);
  if (isCurrent && !state.published)
    return (
      <div className="page student-page">
        <div className="page-heading">
          <p className="eyebrow student-blue">MY RESULTS</p>
          <h1>Results and feedback</h1>
        </div>
        <div className="waiting-card">
          <span className="spinner big" />
          <h2>Your Fractions Check-in is being reviewed</h2>
          <p>
            Your teacher is still checking your work. We never show unconfirmed AI marks or
            feedback.
          </p>
          <Badge tone="amber">Waiting for teacher</Badge>
          <Button variant="secondary" onClick={() => setExam("Number Skills")}>
            View my latest published result
          </Button>
        </div>
      </div>
    );
  return (
    <div className="page student-page results-page">
      <div className="page-heading">
        <p className="eyebrow student-blue">MY RESULTS</p>
        <h1>{isCurrent ? "Fractions Check-in" : "Number Skills"}</h1>
        <p>Checked and shared by Mr. Adel</p>
      </div>
      <div className="result-switch">
        <button className={!isCurrent ? "active" : ""} onClick={() => setExam("Number Skills")}>
          Number Skills <Badge tone="green">Published</Badge>
        </button>
        <button className={isCurrent ? "active" : ""} onClick={() => setExam("Fractions Check-in")}>
          Fractions Check-in{" "}
          <Badge tone={state.published ? "green" : "amber"}>
            {state.published ? "Published" : "Pending"}
          </Badge>
        </button>
      </div>
      <section className="score-hero">
        <div
          className="score-ring"
          style={{ "--score": `${(isCurrent ? total : 8) * 10}%` } as React.CSSProperties}
        >
          <div>
            <strong>{isCurrent ? total : 8}</strong>
            <span>/ 10</span>
          </div>
        </div>
        <div>
          <Badge tone="green">TEACHER CONFIRMED</Badge>
          <h2>{isCurrent ? "You kept trying — well done!" : "Strong work, Alex!"}</h2>
          <p>
            {isCurrent
              ? state.feedback
              : "You used the right methods and showed your working clearly. Keep it up!"}
          </p>
        </div>
      </section>
      {isCurrent ? (
        <>
          <div className="question-results">
            {state.questions.map((q) => (
              <details key={q.id}>
                <summary>
                  <span>Q{q.id}</span>
                  <div>
                    <strong>{q.prompt}</strong>
                    <small>{q.reason}</small>
                  </div>
                  <b>
                    {q.final} / {q.max}
                  </b>
                  <Icon name="chevron" size={16} />
                </summary>
                <div className="student-evidence">
                  <p>
                    <strong>Your answer:</strong> {q.corrected}
                  </p>
                  <p>
                    <strong>Teacher note:</strong>{" "}
                    {q.final === q.max ? "That’s correct. Nice working!" : q.reason}
                  </p>
                </div>
              </details>
            ))}
          </div>
          <div className="feedback-grid">
            <section className="positive">
              <span>
                <Icon name="spark" />
              </span>
              <div>
                <small>WHAT YOU DID WELL</small>
                <h3>Clear working and simplifying</h3>
                <p>You showed steps and simplified 2/8 correctly.</p>
              </div>
            </section>
            <section className="practice">
              <span>
                <Icon name="book" />
              </span>
              <div>
                <small>YOUR NEXT STEP</small>
                <h3>Compare fractions</h3>
                <p>{state.practice}</p>
              </div>
            </section>
          </div>
          {state.redFlag === "confirmed" && (
            <div className="support-card">
              <span>
                <Icon name="users" />
              </span>
              <div>
                <Badge tone="purple">A LITTLE EXTRA HELP</Badge>
                <h3>Your teacher will help with fractions</h3>
                <p>
                  This is not a label or diagnosis. It simply means you’ll get more practice
                  comparing and adding fractions.
                </p>
              </div>
            </div>
          )}
          <div className="teacher-note">
            <div className="avatar">KA</div>
            <div>
              <small>A NOTE FROM MR. ADEL</small>
              <p>“{state.teacherComment}”</p>
            </div>
          </div>
        </>
      ) : (
        <div className="feedback-grid">
          <section className="positive">
            <span>
              <Icon name="spark" />
            </span>
            <div>
              <small>WHAT YOU DID WELL</small>
              <h3>You used place value correctly</h3>
              <p>Keep showing each step.</p>
            </div>
          </section>
          <section className="practice">
            <span>
              <Icon name="book" />
            </span>
            <div>
              <small>PRACTISE NEXT</small>
              <h3>Multiplication facts</h3>
              <p>Practise the 6 times table for five minutes.</p>
            </div>
          </section>
        </div>
      )}
      <Button variant="secondary" onClick={() => setView("progress")}>
        View my progress <Icon name="chart" size={17} />
      </Button>
    </div>
  );
}
