// /api/changelog.js
import { promises as fs } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { html } from 'satori-html';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const THEME = {
  background: '#291B3E',
  pink: '#FF64DA',
  white: '#ffffff',
};

export default async function handler(req, res) {
  try {
    const fontPath = path.join(__dirname, 'Roboto-Regular.ttf');
    const changelogPath = path.join(__dirname, 'log.json');

    const fontData = await fs.readFile(fontPath);
    const changelogData = JSON.parse(await fs.readFile(changelogPath, 'utf-8'));
    let entriesHtml;
    if (!changelogData || changelogData.length === 0) {
      entriesHtml = `<div style="display: flex; color: ${THEME.white}; font-size: 16px;">No recent updates. Check back soon!</div>`;
    } else {
      entriesHtml = changelogData.map(item => `
        <div style="display: flex; align-items: baseline; margin-bottom: 12px; width: 100%;">
          <span style="font-size: 16px; color: ${THEME.pink}; margin-right: 12px; flex-shrink: 0;">${item.date}:</span>
          <span style="font-size: 16px; color: ${THEME.white};">${item.entry}</span>
        </div>
      `).join('');
    }
    const markup = html(`
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: ${THEME.background}; color: ${THEME.white}; padding: 25px; font-family: 'Roboto';">
        <div style="font-size: 24px; color: ${THEME.pink}; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid ${THEME.pink}; padding-bottom: 10px;">
          Changelog
        </div>
        ${entriesHtml}
      </div>
    `);
    const headerHeight = 62;
    const entryHeight = changelogData.length > 0 ? 28 : 20;
    const verticalPadding = 25;
    const calculatedHeight = headerHeight + (changelogData.length * entryHeight) + verticalPadding;
    const height = Math.max(200, calculatedHeight);

    const svg = await satori(markup, {
      width: 450,
      height: height,
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);

  } catch (error) {
    console.error("Error generating changelog SVG:", error);
    res.status(500).send('Error generating changelog image. Check server logs for details.');
  }
}
