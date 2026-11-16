import Select from "../ui/Select.jsx";
import { cn } from "../../utils/cn.js";

/**
 * `filters` is a list of { id, label, value, onChange, options }.
 * Keeping it data-driven means the task page (and the Kanban board later)
 * can share the same control without duplicated markup.
 */
export default function FilterBar({ filters, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map(({ id, label, value, onChange, options, width }) => (
        <Select
          key={id}
          id={id}
          label={label}
          value={value}
          onChange={onChange}
          options={options}
          className={width ?? "w-[140px]"}
        />
      ))}
    </div>
  );
}
