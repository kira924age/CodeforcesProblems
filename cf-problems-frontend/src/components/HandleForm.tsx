import React from "react";
import { useNavigate } from "react-router";
import Tooltip from "./ui/Tooltip";
import "./HandleForm.css";

type Props = {
  userId: string;
  page: "table" | "user";
  submitLabel: string;
  onRefetch?: () => void;
  isLoading?: boolean;
};

export default function HandleForm({
  userId,
  page,
  submitLabel,
  onRefetch,
  isLoading,
}: Props) {
  const [draft, setDraft] = React.useState(userId);
  const isComposing = React.useRef(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setDraft(userId);
  }, [userId]);

  return (
    <form
      className="handle-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (isComposing.current) return;
        const handle = draft.trim();
        if (!/^[a-zA-Z0-9_.-]+$/.test(handle)) return;
        setDraft(handle);
        void navigate(`/${page}/${handle}`);
      }}
    >
      <div className="handle-search">
        <input
          name="handle"
          aria-label="Codeforces ID"
          placeholder="Codeforces ID"
          value={draft}
          required
          pattern={"\\s*[a-zA-Z0-9_.\\-]+\\s*"}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={() => {
            isComposing.current = false;
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              (isComposing.current ||
                event.nativeEvent.isComposing ||
                event.keyCode === 229)
            ) {
              event.preventDefault();
            }
          }}
        />
        <Tooltip title={submitLabel} asChild>
          <button type="submit" aria-label={submitLabel}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <path d="m15 15 4 4" />
            </svg>
          </button>
        </Tooltip>
      </div>
      {onRefetch && (
        <RefetchButton
          onClick={onRefetch}
          isLoading={isLoading}
          disabled={!userId}
        />
      )}
    </form>
  );
}

function RefetchButton({
  onClick,
  isLoading,
  disabled,
}: {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  const label = isLoading ? "Refreshing…" : "Refresh";
  return (
    <Tooltip title={label} asChild>
      <button
        type="button"
        className="refetch-button"
        aria-label={label}
        aria-busy={isLoading}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d={
              isLoading
                ? "M20 12a8 8 0 1 1-8-8"
                : "M20 5v6h-6M20 11a8 8 0 1 0-2 6.3"
            }
          />
        </svg>
      </button>
    </Tooltip>
  );
}
