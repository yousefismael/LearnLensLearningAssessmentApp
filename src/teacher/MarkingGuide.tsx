import { useState } from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

export function MarkingGuide({
  state,
  update,
  setView,
  addHistory,
  setToast,
}: {
  state: DemoState;
  update: (p: Partial<DemoState>) => void;
  setView: (v: TeacherView) => void;
  addHistory: (t: DemoState["history"][number]["type"], s: string) => void;
  setToast: (s: string) => void;
}) {
  const [criteria, setCriteria] = useState(state.questions.map((q) => ({ ...q })));
  const [sourceOpen, setSourceOpen] = useState<number | null>(null);
  const [sourceType, setSourceType] = useState<"Answer key" | "Rubric" | "Graded sample">(
    "Answer key",
  );
  return (
    <div className="teacher-page">
      <TeacherHeader
        eyebrow="FRACTIONS CHECK-IN / MARKING GUIDE"
        title="Review the AI-drafted guide"
      >
        <Badge tone={state.guideApproved ? "green" : "amber"}>
          <Icon name={state.guideApproved ? "check" : "spark"} size={13} /> {state.guideApproved ? "Approved • editing requires re-approval" : "Draft • needs approval"}
        </Badge>
      </TeacherHeader>
      <div className="info-banner">
        <span>
          <Icon name="spark" />
        </span>
        <div>
          <strong>AI drafted this guide from 3 labelled sources.</strong>
          <p>
            Check expected answers, allocations and common errors. Student grading uses only the
            approved version.
          </p>
        </div>
      </div>
      <div className="guide-layout">
        <section className="panel guide-list">
          <div className="panel-head">
            <div>
              <h2>Questions & criteria</h2>
              <p>{criteria.reduce((sum,q)=>sum+q.max,0)} marks in total</p>
            </div>
          </div>
          {criteria.map((q, i) => (
            <details open={i === 0} key={q.id}>
              <summary>
                <span>Q{q.id}</span>
                <div>
                  <strong>{q.prompt}</strong>
                  <small>
                    {q.max} marks • {q.confidence} source match
                  </small>
                </div>
                <Badge tone="green">Ready</Badge>
                <Icon name="chevron" size={16} />
              </summary>
              <div className="criterion-edit">
                <label>
                  Expected answer
                  <input
                    value={q.answer}
                    onChange={(e) =>
                      setCriteria((c) =>
                        c.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)),
                      )
                    }
                  />
                </label>
                <label>
                  Mark allocation
                  <input
                    value={q.rubric}
                    onChange={(e) =>
                      setCriteria((c) =>
                        c.map((x, j) => (j === i ? { ...x, rubric: e.target.value } : x)),
                      )
                    }
                  />
                </label>
                <label>
                  Common error category
                  <input
                    value={q.commonError ?? (i === 1 ? "Adds numerators and denominators" : i === 2 ? "Compares numerators only" : "Calculation / notation")}
                    onChange={e => setCriteria(c => c.map((x,j) => j===i ? {...x, commonError:e.target.value} : x))}
                  />
                </label>
                <button onClick={() => setSourceOpen(q.id)}>
                  <Icon name="eye" size={16} /> Inspect source evidence
                </button>
              </div>
            </details>
          ))}
        </section>
        <aside className="panel source-panel">
          <div className="panel-head">
            <div>
              <h2>Source evidence</h2>
              <p>
                {sourceOpen ? `Evidence for Q${sourceOpen}` : "Select “Inspect source evidence”"}
              </p>
            </div>
          </div>
          <div className="source-preview">
            <div className="source-paper">
              <small>FRACTIONS {sourceType.toUpperCase()}</small>
              <strong>Question {sourceOpen || 1}</strong>
              <p>{criteria[(sourceOpen || 1) - 1]?.answer}</p>
              <mark>{criteria[(sourceOpen || 1) - 1]?.rubric}</mark>
            </div>
          </div>
          <div className="source-tabs">
            {(["Answer key", "Rubric", "Graded sample"] as const).map((type) => (
              <button
                key={type}
                className={sourceType === type ? "active" : ""}
                onClick={() => setSourceType(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <p className="source-note">Original English source • uploaded by Karim Adel</p>
        </aside>
      </div>
      <div className="sticky-actions">
        <Button variant="secondary" onClick={() => setView("setup")}>
          Back to setup
        </Button>
        <div>
          <span>4 of 4 questions ready</span>
          <Button
            onClick={() => {
              addHistory(
                "Rubric",
                `Approved ${state.assessment?.name || "Fractions Check-in"} marking guide after review.`,
              );
              update({ questions: criteria, guideApproved: true, ocrApproved: false, published: false });
              setToast("Marking guide approved. Check OCR before grading.");
              setView("submissions");
            }}
          >
            Approve marking guide <Icon name="check" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}
