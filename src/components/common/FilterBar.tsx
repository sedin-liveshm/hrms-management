import { SearchInput } from "./SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  placeholder: string;
  options: FilterOption[];
  onChange: (value: string | null) => void;
  defaultValue?: string;
}

interface FilterBarProps {
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: FilterConfig[];
  action?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  showSearch = true,
  searchPlaceholder,
  onSearch,
  filters = [],
  action,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        className
      )}
    >
    
      {showSearch && (
        <SearchInput
          placeholder={searchPlaceholder}
          onSearch={onSearch}
          className="w-full sm:w-64"
        />
      )}


      {filters.map((filter) => (
        <Select
          key={filter.id}
          onValueChange={(value) => filter.onChange(value)}
          defaultValue={filter.defaultValue}
        >
          <SelectTrigger
            id={`filter-${filter.id}`}
            className="w-full sm:w-40"
            aria-label={filter.placeholder}
          >
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
