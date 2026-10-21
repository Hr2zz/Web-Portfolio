const CONFIG = {
  name: "ICHIHAAREN",
  role: "Motion designer",
  email: "Hello@ihcihaaren.com",
  city: "Jakarta, ID",
  timezone: "Asia/Jakarta",
  availability: "Available Coms",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/haaren_/" },
    { label: "X", href: "https://x.com/_haaren" },
    {
      label: "Discord",
      href: "https://discord.com/users/706105322946953236",
    },
  ],
  hex: {
    enabled: true,
    size: 31,
    glow: 3.4,
    fade: 0.85,
    autoMove: true,
  },
  showreel: {
    video: "",
    poster: "",
  },
  hero: {
    video: "",
  },
  video: {
    playOnHover: true,
    playOnView: true,
    resetOnLeave: true,
    media: { localDir: "videos", exts: ["mp4", "webm"] },
  },
  bio: {
    title: "Who is イチハーレン?",
    text: "I'm ICHIHAAREN known as Haaren, a Motion Designer who specializes in Motion Graphics, and MV making. capable of using certain editing software such as Adobe After Effect",
    accent: false,
    accentColor: "#b83049",
  },
};

const AD_WORK = [
  {
    title: "Golden Bomber「Memeshikute」／Covered by Banzoin Hakka ",
    client: "Banzoin Hakka",
    tags: ["COLLAB", "0:32"],
    viz: "v-globe",
    views: "184K",
    video: "videos/Everyday.webm",
    poster: "",
    yt: "https://www.youtube.com/watch?v=LskbPo_KImk",
  },
  {
    title: "Edge Of The World",
    client: "collab",
    tags: ["collab", "0:15"],
    viz: "v-scan",
    views: "96K",
    video: "videos/Edge Of The World.webm",
    poster: "",
    yt: "",
  },
  {
    title: "Lucifer - Shimon _  ルシファー 【Akumu】",
    client: "Akumu",
    tags: ["vTUBER", "0:40"],
    viz: "v-type",
    word: "FROST",
    views: "212K",
    video: "videos/Lucifer - Shimon    ルシファー 【Akumu】.webm",
    poster: "",
    yt: "",
  },
  {
    title: "ZZZ RAP SONG  | YIDHARI|",
    client: "Ham Sandwich",
    tags: ["MV RAP", "2:56"],
    viz: "v-bars",
    views: "33K",
    video: "videos/Edge Of The World.webm",
    poster: "",
    yt: "https://www.youtube.com/watch?v=qcSNHfdPLhM",
  },
];

const ARTIST_WORK = [
  {
    title: "Hit my line",
    client: "Part",
    tags: ["Amv"],
    viz: "v-marquee",
    word: "FALLEN STAR",
    views: "128K",
    video: "videos/Hit my line.webm",
    poster: "",
    yt: "",
  },
  {
    title: "Start Again",
    client: "Collab",
    tags: ["Amv"],
    viz: "v-wave",
    views: "88K",
    video: "videos/Start Again.webm",
    poster: "",
    yt: "",
  },
  {
    title: "Everyday",
    client: "Collab",
    tags: ["Amv"],
    viz: "v-stack",
    views: "203K",
    video: "videos/Everyday.webm",
    poster: "",
    yt: "",
  },
  {
    title: "See U again",
    client: "solo",
    tags: ["Amv"],
    viz: "v-crt",
    word: "TRUST",
    views: "61K",
    video: "videos/See U again.webm",
    poster: "",
    yt: "https://www.youtube.com/watch?v=R9E5LDj2XzQ",
  },
  {
    title: "Aonther",
    client: "solo",
    tags: ["Amv"],
    viz: "v-ring",
    views: "412K",
    video: "videos/Aonther.webm",
    poster: "",
    yt: "https://www.youtube.com/watch?v=V8kGg29k1VE",
  },
  {
    title: "Good at Goodbyes",
    client: "solo",
    tags: ["Amv"],
    viz: "v-burst",
    views: "97K",
    video: "videos/Good at Goodbyes.webm",
    poster: "",
    yt: "",
  },
];

const RATES = [
  { group: "Price range", tag: "Starts from" },
  { label: "Simple MVs", price: "$45", unit: "/minute" },
  { label: "Simple AMVs", price: "$40", unit: "/minute" },
  { label: "Complex MVs", price: "$90", unit: "/minute" },
  { label: "Complex AMVs", price: "$80", unit: "/minute" },
  { group: "Add-On", tag: "Additional" },
  { label: "Animate", price: "$30", unit: "/Character" },
  { label: "Original MVs", price: "$80", unit: "/MVs" },
];

const PROJECT_TYPES = [
  "Motion graphics",
  "Product showcase",
  "Explainer video",
  "Music promo",
  "Visualizer",
  "Launch / ad spot",
  "Something else",
];

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TOUCH = window.matchMedia("(hover: none)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const fmtMoney = (n) =>
  "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const initials = (s) => (s || "?").trim().slice(0, 2).toUpperCase();
