import { useState } from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

export function Submissions({ state, setView }: { state: DemoState; setView: (v: TeacherView) => void }) {
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
