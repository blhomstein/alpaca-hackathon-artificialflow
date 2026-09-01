import type { PositionState } from "@/lib/types";
import { Badge, Dot } from "@/components/ui/primitives";

export function PositionStateBadge({ state }: { state: PositionState }) {
  switch (state.type) {
    case "OPEN":
      return (
        <Badge tone="pos">
          <Dot tone="pos" pulse />
          Open
        </Badge>
      );
    case "CLOSING":
      return (
        <Badge tone="warn">
          <Dot tone="warn" pulse />
          Closing · retry {state.retry}
        </Badge>
      );
    case "CANCEL_PENDING":
      return (
        <Badge tone="warn">
          <Dot tone="warn" pulse />
          Cancel pending
        </Badge>
      );
    case "CLOSED":
      return (
        <Badge tone="neutral">
          <Dot tone="neutral" />
          Closed
        </Badge>
      );
  }
}
