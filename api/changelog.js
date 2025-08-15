// api/changelog.js
import { html } from 'satori-html';
import satori from 'satori';
import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // --- 1. LOAD FONT DATA ---
    // Resolve the path to the font file relative to the current file
    const fontPath = path.join(process.cwd(), 'Roboto-Regular.ttf');
    const fontData = readFileSync(fontPath);

    // Read the changelog data
    const changelogPath = path.join(process.cwd(), 'changelog.json');
    const changelogData = JSON.parse(readFileSync(changelogPath, 'utf-8'));

    // Create HTML list items from the changelog entries
    const entriesHtml = changelogData.map(item => `
      <div style="display: flex; align-items: baseline; margin-bottom: 12px;">
        <span style="font-size: 16px; color: #FF64DA; margin-right: 12px;">${item.date}:</span>
        <span style="font-size: 16px; color: #ffffff;">${item.entry}</span>
      </div>
    `).join('');

    // Construct the full HTML for the SVG
    const markup = html(`
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: #291B3E; color: #ffffff; padding: 25px; font-family: 'Roboto';">
        <div style="font-size: 24px; color: #FF64DA; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #FF64DA; padding-bottom: 10px;">
          Changelog
        </div>
        ${entriesHtml}
      </div>
    `);

    // --- 2. PASS FONT DATA TO SATORI ---
    const svg = await satori(markup, {
      width: 450,
      height: 200,
      fonts: [
        {
          name: 'Roboto', // This name must match the font-family in your CSS
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    // Set headers and send the SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);

  } catch (error) {
    console.error(error); // This will help debug in your server logs
    res.status(500).send('Error generating changelog image');
  }
}
