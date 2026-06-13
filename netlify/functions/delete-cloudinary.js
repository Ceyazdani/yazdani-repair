const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const CLOUD  = process.env.CLOUDINARY_CLOUD;
  const KEY    = process.env.CLOUDINARY_KEY;
  const SECRET = process.env.CLOUDINARY_SECRET;

  if (!CLOUD || !KEY || !SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing Cloudinary env vars' }) };
  }

  let urls = [];
  try { urls = JSON.parse(event.body).urls || []; }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid body' }) }; }

  if (!urls.length) {
    return { statusCode: 200, body: JSON.stringify({ deleted: [], message: 'No files to delete' }) };
  }

  // استخراج public_id از URL کلادینری
  function extractPublicId(url) {
    // مثال URL: https://res.cloudinary.com/dp9oqtsy8/image/upload/v1234567890/yazdani_repairs/abc123.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  }

  const results = [];

  for (const url of urls) {
    const publicId = extractPublicId(url);
    if (!publicId) { results.push({ url, status: 'skipped', reason: 'invalid url' }); continue; }

    // تشخیص نوع فایل
    const resourceType = url.includes('/video/') ? 'video' : 'image';

    // امضای Cloudinary
    const timestamp = Math.floor(Date.now() / 1000);
    const str = `public_id=${publicId}&timestamp=${timestamp}${SECRET}`;
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    try {
      const formData = new URLSearchParams({
        public_id: publicId,
        timestamp: timestamp.toString(),
        api_key: KEY,
        signature
      });

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/destroy`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      results.push({ url, publicId, status: data.result });
    } catch (err) {
      results.push({ url, publicId, status: 'error', reason: err.message });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deleted: results })
  };
};
