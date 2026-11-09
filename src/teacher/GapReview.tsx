import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";
import { ReviewWorkflow } from "./ReviewWorkflow";

export function GapReview({
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
    update({ redFlag: d, published: false, feedbackApproved: false });
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
