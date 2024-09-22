import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// create arrayBuffer with the counter image
const imgPath = path.join(import.meta.dirname, '..', 'images', 'counter.png');
const initCounterImgBuffer = readFileSync(imgPath);

function inputTextBuffer(text) {
  const width = 200;
  const height = 18;
  const svgImage = `
  <svg width="${width}" height="${height}">
    <style>
    .title { fill: #000; font-family: 'Arial'; font-size: 14px; }
    </style>
    <text x="0" y="98%" class="title">${text}</text>
  </svg>
  `;
  return Buffer.from(svgImage);
}

export function getCounterImage({views, visitors}) {
  return sharp(initCounterImgBuffer)
    .composite([
      {
        input: inputTextBuffer(views || 0),
        top: 17,
        left: 145
      },
      {
        input: inputTextBuffer(visitors || 0),
        top: 34,
        left: 145
      }
    ])
    .png()
    .toBuffer();
}