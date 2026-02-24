export const MODULES = [
  "Dashboard",
  "Invoices",
  "Products",
  "Customers",
  "Payments",
  "Reports",
  "Inventory",
  "Settings",
];

export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  Admin: MODULES,
  Manager: [
    "Dashboard",
    "Invoices",
    "Products",
    "Customers",
    "Payments",
    "Reports",
    "Inventory",
  ],
  Accountant: ["Dashboard", "Invoices", "Payments", "Reports"],
  Staff: ["Dashboard"],
};