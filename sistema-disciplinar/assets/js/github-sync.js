// Sistema de Sincronização com GitHub
class GitHubDataSync {
    constructor() {
        this.baseUrl = 'https://raw.githubusercontent.com/AttilioJohner/sistema-disciplinar/main';
        this.apiUrl = 'https://api.github.com';
        this.owner = 'AttilioJohner';
        this.repo = 'sistema-disciplinar';
        this.branch = 'main';
        
        // Arquivos de dados
        this.dataFiles = {
            frequencia: '/dados/frequencia.json',
            alunos: '/dados/alunos.json', 
            medidas: '/dados/medidas.json',
            db: '/data/db.json'
        };
        
        // Configuração de autenticação
        this.token = null;
        this.userEmail = null;
        this.userName = null;
        this.fileShas = {}; // Cache dos SHAs dos arquivos
        
        // Inicializar autenticação
        this.initAuth();
    }
    
    // Inicializar autenticação
    initAuth() {
        // Tentar token do usuário primeiro
        this.token = localStorage.getItem('github_token');
        
        // Para produção, usar variável de ambiente
        if (!this.token && typeof process !== 'undefined' && process.env) {
            this.token = process.env.GITHUB_TOKEN;
        }
        
        // Se não tiver token, desabilitar funcionalidade
        if (!this.token) {
            console.warn('GitHub sync desabilitado - nenhum token encontrado');
            this.token = null;
        }
        
        this.userEmail = localStorage.getItem('github_email') || 'sistema@escola.edu.br';
        this.userName = localStorage.getItem('github_name') || 'Sistema Disciplinar';
        
        if (this.token) {
            console.log('✅ GitHub API configurado para:', this.userName);
        } else {
            console.log('⚠️ GitHub API não configurado - modo somente leitura');
        }
    }

    // Carregar dados do GitHub
    async carregarDadosGitHub(tipo = 'frequencia') {
        try {
            console.log(`🔄 Carregando dados de ${tipo} do GitHub...`);
            
            const url = this.baseUrl + this.dataFiles[tipo];
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Dados de ${tipo} carregados do GitHub:`, data);
            
            return data;
        } catch (error) {
            console.warn(`⚠️ Não foi possível carregar dados de ${tipo} do GitHub:`, error.message);
            return null;
        }
    }

    // Salvar dados no localStorage com estrutura GitHub
    async salvarDadosLocal(tipo, registros) {
        try {
            const dadosGitHub = {
                lastUpdate: new Date().toISOString(),
                version: "1.0",
                registros: registros || []
            };

            // Salvar no localStorage para backup
            localStorage.setItem(`github_${tipo}`, JSON.stringify(dadosGitHub));
            
            console.log(`💾 Dados de ${tipo} salvos localmente para sincronização`);
            return dadosGitHub;
        } catch (error) {
            console.error(`Erro ao salvar dados de ${tipo}:`, error);
            return null;
        }
    }

    // Carregar dados locais
    carregarDadosLocal(tipo) {
        try {
            const dados = localStorage.getItem(`github_${tipo}`);
            return dados ? JSON.parse(dados) : null;
        } catch (error) {
            console.error(`Erro ao carregar dados locais de ${tipo}:`, error);
            return null;
        }
    }

    // Sincronizar dados (carrega do GitHub ou local)
    async sincronizarDados(tipo = 'frequencia') {
        try {
            // Tentar carregar do GitHub primeiro
            let dadosGitHub = await this.carregarDadosGitHub(tipo);
            
            if (dadosGitHub && dadosGitHub.registros) {
                console.log(`📡 Usando dados do GitHub para ${tipo}`);
                
                // Salvar localmente para cache
                localStorage.setItem(`github_${tipo}`, JSON.stringify(dadosGitHub));
                
                return dadosGitHub.registros;
            }
            
            // Se não conseguir do GitHub, usar dados locais
            const dadosLocais = this.carregarDadosLocal(tipo);
            if (dadosLocais && dadosLocais.registros) {
                console.log(`💻 Usando dados locais para ${tipo}`);
                return dadosLocais.registros;
            }
            
            console.log(`📝 Nenhum dado encontrado para ${tipo}`);
            return [];
            
        } catch (error) {
            console.error(`Erro na sincronização de ${tipo}:`, error);
            return [];
        }
    }

    // Gerar arquivo JSON para commit manual
    gerarArquivoParaCommit(tipo, registros) {
        try {
            const dadosParaCommit = {
                lastUpdate: new Date().toISOString(),
                version: "1.0",
                total: registros.length,
                registros: registros
            };

            const json = JSON.stringify(dadosParaCommit, null, 2);
            
            // Criar e baixar arquivo
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tipo}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log(`📥 Arquivo ${tipo}.json gerado para commit`);
            
            // Mostrar instrução para o usuário
            this.mostrarInstrucaoCommit(tipo);
            
            return dadosParaCommit;
        } catch (error) {
            console.error(`Erro ao gerar arquivo para commit:`, error);
            return null;
        }
    }

    // Mostrar instrução para commit
    mostrarInstrucaoCommit(tipo) {
        const instrucao = `
🔄 INSTRUÇÕES PARA SINCRONIZAR:

1. O arquivo ${tipo}.json foi baixado
2. Copie o arquivo para a pasta 'dados/' do projeto
3. Execute os comandos:
   git add dados/${tipo}.json
   git commit -m "Atualizar dados de ${tipo}"
   git push origin main

4. Aguarde alguns minutos e recarregue a página
        `;
        
        if (typeof showMessage === 'function') {
            showMessage('Arquivo gerado! Veja instruções no console.', 'info');
        }
        
        console.log(instrucao);
        alert(`Arquivo ${tipo}.json baixado!\n\nVeja as instruções no console para sincronizar com o GitHub.`);
    }

    // Verificar se há dados mais recentes no GitHub
    async verificarAtualizacoes(tipo = 'frequencia') {
        try {
            const dadosGitHub = await this.carregarDadosGitHub(tipo);
            const dadosLocais = this.carregarDadosLocal(tipo);
            
            if (!dadosGitHub || !dadosLocais) return false;
            
            const dataGitHub = new Date(dadosGitHub.lastUpdate);
            const dataLocal = new Date(dadosLocais.lastUpdate);
            
            return dataGitHub > dataLocal;
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
            return false;
        }
    }

    // Obter estatísticas dos dados
    obterEstatisticas(registros) {
        if (!registros || !Array.isArray(registros)) return {};

        const stats = {
            total: registros.length,
            alunos: new Set(registros.map(r => r.codigo_aluno)).size,
            turmas: new Set(registros.map(r => r.turma)).size,
            dias: new Set(registros.map(r => r.data)).size,
            marcacoes: {
                P: registros.filter(r => r.marcacao === 'P').length,
                F: registros.filter(r => r.marcacao === 'F').length,
                FC: registros.filter(r => r.marcacao === 'FC').length,
                A: registros.filter(r => r.marcacao === 'A').length
            }
        };

        return stats;
    }

    // ============================================
    //        NOVOS MÉTODOS DA GITHUB API
    // ============================================

    // Configurar autenticação GitHub
    async configurarGitHub(token, email, nome) {
        this.token = token;
        this.userEmail = email;
        this.userName = nome;

        // Testar token
        const isValid = await this.validarToken();
        if (isValid) {
            // Salvar configuração
            localStorage.setItem('github_token', token);
            localStorage.setItem('github_email', email);
            localStorage.setItem('github_name', nome);
            
            console.log('✅ GitHub configurado com sucesso!');
            return true;
        } else {
            throw new Error('Token inválido ou sem permissões necessárias');
        }
    }

    // Testar conexão (alias para validarToken)
    async testarConexao() {
        return await this.validarToken();
    }

    // Validar token GitHub
    async validarToken() {
        if (!this.token) return false;
        
        try {
            const response = await fetch(`${this.apiUrl}/user`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                this.userName = user.name || user.login;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            return false;
        }
    }

    // Obter SHA atual de um arquivo
    async obterShaArquivo(filePath) {
        try {
            const response = await fetch(`${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    ...(this.token && { 'Authorization': `Bearer ${this.token}` })
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.fileShas[filePath] = data.sha;
                return data.sha;
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao obter SHA:', error);
            return null;
        }
    }

    // Fazer commit automático via GitHub API
    async commitAutomatico(filePath, conteudo, mensagem) {
        if (!this.token) {
            throw new Error('Token GitHub não configurado. Configure nas Configurações do Sistema.');
        }

        try {
            // Obter SHA atual se necessário
            if (!this.fileShas[filePath]) {
                await this.obterShaArquivo(filePath);
            }

            // Codificar conteúdo em Base64
            const contentBase64 = btoa(unescape(encodeURIComponent(conteudo)));

            const requestBody = {
                message: mensagem,
                content: contentBase64,
                branch: this.branch,
                committer: {
                    name: this.userName,
                    email: this.userEmail
                }
            };

            // Incluir SHA se arquivo existe
            if (this.fileShas[filePath]) {
                requestBody.sha = this.fileShas[filePath];
            }

            const response = await fetch(`${this.apiUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                this.fileShas[filePath] = result.content.sha;
                console.log('✅ Commit realizado:', mensagem);
                return result;
            } else {
                const error = await response.json();
                throw new Error(`GitHub API Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Erro no commit automático:', error);
            throw error;
        }
    }

    // Salvar dados principais (db.json) automaticamente
    async salvarDadosAutomatico(dados, tipoOperacao, detalhes = '') {
        if (!this.token) {
            console.warn('GitHub API não configurado - dados salvos apenas localmente');
            return false;
        }

        try {
            const conteudo = JSON.stringify(dados, null, 2);
            const timestamp = new Date().toLocaleString('pt-BR');
            const mensagem = `${tipoOperacao} - ${timestamp}\n\n${detalhes}\n\n🤖 Atualizado automaticamente pelo Sistema Disciplinar`;

            await this.commitAutomatico('data/db.json', conteudo, mensagem);
            
            // Atualizar localStorage também
            localStorage.setItem('db', JSON.stringify(dados));
            
            // Disparar evento para outras páginas
            window.dispatchEvent(new CustomEvent('dadosAtualizados', { 
                detail: { tipo: tipoOperacao, dados } 
            }));

            return true;
        } catch (error) {
            console.error('Erro ao salvar dados automaticamente:', error);
            throw error;
        }
    }

    // Adicionar medida disciplinar
    async adicionarMedidaDisciplinar(medida) {
        try {
            // Carregar dados atuais
            const response = await fetch(`${this.baseUrl}/data/db.json?t=${Date.now()}`);
            const dadosAtuais = response.ok ? await response.json() : { 
                alunos: {}, 
                medidas_disciplinares: {} 
            };

            // Adicionar nova medida
            const medidaId = `medida_${Date.now()}`;
            dadosAtuais.medidas_disciplinares = dadosAtuais.medidas_disciplinares || {};
            dadosAtuais.medidas_disciplinares[medidaId] = {
                ...medida,
                id: medidaId,
                criadoEm: new Date().toISOString(),
                criadoPor: this.userName
            };

            const detalhes = `Aluno: ${medida.aluno || medida.codigo_aluno}\nTipo: ${medida.tipo}\nData: ${medida.data}`;
            
            await this.salvarDadosAutomatico(
                dadosAtuais, 
                'Adicionar medida disciplinar',
                detalhes
            );

            return medidaId;
        } catch (error) {
            console.error('Erro ao adicionar medida disciplinar:', error);
            throw error;
        }
    }

    // Atualizar dados de frequência
    async atualizarFrequencia(dadosFrequencia, data) {
        try {
            // Salvar no formato de arquivo JS como antes
            const fileName = `dados-frequencia-${data}.js`;
            const filePath = `assets/js/${fileName}`;
            
            const conteudo = `// Dados de frequência - ${data}
// Atualizado em: ${new Date().toLocaleString('pt-BR')}
// Por: ${this.userName}

const dadosCSV = \`${dadosFrequencia}\`;

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dadosCSV;
}`;

            const mensagem = `Atualizar frequência ${data} - ${new Date().toLocaleString('pt-BR')}

🤖 Atualizado automaticamente pelo Sistema Disciplinar`;

            await this.commitAutomatico(filePath, conteudo, mensagem);

            // Também salvar no localStorage para acesso imediato
            localStorage.setItem(`frequencia_${data}`, dadosFrequencia);

            return true;
        } catch (error) {
            console.error('Erro ao atualizar frequência:', error);
            throw error;
        }
    }

    // Sincronizar dados automaticamente (bidirecional)
    async sincronizarAutomatico() {
        try {
            console.log('🔄 Sincronizando dados...');
            
            // Se puder escrever, fazer upload dos dados locais
            if (this.podeEscrever()) {
                const dadosLocais = localStorage.getItem('db');
                if (dadosLocais) {
                    try {
                        const dados = JSON.parse(dadosLocais);
                        console.log('📤 Enviando dados locais para GitHub...');
                        
                        await this.salvarDadosAutomatico(dados, 'sincronizacao_completa', 'Sync automático dos dados locais');
                        console.log('✅ Dados locais enviados para GitHub');
                        return dados;
                    } catch (error) {
                        console.warn('⚠️ Erro ao enviar dados, baixando do GitHub:', error);
                    }
                }
            }
            
            // Senão, carregar dados do GitHub
            console.log('📥 Baixando dados do GitHub...');
            const response = await fetch(`${this.baseUrl}/data/db.json?t=${Date.now()}`);
            if (response.ok) {
                const dadosGitHub = await response.json();
                localStorage.setItem('db', JSON.stringify(dadosGitHub));
                
                // Disparar evento para atualizar interfaces
                window.dispatchEvent(new CustomEvent('dadosSincronizados', { 
                    detail: dadosGitHub 
                }));
                
                console.log('✅ Dados baixados do GitHub');
                return dadosGitHub;
            }
            
            return null;
        } catch (error) {
            console.error('Erro na sincronização automática:', error);
            return null;
        }
    }

    // Verificar se está autenticado para escrita
    podeEscrever() {
        return !!this.token;
    }

    // Logout
    logout() {
        this.token = const token = process.env.GITHUB_TOKEN;
        this.userEmail = null;
        this.userName = null;
        this.fileShas = {};
        
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_email');
        localStorage.removeItem('github_name');
        
        console.log('🔓 GitHub desconectado');
    }
}

// Instância global
window.gitHubSync = new GitHubDataSync();

// Funções de conveniência antigas
window.sincronizarFrequencia = () => window.gitHubSync.sincronizarDados('frequencia');
window.salvarFrequenciaGitHub = (registros) => window.gitHubSync.gerarArquivoParaCommit('frequencia', registros);
window.verificarAtualizacoesFrequencia = () => window.gitHubSync.verificarAtualizacoes('frequencia');

// Novas funções para GitHub API
window.configurarGitHubToken = (token, email, nome) => window.gitHubSync.configurarGitHub(token, email, nome);
window.salvarMedidaAutomatico = (medida) => window.gitHubSync.adicionarMedidaDisciplinar(medida);
window.atualizarFrequenciaAutomatico = (dados, data) => window.gitHubSync.atualizarFrequencia(dados, data);
window.sincronizarDadosAutomatico = () => window.gitHubSync.sincronizarAutomatico();

// Inicializar sincronização automática (a cada 3 minutos)
setInterval(() => {
    if (window.gitHubSync.podeEscrever()) {
        window.gitHubSync.sincronizarAutomatico().catch(console.error);
    }
}, 3 * 60 * 1000);
