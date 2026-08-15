const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const token = process.env.SALLA_TOKEN;
if (!token) {
  console.error('Set SALLA_TOKEN environment variable before running.');
  process.exit(1);
}

const zipPath = process.env.ZIP_PATH || path.join(__dirname, '..', 'my-salla-theme-v1.zip');
if (!fs.existsSync(zipPath)) {
  console.error('ZIP not found at', zipPath);
  process.exit(1);
}

const url = process.env.SALLA_UPLOAD_URL || 'https://api.salla.dev/v1/themes/upload';

async function upload() {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(zipPath));

    const headers = { Authorization: `Bearer ${token}`, ...form.getHeaders() };
    const resp = await axios.post(url, form, { headers, maxContentLength: Infinity, maxBodyLength: Infinity });
    console.log('Upload response:');
    console.log(JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Upload failed:', err.response.status, err.response.statusText);
      console.error(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Upload error:', err.message);
    }
    process.exit(1);
  }
}

upload();
