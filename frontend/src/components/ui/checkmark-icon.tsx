import { cn } from "@/lib/utils";
import React from "react";

interface CheckmarkIconProps {
  state: "selected" | "hovered";
}

const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({ state }) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 13L9 17L19 7"
        // stroke={state === "selected" ? "currentColor" : ""}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("", {
          "stroke-current": state === "selected",
          "stroke-neutral-500": state === "hovered",
        })}
      />
    </svg>
  );
};

export default CheckmarkIcon;