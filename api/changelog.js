import { html } from 'satori-html';
import satori from 'satori';
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  try {
    const changelogPath = join(process.cwd(), 'changelog.json');
    const changelogData = JSON.parse(readFileSync(changelogPath, 'utf-8'));
    const bgColor = '#291B3E';
    const dateColor = '#FF64DA';
    const entryColor = '#FFFFFF';
    const titleColor = '#FFFFFF';
    const entriesHtml = changelogData.map(item => `
      <div style="display: flex; flex-direction: row; align-items: flex-start; margin-bottom: 15px; width: 100%;">
        <p style="font-size: 18px; color: ${dateColor}; margin: 0; min-width: 120px;">${item.date}</p>
        <p style="font-size: 18px; color: ${entryColor}; margin: 0; flex-grow: 1;">- ${item.entry}</p>
      </div>
    `).join('');
    const markup = html`
      <div style="
        display: flex; 
        flex-direction: column;
        width: 100%; 
        height: 100%; 
        background-color: ${bgColor}; 
        color: ${entryColor};
        padding: 30px; 
        font-family: 'sans-serif';
        border-radius: 8px;
      ">
        <h2 style="font-size: 28px; margin: 0 0 20px 0; color: ${titleColor};">Changelog</h2>
        ${entriesHtml}
      </div>
    `;
    const svg = await satori(markup, {
      width: 600,
      height: 400, 
      fonts: [],
    });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating changelog image');
  }
}
