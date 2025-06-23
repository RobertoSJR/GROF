//TODAS AS NOTIFICAÇOES
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '';
    switch(type) {
        case 'error':
            icon = '<i class="bi bi-exclamation-triangle-fill"></i>';
            break;
        case 'success':
            icon = '<i class="bi bi-check-circle-fill"></i>';
            break;
        case 'info':
            icon = '<i class="bi bi-info-circle-fill"></i>';
            break;
    }
    
    notification.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(notification);
    
  // ANIMAÇÕES DA ENTRADA NA PAGINA
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, duration);
}

function togglePassword() {
    const senhaInput = document.getElementById('senha');
    const toggleIcon = document.getElementById('togglePassword');

    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        toggleIcon.className = 'bi bi-eye-slash toggle-password';
    } else {
        senhaInput.type = 'password';
        toggleIcon.className = 'bi bi-eye toggle-password';
    }
}

// FUNCAO TELA DE CARREGAMENTO
function setLoading(isLoading) {
    const button = document.getElementById('loginBtn');
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

//FUNCAO PARA ERRO NO LOGIN
function showErrorAnimation() {
    const loginBox = document.getElementById('loginBox');
    loginBox.classList.add('shake');
    setTimeout(() => {
        loginBox.classList.remove('shake');
    }, 600);
}

//FUNCAO PARA SUCESSO NO LOGIN
function showSuccessAnimation() {
    const loginBox = document.getElementById('loginBox');
    loginBox.classList.add('success-scale');
}

// PRINCIPAL LOGIN
async function handleLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();

    // PARTE DE VALIDACEOS
    if (!usuario || !senha) {
        showNotification('Por favor, preencha todos os campos', 'error');
        showErrorAnimation();
        return;
    }

    setLoading(true);
    showNotification('Verificando credenciais...', 'info', 2000);

    try {
        const formData = new FormData();
        formData.append('usuario', usuario);
        formData.append('senha', senha);

        console.log('Enviando dados:', { usuario, senha: '***' });

        const response = await fetch('/GROF/backend/controllers/authController.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        console.log('Status da resposta:', response.status);
        console.log('Headers da resposta:', response.headers);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Resposta não é JSON:', textResponse);
            throw new Error('Resposta do servidor não é JSON válido');
        }

        const data = await response.json();
        console.log('Resposta do servidor:', data);
// VALIDACOES DE SUCESSO PARA ANIMACOES
        if (data.success) {
            showNotification('Login realizado com sucesso!', 'success', 2000);
            
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');

            showSuccessAnimation();

            setTimeout(() => {
                showNotification('Redirecionando para o dashboard...', 'info', 1500);
                setTimeout(() => {
                    console.log('Redirecionando para dashboard...');
                    window.location.href = '/GROF/frontend/pages/dashboard.html';
                }, 1500);
            }, 1000);

        } else {
            //FALAH LOGIN
            showNotification('Não foi possível efetuar o login', 'error');
            showErrorAnimation();
            console.error('Erro no login:', data.message);
        }

    } catch (error) {
        console.error('Erro na requisição:', error);
        let errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
        
        if (error.message.includes('NetworkError')) {
            errorMessage = 'Erro de rede. Verifique se o Apache está rodando.';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erro no servidor. Verifique os logs do PHP.';
        } else if (error.message.includes('HTTP: 404')) {
            errorMessage = 'Controlador não encontrado. Verifique o caminho do arquivo.';
        } else if (error.message.includes('HTTP: 500')) {
            errorMessage = 'Erro interno do servidor. Verifique os logs do PHP.';
        }
        
        showNotification(errorMessage, 'error');
        showErrorAnimation();
    } finally {
        setLoading(false);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePassword);
    }

    //VERIFICACAO SE JÁ ESTA LOGADO
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    
    if (isLoggedIn === 'true' && userData) {
        console.log('Usuário já está logado, redirecionando...');
        showNotification('Usuário já autenticado, redirecionando...', 'info');
        setTimeout(() => {
            window.location.href = '/GROF/frontend/pages/dashboard.html';
        }, 1500);
    }

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
                this.classList.remove('has-value');
            }
        });

        input.addEventListener('input', function () {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });

    //FUNCAO LOGIN COM ENTER
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const loginForm = document.getElementById('loginForm');
            if (loginForm && !document.getElementById('loginBtn').disabled) {
                handleLogin(e);
            }
        }
    });

    const loginBox = document.getElementById('loginBox');
    if (loginBox) {
        loginBox.addEventListener('mouseenter', function() {
            if (!this.classList.contains('success-scale')) {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 35px 60px rgba(0, 0, 0, 0.3)';
            }
        });

        loginBox.addEventListener('mouseleave', function() {
            if (!this.classList.contains('success-scale')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.25)';
            }
        });
    }

    setTimeout(() => {
        showNotification('Bem-vindo ao Sistema GROF', 'info', 3000);
    }, 1000);
});

function clearError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function resetForm() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.reset();
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('has-value');
            input.parentElement.classList.remove('focused');
        });
    }
}