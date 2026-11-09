import type { DemoState, StudentView } from "../models/types";
import { previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { StudentHome } from "./StudentHome";
import { UploadFlow } from "./UploadFlow";
import { Receipt } from "./Receipt";
import { StudentResults } from "./StudentResults";
import { StudentProgress } from "./StudentProgress";
import { Notifications } from "./Notifications";

export function StudentApp({
  view,
  setView,
  state,
  update,
  setToast,
}: {
  view: StudentView;
  setView: (v: StudentView) => void;
  state: DemoState;
  update: (p: Partial<DemoState>) => void;
  setToast: (s: string) => void;
}) {
  const nav = [
    ["home", "home", "Home"],
    ["upload", "upload", "Upload exam"],
    ["results", "file", "My results"],
    ["progress", "chart", "My progress"],
    ["notifications", "bell", "Messages"],
  ] as [StudentView, string, string][];
  return (
    <div className="student-shell">
      <aside className="student-sidebar">
        <div className="student-profile">
          <div className="student-avatar">A</div>
          <div>
            <strong>Alex Morgan</strong>
            <span>Grade 4 • Oak Class</span>
          </div>
        </div>
        <nav>
          {nav.map(([id, icon, label]) => (
            <button
              key={id}
              className={view === id || (view === "receipt" && id === "upload") ? "active" : ""}
              onClick={() => setView(id)}
            >
              <Icon name={icon} size={20} />
              <span>{label}</span>
              {id === "notifications" && <i>{state.published ? 2 : 1}</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-help">
          <span>
            <Icon name="spark" size={18} />
          </span>
          <div>
            <strong>Need help?</strong>
            <small>Ask a grown-up or your teacher.</small>
          </div>
        </div>
      </aside>
      <main className="student-main">
        {view === "home" && <StudentHome state={state} setView={setView} />}
        {view === "upload" && <UploadFlow state={state} update={update} setView={setView} setToast={setToast} />}
        {view === "receipt" && <Receipt state={state} setView={setView} />}
        {view === "results" && <StudentResults state={state} setView={setView} />}
        {view === "progress" && <StudentProgress state={state} setView={setView} />}
        {view === "notifications" && <Notifications state={state} setView={setView} />}
      </main>
      <nav className="student-mobile-nav">
        {nav.slice(0, 5).map(([id, icon, label]) => (
          <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
            <Icon name={icon} size={19} />
            <small>{label.replace("My ", "")}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}
