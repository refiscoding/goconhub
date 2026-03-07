export const FILTER_CATS: string[] = [
  "All", "Plumber", "Electrician", "Carpenter",
  "Painter", "Cleaner", "Tiler", "Mason",
];

export const TIME_SLOTS: string[] = [
  "07:00","08:00","09:00","10:00","11:00",
  "13:00","14:00","15:00","16:00","17:00",
];

export const CUSTOMER_SERVICES: string[] = [
  "Plumbing","Electrical","Carpentry","Painting",
  "Cleaning","Tiling","Roofing","Landscaping","Pest Control","AC Repair",
];

export const VENDOR_CATS: string[] = [
  "Plumber","Electrician","Carpenter","Painter",
  "Cleaner","Tiler","Roofer","Mason","Landscaper",
];

export const VENDOR_SKILLS: string[] = [
  "Pipe Repair","Drain Cleaning","Geyser Install","Leak Detection",
  "Bathroom Fitting","Wiring","Circuit Breakers","Lighting","Sockets",
];

export const QUICK_REPLIES: string[] = [
  "Yes, that time works perfectly!",
  "I'll need to assess on-site first.",
  "My rate for this is P250. Does that work?",
  "I'm on my way — 15 mins away.",
  "Job done! Please confirm completion. ⭐",
  "Could you share more details about the issue?",
];

export const STATUS_TAG: Record<string, string> = {
  active:    "tag-green",
  pending:   "tag-amber",
  suspended: "tag-red",
  confirmed: "tag-acc",
  completed: "tag-green",
  declined:  "tag-red",
  open:      "tag-amber",
  resolved:  "tag-green",
};
