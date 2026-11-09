import { useState } from "react";
import * as React from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";
import { SimilarAnswers } from "./SimilarAnswers";
import { ReviewWorkflow } from "./ReviewWorkflow";

export function MarkReview({
  state,
  setState,
  addHistory,
  setView,
  setToast,
}: {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
  addHistory: (t: DemoState["history"][number]["type"], s: string) => void;
  setView: (v: TeacherView) => void;
  setToast: (s: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<"question" | "similar">("question");
  const [reason, setReason] = useState(state.questions[index].reason);
  const q = state.questions[index];
  const confirmed = state.questions.filter((x) => x.confirmed).length;
  const setMark = (mark: number) =>
    setState((s) => ({
      ...s,
      questions: s.questions.map((x, i) =>
        i === index ? { ...x, final: Math.max(0, Math.min(mark, x.max)), confirmed: false } : x,
      ),
      published: false, feedbackApproved: false,
    }));
  const confirm = () => {
    if (q.final !== q.suggested && reason.trim().length < 5) {
      setToast("Add a short reason for changing the suggested mark.");
      return;
    }
    const changed = q.final !== q.suggested;
    setState((s) => ({
      ...s,
      questions: s.questions.map((x, i) => (i === index ? { ...x, confirmed: true, reason } : x)),
    }));
    addHistory(
      "Grading",
      changed
        ? `Changed Q${q.id} from ${q.suggested}/${q.max} to ${q.final}/${q.max}: ${reason}`
        : `Accepted AI suggestion for Q${q.id}: ${q.final}/${q.max}.`,
    );
    setToast(`Question ${q.id} mark confirmed.`);
    if (index < 3) {
      setIndex(index + 1);
      setReason(state.questions[index + 1].reason);
    }
  };
  const saveExample = () => {
    if (!q.confirmed || q.final === q.suggested) {
      setToast("Confirm an overridden question mark before saving it as an example.");
      return;
    }
    const ex = {
      id: Date.now(),
      answer: q.corrected,
      suggestion: `${q.suggested} / ${q.max}`,
      decision: `${q.final} / ${q.max}`,
      reason,
      course: "Grade 4 Mathematics",
    };
    setState((s) => ({ ...s, examples: [...s.examples, ex] }));
    addHistory("Grading", `Saved Q${q.id} correction as a course-specific example.`);
    setToast("Approved correction saved for later similar answers.");
  };
  if (!state.guideApproved) return (
    <div className="teacher-page"><TeacherHeader eyebrow="REVIEW MARKS" title="Grading is locked" />
      <div className="blocked-state"><h2>Approve the marking guide first</h2>
        <p>The teacher must approve the expected answers and rubric before grading.</p>
        <Button onClick={() => setView("guide")}>Review marking guide</Button></div></div>
  );
  if (!state.ocrApproved)
    return (
      <div className="teacher-page">
        <TeacherHeader eyebrow="REVIEW MARKS" title="Grading is locked" />
        <div className="blocked-state">
          <Icon name="scan" size={35} />
          <h2>Approve OCR before grading</h2>
          <p>
            AI suggestions stay hidden until every extracted answer has been checked and approved.
          </p>
          <Button onClick={() => setView("ocr")}>Return to OCR review</Button>
        </div>
      </div>
    );
  return (
    <div className="teacher-page review-page">
      <TeacherHeader
        eyebrow="SUBMISSIONS / ALEX MORGAN / FRACTIONS CHECK-IN"
        title="Review suggested marks"
      >
        <Badge tone={confirmed === 4 ? "green" : "blue"}>{confirmed} of 4 confirmed</Badge>
      </TeacherHeader>
      <ReviewWorkflow current={1} />
      <div className="view-tabs">
        <button className={tab === "question" ? "active" : ""} onClick={() => setTab("question")}>
          Question review
        </button>
        <button className={tab === "similar" ? "active" : ""} onClick={() => setTab("similar")}>
          Similar answer groups <Badge tone="purple">3</Badge>
        </button>
      </div>
      {tab === "similar" ? (
        <SimilarAnswers
          onOpen={(i) => {
            setIndex(i);
            setTab("question");
          }}
        />
      ) : (
        <>
          <div className="question-tabs">
            {state.questions.map((x, i) => (
              <button
                key={x.id}
                onClick={() => {
                  setIndex(i);
                  setReason(x.reason);
                }}
                className={i === index ? "active" : ""}
              >
                <span>{x.confirmed ? <Icon name="check" size={13} /> : x.id}</span>Question {x.id}
                <b>
                  {x.final}/{x.max}
                </b>
              </button>
            ))}
          </div>
          <div className="mark-layout">
            <section className="panel answer-evidence">
              <div className="compare-head">
                <div>
                  <small>CHECKED STUDENT ANSWER</small>
                  <strong>Question {q.id}</strong>
                </div>
                <Badge tone="green">
                  <Icon name="check" size={12} /> OCR approved
                </Badge>
              </div>
              <div className="question-context">
                <small>QUESTION</small>
                <h3>{q.prompt}</h3>
              </div>
              <div className="answer-card">
                <small>ALEX’S ANSWER</small>
                <p>{q.corrected}</p>
              </div>
              <div className="expected-card">
                <small>APPROVED MARKING GUIDE</small>
                <p>
                  <strong>Expected:</strong> {q.answer}
                </p>
                <p>{q.rubric}</p>
                <button
                  onClick={() => setToast(`Expected answer: ${q.answer} • Rubric: ${q.rubric}`)}
                >
                  <Icon name="eye" size={15} /> Open source evidence
                </button>
              </div>
            </section>
            <section className="panel ai-suggestion">
              <div className="compare-head">
                <div>
                  <small>AI SUGGESTION</small>
                  <strong>Review, then decide</strong>
                </div>
                <Badge tone={q.confidence === "High" ? "green" : "amber"}>
                  {q.confidence} confidence
                </Badge>
              </div>
              <div className="proposed-score">
                <div>
                  <strong>{q.suggested}</strong>
                  <span>/ {q.max}</span>
                </div>
                <p>
                  <b>Suggested deduction: −{q.max - q.suggested}</b>
                  {q.reason}
                </p>
              </div>
              <div className="rubric-match">
                <small>MATCHED RUBRIC EVIDENCE</small>
                <p>{q.rubric}</p>
                <span>
                  <Icon name="spark" size={14} /> Based on answer key + approved guide
                  {q.id === 2 && state.examples.length ? ` + ${state.examples.length} saved example(s)` : ""}
                </span>
              </div>
              {q.id === 2 && state.examples.length > 0 && (
                <div className="reused-example">
                  <Badge tone="purple">COURSE EXAMPLE USED</Badge>
                  <p>A prior approved correction awarded method credit for a similar answer.</p>
                  <button onClick={() => setView("examples")}>
                    Inspect example <Icon name="chevron" size={14} />
                  </button>
                </div>
              )}
              <div className="mark-decision">
                <small>YOUR DECISION</small>
                <div className="mark-input">
                  <button
                    onClick={() => setMark(q.suggested)}
                    className={q.final === q.suggested ? "selected" : ""}
                  >
                    Accept {q.suggested}
                  </button>
                  <label>
                    <input
                      type="number"
                      step=".5"
                      min="0"
                      max={q.max}
                      value={q.final}
                      onChange={(e) => setMark(Number(e.target.value))}
                    />
                    <span>/ {q.max} marks</span>
                  </label>
                </div>
                {q.final !== q.suggested && (
                  <label className="reason-label">
                    Reason for override
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Required: explain the change…"
                    />
                  </label>
                )}
              </div>
              <div className="decision-actions">
                {q.final !== q.suggested && q.confirmed && (
                  <Button variant="ghost" onClick={saveExample}>
                    <Icon name="spark" size={16} /> Save as course example
                  </Button>
                )}
                <Button onClick={confirm}>
                  Confirm question mark <Icon name="check" size={16} />
                </Button>
              </div>
            </section>
          </div>
        </>
      )}
      <div className="sticky-actions">
        <Button variant="secondary" onClick={() => setView("ocr")}>
          Back to checked text
        </Button>
        <div>
          <span>
            {confirmed === 4
              ? "Every question mark is confirmed."
              : "Uncertain marks remain pending until confirmed."}
          </span>
          <Button disabled={confirmed < state.questions.length} onClick={() => setView("gaps")}>
            Continue to learning gaps <Icon name="chevron" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}
