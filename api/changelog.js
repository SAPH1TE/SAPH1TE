// api/changelog.js
import { html } from 'satori-html';
import satori from 'satori';
import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
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
    // Using the "Jolly" theme colors from your README
    const markup = html(`
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: #291B3E; color: #ffffff; padding: 25px; font-family: 'sans-serif';">
        <div style="font-size: 24px; color: #FF64DA; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #FF64DA; padding-bottom: 10px;">
          Changelog
        </div>
        ${entriesHtml}
      </div>
    `);

    // Generate the SVG
    const svg = await satori(markup, {
      width: 450,
      height: 200,
      fonts: [], 
    });

    // Set headers and send the SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating changelog image');
  }
}
