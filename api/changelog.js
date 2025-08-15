import satori from 'satori';
import { html } from 'satori-html';

export default async function handler(req, res) {
  // 1. Fetch your changelog data
  const response = await fetch('https://raw.githubusercontent.com/SAPH1TE/SAPH1TE/main/changelog.json');
  const changelogData = await response.json();

  // Get the latest 3 entries
  const latestEntries = changelogData.slice(0, 3);

  // Fetch a font for a more stylized look
  const fontResponse = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/viga/Viga-Regular.ttf');
  const fontData = await fontResponse.arrayBuffer();

  // 2. Define the image structure using HTML-like syntax with the remastered design
  const template = html`
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: #291B3E; color: #FFFFFF; padding: 30px; font-family: 'Viga';">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <span style="font-size: 32px; color: #FF64DA; margin-right: 15px;">🚀</span>
        <h2 style="color: #FF64DA; margin: 0; font-size: 36px;">Latest Updates</h2>
      </div>
      <div style="display: flex; flex-direction: column; gap: 15px;">
        ${latestEntries.map(log => `
          <div style="display: flex; flex-direction: column; background-color: #3A2C52; border-radius: 10px; padding: 15px; border: 1px solid #FF64DA;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <b style="color: #FF64DA; font-size: 18px;">${log.date}</b>
              <span style="background-color: #FF64DA; color: #291B3E; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;">v${log.version}</span>
            </div>
            <p style="margin: 0; font-size: 16px; color: #E0E0E0;">${log.entry}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // 3. Generate the SVG
  const svg = await satori(template, {
    width: 600,
    height: 400,
    fonts: [
      {
        name: 'Viga',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  // 4. Serve the image
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate'); // Cache control
  res.status(200).send(svg);
}
