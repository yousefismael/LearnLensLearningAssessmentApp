import { useState } from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

export function ReviewHistory({ history }: { history: DemoState["history"] }) {
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
