#!/usr/bin/env node

/**
 * Usage:
 * 1. Save this file as, for example, `importCameras.js`.
 * 2. Run `npm init -y` (if you haven't already) to set up a Node project.
 * 3. Run `chmod +x importCameras.js` to make it executable (optional).
 * 4. Execute `node importCameras.js` (or `./importCameras.js`) to output the SQL.
 */

const fs = require('fs');
const path = require('path');

// Adjust this path if cameras.json is in a different directory
const filePath = path.join(__dirname, 'cameras.json');

// Read the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading cameras.json:', err);
    process.exit(1);
  }

  let cameras;
  try {
    cameras = JSON.parse(data);
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
    process.exit(1);
  }

  // Build the VALUES clauses
  // Note: We map JSON's "lng" -> DB's "lon".
  // Embedding is zeros for now: `array_fill(0::float, ARRAY[512])::vector`
  const values = cameras.map((cam) => {
    const { id, lat, lng } = cam;

    // Be sure to handle any special characters or SQL escaping, if necessary.
    // For simplicity, we assume `id`, `lat`, and `lng` are well-formed.
    return `('${id}', ${lat}, ${lng}, array_fill(0::float, ARRAY[512])::vector)`;
  });

  // Create the SQL insert statement
  // We omit last_updated so it uses its DEFAULT,
  // and we rely on the zero vector default for embedding if needed—
  // but here we explicitly provide it, just to show how it's done.
  const sql = `
INSERT INTO cameras (camera_id, lat, lon, embedding)
VALUES
${values.join(',\n')}
;`;

  // Output the SQL
  console.log(sql);
});
