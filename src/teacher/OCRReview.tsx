import { useState } from "react";
import * as React from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";
import { ReviewWorkflow } from "./ReviewWorkflow";

export function OCRReview({
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
      questions: s.questions.map((x, i) => (i === index ? { ...x, corrected: value, checked: false, confirmed: false } : x)),
      ocrApproved: false, published: false, feedbackApproved: false,
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
          {state.uploadedPages?.length ? (
            <div style={{padding:12,background:"#f8fafc",borderRadius:12,marginBottom:12}}>
              <small>UPLOADED SUBMISSION • {state.uploadedPages.length} file(s)</small>
              {state.uploadedPages.map((file,i) => (
                <details key={file.id} open={i === Math.min(index, state.uploadedPages!.length-1)} style={{padding:"6px 0"}}>
                  <summary>{i+1}. {file.name}</summary>
                  {file.mime.startsWith("image/") ? <img src={file.dataUrl} alt={file.name} style={{width:"100%",maxHeight:400,objectFit:"contain"}}/> :
                    file.mime === "application/pdf" ? <iframe src={file.dataUrl} title={file.name} style={{width:"100%",height:400,border:0}}/> :
                    <p>This is a sample page from the demo submission.</p>}
                </details>
              ))}
              <p style={{fontSize:12,color:"#64748b"}}>OCR text below is simulated. Compare it with the uploaded document and edit recognition errors.</p>
            </div>
          ) : null}
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
