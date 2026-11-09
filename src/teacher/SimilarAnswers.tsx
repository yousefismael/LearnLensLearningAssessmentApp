import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

export function SimilarAnswers({ onOpen }: { onOpen: (i: number) => void }) {
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
