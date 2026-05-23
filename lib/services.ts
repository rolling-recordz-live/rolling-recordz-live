export const SERVICES = [
  {
    title: "Recording Studio",
    slug: "recording-studio",
    price: "$150+",
    desc: "Professional recording sessions for singles, EPs, hooks, verses, and full projects.",
    includes: ["Vocal recording", "Session setup", "Basic vocal cleanup", "Release direction"],
  },
  {
    title: "Video Production",
    slug: "video-production",
    price: "$500+",
    desc: "Music videos, Mic Drop performances, BTS edits, and cinematic artist visuals.",
    includes: ["Performance video", "Lighting setup", "Edited video", "Social clips"],
  },
  {
    title: "Content Creation",
    slug: "content-creation",
    price: "$150+",
    desc: "Photos, reels, promo videos, thumbnails, and rollout visuals for artists.",
    includes: ["Photos", "Reels", "Promo clips", "Thumbnail direction"],
  },
  {
    title: "Radio Promotion",
    slug: "radio-promotion",
    price: "$25+",
    desc: "Approved songs enter Rolling Recordz Radio rotation and community discovery.",
    includes: ["Radio queue", "Artist display", "Community voting", "Live chat exposure"],
  },
  {
    title: "Mobile Studio",
    slug: "mobile-studio",
    price: "$600+",
    desc: "Rolling Recordz pulls up with recording and content setup at your location.",
    includes: ["Mobile recording", "Portable setup", "Photos/videos", "Location vibe"],
  },
  {
    title: "Branding",
    slug: "branding",
    price: "$250+",
    desc: "Artist identity, rollout strategy, cover direction, and creative planning.",
    includes: ["Brand direction", "Rollout plan", "Visual strategy", "Content blueprint"],
  },
];

export const PACKAGES = [
  {
    title: "Starter Frequency",
    slug: "starter-frequency",
    price: "$150",
    desc: "Studio session, basic content clip, 5 photos, song preview reel, and radio submission.",
  },
  {
    title: "Artist Development",
    slug: "artist-development",
    price: "$350",
    desc: "Recording, mix/master direction, photoshoot, reels, cover support, and radio rotation.",
  },
  {
    title: "Mic Drop Performance",
    slug: "mic-drop-performance",
    price: "$500",
    desc: "Cinematic performance video with lighting, 4K edit, thumbnail, and BTS reel.",
  },
  {
    title: "Radio Rotation",
    slug: "radio-rotation",
    price: "$25+",
    desc: "3-day, 7-day, and spotlight promotion options after approval.",
  },
  {
    title: "Mobile Studio Experience",
    slug: "mobile-studio-experience",
    price: "$600",
    desc: "On-location recording, lighting, photos, reels, and interview clip.",
  },
  {
    title: "Studio Frequencies",
    slug: "studio-frequencies",
    price: "$1000",
    desc: "Premium creator session with production, stream coverage, photos, and brand push.",
  },
];

export function findOffer(slugOrTitle: string | null) {
  const all = [...SERVICES, ...PACKAGES];

  return (
    all.find((item) => item.slug === slugOrTitle) ||
    all.find((item) => item.title === slugOrTitle) ||
    SERVICES[0]
  );
}
