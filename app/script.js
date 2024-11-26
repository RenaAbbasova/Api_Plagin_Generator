document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pluginForm');
    const generateButton = document.getElementById('generateButton');
    const previousGenerationsSelect = document.getElementById('previousGenerations');
    const toast = document.getElementById('toast');

    let generationHistory = JSON.parse(localStorage.getItem('generationHistory')) || [];
    updatePreviousGenerations();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.visualizeData = formData.get('visualizeData') === 'on';

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
                
                saveGenerationHistory(data);
                showToast('Plugin generated and downloaded successfully!');
            } else {
                throw new Error('Failed to generate plugin');
            }
        } catch (error) {
            console.error('Error generating plugin:', error);
            showToast('Failed to generate plugin. Please try again.', 'error');
        } finally {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Plugin';
        }
    });

    previousGenerationsSelect.addEventListener('change', (e) => {
        const selectedPluginName = e.target.value;
        const selectedHistory = generationHistory.find(h => h.pluginName === selectedPluginName);
        if (selectedHistory) {
            Object.entries(selectedHistory).forEach(([key, value]) => {
                const element = form.elements[key];
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else if (element.type === 'radio') {
                        form.elements[key].value = value;
                    } else {
                        element.value = value;
                    }
                }
            });
        }
    });

    function saveGenerationHistory(data) {
        generationHistory.push(data);
        localStorage.setItem('generationHistory', JSON.stringify(generationHistory));
        updatePreviousGenerations();
    }

    function updatePreviousGenerations() {
        previousGenerationsSelect.innerHTML = '<option value="">Select previous generation</option>';
        generationHistory.forEach(history => {
            const option = document.createElement('option');
            option.value = history.pluginName;
            option.textContent = history.pluginName;
            previousGenerationsSelect.appendChild(option);
        });
    }

    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
});

