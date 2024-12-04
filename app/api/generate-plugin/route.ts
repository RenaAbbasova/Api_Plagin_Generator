import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import archiver from 'archiver';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { platform, pluginName, description, apiUrl, apiMethod, apiKey, headers, visualizeData } = data;

  // Create a temporary directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-'));

  try {
    // Generate plugin files based on the platform
    switch (platform) {
      case 'wordpress':
        generateWordPressPlugin(tempDir, { pluginName, description, apiUrl, apiMethod, apiKey, headers, visualizeData });
        break;
      case 'chrome':
        generateChromeExtension(tempDir, { pluginName, description, apiUrl, apiMethod, apiKey, headers, visualizeData });
        break;
      case 'firefox':
        generateFirefoxExtension(tempDir, { pluginName, description, apiUrl, apiMethod, apiKey, headers, visualizeData });
        break;
      default:
        throw new Error('Invalid platform');
    }

    // Create a zip file
    const zipFilePath = path.join(os.tmpdir(), `${pluginName}.zip`);
    await createZipFile(tempDir, zipFilePath);

    // Read the zip file
    const zipFileContent = fs.readFileSync(zipFilePath);

    // Clean up temporary files
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(zipFilePath);

    // Send the zip file as a response
    return new NextResponse(zipFileContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${pluginName}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error generating plugin:', error);
    return NextResponse.json({ error: 'Failed to generate plugin' }, { status: 500 });
  }
}

function generateWordPressPlugin(dir: string, data: any) {
  const { pluginName, description, apiUrl, apiMethod, apiKey, headers, visualizeData } = data;
  const pluginFile = `
<?php
/**
 * Plugin Name: ${pluginName}
 * Description: ${description}
 * Version: 1.0
 * Author: API Plugin Generator
 */

function ${pluginName.toLowerCase().replace(/\s/g, '_')}_fetch_data() {
  $api_url = '${apiUrl}';
  $args = array(
    'headers' => array(
      'Authorization' => 'Bearer ${apiKey}'
      ${Object.entries(headers).map(([key, value]) => `,'${key}' => '${value}'`).join('\n      ')}
    )
  );
  
  $response = wp_remote_${apiMethod.toLowerCase()}($api_url, $args);
  
  if (is_wp_error($response)) {
    return 'Error fetching data';
  }
  
  $body = wp_remote_retrieve_body($response);
  $data = json_decode($body);
  
  return $data;
}

function ${pluginName.toLowerCase().replace(/\s/g, '_')}_shortcode() {
  $data = ${pluginName.toLowerCase().replace(/\s/g, '_')}_fetch_data();
  
  // Convert data to HTML representation
  $output = '<div class="api-data">';
  $output .= '<pre>' . print_r($data, true) . '</pre>';
  $output .= '</div>';
  
  return $output;
}

add_shortcode('${pluginName.toLowerCase().replace(/\s/g, '_')}', '${pluginName.toLowerCase().replace(/\s/g, '_')}_shortcode');

${visualizeData ? `
function ${pluginName.toLowerCase().replace(/\s/g, '_')}_visualize_data() {
  $data = ${pluginName.toLowerCase().replace(/\s/g, '_')}_fetch_data();
  
  // Basic visualization example (you may want to customize this based on your data structure)
  $output = '<div class="api-data-visualization">';
  $output .= '<h2>API Data Visualization</h2>';
  
  if (is_array($data) || is_object($data)) {
    foreach ($data as $key => $value) {
      $output .= '<div class="data-item">';
      $output .= '<strong>' . esc_html($key) . ':</strong> ' . esc_html(print_r($value, true));
      $output .= '</div>';
    }
  } else {
    $output .= '<p>Unable to visualize data. Please check the API response format.</p>';
  }
  
  $output .= '</div>';
  
  return $output;
}

add_shortcode('${pluginName.toLowerCase().replace(/\s/g, '_')}_visualize', '${pluginName.toLowerCase().replace(/\s/g, '_')}_visualize_data');
` : ''}
`;

  fs.writeFileSync(path.join(dir, `${pluginName.toLowerCase().replace(/\s/g, '-')}.php`), pluginFile);
}

function generateChromeExtension(dir: string, data: any) {
  const { pluginName, description, apiUrl, apiMethod, apiKey, headers, visualizeData } = data;
  
  const manifestFile = `
{
  "manifest_version": 3,
  "name": "${pluginName}",
  "version": "1.0",
  "description": "${description}",
  "permissions": ["activeTab"],
  "host_permissions": ["${apiUrl}"],
  "action": {
    "default_popup": "popup.html"
  }
}
`;

  const popupHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${pluginName}</title>
  <script src="popup.js"></script>
  <style>
    body {
      width: 300px;
      padding: 10px;
      font-family: Arial, sans-serif;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    ${visualizeData ? `
    .visualization {
      margin-top: 20px;
    }
    .data-item {
      margin-bottom: 10px;
    }
    ` : ''}
  </style>
</head>
<body>
  <h1>${pluginName}</h1>
  <div id="result"></div>
  ${visualizeData ? '<div id="visualization" class="visualization"></div>' : ''}
</body>
</html>
`;

  const popupJs = `
document.addEventListener('DOMContentLoaded', function() {
  fetch('${apiUrl}', {
    method: '${apiMethod}',
    headers: {
      'Authorization': 'Bearer ${apiKey}'
      ${Object.entries(headers).map(([key, value]) => `,'${key}': '${value}'`).join('\n      ')}
    }
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    ${visualizeData ? `
    // Basic visualization (customize based on your data structure)
    const visualization = document.getElementById('visualization');
    visualization.innerHTML = '<h2>Data Visualization</h2>';
    for (const [key, value] of Object.entries(data)) {
      const item = document.createElement('div');
      item.className = 'data-item';
      item.innerHTML = '<strong>' + key + ':</strong> ' + JSON.stringify(value);
      visualization.appendChild(item);
    }
    ` : ''}
  })
  .catch(error => {
    document.getElementById('result').innerText = 'Error: ' + error.message;
  });
});
`;

  fs.writeFileSync(path.join(dir, 'manifest.json'), manifestFile);
  fs.writeFileSync(path.join(dir, 'popup.html'), popupHtml);
  fs.writeFileSync(path.join(dir, 'popup.js'), popupJs);
}

function generateFirefoxExtension(dir: string, data: any) {
  const { pluginName, description, apiUrl, apiMethod, apiKey, headers, visualizeData } = data;
  
  const manifestFile = `
{
  "manifest_version": 2,
  "name": "${pluginName}",
  "version": "1.0",
  "description": "${description}",
  "permissions": ["${apiUrl}"],
  "browser_action": {
    "default_popup": "popup.html"
  }
}
`;

  const popupHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${pluginName}</title>
  <script src="popup.js"></script>
  <style>
    body {
      width: 300px;
      padding: 10px;
      font-family: Arial, sans-serif;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    ${visualizeData ? `
    .visualization {
      margin-top: 20px;
    }
    .data-item {
      margin-bottom: 10px;
    }
    ` : ''}
  </style>
</head>
<body>
  <h1>${pluginName}</h1>
  <div id="result"></div>
  ${visualizeData ? '<div id="visualization" class="visualization"></div>' : ''}
</body>
</html>
`;

  const popupJs = `
document.addEventListener('DOMContentLoaded', function() {
  fetch('${apiUrl}', {
    method: '${apiMethod}',
    headers: {
      'Authorization': 'Bearer ${apiKey}'
      ${Object.entries(headers).map(([key, value]) => `,'${key}': '${value}'`).join('\n      ')}
    }
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    ${visualizeData ? `
    // Basic visualization (customize based on your data structure)
    const visualization = document.getElementById('visualization');
    visualization.innerHTML = '<h2>Data Visualization</h2>';
    for (const [key, value] of Object.entries(data)) {
      const item = document.createElement('div');
      item.className = 'data-item';
      item.innerHTML = '<strong>' + key + ':</strong> ' + JSON.stringify(value);
      visualization.appendChild(item);
    }
    ` : ''}
  })
  .catch(error => {
    document.getElementById('result').innerText = 'Error: ' + error.message;
  });
});
`;

  fs.writeFileSync(path.join(dir, 'manifest.json'), manifestFile);
  fs.writeFileSync(path.join(dir, 'popup.html'), popupHtml);
  fs.writeFileSync(path.join(dir, 'popup.js'), popupJs);
}

async function createZipFile(sourceDir: string, outputFilePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', err => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}



