// Pre-build script: fetches Google reviews and writes src/data/reviews.json
// Runs in plain Node before Vite/Astro, so process.env works directly.
// Never overwrites good data with nothing — if the fetch fails, keep what we have.

const fs = await import('node:fs');
const path = await import('node:path');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;
const OUT = path.resolve(import.meta.dirname, '..', 'src', 'data', 'reviews.json');

function hasExistingData() {
  try {
    const raw = fs.readFileSync(OUT, 'utf8');
    const data = JSON.parse(raw);
    return data && data.reviews?.length > 0;
  } catch { return false; }
}

function ensureFile() {
  const dir = path.dirname(OUT);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(OUT)) fs.writeFileSync(OUT, JSON.stringify(null));
}

if (!API_KEY || !PLACE_ID) {
  console.log('[fetch-reviews] No API key or Place ID — keeping existing data.');
  ensureFile();
  process.exit(0);
}

const baseUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews,url&key=${API_KEY}`;

try {
  const [relevantRes, newestRes] = await Promise.all([
    fetch(`${baseUrl}&reviews_sort=most_relevant`),
    fetch(`${baseUrl}&reviews_sort=newest`),
  ]);

  const relevantData = await relevantRes.json();
  let newestReviews = [];
  try {
    const newestData = await newestRes.json();
    if (newestData.status === 'OK') newestReviews = newestData.result?.reviews || [];
  } catch {}

  if (relevantData.status !== 'OK') {
    console.error(`[fetch-reviews] Google API error: ${relevantData.status} — keeping existing data.`);
    ensureFile();
    process.exit(0);
  }

  const allReviews = [...(relevantData.result?.reviews || []), ...newestReviews];
  const seen = new Set();
  const reviews = allReviews
    .filter(r => {
      if (!r.text) return false;
      if (seen.has(r.author_name)) return false;
      seen.add(r.author_name);
      return true;
    })
    .map(r => ({
      text: r.text,
      name: r.author_name,
      time: r.relative_time_description || '',
      avatar: r.profile_photo_url || '',
      rating: r.rating || 0,
      url: r.author_url || '',
    }));

  const result = {
    rating: relevantData.result?.rating || 0,
    count: relevantData.result?.user_ratings_total || 0,
    mapsUrl: relevantData.result?.url || `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`,
    reviews,
  };

  fs.writeFileSync(OUT, JSON.stringify(result));
  console.log(`[fetch-reviews] Wrote ${reviews.length} reviews to reviews.json`);
} catch (err) {
  console.error('[fetch-reviews] Failed:', err.message, '— keeping existing data.');
  ensureFile();
}
