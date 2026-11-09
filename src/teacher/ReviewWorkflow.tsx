import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

export function ReviewWorkflow({ current }: { current: number }) {
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
