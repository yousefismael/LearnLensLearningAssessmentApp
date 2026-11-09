import type { DemoState, StudentView } from "../models/types";
import { previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";

export function Receipt({ state, setView }: { state: DemoState; setView: (v: StudentView) => void }) {
  return (
    <div className="page student-page receipt-page">
      <div className="success-mark">
        <Icon name="check" size={34} />
      </div>
      <Badge tone="green">EXAM RECEIVED</Badge>
      <h1>Nice work, Alex!</h1>
      <p>Your {state.submittedExamName || "Fractions Check-in"} was sent safely.</p>
      <section className="receipt-card">
        <div className="receipt-top">
          <div>
            <small>SUBMISSION RECEIPT</small>
            <h2>{state.submittedExamName || "Fractions Check-in"}</h2>
            <p>{state.submittedSubject || "Grade 4 Mathematics"}</p>
          </div>
          <Badge tone="gray">{state.receiptId}</Badge>
        </div>
        <div className="receipt-details">
          <span>
            <Icon name="file" />
            <div>
              <small>PAGES RECEIVED</small>
              <strong>{state.uploadedPages?.length || 3} page(s)</strong>
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
