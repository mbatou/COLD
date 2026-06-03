export interface NativeAd {
  id: string;
  brand: string;
  /** Hex color for the small brand logo block. */
  logo_color: string;
  logo_text: string;
  copy: string;
  tag: string;
}

/**
 * Native in-document ad inventory. In production this config is replaced by a
 * dynamic fetch from the Tamtam brand console; the shape stays identical.
 */
export const ads: NativeAd[] = [
  {
    id: "tiak-tiak",
    brand: "Tiak-Tiak Delivery",
    logo_color: "#e8c97a",
    logo_text: "TT",
    copy: "Order anything in Dakar — delivered before the trail goes cold.",
    tag: "Sponsored",
  },
  {
    id: "sablier",
    brand: "Club Sablier",
    logo_color: "#c0392b",
    logo_text: "CS",
    copy: "The night is long at Club Sablier. Reserve your table.",
    tag: "Sponsored",
  },
  {
    id: "meridian-spa",
    brand: "Meridian Spa",
    logo_color: "#6a9fb5",
    logo_text: "MS",
    copy: "Unwind after a long case. The Meridian Spa, open till late.",
    tag: "Sponsored",
  },
];

/** Pick a random ad once per session. */
export function pickAd(): NativeAd {
  return ads[Math.floor(Math.random() * ads.length)];
}
