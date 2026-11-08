import { Select as Primitive } from "radix-ui";
import "./Select.css";

type Props = {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
};

const Select = ({ label, value, options, onValueChange }: Props) => (
  <Primitive.Root value={value} onValueChange={onValueChange}>
    <Primitive.Trigger className="ui-select" aria-label={label}>
      <Primitive.Value />
      <Primitive.Icon className="ui-select-icon">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="m2 4 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </Primitive.Icon>
    </Primitive.Trigger>
    <Primitive.Portal>
      <Primitive.Content
        className="ui-select-popup"
        position="popper"
        sideOffset={4}
        align="start"
        collisionPadding={8}
      >
        <Primitive.ScrollUpButton
          className="ui-select-scroll"
          aria-label="Scroll up"
        >
          ▴
        </Primitive.ScrollUpButton>
        <Primitive.Viewport>
          {options.map((option) => (
            <Primitive.Item
              className="ui-select-option"
              value={option}
              key={option}
            >
              <Primitive.ItemText>{option}</Primitive.ItemText>
            </Primitive.Item>
          ))}
        </Primitive.Viewport>
        <Primitive.ScrollDownButton
          className="ui-select-scroll"
          aria-label="Scroll down"
        >
          ▾
        </Primitive.ScrollDownButton>
      </Primitive.Content>
    </Primitive.Portal>
  </Primitive.Root>
);
export default Select;
