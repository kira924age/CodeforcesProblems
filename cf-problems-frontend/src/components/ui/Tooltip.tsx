import { Tooltip as Primitive } from "radix-ui";
import type { ReactNode } from "react";
import "./Tooltip.css";

export const TooltipProvider = ({ children }: { children: ReactNode }) => (
  <Primitive.Provider delayDuration={100} skipDelayDuration={0}>
    {children}
  </Primitive.Provider>
);

const Tooltip = ({
  title,
  children,
  asChild = false,
}: {
  title: string;
  children: ReactNode;
  asChild?: boolean;
}) => (
  <Primitive.Root>
    <Primitive.Trigger asChild>
      {asChild ? (
        children
      ) : (
        <span className="ui-tooltip-trigger" tabIndex={0} aria-label={title}>
          {children}
        </span>
      )}
    </Primitive.Trigger>
    <Primitive.Portal>
      <Primitive.Content
        className="ui-tooltip"
        side="top"
        sideOffset={4}
        collisionPadding={8}
      >
        {title}
        <Primitive.Arrow className="ui-tooltip-arrow" width={16} height={8} />
      </Primitive.Content>
    </Primitive.Portal>
  </Primitive.Root>
);
export default Tooltip;
