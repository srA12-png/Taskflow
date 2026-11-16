import clsx from "clsx";

/**
 * Small wrapper around clsx so conditional class lists stay readable.
 * Example: cn("px-4", isActive && "bg-brand")
 */
export function cn(...inputs) {
  return clsx(inputs);
}
