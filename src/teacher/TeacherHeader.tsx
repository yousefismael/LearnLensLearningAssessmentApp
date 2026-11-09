import * as React from "react";
import type { DemoState, TeacherView } from "../models/types";
import { initialQuestions, previousResults } from "../models/demoData";
import { Icon, Button, Badge, ProgressSteps, Logo } from "../components/ui";

export function TeacherHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="teacher-heading">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
