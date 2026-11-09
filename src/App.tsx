import { useEffect, useState } from "react";
import type { Role, StudentView, TeacherView, DemoState } from "./models/types";
import { initialState } from "./models/demoData";
import { Icon, Logo } from "./components/ui";
import { StudentApp } from "./student/StudentApp";
import { TeacherApp } from "./teacher/TeacherApp";

function App() {
  const [role, setRole] = useState<Role>("teacher");
  const [studentView, setStudentView] = useState<StudentView>("home");
  const [teacherView, setTeacherView] = useState<TeacherView>("dashboard");
  const [toast, setToast] = useState("");
  const [state, setState] = useState<DemoState>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("learnlens-demo-v3") || "") as DemoState;
      return { ...initialState, ...stored, guideApproved: stored.guideApproved ?? initialState.guideApproved };
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    try { localStorage.setItem("learnlens-demo-v3", JSON.stringify(state)); }
    catch (e) { console.warn("Demo state exceeded browser storage; large uploaded files may not survive a refresh.", e); }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const update = (patch: Partial<DemoState>) => setState((s) => ({ ...s, ...patch }));
  const addHistory = (type: DemoState["history"][number]["type"], text: string) =>
    setState((s) => ({
      ...s,
      history: [{ id: Date.now(), type, text, time: "Just now" }, ...s.history],
    }));
  const reset = () => {
    setState(initialState);
    setRole("teacher");
    setTeacherView("dashboard");
    setStudentView("home");
    localStorage.removeItem("learnlens-demo-v3");
    setToast("Demo reset to the starting workflow.");
  };

  return (
    <div className={`app ${role}`}>
      <header className="topbar">
        <Logo dark={role === "teacher"} />
        <div className="top-actions">
          <div className="role-switch" aria-label="Switch role">
            <button
              className={role === "student" ? "selected" : ""}
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              className={role === "teacher" ? "selected" : ""}
              onClick={() => setRole("teacher")}
            >
              Teacher
            </button>
          </div>
          <button className="reset-btn" onClick={reset} title="Reset all demo progress">
            <Icon name="history" size={17} /> <span>Reset demo</span>
          </button>
          <div className="avatar">{role === "student" ? "AM" : "KA"}</div>
        </div>
      </header>
      {role === "student" ? (
        <StudentApp
          view={studentView}
          setView={setStudentView}
          state={state}
          update={update}
          setToast={setToast}
        />
      ) : (
        <TeacherApp
          view={teacherView}
          setView={setTeacherView}
          state={state}
          setState={setState}
          update={update}
          addHistory={addHistory}
          setToast={setToast}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
