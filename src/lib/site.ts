/**
 * Название и адрес сайта. Адрес нужен абсолютным: от него считаются
 * канонические ссылки и картинки для соцсетей.
 *
 * NEXT_PUBLIC_SITE_URL задаём, когда появится домен. Пока его нет, берём адрес
 * продакшена от Vercel, а локально - localhost.
 */
export const siteName = "TRENDSETTER Welcome Book";

function resolveSiteUrl() {
  const set = process.env.NEXT_PUBLIC_SITE_URL;
  if (set) return set.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
