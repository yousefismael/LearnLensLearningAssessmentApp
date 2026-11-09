import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

export function TeacherDashboard({
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
