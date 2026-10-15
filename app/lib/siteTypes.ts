export type NavLink = { label: string; href: string };

export type SiteSettings = {
  brandName: string;
  logoUrl: string;
  brandColor: string;
  topBarColor: string;
  searchPlaceholder: string;
  city: string;
  /** use {city} to insert the city name. Empty = hide the line */
  availabilityMessage: string;
  showCategories: boolean;
  categoriesLabel: string;
  showOrders: boolean;
  ordersLabel: string;
  signupLabel: string;
  loginLabel: string;
  navLinks: NavLink[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "CITYMALL",
  logoUrl: "",
  brandColor: "#DC2626",
  topBarColor: "#1a1b2e",
  searchPlaceholder: "Search for products…",
  city: "Kanpur",
  availabilityMessage: "Available only for {city} location",
  showCategories: true,
  categoriesLabel: "Categories",
  showOrders: true,
  ordersLabel: "Orders",
  signupLabel: "Sign Up",
  loginLabel: "Login",
  navLinks: [],
};