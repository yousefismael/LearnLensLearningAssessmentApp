import { useRef, useState } from "react";
import type { AssessmentConfig, DemoState, TeacherView } from "../models/types";
import { Icon, Button, Badge } from "../components/ui";
import { TeacherHeader } from "./TeacherHeader";

const seeded: AssessmentConfig = {
  name: "Fractions Check-in", course: "Grade 4 Mathematics • Oak", subject: "Mathematics", grade: "Grade 4",
  totalMarks: 10, language: "English", blankExamName: "fractions-check-in.pdf",
  referenceNames: [
    {type:"Solved answer key",name:"fractions-key.pdf"},
    {type:"Graded sample",name:"alex-sample.pdf"},
  ],
  boundaries: [{label:"Q1 • Page 1",marks:2},{label:"Q2 • Page 1",marks:3},{label:"Q3 • Page 2",marks:3},{label:"Q4 • Page 3",marks:2}],
};
export function ExamSetup({state,update,setView,setToast}:{
  state:DemoState; update:(p:Partial<DemoState>)=>void; setView:(v:TeacherView)=>void; setToast:(s:string)=>void;
}) {
  const [draft,setDraft] = useState<AssessmentConfig>(() => structuredClone(state.assessment || seeded));
  const [error,setError] = useState("");
  const blankRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const pendingType = useRef("");
  const field = <K extends keyof AssessmentConfig>(key:K,value:AssessmentConfig[K]) => setDraft(d=>({...d,[key]:value}));
  const sourceOptions = ["Solved answer key","Rubric / marking scheme","Graded sample","Solved + graded sample"];
  const save = (navigate:boolean) => {
    const total = draft.boundaries.reduce((a,b)=>a+(Number(b.marks)||0),0);
    if (!draft.name.trim() || !draft.boundaries.length || draft.totalMarks<=0 || total!==draft.totalMarks) {
      setError(`Enter an assessment name, valid question boundaries, and matching marks. Questions total ${total}; exam total ${draft.totalMarks}.`); return;
    }
    if (navigate && !draft.referenceNames.length) {setError("Add at least one answer key or other grading reference before drafting the guide.");return;}
    update({assessment:draft,guideApproved:false,published:false,feedbackApproved:false});
    setToast(navigate?"Assessment details saved. Review the proposed marking guide.":"Assessment draft saved locally.");
    if (navigate) setView("guide"); else setView("dashboard");
  };
  return <div className="teacher-page">
    <TeacherHeader eyebrow="ASSESSMENTS / NEW" title="Set up an assessment"><Badge tone="gray">Draft</Badge></TeacherHeader>
    <div className="workflow-banner"><div><span>1</span><strong>Assessment details</strong></div><i/><div><span>2</span><strong>Reference material</strong></div><i/><div><span>3</span><strong>Marking guide</strong></div></div>
    <section className="panel form-panel"><div className="panel-head"><div><h2>Assessment details</h2><p>Define the exam the marking guide will use.</p></div></div>
      <div className="teacher-form-grid">
        <label>Assessment name<input value={draft.name} onChange={e=>field("name",e.target.value)}/></label>
        <label>Course<select value={draft.course} onChange={e=>field("course",e.target.value)}><option>Grade 4 Mathematics • Oak</option><option>Grade 4 Deutsch • Oak</option><option>Grade 4 English • Oak</option></select></label>
        <label>Subject<select value={draft.subject} onChange={e=>field("subject",e.target.value)}><option>Mathematics</option><option>English</option><option>Deutsch</option></select></label>
        <label>Grade level<select value={draft.grade} onChange={e=>field("grade",e.target.value)}>{[1,2,3,4,5].map(i=><option key={i}>Grade {i}</option>)}</select></label>
        <label>Total marks<input type="number" min="1" value={draft.totalMarks} onChange={e=>field("totalMarks",Number(e.target.value))}/></label>
        <label>Exam language<select value={draft.language} onChange={e=>field("language",e.target.value)}><option>English</option><option>German</option><option>Automatic detection</option></select></label>
      </div></section>
    <div className="setup-columns"><section className="panel form-panel"><div className="panel-head"><div><h2>Exam paper & boundaries</h2><p>Upload and check the number of marks per question.</p></div></div>
      <button className="teacher-dropzone" onClick={()=>blankRef.current?.click()}><Icon name="upload"/><strong>Choose blank exam</strong><small>{draft.blankExamName||"PDF, JPG or PNG"}</small></button>
      <input ref={blankRef} hidden type="file" accept=".pdf,image/*" onChange={e=>e.target.files?.[0]&&field("blankExamName",e.target.files[0].name)}/>
      <div className="boundary-list">{draft.boundaries.map((b,i)=><div key={i}><label style={{flex:1,display:"flex",gap:8,alignItems:"center"}}><input aria-label={`Question ${i+1} boundary`} value={b.label} onChange={e=>field("boundaries",draft.boundaries.map((q,j)=>j===i?{...q,label:e.target.value}:q))} style={{width:"65%"}}/><input aria-label={`Question ${i+1} marks`} type="number" min="0" value={b.marks} onChange={e=>field("boundaries",draft.boundaries.map((q,j)=>j===i?{...q,marks:Number(e.target.value)}:q))} style={{width:72}}/> marks</label><button onClick={()=>field("boundaries",draft.boundaries.filter((_,j)=>j!==i))}><Icon name="close" size={15}/></button></div>)}
        <button className="add-boundary" onClick={()=>field("boundaries",[...draft.boundaries,{label:`Q${draft.boundaries.length+1} • Page 1`,marks:1}])}><Icon name="plus" size={16}/> Add question boundary</button></div>
    </section><section className="panel form-panel"><div className="panel-head"><div><h2>Reference material</h2><p>Choose real files and label their purpose. AI output is simulated.</p></div></div>
      <div className="reference-buttons">{sourceOptions.map((type,i)=><button key={type} onClick={()=>{pendingType.current=type;sourceRef.current?.click();}}><Icon name={i===1?"book":"file"}/><span><strong>{type}</strong><small>Choose file</small></span><Icon name="plus"/></button>)}</div>
      <input ref={sourceRef} type="file" hidden accept=".pdf,image/*" onChange={e=>{const f=e.target.files?.[0];if(f)field("referenceNames",[...draft.referenceNames,{type:pendingType.current,name:f.name}]);e.target.value="";}}/>
      <div className="uploaded-files">{draft.referenceNames.map((f,i)=><div key={`${f.name}-${i}`}><span><Icon name="check" size={15}/></span><p>{f.type} • {f.name}</p><button onClick={()=>field("referenceNames",draft.referenceNames.filter((_,j)=>j!==i))}><Icon name="close" size={15}/></button></div>)}</div>
    </section></div>
    {error && <div className="error-state" role="alert"><strong>Review assessment details</strong><span>{error}</span></div>}
    <div className="sticky-actions"><Button variant="secondary" onClick={()=>save(false)}>Save draft</Button><div><span>{draft.referenceNames.length} references • {draft.boundaries.length} questions</span><Button onClick={()=>save(true)}>Create draft marking guide <Icon name="spark" size={17}/></Button></div></div>
  </div>;
}
