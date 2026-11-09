import { useEffect, useMemo, useRef, useState } from "react";

type Role = "student" | "teacher";
type StudentView = "home" | "upload" | "receipt" | "results" | "progress" | "notifications";
type TeacherView =
  | "dashboard"
  | "setup"
  | "guide"
  | "submissions"
  | "ocr"
  | "review"
  | "gaps"
  | "publish"
  | "examples"
  | "history";
type Question = {
  id: number;
  prompt: string;
  original: string;
  ocr: string;
  corrected: string;
  answer: string;
  max: number;
  suggested: number;
  final: number;
  reason: string;
  confidence: "High" | "Medium" | "Low";
  rubric: string;
  checked: boolean;
  confirmed: boolean;
};
type DemoState = {
  submitted: boolean;
  receiptId: string;
  ocrApproved: boolean;
  redFlag: "confirmed" | "dismissed" | null;
  feedback: string;
  feedbackApproved: boolean;
  practice: string;
  teacherComment: string;
  published: boolean;
  questions: Question[];
  examples: {
    id: number;
    answer: string;
    suggestion: string;
    decision: string;
    reason: string;
    course: string;
  }[];
  history: {
    id: number;
    type: "OCR" | "Rubric" | "Grading" | "Feedback" | "Red flag";
    text: string;
    time: string;
  }[];
};

const initialQuestions: Question[] = [
  {
    id: 1,
    prompt: "Write 3/4 as a decimal.",
    original: "3 ÷ 4 = 0.75",
    ocr: "3 ÷ 4 = O.75",
    corrected: "3 ÷ 4 = 0.75",
    answer: "0.75",
    max: 2,
    suggested: 2,
    final: 2,
    reason: "Correct conversion and working shown.",
    confidence: "High",
    rubric: "Correct method: 1 • Correct answer: 1",
    checked: false,
    confirmed: false,
  },
  {
    id: 2,
    prompt: "Add 1/2 + 1/3. Show your working.",
    original: "1/2 + 1/3 = 2/5",
    ocr: "1/2 + 1/3 = 2/S",
    corrected: "1/2 + 1/3 = 2/5",
    answer: "5/6",
    max: 3,
    suggested: 0.5,
    final: 1,
    reason: "Fractions were added without a common denominator.",
    confidence: "Medium",
    rubric: "Common denominator: 1 • Method: 1 • Answer: 1",
    checked: false,
    confirmed: false,
  },
  {
    id: 3,
    prompt: "Which is greater: 2/3 or 3/5? Explain.",
    original: "3/5 because 3 is bigger than 2",
    ocr: "3/5 because 3 is bigger than Z",
    corrected: "3/5 because 3 is bigger than 2",
    answer: "2/3; valid comparison",
    max: 3,
    suggested: 0,
    final: 0,
    reason: "Compared numerators rather than the values of the fractions.",
    confidence: "High",
    rubric: "Correct choice: 1 • Comparison method: 1 • Explanation: 1",
    checked: false,
    confirmed: false,
  },
  {
    id: 4,
    prompt: "Lina ate 2/8 of a pizza. Simplify the fraction.",
    original: "2/8 = 1/4",
    ocr: "2/8 = 1/4",
    corrected: "2/8 = 1/4",
    answer: "1/4",
    max: 2,
    suggested: 2,
    final: 2,
    reason: "Correctly simplified by dividing by 2.",
    confidence: "High",
    rubric: "Method: 1 • Correct answer: 1",
    checked: false,
    confirmed: false,
  },
];

const initialState: DemoState = {
  submitted: true,
  receiptId: "LL-24018",
  ocrApproved: false,
  redFlag: null,
  feedback:
    "You showed your working clearly and simplified a fraction correctly. Next, use a common denominator before adding or comparing fractions.",
  feedbackApproved: false,
  practice:
    "Complete the 5-minute “Fraction bridges” practice and compare three pairs using a number line.",
  teacherComment: "Great effort, Alex. Let’s practise one fraction strategy together this week.",
  published: false,
  questions: initialQuestions,
  examples: [
    {
      id: 1,
      answer: "1/2 + 1/3 = 2/5",
      suggestion: "0.5 / 3",
      decision: "1 / 3",
      reason: "Correct intent and one relevant step; award method credit.",
      course: "Grade 4 Mathematics",
    },
  ],
  history: [
    {
      id: 1,
      type: "Rubric",
      text: "Karim approved Fractions Check-in marking guide v2.",
      time: "Today, 08:42",
    },
    {
      id: 2,
      type: "OCR",
      text: "OCR flagged 3 low-confidence symbols in Alex Morgan’s paper.",
      time: "Today, 09:16",
    },
    {
      id: 3,
      type: "Grading",
      text: "Saved course example for partial method credit.",
      time: "12 Oct, 14:05",
    },
    {
      id: 4,
      type: "Feedback",
      text: "Edited Number Skills feedback to include one next step.",
      time: "08 Oct, 11:30",
    },
    {
      id: 5,
      type: "Red flag",
      text: "Dismissed place-value support suggestion after checking classwork.",
      time: "08 Oct, 11:28",
    },
  ],
};

const previousResults = [
  { name: "Place Value Quiz", date: "18 Sep", score: 7, total: 10, topic: "Place value" },
  { name: "Number Skills", date: "03 Oct", score: 8, total: 10, topic: "Multiplication" },
];

const iconPaths: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 15v5h16v-5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
  scan: (
    <>
      <path d="M3 7V4a1 1 0 0 1 1-1h3" />
      <path d="M17 3h3a1 1 0 0 1 1 1v3" />
      <path d="M21 17v3a1 1 0 0 1-1 1h-3" />
      <path d="M7 21H4a1 1 0 0 1-1-1v-3" />
      <path d="M7 12h10" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5Z" />
      <path d="m19 15-.7 2.3L16 18l2.3.7L19 21l.7-2.3L22 18l-2.3-.7Z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1.03H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10.03 3.1V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.9 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4 16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4l1.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  reorder: (
    <>
      <path d="m8 6 4-4 4 4" />
      <path d="M12 2v20" />
      <path d="m8 18 4 4 4-4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "student";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "gray" | "purple";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function ProgressSteps({ active }: { active: number }) {
  return (
    <div className="steps" aria-label={`Step ${active} of 4`}>
      {["Choose exam", "Add pages", "Check pages", "Send"].map((step, i) => (
        <div
          className={`step ${i + 1 <= active ? "done" : ""} ${i + 1 === active ? "active" : ""}`}
          key={step}
        >
          <span>{i + 1 < active ? <Icon name="check" size={15} /> : i + 1}</span>
          <small>{step}</small>
        </div>
      ))}
    </div>
  );
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`logo ${dark ? "logo-dark" : ""}`}>
      <span className="logo-mark">
        <Icon name="spark" size={19} />
      </span>
      <span>LearnLens</span>
    </div>
  );
}

function App() {
  const [role, setRole] = useState<Role>("teacher");
  const [studentView, setStudentView] = useState<StudentView>("home");
  const [teacherView, setTeacherView] = useState<TeacherView>("dashboard");
  const [toast, setToast] = useState("");
  const [state, setState] = useState<DemoState>(() => {
    try {
      return JSON.parse(localStorage.getItem("learnlens-demo-v3") || "") as DemoState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem("learnlens-demo-v3", JSON.stringify(state));
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

function StudentApp({
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
        {view === "upload" && <UploadFlow update={update} setView={setView} setToast={setToast} />}
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

function StudentHome({ state, setView }: { state: DemoState; setView: (v: StudentView) => void }) {
  return (
    <div className="page student-page">
      <div className="welcome-row">
        <div>
          <p className="eyebrow student-blue">MONDAY, 21 OCTOBER</p>
          <h1>Hi Alex, ready to learn?</h1>
          <p>Everything you need for your Grade 4 assessments is right here.</p>
        </div>
        <div className="streak">
          <span>
            <Icon name="spark" size={22} />
          </span>
          <div>
            <strong>3 exam streak</strong>
            <small>Keep up the great work!</small>
          </div>
        </div>
      </div>
      <section className="student-hero">
        <div className="hero-art">
          <div className="paper paper-a">½</div>
          <div className="paper paper-b">¾</div>
          <div className="lens-ring">
            <Icon name="scan" size={34} />
          </div>
        </div>
        <div className="hero-copy">
          <Badge tone={state.submitted ? "amber" : "blue"}>
            {state.submitted ? "Waiting for teacher" : "NEW ASSIGNMENT"}
          </Badge>
          <h2>{state.submitted ? "Fractions Check-in submitted" : "Fractions Check-in"}</h2>
          <p>
            {state.submitted
              ? "Your 3 pages are safe. Your teacher will check them before you see any marks."
              : "Upload your completed pages. Check each photo, then send it to your teacher."}
          </p>
          <div className="meta-row">
            <span>
              <Icon name="book" size={17} /> Mathematics
            </span>
            <span>Grade 4</span>
            <span>10 marks</span>
          </div>
          <Button variant="student" onClick={() => setView(state.submitted ? "receipt" : "upload")}>
            {state.submitted ? "Check status" : "Start upload"} <Icon name="chevron" size={17} />
          </Button>
        </div>
      </section>
      <div className="section-title">
        <div>
          <h2>Your learning</h2>
          <p>See what’s new and what to practise next.</p>
        </div>
        <button onClick={() => setView("progress")}>
          View all progress <Icon name="chevron" size={16} />
        </button>
      </div>
      <div className="student-grid">
        <button className="learning-card result-card" onClick={() => setView("results")}>
          <span className="card-icon green">
            <Icon name="check" size={22} />
          </span>
          <div>
            <Badge tone="green">LATEST RESULT</Badge>
            <h3>Number Skills</h3>
            <p>Your teacher left feedback</p>
            <strong>
              8 <small>/ 10</small>
            </strong>
          </div>
          <Icon name="chevron" className="arrow" />
        </button>
        <button className="learning-card practice-card" onClick={() => setView("progress")}>
          <span className="card-icon purple">
            <Icon name="spark" size={22} />
          </span>
          <div>
            <Badge tone="purple">PRACTISE NEXT</Badge>
            <h3>Comparing fractions</h3>
            <p>One small step at a time</p>
            <span className="mini-progress">
              <i style={{ width: "40%" }} />
            </span>
          </div>
          <Icon name="chevron" className="arrow" />
        </button>
        <button className="learning-card message-card" onClick={() => setView("notifications")}>
          <span className="card-icon blue">
            <Icon name="bell" size={22} />
          </span>
          <div>
            <Badge tone="blue">TEACHER MESSAGE</Badge>
            <h3>“Great working, Alex!”</h3>
            <p>From Mr. Adel • Number Skills</p>
          </div>
          <Icon name="chevron" className="arrow" />
        </button>
      </div>
    </div>
  );
}

function UploadFlow({
  update,
  setView,
  setToast,
}: {
  update: (p: Partial<DemoState>) => void;
  setView: (v: StudentView) => void;
  setToast: (s: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("Grade 4 Mathematics");
  const [exam, setExam] = useState("Fractions Check-in");
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const addPages = (count = 3) => {
    setLoading(true);
    setError("");
    window.setTimeout(() => {
      setPages((p) => [
        ...p,
        ...Array.from({ length: count }, (_, i) => `Page ${p.length + i + 1}`),
      ]);
      setLoading(false);
      setStep(3);
    }, 700);
  };
  const move = (i: number, dir: number) => {
    const next = [...pages],
      j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setPages(next);
  };
  const send = () => {
    if (!pages.length) {
      setError("Add at least one page before sending. Your selection is still saved.");
      return;
    }
    setLoading(true);
    setStep(4);
    window.setTimeout(() => {
      update({
        submitted: true,
        receiptId: `LL-${Math.floor(10000 + Math.random() * 89999)}`,
        ocrApproved: false,
        published: false,
        feedbackApproved: false,
        redFlag: null,
        questions: initialQuestions,
      });
      setLoading(false);
      setToast("Exam sent safely. All pages were received.");
      setView("receipt");
    }, 1000);
  };
  return (
    <div className="page student-page upload-page">
      <div className="page-heading">
        <button className="back-link" onClick={() => setView("home")}>
          ‹ Back home
        </button>
        <h1>Upload your exam</h1>
        <p>We’ll keep your pages safe while you check them.</p>
      </div>
      <ProgressSteps active={step} />
      {step === 1 && (
        <section className="upload-card">
          <div className="upload-card-head">
            <span>1</span>
            <div>
              <h2>Choose your exam</h2>
              <p>Make sure it matches the name on your paper.</p>
            </div>
          </div>
          <div className="field-grid">
            <label>
              Subject
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option>Grade 4 Mathematics</option>
                <option>Grade 4 English</option>
                <option>Deutsch • Klasse 4</option>
              </select>
            </label>
            <label>
              Exam
              <select value={exam} onChange={(e) => setExam(e.target.value)}>
                <option>Fractions Check-in</option>
                <option>Number Skills</option>
                <option>Brüche und Größen</option>
              </select>
            </label>
          </div>
          <div className="chosen-exam">
            <span className="card-icon blue">
              <Icon name="file" size={22} />
            </span>
            <div>
              <small>YOU’RE SENDING TO</small>
              <strong>{exam}</strong>
              <span>{subject} • 3 pages expected • 10 marks</span>
            </div>
            <Icon name="check" className="chosen-check" />
          </div>
          <Button variant="student" onClick={() => setStep(2)} className="align-right">
            Continue to pages <Icon name="chevron" size={17} />
          </Button>
        </section>
      )}
      {step >= 2 && (
        <section className="upload-card">
          <div className="upload-card-head">
            <span>2</span>
            <div>
              <h2>Add your pages</h2>
              <p>Use clear photos or choose saved scans. You can mix both.</p>
            </div>
          </div>
          <div className="upload-actions">
            <button onClick={() => fileRef.current?.click()}>
              <span>
                <Icon name="upload" size={25} />
              </span>
              <strong>Choose files</strong>
              <small>PDF, JPG or PNG</small>
            </button>
            <button onClick={() => cameraRef.current?.click()}>
              <span>
                <Icon name="camera" size={25} />
              </span>
              <strong>Take photos</strong>
              <small>Use your camera</small>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              multiple
              hidden
              onChange={(e) => addPages(Math.max(1, Math.min(e.target.files?.length || 1, 4)))}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              hidden
              onChange={() => addPages(1)}
            />
          </div>
          {loading && (
            <div className="loading-row">
              <span className="spinner" /> Reading your pages…
            </div>
          )}
          {!pages.length && !loading && (
            <button className="demo-add" onClick={() => addPages(3)}>
              Use 3 demo exam pages
            </button>
          )}
          {pages.length > 0 && (
            <div className="pages-head">
              <div>
                <h3>Check your pages</h3>
                <p>Is every page here and easy to read?</p>
              </div>
              <Badge tone="green">{pages.length} pages added</Badge>
            </div>
          )}
          <div className="page-previews">
            {pages.map((page, i) => (
              <div className="page-preview" key={`${page}-${i}`}>
                <div className="scan-paper">
                  <span>{i + 1}</span>
                  <h4>Fractions Check-in</h4>
                  <p>
                    Q{i + 1}. &nbsp; 1/{i + 2} + 1/{i + 3}
                  </p>
                  <em>
                    {i === 1 ? "1/2 + 1/3 = 2/5" : i === 2 ? "3/5 is bigger" : "3 ÷ 4 = 0.75"}
                  </em>
                  <div className="scribble" />
                </div>
                <div className="preview-info">
                  <strong>{page}</strong>
                  <span>
                    <i /> Clear and readable
                  </span>
                  <div>
                    <button onClick={() => fileRef.current?.click()}>Replace</button>
                    <button onClick={() => move(i, -1)} disabled={i === 0}>
                      ↑
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === pages.length - 1}>
                      ↓
                    </button>
                    <button
                      onClick={() => setPages((p) => p.filter((_, x) => x !== i))}
                      aria-label={`Remove ${page}`}
                    >
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {error && (
            <div className="error-state">
              <strong>We couldn’t send yet.</strong>
              <span>{error}</span>
            </div>
          )}
          {pages.length > 0 && (
            <label className="check-confirm">
              <input type="checkbox" onChange={(e) => setStep(e.target.checked ? 3 : 2)} />
              <span>
                <Icon name="check" size={16} />
              </span>
              I checked that all pages are included, readable, and in the right order.
            </label>
          )}
          <div className="form-footer">
            <Button variant="secondary" onClick={() => setView("home")}>
              Save and finish later
            </Button>
            <Button variant="student" disabled={step < 3 || loading} onClick={send}>
              {loading ? "Sending…" : "Send exam safely"} <Icon name="chevron" size={17} />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Receipt({ state, setView }: { state: DemoState; setView: (v: StudentView) => void }) {
  return (
    <div className="page student-page receipt-page">
      <div className="success-mark">
        <Icon name="check" size={34} />
      </div>
      <Badge tone="green">EXAM RECEIVED</Badge>
      <h1>Nice work, Alex!</h1>
      <p>Your Fractions Check-in was sent safely.</p>
      <section className="receipt-card">
        <div className="receipt-top">
          <div>
            <small>SUBMISSION RECEIPT</small>
            <h2>Fractions Check-in</h2>
            <p>Grade 4 Mathematics</p>
          </div>
          <Badge tone="gray">{state.receiptId}</Badge>
        </div>
        <div className="receipt-details">
          <span>
            <Icon name="file" />
            <div>
              <small>PAGES RECEIVED</small>
              <strong>3 of 3 pages</strong>
            </div>
          </span>
          <span>
            <Icon name="history" />
            <div>
              <small>SENT</small>
              <strong>Today, 10:24 AM</strong>
            </div>
          </span>
        </div>
        <div className="status-timeline">
          <div className="complete">
            <span>
              <Icon name="check" size={15} />
            </span>
            <div>
              <strong>Exam sent</strong>
              <small>All pages received</small>
            </div>
          </div>
          <div className="current">
            <span>2</span>
            <div>
              <strong>Waiting for your teacher</strong>
              <small>Your answers and marks are not ready yet</small>
            </div>
          </div>
          <div>
            <span>3</span>
            <div>
              <strong>Results ready</strong>
              <small>We’ll send you a message</small>
            </div>
          </div>
        </div>
      </section>
      <div className="what-next">
        <span>
          <Icon name="bell" />
        </span>
        <div>
          <strong>What happens next?</strong>
          <p>
            Your teacher checks your answers and marks your exam. You’ll get a message when your
            confirmed results are ready.
          </p>
        </div>
      </div>
      <Button variant="student" onClick={() => setView("home")}>
        Back to home
      </Button>
    </div>
  );
}

function StudentResults({
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

function StudentProgress({
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

function Notifications({
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
            title: "Your Fractions results are ready!",
            text: "Mr. Adel shared your confirmed marks and a practice tip.",
            time: "Just now",
            action: "results" as StudentView,
            fresh: true,
          },
        ]
      : []),
    {
      title: "Exam received safely",
      text: "Your 3 Fractions Check-in pages are waiting for your teacher.",
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

function TeacherApp({
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
        {view === "setup" && <ExamSetup setView={setView} setToast={setToast} />}
        {view === "guide" && (
          <MarkingGuide setView={setView} addHistory={addHistory} setToast={setToast} />
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

function TeacherHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="teacher-heading">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}

function TeacherDashboard({
  state,
  setView,
}: {
  state: DemoState;
  setView: (v: TeacherView) => void;
}) {
  const confirmed = state.questions.filter((q) => q.confirmed).length;
  const next: TeacherView = !state.ocrApproved
    ? "ocr"
    : confirmed < 4
      ? "review"
      : !state.redFlag
        ? "gaps"
        : "publish";
  return (
    <div className="teacher-page">
      <TeacherHeader eyebrow="MONDAY, 21 OCTOBER" title="Good morning, Karim">
        <Button onClick={() => setView("setup")}>
          <Icon name="plus" size={17} /> Create assessment
        </Button>
      </TeacherHeader>
      <div className="metric-grid">
        <div>
          <span className="metric-icon blue">
            <Icon name="file" />
          </span>
          <div>
            <small>ACTIVE ASSESSMENTS</small>
            <strong>4</strong>
            <p>Across 2 courses</p>
          </div>
        </div>
        <div>
          <span className="metric-icon amber">
            <Icon name="scan" />
          </span>
          <div>
            <small>NEED REVIEW</small>
            <strong>7</strong>
            <p>3 OCR • 4 marks</p>
          </div>
        </div>
        <div>
          <span className="metric-icon green">
            <Icon name="check" />
          </span>
          <div>
            <small>READY TO SHARE</small>
            <strong>2</strong>
            <p>All reviews complete</p>
          </div>
        </div>
        <div>
          <span className="metric-icon purple">
            <Icon name="spark" />
          </span>
          <div>
            <small>COURSE EXAMPLES</small>
            <strong>{state.examples.length}</strong>
            <p>Approved corrections</p>
          </div>
        </div>
      </div>
      <div className="teacher-grid-main">
        <section className="panel review-queue">
          <div className="panel-head">
            <div>
              <h2>Review queue</h2>
              <p>Continue each submission from its next required step.</p>
            </div>
            <button onClick={() => setView("submissions")}>
              View all <Icon name="chevron" size={15} />
            </button>
          </div>
          <button className="queue-item priority" onClick={() => setView(next)}>
            <div className="student-initial">AM</div>
            <div className="queue-name">
              <strong>Alex Morgan</strong>
              <span>Fractions Check-in • Submitted 10:24</span>
            </div>
            <Badge tone={state.published ? "green" : "amber"}>
              {state.published
                ? "Published"
                : !state.ocrApproved
                  ? "Check OCR"
                  : confirmed < 4
                    ? "Review marks"
                    : !state.redFlag
                      ? "Support review"
                      : "Ready to share"}
            </Badge>
            <div className="queue-progress">
              <i
                style={{
                  width: state.published
                    ? "100%"
                    : state.ocrApproved
                      ? confirmed === 4
                        ? "80%"
                        : "50%"
                      : "20%",
                }}
              />
            </div>
            <Icon name="chevron" />
          </button>
          <button className="queue-item" onClick={() => setView("review")}>
            <div className="student-initial teal">SJ</div>
            <div className="queue-name">
              <strong>Sara Jones</strong>
              <span>Fractions Check-in • Yesterday</span>
            </div>
            <Badge tone="blue">Review marks</Badge>
            <div className="queue-progress">
              <i style={{ width: "50%" }} />
            </div>
            <Icon name="chevron" />
          </button>
          <button className="queue-item" onClick={() => setView("publish")}>
            <div className="student-initial purple">LK</div>
            <div className="queue-name">
              <strong>Lina Khalil</strong>
              <span>Number Skills • Yesterday</span>
            </div>
            <Badge tone="purple">Check feedback</Badge>
            <div className="queue-progress">
              <i style={{ width: "82%" }} />
            </div>
            <Icon name="chevron" />
          </button>
        </section>
        <aside className="panel class-insight">
          <div className="panel-head">
            <div>
              <h2>Class insight</h2>
              <p>Confirmed patterns only</p>
            </div>
          </div>
          <div className="insight-donut">
            <div>
              <strong>6</strong>
              <span>students</span>
            </div>
          </div>
          <h3>Comparing fractions</h3>
          <p>Recurring in 2 assessments. Open the evidence before planning support.</p>
          <Button variant="secondary" onClick={() => setView("gaps")}>
            Review learning gaps
          </Button>
        </aside>
      </div>
      <section className="panel assessments-table">
        <div className="panel-head">
          <div>
            <h2>Recent assessments</h2>
            <p>Setup, review and sharing status.</p>
          </div>
          <button onClick={() => setView("setup")}>
            Manage assessments <Icon name="chevron" size={15} />
          </button>
        </div>
        <div className="table-row table-head">
          <span>Assessment</span>
          <span>Submissions</span>
          <span>Review progress</span>
          <span>Status</span>
          <span />
        </div>
        {[
          ["Fractions Check-in", "18 / 24", "12 reviewed", "In review"],
          ["Number Skills", "24 / 24", "24 reviewed", "Published"],
          ["Brüche und Größen", "20 / 22", "Guide approved", "Collecting"],
        ].map((r, i) => (
          <button
            className="table-row"
            key={r[0]}
            onClick={() => setView(i === 0 ? "submissions" : "guide")}
          >
            <span>
              <b>{r[0]}</b>
              <small>{i === 2 ? "Deutsch • Grade 4" : "Mathematics • Grade 4"}</small>
            </span>
            <span>{r[1]}</span>
            <span>{r[2]}</span>
            <span>
              <Badge tone={i === 0 ? "amber" : i === 1 ? "green" : "blue"}>{r[3]}</Badge>
            </span>
            <Icon name="more" />
          </button>
        ))}
      </section>
    </div>
  );
}

function ExamSetup({
  setView,
  setToast,
}: {
  setView: (v: TeacherView) => void;
  setToast: (s: string) => void;
}) {
  const [name, setName] = useState("Fractions Check-in");
  const [files, setFiles] = useState<string[]>([
    "Blank exam • fractions-check-in.pdf",
    "Answer key • fractions-key.pdf",
    "Graded example • alex-sample.pdf",
  ]);
  const [boundaries, setBoundaries] = useState([
    "Q1 • Page 1 • 2 marks",
    "Q2 • Page 1 • 3 marks",
    "Q3 • Page 2 • 3 marks",
    "Q4 • Page 3 • 2 marks",
  ]);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="teacher-page">
      <TeacherHeader eyebrow="ASSESSMENTS / NEW" title="Set up an assessment">
        <Badge tone="gray">Draft</Badge>
      </TeacherHeader>
      <div className="workflow-banner">
        <div>
          <span>1</span>
          <strong>Assessment details</strong>
        </div>
        <i />
        <div>
          <span>2</span>
          <strong>Reference material</strong>
        </div>
        <i />
        <div>
          <span>3</span>
          <strong>Marking guide</strong>
        </div>
      </div>
      <section className="panel form-panel">
        <div className="panel-head">
          <div>
            <h2>Assessment details</h2>
            <p>Define the structure students and reviewers will use.</p>
          </div>
        </div>
        <div className="teacher-form-grid">
          <label>
            Assessment name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Course
            <select>
              <option>Grade 4 Mathematics • Oak</option>
              <option>Grade 4 Deutsch • Oak</option>
            </select>
          </label>
          <label>
            Subject
            <select>
              <option>Mathematics</option>
              <option>English</option>
              <option>Deutsch</option>
            </select>
          </label>
          <label>
            Grade level
            <select>
              <option>Grade 4</option>
              <option>Grade 1</option>
              <option>Grade 2</option>
              <option>Grade 3</option>
              <option>Grade 5</option>
            </select>
          </label>
          <label>
            Total marks
            <input type="number" defaultValue={10} />
          </label>
          <label>
            Exam language
            <select>
              <option>English</option>
              <option>German</option>
              <option>Automatic detection</option>
            </select>
          </label>
        </div>
      </section>
      <div className="setup-columns">
        <section className="panel form-panel">
          <div className="panel-head">
            <div>
              <h2>Exam paper & boundaries</h2>
              <p>Upload the blank paper and confirm each question.</p>
            </div>
          </div>
          <button className="teacher-dropzone" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" />
            <strong>Upload blank exam</strong>
            <small>PDF, JPG or PNG • up to 20 MB</small>
          </button>
          <input
            ref={fileRef}
            hidden
            type="file"
            onChange={(e) =>
              e.target.files?.[0] &&
              setFiles((f) => [`${e.target.files![0].name} • Blank exam`, ...f])
            }
          />
          <div className="boundary-list">
            {boundaries.map((b, i) => (
              <div key={i}>
                <span>
                  <Icon name="file" size={16} />
                  {b}
                </span>
                <button onClick={() => setBoundaries((x) => x.filter((_, j) => j !== i))}>
                  <Icon name="close" size={15} />
                </button>
              </div>
            ))}
            <button
              className="add-boundary"
              onClick={() => setBoundaries((b) => [...b, `Q${b.length + 1} • Page 3 • 1 mark`])}
            >
              <Icon name="plus" size={16} /> Add question boundary
            </button>
          </div>
        </section>
        <section className="panel form-panel">
          <div className="panel-head">
            <div>
              <h2>Reference material</h2>
              <p>Label sources so AI uses them for the intended purpose.</p>
            </div>
          </div>
          <div className="reference-buttons">
            {[
              "Solved answer key",
              "Rubric / marking scheme",
              "Graded sample",
              "Solved + graded sample",
            ].map((x, i) => (
              <button
                key={x}
                onClick={() =>
                  setFiles((f) => [...f, `${x} • uploaded-source-${f.length + 1}.pdf`])
                }
              >
                <Icon name={i === 1 ? "book" : "file"} />
                <span>
                  <strong>{x}</strong>
                  <small>Upload and label</small>
                </span>
                <Icon name="plus" />
              </button>
            ))}
          </div>
          <div className="uploaded-files">
            {files.slice(0, 4).map((f, i) => (
              <div key={`${f}-${i}`}>
                <span>
                  <Icon name="check" size={15} />
                </span>
                <p>{f}</p>
                <button onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}>
                  <Icon name="close" size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="sticky-actions">
        <Button variant="secondary" onClick={() => setView("dashboard")}>
          Save draft
        </Button>
        <div>
          <span>
            {files.length} sources • {boundaries.length} questions
          </span>
          <Button
            onClick={() => {
              setToast("AI draft created from your labelled sources.");
              setView("guide");
            }}
          >
            Create draft marking guide <Icon name="spark" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MarkingGuide({
  setView,
  addHistory,
  setToast,
}: {
  setView: (v: TeacherView) => void;
  addHistory: (t: DemoState["history"][number]["type"], s: string) => void;
  setToast: (s: string) => void;
}) {
  const [criteria, setCriteria] = useState(initialQuestions.map((q) => ({ ...q })));
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
        <Badge tone="amber">
          <Icon name="spark" size={13} /> Draft • needs approval
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
              <p>10 marks in total</p>
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
                    defaultValue={
                      i === 1
                        ? "Adds numerators and denominators"
                        : i === 2
                          ? "Compares numerators only"
                          : "Calculation / notation"
                    }
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
                "Approved Fractions Check-in marking guide after reviewing all source evidence.",
              );
              setToast("Marking guide approved. Submissions can now be graded after OCR approval.");
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

function Submissions({ state, setView }: { state: DemoState; setView: (v: TeacherView) => void }) {
  const [filter, setFilter] = useState("All review steps");
  const [search, setSearch] = useState("");
  const confirmed = state.questions.filter((q) => q.confirmed).length;
  const rows = [
    {
      name: "Alex Morgan",
      initials: "AM",
      status: state.published
        ? "Published"
        : !state.ocrApproved
          ? "Check scanned answers"
          : confirmed < 4
            ? "Review suggested marks"
            : !state.redFlag
              ? "Review support flag"
              : "Check feedback & share",
      time: "Today, 10:24",
      action: !state.ocrApproved
        ? "ocr"
        : confirmed < 4
          ? "review"
          : !state.redFlag
            ? "gaps"
            : "publish",
    },
    {
      name: "Sara Jones",
      initials: "SJ",
      status: "Review suggested marks",
      time: "Yesterday, 16:40",
      action: "review",
    },
    {
      name: "Lina Khalil",
      initials: "LK",
      status: "Check feedback & share",
      time: "Yesterday, 15:12",
      action: "publish",
    },
    {
      name: "Jonas Weber",
      initials: "JW",
      status: "Waiting for clearer scan",
      time: "Yesterday, 14:08",
      action: "ocr",
    },
    {
      name: "Mia Braun",
      initials: "MB",
      status: "Published",
      time: "19 Oct, 12:10",
      action: "publish",
    },
  ].filter(
    (x) =>
      x.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All review steps" || x.status === filter),
  );
  return (
    <div className="teacher-page">
      <TeacherHeader eyebrow="GRADE 4 MATHEMATICS / FRACTIONS CHECK-IN" title="Student submissions">
        <Button variant="secondary" onClick={() => setView("guide")}>
          <Icon name="book" size={17} /> View marking guide
        </Button>
      </TeacherHeader>
      <div className="readiness-strip">
        <span>
          <Icon name="check" /> Answer key uploaded
        </span>
        <span>
          <Icon name="check" /> Marking guide approved
        </span>
        <span>
          <Icon name="check" /> 18 of 24 submitted
        </span>
      </div>
      <section className="panel submission-panel">
        <div className="filter-row">
          <label className="search">
            <span>⌕</span>
            <input
              placeholder="Search student…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All review steps</option>
            <option>Check scanned answers</option>
            <option>Review suggested marks</option>
            <option>Check feedback & share</option>
            <option>Published</option>
          </select>
          <select>
            <option>Newest first</option>
            <option>Student name</option>
          </select>
        </div>
        <div className="submission-table">
          <div className="submission-row head">
            <span>Student</span>
            <span>Submitted</span>
            <span>Progress</span>
            <span>Next step</span>
            <span />
          </div>
          {rows.map((r, i) => (
            <button
              className="submission-row"
              key={r.name}
              onClick={() => setView(r.action as TeacherView)}
            >
              <span className="student-cell">
                <i className={`student-initial c${i}`}>{r.initials}</i>
                <div>
                  <strong>{r.name}</strong>
                  <small>
                    {r.name === "Jonas Weber" ? "German answer detected" : "English • 3 pages"}
                  </small>
                </div>
              </span>
              <span>{r.time}</span>
              <span className="mini-workflow">
                <i className="done" />
                <i className={r.status.includes("scanned") ? "current" : "done"} />
                <i
                  className={
                    r.status.includes("marks")
                      ? "current"
                      : r.status.includes("scanned")
                        ? ""
                        : "done"
                  }
                />
                <i
                  className={
                    r.status.includes("feedback")
                      ? "current"
                      : r.status === "Published"
                        ? "done"
                        : ""
                  }
                />
              </span>
              <span>
                <Badge
                  tone={
                    r.status === "Published"
                      ? "green"
                      : r.status.includes("clearer")
                        ? "red"
                        : r.status.includes("marks")
                          ? "blue"
                          : "amber"
                  }
                >
                  {r.status}
                </Badge>
              </span>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewWorkflow({ current }: { current: number }) {
  return (
    <div className="review-workflow">
      {["OCR checked", "Marks confirmed", "Support reviewed", "Feedback & share"].map((x, i) => (
        <div className={i < current ? "done" : i === current ? "current" : ""} key={x}>
          <span>{i < current ? <Icon name="check" size={14} /> : i + 1}</span>
          <small>{x}</small>
        </div>
      ))}
    </div>
  );
}

function OCRReview({
  state,
  setState,
  update,
  addHistory,
  setView,
  setToast,
}: {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
  update: (p: Partial<DemoState>) => void;
  addHistory: (t: DemoState["history"][number]["type"], s: string) => void;
  setView: (v: TeacherView) => void;
  setToast: (s: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState("Automatic detection");
  const [requesting, setRequesting] = useState(false);
  const [fitPage, setFitPage] = useState(true);
  const q = state.questions[index];
  const allChecked = state.questions.every((x) => x.checked);
  const changeText = (value: string) =>
    setState((s) => ({
      ...s,
      questions: s.questions.map((x, i) => (i === index ? { ...x, corrected: value } : x)),
    }));
  const markChecked = () => {
    const changed = q.corrected !== q.ocr;
    setState((s) => ({
      ...s,
      questions: s.questions.map((x, i) => (i === index ? { ...x, checked: true } : x)),
    }));
    if (changed)
      addHistory(
        "OCR",
        `Corrected Q${q.id} transcript from “${q.ocr}” to “${q.corrected}”. Student’s own answer preserved.`,
      );
    setToast(`Question ${q.id} checked.${index < 3 ? " Moving to the next answer." : ""}`);
    if (index < 3) setIndex(index + 1);
  };
  return (
    <div className="teacher-page review-page">
      <TeacherHeader
        eyebrow="SUBMISSIONS / ALEX MORGAN / FRACTIONS CHECK-IN"
        title="Check scanned answers"
      >
        <Badge tone={allChecked ? "green" : "amber"}>
          {state.questions.filter((x) => x.checked).length} of 4 checked
        </Badge>
      </TeacherHeader>
      <ReviewWorkflow current={0} />
      <div className="review-context">
        <div>
          <div className="student-initial">AM</div>
          <span>
            <strong>Alex Morgan</strong>
            <small>3 pages • Submitted today, 10:24</small>
          </span>
        </div>
        <label>
          Content language
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>Automatic detection</option>
            <option>English</option>
            <option>German</option>
          </select>
        </label>
      </div>
      <div className="question-tabs">
        {state.questions.map((x, i) => (
          <button key={x.id} onClick={() => setIndex(i)} className={i === index ? "active" : ""}>
            <span>{x.checked ? <Icon name="check" size={13} /> : x.id}</span>Question {x.id}
            {!x.checked && i < 3 && <i />}
          </button>
        ))}
      </div>
      <div className="ocr-layout">
        <section className="panel original-panel">
          <div className="compare-head">
            <div>
              <small>STUDENT’S ORIGINAL PAGE</small>
              <strong>Page {index < 2 ? 1 : index} of 3</strong>
            </div>
            <button onClick={() => setFitPage((value) => !value)}>
              <Icon name="scan" size={16} /> {fitPage ? "Actual size" : "Fit page"}
            </button>
          </div>
          <div className={`handwritten-page ${fitPage ? "" : "actual-size"}`}>
            <small>FRACTIONS CHECK-IN</small>
            <h3>{q.prompt}</h3>
            <div className="hand-answer">{q.original}</div>
            <div className="pencil-lines" />
            <span className="page-number">{index + 1}</span>
          </div>
        </section>
        <section className="panel transcript-panel">
          <div className="compare-head">
            <div>
              <small>TEXT READ FROM PHOTO</small>
              <strong>Question {q.id} of 4</strong>
            </div>
            <Badge
              tone={q.confidence === "High" ? "green" : q.confidence === "Medium" ? "amber" : "red"}
            >
              {q.confidence} confidence
            </Badge>
          </div>
          <div className="prompt-box">
            <small>QUESTION</small>
            <p>{q.prompt}</p>
          </div>
          <label className="transcript-label">
            Extracted answer
            <textarea value={q.corrected} onChange={(e) => changeText(e.target.value)} />
            <span>
              Correct scan-reading only. Keep the student’s own spelling and maths mistakes
              unchanged.
            </span>
          </label>
          {q.ocr !== q.corrected && (
            <div className="change-preview">
              <strong>OCR correction detected</strong>
              <p>
                <del>{q.ocr}</del> → <ins>{q.corrected}</ins>
              </p>
            </div>
          )}
          <div className="uncertain">
            <span>AI FLAG</span>
            <p>
              {q.ocr === q.corrected
                ? "Check the highlighted symbol even if it looks correct."
                : `Possible misread corrected. Compare “${q.ocr}” with the photo.`}
            </p>
          </div>
          {requesting ? (
            <div className="request-state">
              <Badge tone="red">Pending new scan</Badge>
              <p>Student notified. This answer cannot be approved until a clearer photo arrives.</p>
              <Button variant="ghost" onClick={() => setRequesting(false)}>
                Cancel request (demo)
              </Button>
            </div>
          ) : (
            <div className="ocr-actions">
              <Button variant="secondary" onClick={() => setRequesting(true)}>
                Request clearer photo
              </Button>
              <Button onClick={markChecked}>
                Save & mark checked <Icon name="check" size={17} />
              </Button>
            </div>
          )}
        </section>
      </div>
      <div className="sticky-actions">
        <Button variant="secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Previous question
        </Button>
        <div>
          <span>
            {allChecked
              ? "Every answer has been checked against the original."
              : "Check every answer, including those without warnings."}
          </span>
          <Button
            disabled={!allChecked || requesting}
            onClick={() => {
              update({ ocrApproved: true });
              addHistory("OCR", "Approved all 4 extracted answers for AI grading.");
              setToast("OCR approved. AI marking suggestions are now available.");
              setView("review");
            }}
          >
            Approve OCR & continue to marks <Icon name="chevron" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MarkReview({
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
        i === index ? { ...x, final: Math.max(0, Math.min(mark, x.max)) } : x,
      ),
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
                  onClick={() => setToast(`Opened approved answer-key evidence for Q${q.id}.`)}
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
                  {q.id === 2 ? " + 1 saved example" : ""}
                </span>
              </div>
              {q.id === 2 && (
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
                {q.final !== q.suggested && (
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
          <Button disabled={confirmed < 4} onClick={() => setView("gaps")}>
            Continue to learning gaps <Icon name="chevron" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SimilarAnswers({ onOpen }: { onOpen: (i: number) => void }) {
  return (
    <section className="panel similar-panel">
      <div className="panel-head">
        <div>
          <h2>Suggested group: Added tops and bottoms</h2>
          <p>Question 2 • 5 similar answers • Similarity never makes a mark official.</p>
        </div>
        <Badge tone="purple">AI grouped</Badge>
      </div>
      <div className="similar-grid">
        {[
          ["Alex Morgan", "1/2 + 1/3 = 2/5", "0.5 / 3"],
          ["Sara Jones", "2/4 + 1/3 = 3/7", "0.5 / 3"],
          ["Omar Ali", "1/3 + 1/4 = 2/7", "0 / 3"],
        ].map((x, i) => (
          <button key={x[0]} onClick={() => onOpen(1)}>
            <div className="student-initial">
              {x[0]
                .split(" ")
                .map((s) => s[0])
                .join("")}
            </div>
            <strong>{x[0]}</strong>
            <p>{x[1]}</p>
            <span>Suggested {x[2]}</span>
            <small>
              Open answer & evidence <Icon name="chevron" size={13} />
            </small>
          </button>
        ))}
      </div>
      <div className="info-banner compact">
        <span>
          <Icon name="book" />
        </span>
        <div>
          <strong>Approved rubric still controls each decision.</strong>
          <p>Review each answer’s method and evidence individually.</p>
        </div>
      </div>
    </section>
  );
}

function GapReview({
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
  const allConfirmed = state.questions.every((q) => q.confirmed);
  const decide = (d: "confirmed" | "dismissed") => {
    update({ redFlag: d });
    addHistory(
      "Red flag",
      `${d === "confirmed" ? "Confirmed" : "Dismissed"} extra-support suggestion for recurring fraction comparison errors.`,
    );
    setToast(`Support suggestion ${d}.`);
  };
  if (!allConfirmed)
    return (
      <div className="teacher-page">
        <TeacherHeader eyebrow="LEARNING GAPS" title="Support review is locked" />
        <div className="blocked-state">
          <Icon name="check" size={35} />
          <h2>Confirm every question mark first</h2>
          <p>Learning gaps use teacher-confirmed decisions, not draft AI marks.</p>
          <Button onClick={() => setView("review")}>Return to marks</Button>
        </div>
      </div>
    );
  return (
    <div className="teacher-page">
      <TeacherHeader eyebrow="SUBMISSIONS / ALEX MORGAN" title="Review learning gaps & support">
        <Badge tone="amber">1 decision needed</Badge>
      </TeacherHeader>
      <ReviewWorkflow current={2} />
      <div className="gap-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recurring learning gaps</h2>
              <p>Patterns based on confirmed marks and prior assessments.</p>
            </div>
          </div>
          <div className="gap-card high">
            <div className="gap-title">
              <span>
                <Icon name="chart" />
              </span>
              <div>
                <Badge tone="red">REPEATED PATTERN</Badge>
                <h3>Comparing fractions</h3>
                <p>3 related mistakes across 2 published assessments</p>
              </div>
            </div>
            <div className="evidence-timeline">
              <div>
                <span>Today</span>
                <p>
                  <strong>Fractions Check-in • Q3</strong>Compared numerators instead of fraction
                  values.
                </p>
                <Badge tone="red">0 / 3</Badge>
              </div>
              <div>
                <span>3 Oct</span>
                <p>
                  <strong>Number Skills • Q5</strong>Selected 3/7 as greater than 1/2.
                </p>
                <Badge tone="amber">1 / 2</Badge>
              </div>
            </div>
            <button
              onClick={() => {
                setToast("Opening the confirmed Q3 mark and rubric evidence.");
                setView("review");
              }}
            >
              Open confirmed question evidence <Icon name="chevron" size={15} />
            </button>
          </div>
          <div className="gap-card">
            <div className="gap-title">
              <span>
                <Icon name="chart" />
              </span>
              <div>
                <Badge tone="amber">THIS ASSESSMENT</Badge>
                <h3>Adding unlike fractions</h3>
                <p>1 mistake • monitor in the next check-in</p>
              </div>
            </div>
          </div>
        </section>
        <aside className="panel support-decision">
          <div className="panel-head">
            <div>
              <h2>Extra-help suggestion</h2>
              <p>Teacher decision required</p>
            </div>
            <Badge tone="purple">
              <Icon name="spark" size={12} /> AI suggested
            </Badge>
          </div>
          <div className="support-summary">
            <span>
              <Icon name="users" />
            </span>
            <h3>Alex may benefit from extra support with comparing fractions.</h3>
            <p>This is a support need, not a diagnosis.</p>
          </div>
          <div className="evidence-check">
            <small>EVIDENCE CONSIDERED</small>
            <p>
              <Icon name="check" size={15} /> 2 confirmed assessment patterns
            </p>
            <p>
              <Icon name="check" size={15} /> 3 related question decisions
            </p>
            <p>
              <Icon name="check" size={15} /> Recent improvement in showing working
            </p>
          </div>
          <label>
            Private teacher note
            <textarea defaultValue="Review number-line comparisons in a short small-group activity. Check again after the next quiz." />
          </label>
          <div className="two-actions">
            <Button
              variant={state.redFlag === "dismissed" ? "danger" : "secondary"}
              onClick={() => decide("dismissed")}
            >
              Dismiss suggestion
            </Button>
            <Button onClick={() => decide("confirmed")}>
              <Icon name="check" size={16} /> Confirm support need
            </Button>
          </div>
          {state.redFlag && (
            <div className="decision-record">
              <Icon name="check" size={16} /> Decision recorded: <strong>{state.redFlag}</strong>
            </div>
          )}
        </aside>
      </div>
      <div className="sticky-actions">
        <Button variant="secondary" onClick={() => setView("review")}>
          Back to marks
        </Button>
        <div>
          <span>
            {state.redFlag ? "Support decision complete." : "Confirm or dismiss before continuing."}
          </span>
          <Button disabled={!state.redFlag} onClick={() => setView("publish")}>
            Continue to feedback <Icon name="chevron" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PublishReview({
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
  const ready = state.ocrApproved && marks && support && state.feedbackApproved;
  const approve = () => {
    update({ feedback, practice, teacherComment: comment, feedbackApproved: true });
    addHistory("Feedback", "Edited and approved student feedback and practice advice.");
    setToast("Feedback approved and ready to share.");
  };
  const publish = () => {
    update({ published: true, feedback, practice, teacherComment: comment });
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
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={5} />
            <span>{feedback.length} characters • Clear, positive and specific</span>
          </label>
          <label>
            Practice recommendation
            <textarea value={practice} onChange={(e) => setPractice(e.target.value)} rows={3} />
          </label>
          <label>
            Teacher comment
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
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

function SavedExamples({
  state,
  setState,
  addHistory,
  setToast,
}: {
  state: DemoState;
  setState: React.Dispatch<React.SetStateAction<DemoState>>;
  addHistory: (t: DemoState["history"][number]["type"], s: string) => void;
  setToast: (s: string) => void;
}) {
  const [selected, setSelected] = useState(state.examples[0]?.id || 0);
  const [filter, setFilter] = useState("All topics");
  const [editing, setEditing] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const ex = state.examples.find((x) => x.id === selected);
  const remove = () => {
    if (!ex) return;
    setState((s) => ({ ...s, examples: s.examples.filter((x) => x.id !== ex.id) }));
    addHistory("Grading", `Removed saved marking example ${ex.id}.`);
    setSelected(0);
    setToast("Saved example removed.");
  };
  return (
    <div className="teacher-page">
      <TeacherHeader eyebrow="COURSE ADAPTATION" title="Saved marking examples">
        <Badge tone="purple">{state.examples.length} approved examples</Badge>
      </TeacherHeader>
      <div className="info-banner">
        <span>
          <Icon name="spark" />
        </span>
        <div>
          <strong>Teacher-approved examples inform later suggestions in this course.</strong>
          <p>
            This prototype simulates reuse; it does not retrain a model. OCR, rubric, feedback and
            support edits are never stored here.
          </p>
        </div>
      </div>
      <div className="examples-layout">
        <section className="panel examples-list">
          <div className="filter-row">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All topics</option>
              <option>Fractions</option>
              <option>Place value</option>
            </select>
            <select>
              <option>Grade 4 Mathematics</option>
            </select>
          </div>
          {state.examples.length === 0 ? (
            <div className="empty-state">
              <Icon name="spark" size={30} />
              <h3>No saved grading examples</h3>
              <p>Save a teacher-approved mark correction during review.</p>
            </div>
          ) : (
            state.examples.map((x, i) => (
              <button
                key={x.id}
                className={selected === x.id ? "active" : ""}
                onClick={() => {
                  setSelected(x.id);
                  setEditing(false);
                  setSimulated(false);
                }}
              >
                <span className="example-number">EX-{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>Partial credit • Fractions</strong>
                  <p>“{x.answer}”</p>
                  <small>{x.course}</small>
                </div>
                <Icon name="chevron" />
              </button>
            ))
          )}
        </section>
        <section className="panel example-detail">
          {ex ? (
            <>
              <div className="panel-head">
                <div>
                  <Badge tone="green">TEACHER APPROVED</Badge>
                  <h2>Partial method credit</h2>
                  <p>Saved from Alex Morgan • Fractions Check-in • Q2</p>
                </div>
                <button
                  onClick={() =>
                    setToast("Example actions: edit, simulate reuse, or delete below.")
                  }
                >
                  <Icon name="more" />
                </button>
              </div>
              <div className="example-source">
                <small>STUDENT ANSWER</small>
                <p>{ex.answer}</p>
              </div>
              <div className="decision-compare">
                <div>
                  <small>AI SUGGESTED</small>
                  <strong>{ex.suggestion}</strong>
                </div>
                <Icon name="chevron" />
                <div>
                  <small>TEACHER DECISION</small>
                  <strong>{ex.decision}</strong>
                </div>
              </div>
              <label>
                Approved reason
                <textarea
                  disabled={!editing}
                  value={ex.reason}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      examples: s.examples.map((x) =>
                        x.id === ex.id ? { ...x, reason: e.target.value } : x,
                      ),
                    }))
                  }
                />
              </label>
              <div className="source-separation">
                <strong>Correction type: Grading only</strong>
                <span>Source transcript, rubric and support decisions remain unchanged.</span>
              </div>
              {simulated && (
                <div className="simulation-result">
                  <Icon name="spark" />
                  <div>
                    <strong>Reuse simulation</strong>
                    <p>
                      For “1/4 + 1/3 = 2/7”, the system would surface this example beside the rubric
                      and suggest reviewing method credit. A teacher must still decide.
                    </p>
                  </div>
                </div>
              )}
              <div className="example-actions">
                <Button variant="danger" onClick={remove}>
                  Delete example
                </Button>
                <div>
                  <Button variant="secondary" onClick={() => setEditing(!editing)}>
                    {editing ? "Save changes" : "Edit example"}
                  </Button>
                  <Button onClick={() => setSimulated(true)}>
                    <Icon name="spark" size={16} /> Simulate reuse
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Icon name="file" size={30} />
              <h3>Select an example</h3>
              <p>Inspect its source, previous suggestion and teacher decision.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ReviewHistory({ history }: { history: DemoState["history"] }) {
  const [tab, setTab] = useState<"All" | DemoState["history"][number]["type"]>("All");
  const [expanded, setExpanded] = useState<number | null>(null);
  const types: ["All", ...DemoState["history"][number]["type"][]] = [
    "All",
    "OCR",
    "Rubric",
    "Grading",
    "Feedback",
    "Red flag",
  ];
  return (
    <div className="teacher-page">
      <TeacherHeader eyebrow="AUDIT & EVIDENCE" title="Review history">
        <Badge tone="gray">Teacher decisions</Badge>
      </TeacherHeader>
      <div className="info-banner">
        <span>
          <Icon name="history" />
        </span>
        <div>
          <strong>Each correction history stays separate.</strong>
          <p>Inspect what changed, who approved it and which source supported the decision.</p>
        </div>
      </div>
      <div className="history-tabs">
        {types.map((t) => (
          <button className={tab === t ? "active" : ""} key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <section className="panel audit-list">
        {history
          .filter((x) => tab === "All" || x.type === tab)
          .map((h) => (
            <div key={h.id} className={expanded === h.id ? "expanded" : ""}>
              <span className={`audit-icon ${h.type.toLowerCase().replace(" ", "-")}`}>
                <Icon
                  name={
                    h.type === "OCR"
                      ? "scan"
                      : h.type === "Grading"
                        ? "check"
                        : h.type === "Rubric"
                          ? "book"
                          : h.type === "Feedback"
                            ? "file"
                            : "users"
                  }
                />
              </span>
              <div>
                <Badge
                  tone={
                    h.type === "OCR"
                      ? "blue"
                      : h.type === "Grading"
                        ? "green"
                        : h.type === "Red flag"
                          ? "purple"
                          : "gray"
                  }
                >
                  {h.type}
                </Badge>
                <p>{h.text}</p>
                <small>{h.time} • Karim Adel</small>
              </div>
              <button onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
                <Icon name="eye" size={16} /> {expanded === h.id ? "Hide" : "Evidence"}
              </button>
              {expanded === h.id && (
                <aside>
                  <strong>Source and decision record</strong>
                  <span>
                    Original source retained • Teacher action recorded separately • Published
                    outcomes use the confirmed decision only
                  </span>
                </aside>
              )}
            </div>
          ))}
      </section>
    </div>
  );
}

export default App;
