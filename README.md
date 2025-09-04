# 🤖 Claude Code Prompt Optimizer

**App pessoal para gerar os melhores prompts de comando para Claude Code CLI**

Baseado nas melhores práticas P→E→V→R e RA (Response Awareness) - Atualizado para 04/09/2025

## 🎯 Funcionalidades

### ✨ **Geração de Prompts Otimizados**
- Templates baseados nas melhores práticas Claude Code
- Prompts seguindo metodologia P→E→V→R (Plan→Execute→Verify→Report)
- Response Awareness (RA) integrado
- Zero conjecturas e verificação defensiva

### 📊 **Categorias Disponíveis**
- **Desenvolvimento**: Criar projetos, debug, otimização performance
- **Agronegócio**: Compliance fiscal, integração ERP, cálculo ROI
- **Deploy & DevOps**: CI/CD, Render.com, infraestrutura
- **Segurança**: Auditorias, compliance, vulnerabilidades

### 🚀 **Interface Intuitiva**
- Seleção de categoria e template
- Preenchimento automático com exemplos
- Histórico de prompts gerados
- Templates populares
- Cópia com um clique

### 📈 **Estatísticas de Uso**
- Tracking de prompts gerados
- Templates mais utilizados
- Histórico completo
- Métricas de uso

## 🛠️ Instalação e Uso

### **Pré-requisitos**
- Python 3.8+
- pip

### **Setup Local**

```bash
# 1. Clonar/extrair projeto
cd claude_code_prompt_optimizer

# 2. Criar ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Executar aplicação
python app.py
```

### **Acessar Aplicação**
- Abra o navegador em: http://localhost:5000
- Interface pronta para uso!

## 📋 Como Usar

### **1. Selecionar Categoria**
Escolha a categoria que melhor se adequa ao seu projeto:
- **Desenvolvimento**: Para projetos de software em geral
- **Agronegócio**: Para automação no setor agrícola
- **Deploy**: Para configuração de infraestrutura
- **Segurança**: Para auditorias e compliance

### **2. Escolher Template**
Selecione o template específico para sua necessidade. Cada template é otimizado com as melhores práticas Claude Code.

### **3. Preencher Variáveis**
Complete as variáveis necessárias. Use os exemplos fornecidos como referência para valores apropriados.

### **4. Gerar e Copiar**
Clique em "Gerar Prompt" e copie o resultado para usar diretamente no Claude Code CLI.

## 🎯 Exemplos de Prompts Gerados

### **Desenvolvimento - Criar Projeto**
```
/create_project name=meu-app type=web_app framework=flask

Criar projeto meu-app com:

ESTRUTURA:
- Arquitetura flask otimizada
- Configuração CI/CD
- Testes automatizados
- Documentação completa
- Deploy pronto produção

Siga P→E→V→R e RA. Zero conjecturas.
Entregue diffs + testes + comandos execução.
```

### **Agronegócio - Compliance**
```
/audit_compliance_agro state=MT erp=TOTVS_Agro urgency=critical

Auditoria compliance agronegócio:

CONTEXTO:
- Estado: MT
- ERP: TOTVS Agro
- Urgência: critical
- Safra 2024/25 ativa

FOCO:
- NFP-e SEFAZ-MT
- Certificado digital A1/A3
- Integração TOTVS Agro
- FUNRURAL + SPED

Siga P→E→V→R e RA. Compliance 100%.
Entregue relatório + plano correção + ROI.
```

## 🏗️ Arquitetura

### **Backend (Flask)**
- `app.py`: Aplicação principal
- `PromptOptimizer`: Classe core para geração de prompts
- APIs REST para frontend
- Persistência de estatísticas em JSON

### **Frontend**
- HTML5 + CSS3 + JavaScript vanilla
- Interface responsiva
- Interação assíncrona com APIs
- Cópia automática para clipboard

### **Dados**
- `data/prompt_templates.json`: Templates de prompts
- `data/usage_stats.json`: Estatísticas de uso
- Persistência automática

## 📊 Templates Disponíveis

### **Desenvolvimento**
- **Criar Projeto**: Estrutura completa de projeto
- **Debug Problema**: Identificar e corrigir issues
- **Otimizar Performance**: Melhorar performance de código

### **Agronegócio**
- **Auditoria Compliance**: Compliance fiscal agronegócio
- **Integração ERP**: Automação ERP (TOTVS, SAP, Protheus)
- **Cálculo ROI**: Análise financeira detalhada

### **Deploy & DevOps**
- **Setup CI/CD**: Pipeline completo
- **Deploy Render.com**: Configuração otimizada

### **Segurança**
- **Auditoria Segurança**: Análise completa vulnerabilidades

## 🔧 Personalização

### **Adicionar Novos Templates**
Edite o método `load_templates()` em `app.py`:

```python
"novo_template": {
    "name": "Nome do Template",
    "description": "Descrição do que faz",
    "template": "Prompt template com {variavel}",
    "variables": ["variavel"],
    "examples": [{"variavel": "exemplo"}]
}
```

### **Modificar Categorias**
Adicione novas categorias na estrutura `self.templates`:

```python
"nova_categoria": {
    "name": "Nova Categoria",
    "templates": {
        # seus templates aqui
    }
}
```

## 📈 Estatísticas

O app automaticamente coleta:
- Total de prompts gerados
- Uso por categoria
- Templates mais populares
- Histórico de uso (últimos 10)
- Timestamps de geração

## 🚀 Deploy em Produção

### **Render.com**
```bash
# 1. Criar repositório Git
git init
git add .
git commit -m "Initial commit"

# 2. Push para GitHub/GitLab

# 3. Conectar no Render.com
# - Build Command: pip install -r requirements.txt
# - Start Command: python app.py
```

### **Heroku**
```bash
# 1. Criar Procfile
echo "web: gunicorn app:app" > Procfile

# 2. Deploy
heroku create meu-prompt-optimizer
git push heroku main
```

## 🔒 Segurança

- Validação de entrada em todas as APIs
- Sanitização de dados do usuário
- Sem exposição de secrets
- Logs estruturados sem PII

## 📝 Changelog

### **v1.0 - 04/09/2025**
- ✅ Interface completa funcional
- ✅ 4 categorias de templates
- ✅ 8 templates otimizados
- ✅ Sistema de estatísticas
- ✅ Histórico de uso
- ✅ Templates populares
- ✅ Exemplos integrados
- ✅ Cópia com um clique

## 🤝 Contribuição

Este é um app pessoal, mas sugestões são bem-vindas:

1. Novos templates úteis
2. Melhorias na interface
3. Otimizações de performance
4. Correções de bugs

## 📄 Licença

Uso pessoal - Baseado nas melhores práticas públicas da Anthropic Claude Code.

## 🔗 Links Úteis

- [Claude Code CLI](https://claude.ai/code)
- [Anthropic Documentation](https://docs.anthropic.com)
- [Melhores Práticas Claude Code](https://www.anthropic.com/engineering/claude-code-best-practices)

---

**🎯 Desenvolvido para otimizar sua produtividade com Claude Code CLI!**

**Gere prompts profissionais baseados nas melhores práticas em segundos! 🚀**

