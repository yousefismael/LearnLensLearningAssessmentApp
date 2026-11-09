import type { DemoState, StudentView } from "../models/types";
import { previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";

export function Notifications({
  state,
  setView,
}: {
  state: DemoState;
  setView: (v: StudentView) => void;
}) {
  const notes = [
    ...(state.published
      ? [
          {
            title: `Your ${state.submittedExamName || "Fractions Check-in"} results are ready!`,
            text: "Mr. Adel shared your confirmed marks and a practice tip.",
            time: "Just now",
            action: "results" as StudentView,
            fresh: true,
          },
        ]
      : []),
    {
      title: "Exam received safely",
      text: `Your ${state.uploadedPages?.length || 3} ${state.submittedExamName || "Fractions Check-in"} page(s) are waiting for your teacher.`,
      time: "Today, 10:24",
      action: "receipt" as StudentView,
      fresh: !state.published,
    },
    {
      title: "New feedback from Mr. Adel",
      text: "“Great working, Alex! Keep showing your steps.”",
      time: "3 Oct",
      action: "results" as StudentView,
      fresh: false,
    },
    {
      title: "Practice recommendation",
      text: "Try 5 minutes of multiplication facts before your next quiz.",
      time: "3 Oct",
      action: "progress" as StudentView,
      fresh: false,
    },
  ];
  return (
    <div className="page student-page">
      <div className="page-heading">
        <p className="eyebrow student-blue">MESSAGES</p>
        <h1>Teacher messages</h1>
        <p>Results, feedback, comments and practice advice.</p>
      </div>
      <div className="notification-list">
        {notes.map((n, i) => (
          <button key={i} onClick={() => setView(n.action)} className={n.fresh ? "unread" : ""}>
            <span className="card-icon blue">
              <Icon name={i === 0 && state.published ? "spark" : "bell"} />
            </span>
            <div>
              <strong>{n.title}</strong>
              <p>{n.text}</p>
              <small>{n.time}</small>
            </div>
            {n.fresh && <i />}
            <Icon name="chevron" />
          </button>
        ))}
      </div>
    </div>
  );
}
