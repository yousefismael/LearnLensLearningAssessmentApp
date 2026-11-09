import { useState } from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";
import { ReviewWorkflow } from "./ReviewWorkflow";

export function PublishReview({
  state,
  update,
  addHistory,
  setView,
  setToast,
}: {
  state: DemoState;
  update: (p: Partial<DemoState>) => void;
  addHistory: (t: DemoState["history"][number]["type"], s: string) => void;
  setView: (v: TeacherView) => void;
  setToast: (s: string) => void;
}) {
  const [feedback, setFeedback] = useState(state.feedback);
  const [practice, setPractice] = useState(state.practice);
  const [comment, setComment] = useState(state.teacherComment);
  const [lang, setLang] = useState("English");
  const marks = state.questions.every((q) => q.confirmed),
    support = !!state.redFlag;
  const ready = !!state.guideApproved && state.ocrApproved && marks && support && state.feedbackApproved;
  const approve = () => {
    if (!feedback.trim() || !practice.trim()) { setToast("Add feedback and practice advice before approving."); return; }
    update({ feedback, practice, teacherComment: comment, feedbackApproved: true });
    addHistory("Feedback", "Edited and approved student feedback and practice advice.");
    setToast("Feedback approved and ready to share.");
  };
  const publish = () => {
    if (!ready) return;
    update({ published: true, feedback, practice, teacherComment: comment, notificationRead: false });
    addHistory(
      "Feedback",
      "Published confirmed Fractions Check-in results and sent student notification.",
    );
    setToast("Results published. Alex has been notified.");
  };
  return (
    <div className="teacher-page">
      <TeacherHeader eyebrow="SUBMISSIONS / ALEX MORGAN" title="Check feedback & share results">
        <Badge tone={state.published ? "green" : "amber"}>
          {state.published ? "Published" : "Not shared"}
        </Badge>
      </TeacherHeader>
      <ReviewWorkflow current={3} />
      <div className="publish-summary">
        <div>
          <small>CONFIRMED SCORE</small>
          <strong>
            {state.questions.reduce((a, q) => a + q.final, 0)} <span>/ 10</span>
          </strong>
        </div>
        <i />
        <div>
          <small>PRIMARY GAP</small>
          <strong>Comparing fractions</strong>
        </div>
        <i />
        <div>
          <small>SUPPORT DECISION</small>
          <strong>
            {state.redFlag === "confirmed"
              ? "Extra support confirmed"
              : state.redFlag === "dismissed"
                ? "Suggestion dismissed"
                : "Pending"}
          </strong>
        </div>
      </div>
      <div className="publish-layout">
        <section className="panel feedback-editor">
          <div className="panel-head">
            <div>
              <h2>Student feedback</h2>
              <p>Edit the AI draft for age, language and confirmed evidence.</p>
            </div>
            <Badge tone="purple">
              <Icon name="spark" size={12} /> AI draft
            </Badge>
          </div>
          <label>
            Feedback the student will see
            <textarea value={feedback} onChange={(e) => {setFeedback(e.target.value);update({feedbackApproved:false,published:false});}} rows={5} />
            <span>{feedback.length} characters • Clear, positive and specific</span>
          </label>
          <label>
            Practice recommendation
            <textarea value={practice} onChange={(e) => {setPractice(e.target.value);update({feedbackApproved:false,published:false});}} rows={3} />
          </label>
          <label>
            Teacher comment
            <textarea value={comment} onChange={(e) => {setComment(e.target.value);update({feedbackApproved:false,published:false});}} rows={2} />
          </label>
          <div className="feedback-controls">
            <label>
              Student-facing language
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option>English</option>
                <option>German</option>
              </select>
            </label>
            <Button onClick={approve}>
              <Icon name="check" size={16} />{" "}
              {state.feedbackApproved ? "Feedback approved" : "Approve feedback"}
            </Button>
          </div>
        </section>
        <aside className="panel student-preview">
          <div className="panel-head">
            <div>
              <h2>Student preview</h2>
              <p>What Alex sees after publishing</p>
            </div>
            <Badge tone="gray">
              <Icon name="eye" size={12} /> Preview
            </Badge>
          </div>
          <div className="preview-score">
            <span>
              {state.questions.reduce((a, q) => a + q.final, 0)}
              <small>/10</small>
            </span>
            <strong>{lang === "German" ? "Gute Arbeit, Alex!" : "Keep going, Alex!"}</strong>
          </div>
          <div className="preview-feedback">
            <small>{lang === "German" ? "LEHRER-FEEDBACK" : "TEACHER FEEDBACK"}</small>
            <p>
              {lang === "German"
                ? "Du hast deine Rechenwege klar gezeigt. Übe als Nächstes Brüche mit verschiedenen Nennern."
                : feedback}
            </p>
          </div>
          <div className="preview-practice">
            <Icon name="book" />
            <div>
              <small>NEXT STEP</small>
              <p>{practice}</p>
            </div>
          </div>
          {state.redFlag === "confirmed" && (
            <div className="preview-support">
              <Icon name="users" />
              <p>
                <strong>A little extra help</strong>Your teacher will practise fractions with you.
              </p>
            </div>
          )}
        </aside>
      </div>
      <section className="panel before-sharing">
        <div className="panel-head">
          <div>
            <h2>Before sharing</h2>
            <p>Every required teacher review must be complete.</p>
          </div>
        </div>
        <div className="checklist">
          <span className={state.ocrApproved ? "done" : ""}>
            <i>{state.ocrApproved ? <Icon name="check" size={14} /> : 1}</i>OCR text approved
          </span>
          <span className={marks ? "done" : ""}>
            <i>{marks ? <Icon name="check" size={14} /> : 2}</i>All question marks confirmed
          </span>
          <span className={support ? "done" : ""}>
            <i>{support ? <Icon name="check" size={14} /> : 3}</i>Support suggestion decided
          </span>
          <span className={state.feedbackApproved ? "done" : ""}>
            <i>{state.feedbackApproved ? <Icon name="check" size={14} /> : 4}</i>Feedback approved
          </span>
        </div>
        {!ready && (
          <div className="missing-approval">
            <strong>Sharing is unavailable.</strong>
            <span>
              {!marks ? "Confirm all question marks. " : ""}
              {!support ? "Confirm or dismiss the extra-help suggestion. " : ""}
              {!state.feedbackApproved ? "Approve the student feedback." : ""}
            </span>
          </div>
        )}
      </section>
      <div className="sticky-actions">
        <Button variant="secondary" onClick={() => setView("gaps")}>
          Back to support review
        </Button>
        <div>
          <span>
            {state.published
              ? "Results are visible in Alex’s student view."
              : "Publishing also sends a student notification."}
          </span>
          <Button disabled={!ready || state.published} onClick={publish}>
            {state.published ? "Results published" : "Publish results & notify student"}{" "}
            <Icon name="chevron" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}
