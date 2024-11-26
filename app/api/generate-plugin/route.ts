import { NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { platform, pluginName, description, apiUrl, apiMethod, apiKey, visualizeData } = data

  const archive = archiver('zip', {
    zlib: { level: 9 },
  })

  const chunks: Uint8Array[] = []
  archive.on('data', (chunk) => chunks.push(chunk))

  const files = generatePluginFiles(platform, { pluginName, description, apiUrl, apiMethod, apiKey, visualizeData })

  for (const [filename, content] of Object.entries(files)) {
    archive.append(content, { name: filename })
  }

  // Add installation instructions
  const instructions = generateInstructions(platform, pluginName)
  archive.append(instructions, { name: 'INSTALL.md' })

  await archive.finalize()

  const zipBuffer = Buffer.concat(chunks)

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${pluginName}.zip"`,
    },
  })
}

function generatePluginFiles(platform: string, data: any) {
  const files: Record<string, string> = {}

  if (platform === 'wordpress') {
    files['plugin.php'] = `
<?php
/*
Plugin Name: ${data.pluginName}
Description: ${data.description}
Version: 1.0
Author: Generated Plugin
*/

function call_api() {
    $api_url = "${data.apiUrl}";
    $api_key = "${data.apiKey}";

    $response = wp_remote_${data.apiMethod.toLowerCase()}($api_url, array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key,
        ),
    ));

    $body = wp_remote_retrieve_body($response);
    
    if (${data.visualizeData}) {
        return visualize_data($body);
    }
    
    return $body;
}

function visualize_data($data) {
    $json_data = json_decode($data, true);
    $output = '<div class="api-data-visualization">';
    
    foreach ($json_data as $key => $value) {
        $output .= "<p><strong>$key:</strong> $value</p>";
    }
    
    $output .= '</div>';
    return $output;
}

add_shortcode('api_data', 'call_api');
`
  } else if (platform === 'chrome' || platform === 'firefox') {
    files['manifest.json'] = `
{
  "manifest_version": ${platform === 'chrome' ? 3 : 2},
  "name": "${data.pluginName}",
  "version": "1.0",
  "description": "${data.description}",
  ${platform === 'chrome' ? '"background": { "service_worker": "background.js" },' : '"background": { "scripts": ["background.js"] },'}
  "permissions": ["storage", "${data.apiUrl}"]
}
`

    files['background.js'] = `
console.log('Background script for ${data.pluginName} running!');

function callApi() {
  fetch("${data.apiUrl}", {
    method: "${data.apiMethod}",
    headers: {
      "Authorization": "Bearer ${data.apiKey}",
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      ${data.visualizeData ? 'visualizeData(data);' : ''}
    })
    .catch(error => console.error('Error:', error));
}

${data.visualizeData ? `
function visualizeData(data) {
  // This is a simple visualization. You might want to use a charting library for more complex visualizations.
  let visualizationHtml = '<div style="font-family: Arial, sans-serif;">';
  for (let [key, value] of Object.entries(data)) {
    visualizationHtml += \`<p><strong>\${key}:</strong> \${value}</p>\`;
  }
  visualizationHtml += '</div>';

  chrome.runtime.sendMessage({action: "updateVisualization", html: visualizationHtml});
}
` : ''}

callApi();
`

    if (data.visualizeData) {
      files['popup.html'] = `
<!DOCTYPE html>
<html>
<head>
  <title>${data.pluginName}</title>
</head>
<body>
  <div id="visualization"></div>
  <script src="popup.js"></script>
</body>
</html>
`

      files['popup.js'] = `
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateVisualization") {
    document.getElementById('visualization').innerHTML = request.html;
  }
});
`
    }
  }

  return files
}

function generateInstructions(platform: string, pluginName: string) {
  let instructions = `# Installation Instructions for ${pluginName}\n\n`;

  switch (platform) {
    case 'wordpress':
      instructions += `
1. Log in to your WordPress admin panel.
2. Navigate to Plugins > Add New.
3. Click on the "Upload Plugin" button at the top of the page.
4. Click "Choose File" and select the ${pluginName}.zip file.
5. Click "Install Now".
6. After installation, click "Activate Plugin".
7. The plugin is now installed and activated. You can use the [api_data] shortcode in your posts or pages to display the API data.
`;
      break;
    case 'chrome':
      instructions += `
1. Open Google Chrome and navigate to chrome://extensions.
2. Enable "Developer mode" by toggling the switch in the top right corner.
3. Click on "Load unpacked" button.
4. Select the folder containing the unzipped ${pluginName} files.
5. The extension should now appear in your list of installed extensions.
`;
      break;
    case 'firefox':
      instructions += `
1. Open Firefox and navigate to about:debugging.
2. Click on "This Firefox" in the left sidebar.
3. Click on "Load Temporary Add-on".
4. Navigate to the folder containing the unzipped ${pluginName} files and select the manifest.json file.
5. The extension should now be temporarily installed and appear in your list of add-ons.

Note: To permanently install the add-on, you need to submit it to Mozilla for signing.
`;
      break;
  }

  return instructions;
}

