import type { Question, DemoState } from "./types";

export const initialQuestions: Question[] = [
  {
    id: 1,
    prompt: "Write 3/4 as a decimal.",
    original: "3 ÷ 4 = 0.75",
    ocr: "3 ÷ 4 = O.75",
    corrected: "3 ÷ 4 = 0.75",
    answer: "0.75",
    max: 2,
    suggested: 2,
    final: 2,
    reason: "Correct conversion and working shown.",
    confidence: "High",
    rubric: "Correct method: 1 • Correct answer: 1",
    checked: false,
    confirmed: false,
  },
  {
    id: 2,
    prompt: "Add 1/2 + 1/3. Show your working.",
    original: "1/2 + 1/3 = 2/5",
    ocr: "1/2 + 1/3 = 2/S",
    corrected: "1/2 + 1/3 = 2/5",
    answer: "5/6",
    max: 3,
    suggested: 0.5,
    final: 1,
    reason: "Fractions were added without a common denominator.",
    confidence: "Medium",
    rubric: "Common denominator: 1 • Method: 1 • Answer: 1",
    checked: false,
    confirmed: false,
  },
  {
    id: 3,
    prompt: "Which is greater: 2/3 or 3/5? Explain.",
    original: "3/5 because 3 is bigger than 2",
    ocr: "3/5 because 3 is bigger than Z",
    corrected: "3/5 because 3 is bigger than 2",
    answer: "2/3; valid comparison",
    max: 3,
    suggested: 0,
    final: 0,
    reason: "Compared numerators rather than the values of the fractions.",
    confidence: "High",
    rubric: "Correct choice: 1 • Comparison method: 1 • Explanation: 1",
    checked: false,
    confirmed: false,
  },
  {
    id: 4,
    prompt: "Lina ate 2/8 of a pizza. Simplify the fraction.",
    original: "2/8 = 1/4",
    ocr: "2/8 = 1/4",
    corrected: "2/8 = 1/4",
    answer: "1/4",
    max: 2,
    suggested: 2,
    final: 2,
    reason: "Correctly simplified by dividing by 2.",
    confidence: "High",
    rubric: "Method: 1 • Correct answer: 1",
    checked: false,
    confirmed: false,
  },
];

export const initialState: DemoState = {
  submitted: true,
  guideApproved: true, // The seeded demo guide was already approved, as recorded in history.
  uploadedPages: [],
  submittedExamName: "Fractions Check-in",
  submittedSubject: "Grade 4 Mathematics",
  notificationRead: false,

  receiptId: "LL-24018",
  ocrApproved: false,
  redFlag: null,
  feedback:
    "You showed your working clearly and simplified a fraction correctly. Next, use a common denominator before adding or comparing fractions.",
  feedbackApproved: false,
  practice:
    "Complete the 5-minute “Fraction bridges” practice and compare three pairs using a number line.",
  teacherComment: "Great effort, Alex. Let’s practise one fraction strategy together this week.",
  published: false,
  questions: initialQuestions,
  examples: [
    {
      id: 1,
      answer: "1/2 + 1/3 = 2/5",
      suggestion: "0.5 / 3",
      decision: "1 / 3",
      reason: "Correct intent and one relevant step; award method credit.",
      course: "Grade 4 Mathematics",
    },
  ],
  history: [
    {
      id: 1,
      type: "Rubric",
      text: "Karim approved Fractions Check-in marking guide v2.",
      time: "Today, 08:42",
    },
    {
      id: 2,
      type: "OCR",
      text: "OCR flagged 3 low-confidence symbols in Alex Morgan’s paper.",
      time: "Today, 09:16",
    },
    {
      id: 3,
      type: "Grading",
      text: "Saved course example for partial method credit.",
      time: "12 Oct, 14:05",
    },
    {
      id: 4,
      type: "Feedback",
      text: "Edited Number Skills feedback to include one next step.",
      time: "08 Oct, 11:30",
    },
    {
      id: 5,
      type: "Red flag",
      text: "Dismissed place-value support suggestion after checking classwork.",
      time: "08 Oct, 11:28",
    },
  ],
};

export const previousResults = [
  { name: "Place Value Quiz", date: "18 Sep", score: 7, total: 10, topic: "Place value" },
  { name: "Number Skills", date: "03 Oct", score: 8, total: 10, topic: "Multiplication" },
];

