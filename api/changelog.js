//I dunno
import { promises as fs } from 'fs';
import path from 'path';
import satori from 'satori';
import { html } from 'satori-html';

export default async function handler(req, res) {
  try {
    // Construct the path to your changelog.json file
    const changelogPath = path.join(process.cwd(), 'changelog.json');
    const changelogFile = await fs.readFile(changelogPath, 'utf-8');
    const changelogData = JSON.parse(changelogFile);

    // Use satori-html to create the markup for the image
    // This uses your profile's "Jolly" theme colors
    const markup = html(
      `<div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: #291B3E; color: #FF64DA; padding: 25px; border-radius: 10px; font-family: sans-serif;">
        <h2 style="color: #ffff; margin-bottom: 15px;">Latest Changes</h2>
        ${changelogData.map(item => `
          <div style="display: flex; margin-bottom: 10px; font-size: 18px;">
            <strong style="color: #ffff; margin-right: 8px;">${item.date}:</strong>
            <span>${item.entry}</span>
          </div>
        `).join('')}
      </div>`
    );

    // Generate the SVG using satori
    const svg = await satori(markup, {
      width: 500,
      height: 250, // Adjust height as needed
      fonts: [], // satori will use a default font
    });

    // Send the generated SVG image as the response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(svg);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating changelog image');
  }
}
