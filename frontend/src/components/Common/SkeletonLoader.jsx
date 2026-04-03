import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div className={`skeleton ${className}`} />
);

export const StatCardSkeleton = () => (
  <div
    className="rounded-2xl border p-6"
    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
  >
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl ml-4" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const CardSkeleton = ({ lines = 3 }) => (
  <div
    className="rounded-2xl border p-6 space-y-3"
    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
  >
    <Skeleton className="h-5 w-40" />
    <div
      className="border-t pt-3 space-y-2"
      style={{ borderColor: "var(--border)" }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  </div>
);

export default Skeleton;
