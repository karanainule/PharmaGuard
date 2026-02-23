import React from "react";

export default function Spinner({
  size = 48,
  ariaLabel = "Loading",
  className = "",
  centered = true,
}) {
  const wrapper =
    `${centered ? "flex items-center justify-center" : ""} ${className}`.trim();

  return (
    <div role="status" aria-label={ariaLabel} className={wrapper}>
      <div
        style={{ width: size, height: size }}
        className="border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
        aria-hidden="true"
      />
    </div>
  );
}
