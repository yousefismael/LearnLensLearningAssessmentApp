export type Role = "student" | "teacher";
export type StudentView = "home" | "upload" | "receipt" | "results" | "progress" | "notifications";
export type TeacherView =
  | "dashboard"
  | "setup"
  | "guide"
  | "submissions"
  | "ocr"
  | "review"
  | "gaps"
  | "publish"
  | "examples"
  | "history";
export type Question = {
  id: number;
  prompt: string;
  original: string;
  ocr: string;
  corrected: string;
  answer: string;
  max: number;
  suggested: number;
  final: number;
  reason: string;
  confidence: "High" | "Medium" | "Low";
  rubric: string;
  commonError?: string;
  checked: boolean;
  confirmed: boolean;
};
export type UploadedPage = { id: string; name: string; dataUrl: string; mime: string };
export type AssessmentConfig = {
  name: string; course: string; subject: string; grade: string;
  totalMarks: number; language: string; blankExamName?: string;
  referenceNames: { type: string; name: string }[];
  boundaries: { label: string; marks: number }[];
};
export type DemoState = {
  assessment?: AssessmentConfig;
  guideApproved?: boolean;
  uploadedPages?: UploadedPage[];
  submittedExamName?: string;
  submittedSubject?: string;
  notificationRead?: boolean;

  submitted: boolean;
  receiptId: string;
  ocrApproved: boolean;
  redFlag: "confirmed" | "dismissed" | null;
  feedback: string;
  feedbackApproved: boolean;
  practice: string;
  teacherComment: string;
  published: boolean;
  questions: Question[];
  examples: {
    id: number;
    answer: string;
    suggestion: string;
    decision: string;
    reason: string;
    course: string;
  }[];
  history: {
    id: number;
    type: "OCR" | "Rubric" | "Grading" | "Feedback" | "Red flag";
    text: string;
    time: string;
  }[];
};

