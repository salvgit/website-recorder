const express = require('express');
const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const url = req.query.url || 'https://example.com';
  const duration = parseInt(req.query.duration || 30); // ثانیه

  const browser = await puppeteer.launch({
    headless: false, // headless: true باعث میشه تصویر ضبط نشه!
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(url);

  const filePath = path.join(__dirname, 'recorded.mp4');
  const recorder = new PuppeteerScreenRecorder(page);
  await recorder.start(filePath);

  console.log(`Recording ${url} for ${duration} seconds...`);
  await new Promise(resolve => setTimeout(resolve, duration * 1000));

  await recorder.stop();
  await browser.close();

  res.download(filePath, 'recorded.mp4', err => {
    if (err) console.error('Error sending file:', err);
  });
});

app.listen(PORT, () => {
  console.log(`🎥 Server is recording on port ${PORT}`);
});
