// Public data helpers for pages. The demo reads from the in-browser store (lib/demo).
export { CATEGORIES, type Category } from "./demo/types";
export { formatWhen } from "./demo/time";
export { filterEvents } from "./demo/logic";

export const catClass: Record<string, string> = {
  academic: "bg-cat-academic text-primary-foreground",
  cultural: "bg-cat-cultural text-primary-foreground",
  professional: "bg-cat-professional text-primary-foreground",
  social: "bg-cat-social text-primary-foreground",
};

/** Gradient "flyer" backgrounds per category, used where a real flyer image would go. */
export const catGradient: Record<string, string> = {
  academic: "from-cat-academic to-primary",
  cultural: "from-cat-cultural to-cat-social",
  professional: "from-cat-professional to-primary",
  social: "from-cat-social to-cat-cultural",
};
