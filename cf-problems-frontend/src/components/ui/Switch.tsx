import type { ReactNode } from "react";
import { Switch as Primitive } from "radix-ui";
import "./Switch.css";

type Props = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "small";
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
};

const Switch = ({
  label,
  checked,
  onCheckedChange,
  size,
  checkedChildren,
  unCheckedChildren,
}: Props) => (
  <Primitive.Root
    className={`ui-switch${size === "small" ? " ui-switch-small" : ""}`}
    aria-label={label}
    checked={checked}
    onCheckedChange={onCheckedChange}
  >
    <span className="ui-switch-content" aria-hidden="true">
      {checked ? checkedChildren : unCheckedChildren}
    </span>
    <Primitive.Thumb className="ui-switch-thumb" />
  </Primitive.Root>
);
export default Switch;
