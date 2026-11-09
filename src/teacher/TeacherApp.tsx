import * as React from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherDashboard } from "./TeacherDashboard";
import { ExamSetup } from "./ExamSetup";
import { MarkingGuide } from "./MarkingGuide";
import { Submissions } from "./Submissions";
import { OCRReview } from "./OCRReview";
import { MarkReview } from "./MarkReview";
import { GapReview } from "./GapReview";
import { PublishReview } from "./PublishReview";
import { SavedExamples } from "./SavedExamples";
import { ReviewHistory } from "./ReviewHistory";

export function TeacherApp({
  view,
  setView,
  state,
  setState,
  update,
  addHistory,
  setToast,
}: {
  view: TeacherView;
  setView: (v: TeacherView) => void;
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
  update: (p: Partial<DemoState>) => void;
  addHistory: (t: DemoState["history"][number]["type"], s: string) => void;
  setToast: (s: string) => void;
}) {
  const nav = [
    ["dashboard", "home", "Overview"],
    ["submissions", "users", "Submissions"],
    ["setup", "plus", "Assessments"],
    ["guide", "book", "Marking guides"],
    ["examples", "spark", "Saved examples"],
    ["history", "history", "Review history"],
  ] as [TeacherView, string, string][];
  const activeNav = ["ocr", "review", "gaps", "publish"].includes(view) ? "submissions" : view;
  return (
    <div className="teacher-shell">
      <aside className="teacher-sidebar">
        <div>
          <p className="side-label">WORKSPACE</p>
          <nav>
            {nav.map(([id, icon, label]) => (
              <button
                key={id}
                className={activeNav === id ? "active" : ""}
                onClick={() => setView(id)}
              >
                <Icon name={icon} size={19} />
                {label}
                {id === "submissions" && <i>3</i>}
              </button>
            ))}
          </nav>
        </div>
        <div className="course-card">
          <small>CURRENT COURSE</small>
          <strong>Grade 4 Mathematics</strong>
          <span>Oak Class • 24 students</span>
          <button
            onClick={() => {
              setView("dashboard");
              setToast("Course switcher opened for Grade 4 Mathematics (demo course selected).");
            }}
          >
            Change course
          </button>
        </div>
        <div className="teacher-profile">
          <div className="avatar">KA</div>
          <div>
            <strong>Karim Adel</strong>
            <span>Teacher</span>
          </div>
          <Icon name="more" />
        </div>
      </aside>
      <main className="teacher-main">
        {view === "dashboard" && <TeacherDashboard state={state} setView={setView} />}
        {view === "setup" && <ExamSetup state={state} update={update} setView={setView} setToast={setToast} />}
        {view === "guide" && (
          <MarkingGuide state={state} update={update} setView={setView} addHistory={addHistory} setToast={setToast} />
        )}
        {view === "submissions" && <Submissions state={state} setView={setView} />}
        {view === "ocr" && (
          <OCRReview
            state={state}
            setState={setState}
            update={update}
            addHistory={addHistory}
            setView={setView}
            setToast={setToast}
          />
        )}
        {view === "review" && (
          <MarkReview
            state={state}
            setState={setState}
            addHistory={addHistory}
            setView={setView}
            setToast={setToast}
          />
        )}
        {view === "gaps" && (
          <GapReview
            state={state}
            update={update}
            addHistory={addHistory}
            setView={setView}
            setToast={setToast}
          />
        )}
        {view === "publish" && (
          <PublishReview
            state={state}
            update={update}
            addHistory={addHistory}
            setView={setView}
            setToast={setToast}
          />
        )}
        {view === "examples" && (
          <SavedExamples
            state={state}
            setState={setState}
            addHistory={addHistory}
            setToast={setToast}
          />
        )}
        {view === "history" && <ReviewHistory history={state.history} />}
      </main>
    </div>
  );
}
