export type BadgeTone = "success" | "pending" | "failed" | "paused";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-status-success-bg text-status-success-fg",
  pending: "bg-status-pending-bg text-status-pending-fg",
  failed: "bg-status-failed-bg text-status-failed-fg",
  paused: "bg-status-paused-bg text-status-paused-fg",
};

/** Maps backend status strings to a visual tone. Keep in one place so every
 * list/detail screen reads statuses the same way. */
export function toneFor(status: string): BadgeTone {
  switch (status) {
    case "active":
    case "enabled":
    case "success":
    case "SUCCESS":
    case "successful":
    case "SUCCESSFUL":
      return "success";
    case "pending":
    case "PENDING":
      return "pending";
    case "cancelled":
    case "disabled":
    case "failed":
    case "FAILED":
      return "failed";
    case "paused":
      return "paused";
    default:
      return "pending";
  }
}

export function badgeClass(status: string): string {
  return TONE_CLASSES[toneFor(status)];
}
