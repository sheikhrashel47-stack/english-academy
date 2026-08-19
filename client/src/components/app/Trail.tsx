/**
 * Design reminder — “ভাষার মানচিত্র”: routes are visible as dotted, tactile trails;
 * completion reads as a stamped waypoint rather than a generic dashboard badge.
 */
import { Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrailStep = {
  id: string;
  title: string;
  shortLabel: string;
  status: "complete" | "current" | "locked";
};

export function Trail({ steps, onCurrentClick }: { steps: TrailStep[]; onCurrentClick: () => void }) {
  return (
    <ol className="learning-trail" aria-label="পাঠের পথ">
      {steps.map((step, index) => (
        <li className={cn("trail-step", `trail-${step.status}`)} key={step.id}>
          {index > 0 && <span className="trail-connector" aria-hidden="true" />}
          <button
            type="button"
            className="trail-pin"
            disabled={step.status === "locked"}
            onClick={step.status === "current" ? onCurrentClick : undefined}
            aria-label={`${step.title}${step.status === "complete" ? ", সম্পন্ন" : step.status === "current" ? ", শুরু করুন" : ", লকড"}`}
          >
            {step.status === "complete" ? <Check size={18} /> : step.status === "current" ? <Play size={16} fill="currentColor" /> : <Lock size={14} />}
          </button>
          <span className="trail-step-label">{step.shortLabel}</span>
        </li>
      ))}
    </ol>
  );
}
