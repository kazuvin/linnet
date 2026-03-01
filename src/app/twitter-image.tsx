import { renderOgImage } from "./_og/render-og-image";

export const dynamic = "force-dynamic";

export const alt = "Linnet - ギターコード進行リファレンスツール";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderOgImage();
}
