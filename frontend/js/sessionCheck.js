/**
 * Classe responsável por gerenciar a sessão do usuário,
 * incluindo monitoramento de atividade, verificação periódica
 * da sessão no servidor, aviso de timeout e logout automático.
 */
class SessionManager {
    constructor() {
        // Intervalo para checar a sessão no servidor (5 minutos)
        this.checkInterval = 5 * 60 * 1000;

        // Tempo para exibir aviso de timeout antes da expiração (2 minutos)
        this.warningTime = 2 * 60 * 1000;

        // Tempo total de sessão até expiração por inatividade (30 minutos)
        this.sessionTimeout = 30 * 60 * 1000;

        // Timestamp da última atividade do usuário
        this.lastActivity = Date.now();

        // Flag para evitar mostrar aviso de timeout várias vezes
        this.warningShown = false;

        // Inicializa a sessão
        this.init();
    }

    /**
     * Inicializa a verificação da sessão, monitoramento de atividade
     * e timers para controle do timeout e checagem periódica.
     */
    init() {
        // Se estiver na página de login, não inicializa o monitoramento
        if (this.isLoginPage()) return;

        // Verifica se o usuário está autenticado
        this.checkAuthentication();

        // Configura escuta dos eventos para detectar atividade do usuário
        this.setupActivityMonitoring();

        // Checa a validade da sessão no servidor a cada checkInterval
        setInterval(() => this.checkSession(), this.checkInterval);

        // Checa o timeout da sessão a cada minuto
        setInterval(() => this.checkTimeout(), 60000);
    }

    /**
     * Verifica se a página atual é a página de login.
     * @returns {boolean} true se for página de login, false caso contrário
     */
    isLoginPage() {
        const currentPage = window.location.pathname;
        return currentPage.includes('login.html') || currentPage.endsWith('/');
    }

    /**
     * Verifica localmente e no servidor se o usuário está autenticado.
     * Se não estiver, redireciona para login.
     */
    async checkAuthentication() {
        const user = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        // Se não houver usuário logado no localStorage, redireciona
        if (!user || isLoggedIn !== 'true') {
            this.redirectToLogin();
            return;
        }

        try {
            // Verifica sessão no backend via API
            const response = await fetch('../../backend/controllers/authController.php?action=check_session');
            const data = await response.json();

            if (!data.success) {
                // Sessão inválida, remove dados locais e redireciona
                localStorage.removeItem('user');
                localStorage.removeItem('isLoggedIn');
                this.redirectToLogin();
            } else {
                // Atualiza dados do usuário localmente e exibe info na UI
                localStorage.setItem('user', JSON.stringify(data.user));
                this.displayUserInfo(data.user);
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
        }
    }

    /**
     * Configura listeners para vários eventos de interação do usuário,
     * atualizando a atividade para evitar timeout da sessão.
     */
    setupActivityMonitoring() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, () => this.updateActivity(), { passive: true });
        });
    }

    /**
     * Atualiza o timestamp da última atividade do usuário,
     * e reseta a flag de aviso de timeout.
     */
    updateActivity() {
        this.lastActivity = Date.now();
        this.warningShown = false;
    }

    /**
     * Checa no servidor se a sessão ainda está ativa.
     * Caso contrário, dispara logout.
     */
    async checkSession() {
        try {
            const response = await fetch('../../backend/controllers/authController.php?action=check_session');
            const data = await response.json();

            if (!data.success) {
                this.handleSessionExpired();
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
        }
    }

    /**
     * Verifica se o tempo de inatividade ultrapassou o timeout,
     * ou se está próximo do timeout para mostrar aviso ao usuário.
     */
    checkTimeout() {
        const inactiveTime = Date.now() - this.lastActivity;

        if (inactiveTime >= this.sessionTimeout) {
            this.handleSessionExpired();
        } else if (inactiveTime >= (this.sessionTimeout - this.warningTime) && !this.warningShown) {
            this.showTimeoutWarning();
        }
    }

    /**
     * Exibe um aviso de que a sessão está para expirar e pergunta se o usuário deseja continuar.
     * Se sim, atualiza a atividade; se não, desloga.
     */
    showTimeoutWarning() {
        this.warningShown = true;

        const remainingTime = Math.ceil((this.sessionTimeout - (Date.now() - this.lastActivity)) / 1000 / 60);

        if (confirm(`Sua sessão expirará em ${remainingTime} minutos devido à inatividade. Deseja continuar?`)) {
            this.updateActivity();
        } else {
            this.logout();
        }
    }

    /**
     * Trata a expiração da sessão: informa o usuário e faz logout.
     */
    handleSessionExpired() {
        alert('Sua sessão expirou. Você será redirecionado para a página de login.');
        this.logout();
    }

    /**
     * Realiza o logout do usuário, comunicando o backend e limpando dados locais,
     * depois redireciona para a página de login.
     */
    async logout() {
        try {
            await fetch('../../backend/controllers/authController.php?action=logout', {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }

        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        this.redirectToLogin();
    }

    /**
     * Redireciona para a página de login fixa no caminho absoluto
     */
    redirectToLogin() {
        window.location.replace('http://localhost/GROF/frontend/pages/login.html');
    }

    /**
     * Exibe as informações básicas do usuário na interface,
     * preenchendo elementos com atributo data-user-info.
     * Também cria o menu do usuário.
     * @param {Object} user - Dados do usuário autenticado
     */
    displayUserInfo(user) {
        const userElements = document.querySelectorAll('[data-user-info]');

        userElements.forEach(element => {
            const info = element.getAttribute('data-user-info');
            if (user[info]) {
                element.textContent = user[info];
            }
        });

        this.createUserMenu(user);
    }

    /**
     * Cria o menu do usuário (nome, tipo, botões Perfil e Sair)
     * e adiciona no elemento de navegação se ainda não existir.
     * @param {Object} user - Dados do usuário autenticado
     */
    createUserMenu(user) {
        if (document.querySelector('.user-menu')) return;

        const nav = document.querySelector('.barraNavegacao');
        if (!nav) return;

        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-info">
                <span class="user-name">${user.nome}</span>
                <span class="user-type">${user.tipo}</span>
            </div>
            <div class="user-actions">
                <button onclick="sessionManager.showProfile()" class="user-btn">Perfil</button>
                <button onclick="sessionManager.logout()" class="user-btn logout-btn">Sair</button>
            </div>
        `;

        nav.appendChild(userMenu);

        this.addUserMenuStyles();
    }

    /**
     * Injeta estilos CSS para o menu do usuário criado dinamicamente.
     */
    addUserMenuStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .user-menu {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-left: auto;
                padding: 10px;
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            
            .user-name {
                font-weight: bold;
                color: #333;
                font-size: 14px;
            }
            
            .user-type {
                font-size: 12px;
                color: #666;
                text-transform: capitalize;
            }
            
            .user-actions {
                display: flex;
                gap: 10px;
            }
            
            .user-btn {
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.3s;
            }
            
            .user-btn:hover {
                background-color: #f0f0f0;
            }
            
            .logout-btn {
                background-color: #e74c3c;
                color: white;
            }
            
            .logout-btn:hover {
                background-color: #c0392b;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Exibe um modal com as informações do perfil do usuário.
     */
    showProfile() {
        const user = JSON.parse(localStorage.getItem('user'));

        const profileModal = document.createElement('div');
        profileModal.className = 'profile-modal';
        profileModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Perfil do Usuário</h3>
                    <button onclick="this.closest('.profile-modal').remove()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Nome:</strong> ${user.nome}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Usuário:</strong> ${user.usuario}</p>
                    <p><strong>Tipo:</strong> ${user.tipo}</p>
                    <button onclick="this.closest('.profile-modal').remove()" class="btn-close">Fechar</button>
                </div>
            </div>
        `;

        // Estilos do modal
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .profile-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: white;
                padding: 20px;
                border-radius: 10px;
                min-width: 300px;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .close-btn {
                border: none;
                background: none;
                font-size: 20px;
                cursor: pointer;
            }
            
            .btn-close {
                margin-top: 15px;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
        `;

        document.head.appendChild(modalStyle);
        document.body.appendChild(profileModal);
    }
}

// Instancia e inicia o gerenciador de sessão após o carregamento da página,
// exceto se estiver na página de login.
let sessionManager;

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    if (!currentPage.includes('login.html')) {
        sessionManager = new SessionManager();
    }
});
