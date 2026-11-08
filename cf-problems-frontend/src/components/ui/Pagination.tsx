import Select from "./Select";
import "./Pagination.css";

type Props = {
  current: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onChange: (page: number, pageSize: number) => void;
  className?: string;
  label?: string;
};
type PageItem =
  | { page: number; compact?: boolean }
  | { jump: "previous" | "next" };

// Keep the existing five-number window and five-page jumps near either end.
const pageItems = (page: number, last: number): PageItem[] => {
  if (last <= 7)
    return Array.from({ length: last }, (_, i) => ({ page: i + 1 }));
  let left = Math.max(1, page - 2);
  let right = Math.min(last, page + 2);
  if (page <= 3) right = 5;
  if (last - page <= 2) left = last - 4;
  const previous = page >= 5;
  const next = last - page >= 4;
  if (previous && right !== last) left++;
  if (next && left !== 1) right--;
  const items: PageItem[] = [];
  if (left !== 1) items.push({ page: 1 });
  if (previous) items.push({ jump: "previous" });
  for (let n = left; n <= right; n++) {
    items.push({
      page: n,
      compact: (previous && n === left) || (next && n === right),
    });
  }
  if (next) items.push({ jump: "next" });
  if (right !== last) items.push({ page: last });
  return items;
};
const Chevron = ({
  previous,
  double = false,
}: {
  previous?: boolean;
  double?: boolean;
}) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    aria-hidden="true"
    style={previous ? { transform: "rotate(180deg)" } : undefined}
  >
    <path
      d={double ? "m2 2 4 4-4 4m4-8 4 4-4 4" : "m4 2 4 4-4 4"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const Pagination = ({
  current,
  pageSize,
  total,
  pageSizeOptions = [10, 20, 50, 100],
  onChange,
  className = "",
  label = "Pagination",
}: Props) => {
  if (total === 0) return null;
  const last = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.max(1, Math.min(current, last));
  const move = (next: number) => {
    const target = Math.max(1, Math.min(next, last));
    if (target !== page) onChange(target, pageSize);
  };
  const sizes = [...new Set([...pageSizeOptions, pageSize])].sort(
    (a, b) => a - b
  );
  return (
    <nav className={`ui-pagination ${className}`} aria-label={label}>
      <ul>
        <li>
          <button
            type="button"
            className="ui-pagination-direction"
            aria-label="Previous Page"
            title="Previous Page"
            disabled={page === 1}
            onClick={() => move(page - 1)}
          >
            <Chevron previous />
          </button>
        </li>
        {pageItems(page, last).map((item) =>
          "page" in item ? (
            <li
              key={item.page}
              className={item.compact ? "ui-pagination-compact" : undefined}
            >
              <button
                type="button"
                className="ui-pagination-page"
                aria-label={`Page ${item.page}`}
                title={String(item.page)}
                aria-current={page === item.page ? "page" : undefined}
                onClick={() => move(item.page)}
              >
                {item.page}
              </button>
            </li>
          ) : (
            <li key={item.jump}>
              <button
                type="button"
                className="ui-pagination-jump"
                aria-label={
                  item.jump === "previous" ? "Previous 5 Pages" : "Next 5 Pages"
                }
                title={
                  item.jump === "previous" ? "Previous 5 Pages" : "Next 5 Pages"
                }
                onClick={() => move(page + (item.jump === "previous" ? -5 : 5))}
              >
                <svg
                  className="ui-pagination-ellipsis"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <circle cx="2" cy="6" r="1" />
                  <circle cx="6" cy="6" r="1" />
                  <circle cx="10" cy="6" r="1" />
                </svg>
                <span className="ui-pagination-jump-icon">
                  <Chevron double previous={item.jump === "previous"} />
                </span>
              </button>
            </li>
          )
        )}
        <li className="ui-pagination-next">
          <button
            type="button"
            className="ui-pagination-direction"
            aria-label="Next Page"
            title="Next Page"
            disabled={page === last}
            onClick={() => move(page + 1)}
          >
            <Chevron />
          </button>
        </li>
        {total > 50 && (
          <li className="ui-pagination-size">
            <Select
              label="Page Size"
              value={String(pageSize)}
              options={sizes.map(String)}
              getOptionLabel={(size) => `${size} / page`}
              onValueChange={(value) => {
                const size = Number(value);
                if (size !== pageSize)
                  onChange(
                    Math.min(page, Math.max(1, Math.ceil(total / size))),
                    size
                  );
              }}
            />
          </li>
        )}
      </ul>
    </nav>
  );
};
export default Pagination;
