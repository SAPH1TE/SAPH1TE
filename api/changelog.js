//ima be fr i honestly HATE javascript so gemini js did it </3
import { readFileSync } from 'fs';
import { join } from 'path';
import satori from 'satori';
import { html } from 'satori-html';

// Import the JSON data directly
import logData from './api/log.json';

const fontPath = join(process.cwd(), 'public', 'Inter-Regular.ttf');
const interRegular = readFileSync(fontPath);

export default async function handler(req, res) {
  try {
    const changelogEntries = logData.map(item => `
      <div style="display: flex; flex-direction: column; margin-bottom: 15px;">
        <p style="margin: 0; font-size: 16px; font-weight: 600;">${item.date}</p>
        <p style="margin: 0; font-size: 14px; color: #ffffff;">- ${item.entry}</p>
      </div>
    `).join('');

    const template = html(`
      <div style="
        display: flex; 
        flex-direction: column; 
        width: 100%; 
        height: 100%;
        color: #FF64DA;
        background-color: #291B3E; 
        padding: 25px;
        border-radius: 10px;
        font-family: 'Inter';
      ">
        <h2 style="margin: 0 0 20px 0; font-size: 24px;">Latest Changes</h2>
        ${changelogEntries}
      </div>
    `);

    const svg = await satori(template, {
      width: 500, 
      height: 300,
      fonts: [
        {
          name: 'Inter',
          data: interRegular,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating changelog image');
  }
}
