export const DEFAULT_CONTENT = {
  name: "Dave Devine",
  kicker: "Artist · Producer",
  bio: "Late-night electronic soul recorded in one room. New material every season, live dates in the list below.",
  releaseKicker: "New single · out now",
  releaseTitle: "Slow Static",
  releaseUrl: "https://open.spotify.com",
  coverUrl: "",
  footer: "© 2026 Divine Dynasty Records",
  contactLabel: "Booking & Collaboration",
  contactUrl: "mailto:booking@davedevine.com",
  aboutTitle: "A room, a tape machine, a city that never quite sleeps",
  aboutText:
    "Dave Devine writes and records alone: analogue drum machines, a detuned upright piano and a voice pushed through tape until it frays. Three EPs since 2022, all self-released.\n\nThe live show is built around a modular rig and a single moving light — no backing tracks, no laptop. Sets have run from twenty-minute support slots to two-hour warehouse improvisations.\n\nFor interviews, stems, or festival enquiries use the booking address below; press kit and high-resolution photos are in the links list.",
  aboutPhoto: "",
  videoUrl: "",
  bgUrl: "",
  avatarUrl: "",
  overlay: 0.62,
  accent: "#6d1420",
  font: "serif",
  layout: "background",
  showTour: true,
  googleAnalyticsCode: "",
  yandexMetrikaCode: "",
  instagramUrl: "",
  telegramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  threadsUrl: "",
  xUrl: "",
} as const;

export const DEFAULT_LINKS = [
  { label: "Spotify", url: "https://open.spotify.com", tag: "Stream", order: 0 },
  { label: "Apple Music", url: "https://music.apple.com", tag: "Stream", order: 1 },
  { label: "Yandex Music", url: "https://music.yandex.ru", tag: "Stream", order: 2 },
  { label: "YouTube", url: "https://youtube.com", tag: "Videos", order: 3 },
  { label: "Instagram", url: "https://instagram.com", tag: "Social", order: 4 },
  { label: "Tickets", url: "https://bandsintown.com", tag: "Live", order: 5 },
  { label: "Merch store", url: "https://shop.example.com", tag: "Shop", order: 6 },
  { label: "Press kit", url: "https://drive.google.com", tag: "Contact", order: 7 },
];

export const DEFAULT_MENU = [
  { label: "Newsletter", url: "https://buttondown.email", order: 0 },
  { label: "Merch store", url: "https://shop.example.com", order: 1 },
  { label: "Press kit", url: "https://drive.google.com", order: 2 },
];

export const DEFAULT_DATES = [
  { date: "12 OCT", city: "Berlin", venue: "Berghain Kantine", url: "https://tickets.example.com", order: 0 },
  { date: "19 OCT", city: "Amsterdam", venue: "Paradiso Noord", url: "https://tickets.example.com", order: 1 },
  { date: "02 NOV", city: "London", venue: "Village Underground", url: "https://tickets.example.com", order: 2 },
];

export const ACCENT_PALETTE = ["#6d1420", "#8a2e46", "#2f4a3c", "#3a5b7a", "#6b6357"];

export const FONT_OPTIONS = {
  serif: { label: "Instrument", stack: "'Instrument Serif', serif" },
  syne: { label: "Syne", stack: "Syne, sans-serif" },
  grotesk: { label: "Grotesk", stack: "'Space Grotesk', sans-serif" },
} as const;

export type FontKey = keyof typeof FONT_OPTIONS;
