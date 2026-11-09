import { useRef, useState } from "react";
import type { DemoState, StudentView, UploadedPage } from "../models/types";
import { initialQuestions } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps } from "../components/ui";

const MAX_FILE = 2 * 1024 * 1024;
const MAX_PAGES = 12;
const readPage = (file: File): Promise<UploadedPage> => new Promise((resolve, reject) => {
  if (!(["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(file.type))) return reject(new Error(`${file.name}: use a PDF, JPG, PNG or WEBP.`));
  if (file.size > MAX_FILE) return reject(new Error(`${file.name}: file is over 2 MB. Compress it and try again.`));
  const reader = new FileReader();
  reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, mime: file.type, dataUrl: String(reader.result) });
  reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
  reader.readAsDataURL(file);
});

export function UploadFlow({ state, update, setView, setToast }: {
  state: DemoState;
  update: (p: Partial<DemoState>) => void;
  setView: (v: StudentView) => void;
  setToast: (s: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("Grade 4 Mathematics");
  const [exam, setExam] = useState("Fractions Check-in");
  const [pages, setPages] = useState<UploadedPage[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const updatePages = (next: UploadedPage[]) => { setPages(next); setChecked(false); setStep(2); };

  const addFiles = async (files: FileList | null, replace: number | null = null) => {
    if (!files?.length) return;
    setLoading(true); setError("");
    try {
      if ((replace === null ? pages.length : pages.length - 1) + files.length > MAX_PAGES) throw new Error(`Maximum ${MAX_PAGES} uploaded files per submission.`);
      const estimatedBytes = Array.from(files).reduce((n, f) => n + f.size, 0) + pages.reduce((n,p)=>n + (p.dataUrl.length * 0.75),0);
      if (estimatedBytes > 2.5 * 1024 * 1024) throw new Error("This demo can retain up to 2.5 MB of files total. Compress files or use demo pages.");
      const newPages = await Promise.all(Array.from(files).map(readPage));
      const next = [...pages];
      if (replace !== null) next.splice(replace, 1, ...newPages);
      else next.push(...newPages);
      updatePages(next);
      setToast(`${newPages.length} file(s) added. Review every page before sending.`);
    } catch (e) { setError(e instanceof Error ? e.message : "File could not be loaded."); }
    finally { setLoading(false); setReplaceIndex(null); if (fileRef.current) fileRef.current.value = ""; if (cameraRef.current) cameraRef.current.value = ""; }
  };
  const move = (i: number, direction: number) => {
    const j = i + direction;
    if (j < 0 || j >= pages.length) return;
    const next = [...pages]; [next[i], next[j]] = [next[j], next[i]];
    updatePages(next);
  };
  const addDemo = () => {
    const demos: UploadedPage[] = [1, 2, 3].map(i => ({ id: `demo-${i}`, name: `Demo page ${i}`, mime: "text/demo", dataUrl: "" }));
    updatePages([...pages, ...demos].slice(0, MAX_PAGES));
  };
  const send = () => {
    if (!pages.length || !checked) { setError("Add pages and confirm that all pages are complete, readable and correctly ordered."); return; }
    if (state.submitted && !state.published && state.receiptId && state.uploadedPages?.length) {
      setError("An earlier submission is already awaiting review. Check its status before submitting again."); return;
    }
    setLoading(true); setStep(4); setError("");
    window.setTimeout(() => {
      update({ submitted: true, receiptId: `LL-${Math.floor(10000 + Math.random() * 89999)}`, submittedExamName: exam,
        submittedSubject: subject, uploadedPages: pages, notificationRead: false,
        ocrApproved: false, published: false, feedbackApproved: false, redFlag: null,
        questions: initialQuestions.map(q => ({ ...q })),
        guideApproved: exam === "Fractions Check-in" ? state.guideApproved : false });
      setLoading(false); setToast("Exam received. Your teacher will review it."); setView("receipt");
    }, 450);
  };
  return (
    <div className="page student-page upload-page">
      <div className="page-heading"><button className="back-link" onClick={() => setView("home")}>‹ Back home</button><h1>Upload your exam</h1><p>We’ll keep your pages safe while you check them.</p></div>
      <ProgressSteps active={step} />
      {step === 1 && <section className="upload-card">
        <div className="upload-card-head"><span>1</span><div><h2>Choose your exam</h2><p>Make sure it matches the name on your paper.</p></div></div>
        <div className="field-grid">
          <label>Subject<select value={subject} onChange={e => setSubject(e.target.value)}><option>Grade 4 Mathematics</option><option>Grade 4 English</option><option>Deutsch • Klasse 4</option></select></label>
          <label>Exam<select value={exam} onChange={e => setExam(e.target.value)}><option>Fractions Check-in</option><option>Number Skills</option><option>Brüche und Größen</option></select></label>
        </div>
        <div className="chosen-exam"><span className="card-icon blue"><Icon name="file" size={22}/></span><div><small>YOU’RE SENDING TO</small><strong>{exam}</strong><span>{subject} • check your paper before sending</span></div><Icon name="check" className="chosen-check"/></div>
        <Button variant="student" onClick={() => setStep(2)} className="align-right">Continue to pages <Icon name="chevron" size={17}/></Button>
      </section>}
      {step >= 2 && <section className="upload-card">
        <div className="upload-card-head"><span>2</span><div><h2>Add and review your pages</h2><p>{exam} — {subject}. Choose clear photos or saved scans.</p></div></div>
        <div className="upload-actions">
          <button onClick={() => { setReplaceIndex(null); fileRef.current?.click(); }}><span><Icon name="upload" size={25}/></span><strong>Choose files</strong><small>PDF, JPG, PNG • 2 MB each</small></button>
          <button onClick={() => cameraRef.current?.click()}><span><Icon name="camera" size={25}/></span><strong>Take photos</strong><small>Use your camera</small></button>
          <input ref={fileRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" multiple hidden onChange={e => addFiles(e.target.files, replaceIndex)} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={e => addFiles(e.target.files)} />
        </div>
        {loading && <div className="loading-row"><span className="spinner"/>Reading your pages…</div>}
        {!pages.length && !loading && <button className="demo-add" onClick={addDemo}>Use 3 demo exam pages</button>}
        {!!pages.length && <div className="pages-head"><div><h3>Check your pages</h3><p>Are all pages here, readable and in order?</p></div><Badge tone="green">{pages.length} file(s) added</Badge></div>}
        <div className="page-previews">{pages.map((page, i) => <div className="page-preview" key={page.id}>
          {page.mime.startsWith("image/") ? <img src={page.dataUrl} alt={`Uploaded file ${i+1}: ${page.name}`} style={{width:"100%",height:185,objectFit:"contain",background:"white"}}/> : page.mime === "application/pdf" ?
            <iframe title={`Preview ${page.name}`} src={page.dataUrl} style={{width:"100%",height:185,border:0,background:"white"}}/> :
            <div className="scan-paper"><span>{i+1}</span><h4>Fractions Check-in — demo</h4><p>Q{i+1}. Work with fractions</p><em>{i===1 ? "1/2 + 1/3 = 2/5" : "3 ÷ 4 = 0.75"}</em></div>}
          <div className="preview-info"><strong>{i+1}. {page.name}</strong><span>{page.mime === "application/pdf" ? "PDF preview — review all pages inside the PDF" : page.mime === "text/demo" ? "Sample page (demo only)" : "Check this image is readable"}</span>
            <div><button onClick={() => { setReplaceIndex(i); fileRef.current?.click(); }}>Replace</button><button onClick={() => move(i,-1)} disabled={i===0}>↑</button><button onClick={() => move(i,1)} disabled={i===pages.length-1}>↓</button><button onClick={() => updatePages(pages.filter((_,j)=>i!==j))} aria-label={`Remove ${page.name}`}><Icon name="close" size={15}/></button></div>
          </div></div>)}</div>
        {error && <div className="error-state" role="alert"><strong>Check your submission</strong><span>{error}</span></div>}
        {!!pages.length && <label className="check-confirm"><input type="checkbox" checked={checked} onChange={e => {setChecked(e.target.checked);setStep(e.target.checked?3:2);}}/><span><Icon name="check" size={16}/></span>I checked that every page is included, readable, and in the right order.</label>}
        <div className="form-footer"><Button variant="secondary" onClick={() => setView("home")}>Back to home</Button><Button variant="student" disabled={!checked || loading} onClick={send}>{loading?"Sending…":"Send exam safely"} <Icon name="chevron" size={17}/></Button></div>
      </section>}
    </div>
  );
}
