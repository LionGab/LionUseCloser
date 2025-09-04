#!/usr/bin/env python3
"""
Claude Code Prompt Optimizer - App Pessoal
Gera prompts otimizados para Claude Code CLI baseado em melhores práticas
Data: 04/09/2025
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import os
from datetime import datetime
from typing import Dict, List, Any

app = Flask(__name__, static_url_path='/static', static_folder='static')

class PromptOptimizer:
    """Otimizador de prompts para Claude Code CLI"""
    
    def __init__(self):
        self.data_dir = "data"
        self.templates_file = os.path.join(self.data_dir, "prompt_templates.json")
        self.usage_file = os.path.join(self.data_dir, "usage_stats.json")
        self.load_templates()
        self.load_usage_stats()
    
    def load_templates(self):
        """Carrega templates de prompts otimizados"""
        self.templates = {
            "development": {
                "name": "Desenvolvimento",
                "templates": {
                    "create_project": {
                        "name": "Criar Projeto",
                        "description": "Criar novo projeto com estrutura completa",
                        "template": "/create_project name={project_name} type={project_type} framework={framework}\n\nCriar projeto {project_name} com:\n\nESTRUTURA:\n- Arquitetura {framework} otimizada\n- Configuração CI/CD\n- Testes automatizados\n- Documentação completa\n- Deploy pronto produção\n\nSiga P→E→V→R e RA. Zero conjecturas.\nEntregue diffs + testes + comandos execução.",
                        "variables": ["project_name", "project_type", "framework"],
                        "examples": [
                            {"project_name": "meu-app", "project_type": "web_app", "framework": "flask"},
                            {"project_name": "api-service", "project_type": "api", "framework": "fastapi"}
                        ]
                    },
                    "debug_issue": {
                        "name": "Debug Problema",
                        "description": "Debugar e corrigir problema específico",
                        "template": "/debug_issue file={file_path} symptom=\"{symptom}\" priority={priority}\n\nDebugar problema em {file_path}:\n\nSINTOMAS:\n- {symptom}\n- Comportamento esperado vs atual\n- Logs/erros relevantes\n\nOBJETIVO:\n- Identificar causa raiz\n- Implementar correção\n- Adicionar testes preventivos\n- Documentar solução\n\nSiga P→E→V→R e RA. Evidências com paths+linhas.\nEntregue patch + teste que falha→passa.",
                        "variables": ["file_path", "symptom", "priority"],
                        "examples": [
                            {"file_path": "src/api/users.py", "symptom": "timeout em requests", "priority": "high"},
                            {"file_path": "frontend/components/Form.tsx", "symptom": "validação não funciona", "priority": "medium"}
                        ]
                    },
                    "optimize_performance": {
                        "name": "Otimizar Performance",
                        "description": "Otimizar performance de código/sistema",
                        "template": "/optimize_performance target={target_component} metric={performance_metric} goal={target_goal}\n\nOtimizar performance de {target_component}:\n\nMÉTRICAS ATUAIS:\n- {performance_metric} atual\n- Gargalos identificados\n- Recursos consumidos\n\nMETA:\n- {target_goal}\n- Manter funcionalidade\n- Adicionar monitoramento\n\nSiga P→E→V→R e RA. Benchmarks antes/depois.\nEntregue otimizações + testes performance.",
                        "variables": ["target_component", "performance_metric", "target_goal"],
                        "examples": [
                            {"target_component": "database queries", "performance_metric": "response time 2s", "target_goal": "< 500ms"},
                            {"target_component": "frontend bundle", "performance_metric": "size 2MB", "target_goal": "< 1MB"}
                        ]
                    }
                }
            },
            "agronegocio": {
                "name": "Agronegócio",
                "templates": {
                    "compliance_audit": {
                        "name": "Auditoria Compliance",
                        "description": "Auditoria compliance fiscal agronegócio",
                        "template": "/audit_compliance_agro state={state} erp={erp_system} urgency={urgency_level}\n\nAuditoria compliance agronegócio:\n\nCONTEXTO:\n- Estado: {state}\n- ERP: {erp_system}\n- Urgência: {urgency_level}\n- Safra 2024/25 ativa\n\nFOCO:\n- NFP-e SEFAZ-{state}\n- Certificado digital A1/A3\n- Integração {erp_system}\n- FUNRURAL + SPED\n\nSiga P→E→V→R e RA. Compliance 100%.\nEntregue relatório + plano correção + ROI.",
                        "variables": ["state", "erp_system", "urgency_level"],
                        "examples": [
                            {"state": "MT", "erp_system": "TOTVS Agro", "urgency_level": "critical"},
                            {"state": "GO", "erp_system": "SAP", "urgency_level": "high"}
                        ]
                    },
                    "erp_integration": {
                        "name": "Integração ERP",
                        "description": "Integração automática ERP agronegócio",
                        "template": "/integrate_erp_agro erp={erp_system} modules={modules} automation_level={automation}\n\nIntegração ERP agronegócio:\n\nSISTEMA:\n- ERP: {erp_system}\n- Módulos: {modules}\n- Automação: {automation}\n\nINTEGRAÇÕES:\n- SEFAZ estadual\n- NFP-e automática\n- Workflow safra\n- Dashboard ROI\n\nSiga P→E→V→R e RA. Production-ready.\nEntregue código + testes + deploy.",
                        "variables": ["erp_system", "modules", "automation"],
                        "examples": [
                            {"erp_system": "TOTVS Agro", "modules": "fiscal,estoque,vendas", "automation": "95%"},
                            {"erp_system": "Protheus", "modules": "fiscal,financeiro", "automation": "80%"}
                        ]
                    },
                    "roi_calculation": {
                        "name": "Cálculo ROI",
                        "description": "Cálculo ROI detalhado agronegócio",
                        "template": "/calculate_roi_agro investment={investment} current_cost={monthly_cost} timeline={timeline}\n\nCálculo ROI agronegócio:\n\nINVESTIMENTO:\n- Valor: R$ {investment}\n- Custo atual: R$ {monthly_cost}/mês\n- Timeline: {timeline}\n\nANÁLISE:\n- Baseline operacional\n- Economia projetada\n- Payback period\n- VPL + TIR\n- Cenários (conservador/otimista)\n\nSiga P→E→V→R e RA. Métricas validadas.\nEntregue planilha + dashboard + apresentação.",
                        "variables": ["investment", "monthly_cost", "timeline"],
                        "examples": [
                            {"investment": "75000", "monthly_cost": "35000", "timeline": "24 meses"},
                            {"investment": "120000", "monthly_cost": "50000", "timeline": "36 meses"}
                        ]
                    }
                }
            },
            "deployment": {
                "name": "Deploy & DevOps",
                "templates": {
                    "setup_cicd": {
                        "name": "Setup CI/CD",
                        "description": "Configurar pipeline CI/CD completo",
                        "template": "/setup_cicd platform={platform} env={environments} tests={test_types}\n\nConfigurar CI/CD:\n\nPLATAFORMA:\n- {platform}\n- Ambientes: {environments}\n- Testes: {test_types}\n\nPIPELINE:\n- Build automatizado\n- Testes multi-stage\n- Deploy automático\n- Rollback seguro\n- Monitoramento\n\nSiga P→E→V→R e RA. Zero downtime.\nEntregue workflows + scripts + docs.",
                        "variables": ["platform", "environments", "test_types"],
                        "examples": [
                            {"platform": "GitHub Actions", "environments": "dev,staging,prod", "test_types": "unit,integration,e2e"},
                            {"platform": "GitLab CI", "environments": "test,prod", "test_types": "unit,security"}
                        ]
                    },
                    "deploy_render": {
                        "name": "Deploy Render.com",
                        "description": "Deploy otimizado para Render.com",
                        "template": "/deploy_render app_type={app_type} framework={framework} features={features}\n\nDeploy Render.com:\n\nAPLICAÇÃO:\n- Tipo: {app_type}\n- Framework: {framework}\n- Features: {features}\n\nCONFIGURAÇÃO:\n- requirements.txt otimizado\n- Procfile configurado\n- Environment variables\n- Health checks\n- Auto-scaling\n\nSiga P→E→V→R e RA. Production-ready.\nEntregue config + deploy + monitoring.",
                        "variables": ["app_type", "framework", "features"],
                        "examples": [
                            {"app_type": "web_app", "framework": "flask", "features": "api,dashboard,auth"},
                            {"app_type": "api_service", "framework": "fastapi", "features": "rest,docs,metrics"}
                        ]
                    }
                }
            },
            "security": {
                "name": "Segurança",
                "templates": {
                    "security_audit": {
                        "name": "Auditoria Segurança",
                        "description": "Auditoria completa de segurança",
                        "template": "/security_audit scope={audit_scope} compliance={compliance_reqs} priority={priority}\n\nAuditoria segurança:\n\nESCOPO:\n- {audit_scope}\n- Compliance: {compliance_reqs}\n- Prioridade: {priority}\n\nVERIFICAÇÕES:\n- Vulnerabilidades código\n- Secrets expostos\n- Configurações inseguras\n- Dependências desatualizadas\n- Logs PII\n\nSiga P→E→V→R e RA. Zero false positives.\nEntregue relatório + correções + scripts.",
                        "variables": ["audit_scope", "compliance_reqs", "priority"],
                        "examples": [
                            {"audit_scope": "web_app", "compliance_reqs": "LGPD,SOX", "priority": "critical"},
                            {"audit_scope": "api_service", "compliance_reqs": "OWASP", "priority": "high"}
                        ]
                    }
                }
            }
        }
    
    def load_usage_stats(self):
        """Carrega estatísticas de uso"""
        if os.path.exists(self.usage_file):
            with open(self.usage_file, 'r', encoding='utf-8') as f:
                self.usage_stats = json.load(f)
        else:
            self.usage_stats = {
                "total_prompts": 0,
                "categories": {},
                "popular_templates": [],
                "last_used": []
            }
    
    def save_usage_stats(self):
        """Salva estatísticas de uso"""
        os.makedirs(self.data_dir, exist_ok=True)
        with open(self.usage_file, 'w', encoding='utf-8') as f:
            json.dump(self.usage_stats, f, indent=2, ensure_ascii=False)
    
    def generate_prompt(self, category: str, template_key: str, variables: Dict[str, str]) -> Dict[str, Any]:
        """Gera prompt otimizado baseado no template"""
        if category not in self.templates:
            return {"error": f"Categoria '{category}' não encontrada"}
        
        if template_key not in self.templates[category]["templates"]:
            return {"error": f"Template '{template_key}' não encontrado na categoria '{category}'"}
        
        template_data = self.templates[category]["templates"][template_key]
        template_str = template_data["template"]
        
        # Substituir variáveis no template
        try:
            formatted_prompt = template_str.format(**variables)
        except KeyError as e:
            return {"error": f"Variável obrigatória não fornecida: {e}"}
        
        # Atualizar estatísticas
        self.usage_stats["total_prompts"] += 1
        if category not in self.usage_stats["categories"]:
            self.usage_stats["categories"][category] = 0
        self.usage_stats["categories"][category] += 1
        
        # Adicionar aos últimos usados
        usage_entry = {
            "category": category,
            "template": template_key,
            "timestamp": datetime.now().isoformat(),
            "variables": variables
        }
        self.usage_stats["last_used"].insert(0, usage_entry)
        self.usage_stats["last_used"] = self.usage_stats["last_used"][:10]  # Manter apenas os 10 últimos
        
        self.save_usage_stats()
        
        return {
            "success": True,
            "prompt": formatted_prompt,
            "template_info": {
                "name": template_data["name"],
                "description": template_data["description"],
                "category": self.templates[category]["name"]
            },
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "variables_used": variables,
                "total_prompts_generated": self.usage_stats["total_prompts"]
            }
        }
    
    def get_popular_templates(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Retorna templates mais populares"""
        popular = []
        for category, templates in self.templates.items():
            for template_key, template_data in templates["templates"].items():
                # Contar uso nos últimos usados
                usage_count = sum(1 for usage in self.usage_stats["last_used"] 
                                if usage["category"] == category and usage["template"] == template_key)
                
                popular.append({
                    "category": category,
                    "template_key": template_key,
                    "name": template_data["name"],
                    "description": template_data["description"],
                    "usage_count": usage_count
                })
        
        return sorted(popular, key=lambda x: x["usage_count"], reverse=True)[:limit]

# Instância global do otimizador
optimizer = PromptOptimizer()

@app.route('/')
def index():
    """Página principal"""
    popular_templates = optimizer.get_popular_templates()
    return render_template('index.html', 
                         templates=optimizer.templates,
                         popular_templates=popular_templates,
                         usage_stats=optimizer.usage_stats)

@app.route('/api/generate', methods=['POST'])
def generate_prompt():
    """API para gerar prompt otimizado"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados não fornecidos"}), 400
    
    category = data.get('category')
    template_key = data.get('template')
    variables = data.get('variables', {})
    
    if not category or not template_key:
        return jsonify({"error": "Categoria e template são obrigatórios"}), 400
    
    result = optimizer.generate_prompt(category, template_key, variables)
    
    if "error" in result:
        return jsonify(result), 400
    
    return jsonify(result)

@app.route('/api/templates/<category>')
def get_templates(category):
    """API para obter templates de uma categoria"""
    if category not in optimizer.templates:
        return jsonify({"error": "Categoria não encontrada"}), 404
    
    return jsonify(optimizer.templates[category])

@app.route('/api/stats')
def get_stats():
    """API para obter estatísticas de uso"""
    return jsonify(optimizer.usage_stats)

@app.route('/api/examples/<category>/<template_key>')
def get_examples(category, template_key):
    """API para obter exemplos de um template"""
    if category not in optimizer.templates:
        return jsonify({"error": "Categoria não encontrada"}), 404
    
    if template_key not in optimizer.templates[category]["templates"]:
        return jsonify({"error": "Template não encontrado"}), 404
    
    template_data = optimizer.templates[category]["templates"][template_key]
    return jsonify({
        "examples": template_data.get("examples", []),
        "variables": template_data.get("variables", [])
    })

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Servir arquivos estáticos explicitamente"""
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    return send_from_directory(static_dir, filename)

if __name__ == '__main__':
    # Criar diretório de dados se não existir
    os.makedirs('data', exist_ok=True)
    
    # Configuração para produção (Render.com)
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') != 'production'
    
    # Executar app
    app.run(debug=debug, host='0.0.0.0', port=port)

