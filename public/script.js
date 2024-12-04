document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('plugin-form');
    const generateButton = document.getElementById('generate-button');
    const apiResponseDiv = document.getElementById('api-response');
    const apiResponseContent = document.getElementById('api-response-content');
    const pluginPreviewDiv = document.getElementById('plugin-preview');
    const pluginPreviewContent = document.getElementById('plugin-preview-content');
    const savedConfigsDiv = document.getElementById('saved-configs');
    const savedConfigsList = document.getElementById('saved-configs-list');
    const addHeaderButton = document.getElementById('add-header-button');
    const headerInputs = document.getElementById('header-inputs');
    const generateApiKeyButton = document.getElementById('generate-api-key');
    const apiKeyInput = document.getElementById('apiKey');

    let savedConfigs = JSON.parse(localStorage.getItem('savedConfigs')) || [];
    updateSavedConfigsList();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.visualizeData = formData.get('visualizeData') === 'on';
        data.headers = getCustomHeaders();

        try {
            const response = await fetch('/api/generate-plugin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${data.pluginName}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                showToast('Plugin generated and downloaded successfully!');

                // Save configuration
                savedConfigs.push(data);
                localStorage.setItem('savedConfigs', JSON.stringify(savedConfigs));
                updateSavedConfigsList();
            } else {
                throw new Error('Failed to generate plugin');
            }
        } catch (error) {
            console.error('Error generating plugin:', error);
            showToast('Failed to generate plugin. Please try again.');
        } finally {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Plugin';
        }
    });

    addHeaderButton.addEventListener('click', function() {
        addCustomHeader();
    });

    document.getElementById('test-api-button').addEventListener('click', testApi);
    document.getElementById('generate-preview-button').addEventListener('click', generatePreview);

    generateApiKeyButton.addEventListener('click', function() {
        const apiKey = generateRandomApiKey();
        apiKeyInput.value = apiKey;
    });

    async function testApi() {
        const apiUrl = document.getElementById('apiUrl').value;
        const apiMethod = document.querySelector('input[name="apiMethod"]:checked').value;
        const apiKey = document.getElementById('apiKey').value;
        const headers = getCustomHeaders();

        try {
            const response = await fetch('/api/test-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ apiUrl, apiMethod, apiKey, headers }),
            });

            const data = await response.json();
            apiResponseContent.textContent = JSON.stringify(data, null, 2);
            apiResponseDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error testing API:', error);
            apiResponseContent.textContent = 'Error testing API. Please check your configuration.';
            apiResponseDiv.classList.remove('hidden');
        }
    }

    function generatePreview() {
        const platform = document.getElementById('platform').value;
        const pluginName = document.getElementById('pluginName').value;
        const description = document.getElementById('description').value;
        const apiUrl = document.getElementById('apiUrl').value;
        const apiMethod = document.querySelector('input[name="apiMethod"]:checked').value;
        const apiKey = document.getElementById('apiKey').value;
        const headers = getCustomHeaders();

        let previewCode = '';

        switch (platform) {
            case 'wordpress':
                previewCode = `
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
            ${Object.entries(headers).map(([key, value]) => `,'${key}' => '${value}'`).join('\n            ')}
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

// Use the function like this:
// $api_data = ${pluginName.toLowerCase().replace(/\s/g, '_')}_fetch_data();
`;
                break;
            case 'chrome':
            case 'firefox':
                previewCode = `
// manifest.json
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

// popup.js
document.addEventListener('DOMContentLoaded', function() {
    fetch('${apiUrl}', {
        method: '${apiMethod}',
        headers: {
            'Authorization': 'Bearer ${apiKey}'
            ${Object.entries(headers).map(([key, value]) => `,'${key}': '${value}'`).join('\n            ')}
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = JSON.stringify(data, null, 2);
    })
    .catch(error => {
        document.getElementById('result').innerText = 'Error: ' + error.message;
    });
});
`;
                break;
        }

        pluginPreviewContent.textContent = previewCode;
        pluginPreviewDiv.classList.remove('hidden');
    }

    function updateSavedConfigsList() {
        savedConfigsList.innerHTML = '';
        savedConfigs.forEach((config, index) => {
            const li = document.createElement('li');
            li.textContent = `${config.pluginName} (${config.platform})`;
            li.addEventListener('click', () => loadSavedConfig(index));
            savedConfigsList.appendChild(li);
        });
        savedConfigsDiv.classList.toggle('hidden', savedConfigs.length === 0);
    }

    function loadSavedConfig(index) {
        const config = savedConfigs[index];
        document.getElementById('platform').value = config.platform;
        document.getElementById('pluginName').value = config.pluginName;
        document.getElementById('description').value = config.description;
        document.getElementById('apiUrl').value = config.apiUrl;
        document.querySelector(`input[name="apiMethod"][value="${config.apiMethod}"]`).checked = true;
        document.getElementById('apiKey').value = config.apiKey;
        document.getElementById('visualizeData').checked = config.visualizeData;

        // Clear existing custom headers
        headerInputs.innerHTML = '';

        // Add saved custom headers
        if (config.headers) {
            Object.entries(config.headers).forEach(([key, value]) => {
                addCustomHeader(key, value);
            });
        }
    }

    function getCustomHeaders() {
        const headers = {};
        const headerInputs = document.querySelectorAll('.header-input');
        headerInputs.forEach(input => {
            const name = input.querySelector('input[name="headerName[]"]').value;
            const value = input.querySelector('input[name="headerValue[]"]').value;
            if (name && value) {
                headers[name] = value;
            }
        });
        return headers;
    }

    function addCustomHeader(name = '', value = '') {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'header-input';
        headerDiv.innerHTML = `
            <input type="text" placeholder="Header Name" name="headerName[]" value="${name}">
            <input type="text" placeholder="Header Value" name="headerValue[]" value="${value}">
            <button type="button" class="remove-header">Remove</button>
        `;
        headerInputs.appendChild(headerDiv);

        headerDiv.querySelector('.remove-header').addEventListener('click', function() {
            headerInputs.removeChild(headerDiv);
        });
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function validateForm() {
        let isValid = true;
        const fields = ['platform', 'pluginName', 'description', 'apiUrl', 'apiKey'];
        
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });

        const apiUrl = document.getElementById('apiUrl');
        if (apiUrl.value && !isValidUrl(apiUrl.value)) {
            apiUrl.classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function generateRandomApiKey() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
});



