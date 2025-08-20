// api/changelog.js
// Just checkin sum
// Use require for built-in CJS modules
const { readFileSync } = require('fs');
const path = require('path');

// Use module.exports instead of export default
module.exports = async function handler(req, res) {
  try {
    // --- Dynamically import the ESM packages ---
    const { html } = await import('satori-html');
    const satori = (await import('satori')).default; // Satori uses a default export

    // --- The rest of your code remains the same ---

    // Load Font Data
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

    // Generate the SVG
    const svg = await satori(markup, {
      width: 450,
      height: 200,
      fonts: [
        {
          name: 'Roboto',
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
    console.error(error);
    res.status(500).send('Error generating changelog image');
  }
}
