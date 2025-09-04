// Claude Code Prompt Optimizer - JavaScript

let currentTemplates = {};
let currentTemplateData = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Claude Code Prompt Optimizer carregado');
});

// Carregar templates quando categoria é selecionada
async function loadTemplates() {
    const categorySelect = document.getElementById('category');
    const templateSelect = document.getElementById('template');
    const category = categorySelect.value;
    
    // Reset template select
    templateSelect.innerHTML = '<option value="">Selecione um template...</option>';
    templateSelect.disabled = true;
    hideTemplateInfo();
    
    if (!category) {
        return;
    }
    
    try {
        const response = await fetch(`/api/templates/${category}`);
        const data = await response.json();
        
        if (response.ok) {
            currentTemplates = data.templates;
            
            // Preencher select de templates
            for (const [key, template] of Object.entries(currentTemplates)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = template.name;
                templateSelect.appendChild(option);
            }
            
            templateSelect.disabled = false;
        } else {
            showMessage('Erro ao carregar templates: ' + data.error, 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão: ' + error.message, 'error');
    }
}

// Carregar informações do template
async function loadTemplateInfo() {
    const categorySelect = document.getElementById('category');
    const templateSelect = document.getElementById('template');
    const category = categorySelect.value;
    const templateKey = templateSelect.value;
    
    if (!category || !templateKey) {
        hideTemplateInfo();
        return;
    }
    
    currentTemplateData = currentTemplates[templateKey];
    
    // Mostrar informações do template
    document.getElementById('template-description').textContent = currentTemplateData.description;
    
    // Carregar exemplos
    try {
        const response = await fetch(`/api/examples/${category}/${templateKey}`);
        const data = await response.json();
        
        if (response.ok) {
            displayTemplateInfo(data);
            createVariableInputs(data.variables, data.examples);
        } else {
            showMessage('Erro ao carregar exemplos: ' + data.error, 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão: ' + error.message, 'error');
    }
}

// Exibir informações do template
function displayTemplateInfo(data) {
    const templateInfo = document.getElementById('template-info');
    const variablesDiv = document.getElementById('template-variables');
    const examplesDiv = document.getElementById('template-examples');
    
    // Mostrar variáveis
    if (data.variables && data.variables.length > 0) {
        variablesDiv.innerHTML = `
            <h4>Variáveis necessárias:</h4>
            <ul>
                ${data.variables.map(variable => `<li><code>${variable}</code></li>`).join('')}
            </ul>
        `;
    } else {
        variablesDiv.innerHTML = '';
    }
    
    // Mostrar exemplos
    if (data.examples && data.examples.length > 0) {
        examplesDiv.innerHTML = `
            <h4>Exemplos:</h4>
            <div class="examples-container">
                ${data.examples.map((example, index) => `
                    <div class="example-item" onclick="loadExample(${index})">
                        <strong>Exemplo ${index + 1}:</strong><br>
                        <small>${Object.entries(example).map(([key, value]) => `${key}: ${value}`).join(', ')}</small>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        examplesDiv.innerHTML = '';
    }
    
    templateInfo.style.display = 'block';
}

// Criar inputs para variáveis
function createVariableInputs(variables, examples) {
    const variablesForm = document.getElementById('variables-form');
    const variablesInputs = document.getElementById('variables-inputs');
    
    if (!variables || variables.length === 0) {
        variablesForm.style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
        return;
    }
    
    let inputsHTML = '';
    variables.forEach(variable => {
        inputsHTML += `
            <div class="variable-input">
                <label for="var-${variable}">${variable}:</label>
                <input type="text" id="var-${variable}" name="${variable}" placeholder="Digite ${variable}...">
            </div>
        `;
    });
    
    variablesInputs.innerHTML = inputsHTML;
    variablesForm.style.display = 'block';
    
    // Habilitar botão quando todos os campos estiverem preenchidos
    const inputs = variablesInputs.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', checkFormCompletion);
    });
    
    checkFormCompletion();
}

// Verificar se o formulário está completo
function checkFormCompletion() {
    const inputs = document.querySelectorAll('#variables-inputs input');
    const generateBtn = document.getElementById('generate-btn');
    
    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            allFilled = false;
        }
    });
    
    generateBtn.disabled = !allFilled;
}

// Carregar exemplo
function loadExample(exampleIndex) {
    const categorySelect = document.getElementById('category');
    const templateSelect = document.getElementById('template');
    const category = categorySelect.value;
    const templateKey = templateSelect.value;
    
    fetch(`/api/examples/${category}/${templateKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.examples && data.examples[exampleIndex]) {
                const example = data.examples[exampleIndex];
                
                // Preencher inputs com valores do exemplo
                Object.entries(example).forEach(([key, value]) => {
                    const input = document.getElementById(`var-${key}`);
                    if (input) {
                        input.value = value;
                    }
                });
                
                checkFormCompletion();
                showMessage('Exemplo carregado com sucesso!', 'success');
            }
        })
        .catch(error => {
            showMessage('Erro ao carregar exemplo: ' + error.message, 'error');
        });
}

// Gerar prompt
async function generatePrompt() {
    const categorySelect = document.getElementById('category');
    const templateSelect = document.getElementById('template');
    const category = categorySelect.value;
    const template = templateSelect.value;
    
    if (!category || !template) {
        showMessage('Selecione categoria e template', 'error');
        return;
    }
    
    // Coletar variáveis
    const variables = {};
    const inputs = document.querySelectorAll('#variables-inputs input');
    inputs.forEach(input => {
        variables[input.name] = input.value.trim();
    });
    
    // Mostrar loading
    const generateBtn = document.getElementById('generate-btn');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="loading"></span> Gerando...';
    generateBtn.disabled = true;
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category: category,
                template: template,
                variables: variables
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayResult(data);
            showMessage('Prompt gerado com sucesso!', 'success');
        } else {
            showMessage('Erro ao gerar prompt: ' + data.error, 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão: ' + error.message, 'error');
    } finally {
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}

// Exibir resultado
function displayResult(data) {
    const resultSection = document.getElementById('result-section');
    const templateName = document.getElementById('result-template-name');
    const generatedPrompt = document.getElementById('generated-prompt');
    const resultMetadata = document.getElementById('result-metadata');
    
    templateName.textContent = `${data.template_info.category} > ${data.template_info.name}`;
    generatedPrompt.textContent = data.prompt;
    
    resultMetadata.innerHTML = `
        <strong>Gerado em:</strong> ${new Date(data.metadata.generated_at).toLocaleString('pt-BR')}<br>
        <strong>Total de prompts gerados:</strong> ${data.metadata.total_prompts_generated}<br>
        <strong>Variáveis utilizadas:</strong> ${Object.entries(data.metadata.variables_used).map(([k, v]) => `${k}=${v}`).join(', ')}
    `;
    
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Copiar prompt
function copyPrompt() {
    const promptText = document.getElementById('generated-prompt').textContent;
    
    navigator.clipboard.writeText(promptText).then(() => {
        showMessage('Prompt copiado para a área de transferência!', 'success');
        
        // Animação visual no botão
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        copyBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#3498db';
        }, 2000);
    }).catch(err => {
        showMessage('Erro ao copiar: ' + err.message, 'error');
    });
}

// Limpar formulário
function clearForm() {
    document.getElementById('category').value = '';
    document.getElementById('template').value = '';
    document.getElementById('template').disabled = true;
    
    hideTemplateInfo();
    document.getElementById('variables-form').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('generate-btn').disabled = true;
    
    showMessage('Formulário limpo!', 'success');
}

// Esconder informações do template
function hideTemplateInfo() {
    document.getElementById('template-info').style.display = 'none';
    document.getElementById('variables-form').style.display = 'none';
}

// Carregar template popular
function loadPopularTemplate(category, templateKey) {
    document.getElementById('category').value = category;
    loadTemplates().then(() => {
        document.getElementById('template').value = templateKey;
        loadTemplateInfo();
    });
    
    // Scroll para o topo
    document.querySelector('.section').scrollIntoView({ behavior: 'smooth' });
}

// Carregar item do histórico
function loadHistoryItem(category, templateKey, variables) {
    document.getElementById('category').value = category;
    loadTemplates().then(() => {
        document.getElementById('template').value = templateKey;
        loadTemplateInfo().then(() => {
            // Aguardar criação dos inputs
            setTimeout(() => {
                Object.entries(variables).forEach(([key, value]) => {
                    const input = document.getElementById(`var-${key}`);
                    if (input) {
                        input.value = value;
                    }
                });
                checkFormCompletion();
            }, 500);
        });
    });
    
    // Scroll para o topo
    document.querySelector('.section').scrollIntoView({ behavior: 'smooth' });
}

// Mostrar mensagem
function showMessage(message, type) {
    // Remover mensagens existentes
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Inserir no topo do container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remover após 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
    
    // Scroll para a mensagem
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Atualizar estatísticas periodicamente
setInterval(async () => {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        // Atualizar contadores no header
        const statItems = document.querySelectorAll('.stat-item');
        if (statItems.length >= 2) {
            statItems[0].innerHTML = `<i class="fas fa-chart-line"></i> Total: ${stats.total_prompts} prompts`;
            statItems[1].innerHTML = `<i class="fas fa-fire"></i> Categorias: ${Object.keys(stats.categories).length}`;
        }
    } catch (error) {
        console.log('Erro ao atualizar estatísticas:', error);
    }
}, 30000); // Atualizar a cada 30 segundos

