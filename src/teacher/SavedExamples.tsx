import { useState } from "react";
import * as React from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

export function SavedExamples({
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
