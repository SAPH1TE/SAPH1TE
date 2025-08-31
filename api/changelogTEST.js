// /api/changelog.js
import { promises as fs } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { html } from 'satori-html';

// Get the directory name in an ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define a theme for consistent styling
const THEME = {
  background: '#291B3E',
  pink: '#FF64DA',
  white: '#ffffff',
  fontFamily: 'Roboto',
};

// Define constants for styling and layout
const FONT_SIZE = {
  title: '24px',
  entry: '16px',
};
const PADDING = '10px';

/**
 * Generates the HTML markup for a single changelog entry.
 * @param {object} item - The changelog item.
 * @returns {string} - The HTML string for the entry.
 */
function createChangelogEntry(item) {
  return `
    <div style="display: flex; align-items: baseline; margin-bottom: 12px; width: 100%;">
      <span style="font-size: ${FONT_SIZE.entry}; color: ${THEME.pink}; margin-right: 12px; flex-shrink: 0;">${item.date}:</span>
      <span style="font-size: ${FONT_SIZE.entry}; color: ${THEME.white};">${item.entry}</span>
    </div>
  `;
}

/**
 * The main handler for the serverless function.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export default async function handler(req, res) {
  try {
    // Construct absolute paths to asset files
    const fontPath = path.join(__dirname, 'Roboto-Regular.ttf');
    const changelogPath = path.join(__dirname, 'log.json');

    // Read font and changelog data in parallel
    const [fontData, changelogJson] = await Promise.all([
      fs.readFile(fontPath),
      fs.readFile(changelogPath, 'utf-8'),
    ]);

    const changelogData = JSON.parse(changelogJson);

    // Generate HTML for all entries or a "no updates" message
    let entriesHtml;
    if (!changelogData || changelogData.length === 0) {
      entriesHtml = `<div style="display: flex; color: ${THEME.white}; font-size: ${FONT_SIZE.entry};">No recent updates. Check back soon!</div>`;
    } else {
      entriesHtml = changelogData.map(createChangelogEntry).join('');
    }

    // Create the main HTML structure for the SVG
    const markup = html(`
      <div style="
        display: flex; 
        flex-direction: column; 
        width: 100%; 
        height: 100%; 
        background-color: ${THEME.background}; 
        color: ${THEME.white}; 
        padding: ${PADDING}; 
        font-family: '${THEME.fontFamily}'; 
        border-radius: 5px;
      ">
        <div style="
          font-size: ${FONT_SIZE.title}; 
          color: ${THEME.pink}; 
          font-weight: bold; 
          margin-bottom: 20px; 
          border-bottom: 2px solid ${THEME.pink}; 
          padding-bottom: 10px;
        ">
          Changelog
        </div>
        ${entriesHtml}
      </div>
    `);

    // Generate the SVG using Satori
    const svg = await satori(markup, {
      width: 440,
      // The height is now dynamic based on content, Satori will calculate it.
      // We can provide an estimated height, but Satori adjusts it.
      height: 225, // Provide a base height, Satori will expand if needed.
      fonts: [
        {
          name: THEME.fontFamily,
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    // Set response headers for SVG content and caching
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    // Send the generated SVG
    res.status(200).send(svg);

  } catch (error) {
    console.error("Error generating changelog SVG:", error);
    // Return a user-friendly error message as an SVG
    const errorSvg = `
      <svg width="450" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${THEME.background}"/>
        <text x="20" y="40" font-family="sans-serif" font-size="16" fill="${THEME.pink}">Error generating changelog.</text>
        <text x="20" y="65" font-family="sans-serif" font-size="12" fill="${THEME.white}">Please check server logs for details.</text>
      </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(500).send(errorSvg);
  }
}
