import type { DemoState, StudentView } from "../models/types";
import { previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";

export function StudentHome({ state, setView }: { state: DemoState; setView: (v: StudentView) => void }) {
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
