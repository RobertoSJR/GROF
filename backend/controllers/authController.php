<?php
// Limpar qualquer output anterior
ob_start();

// Iniciar sessão
session_start();

// Incluir modelo
require_once '../models/authModel.php';

// Configurações de erro
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Headers CORS e JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Tratar requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Debug melhorado
error_log("=== NOVA REQUISIÇÃO ===");
error_log("Método: " . $method);
error_log("POST data: " . print_r($_POST, true));
error_log("GET data: " . print_r($_GET, true));
error_log("Headers: " . print_r(getallheaders(), true));

try {
    switch ($method) {
        case 'POST':
            // Verificar se é login ou criação de usuário
            if (isset($_POST['action']) && $_POST['action'] === 'create') {
                // Criar novo usuário
                if (empty($_POST['nome']) || empty($_POST['email']) || empty($_POST['usuario']) || empty($_POST['senha'])) {
                    echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios']);
                    exit;
                }
                
                $data = [
                    'nome' => $_POST['nome'],
                    'email' => $_POST['email'],
                    'usuario' => $_POST['usuario'],
                    'senha' => $_POST['senha'],
                    'tipo' => $_POST['tipo'] ?? 'usuario'
                ];
                
                $result = criarUsuario($data);
                
                if (is_array($result) && isset($result['error'])) {
                    echo json_encode(['success' => false, 'message' => $result['error']]);
                } else {
                    echo json_encode(['success' => true, 'message' => 'Usuário criado com sucesso', 'id' => $result]);
                }
                
            } elseif (isset($_POST['action']) && $_POST['action'] === 'change_password') {
                // Alterar senha
                if (!isset($_SESSION['user_id'])) {
                    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
                    exit;
                }
                
                if (empty($_POST['senha_atual']) || empty($_POST['nova_senha'])) {
                    echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios']);
                    exit;
                }
                
                $result = alterarSenha($_SESSION['user_id'], $_POST['senha_atual'], $_POST['nova_senha']);
                
                if (is_array($result) && isset($result['error'])) {
                    echo json_encode(['success' => false, 'message' => $result['error']]);
                } else {
                    echo json_encode(['success' => true, 'message' => 'Senha alterada com sucesso']);
                }
                
            } else {
                // Login padrão
                error_log("=== PROCESSANDO LOGIN ===");
                
                if (empty($_POST['usuario']) || empty($_POST['senha'])) {
                    error_log("Campos obrigatórios vazios");
                    echo json_encode(['success' => false, 'message' => 'Usuário e senha são obrigatórios']);
                    exit;
                }
                
                $usuario = trim($_POST['usuario']);
                $senha = trim($_POST['senha']);
                
                error_log("Usuário: " . $usuario);
                error_log("Senha recebida: " . (empty($senha) ? 'vazia' : 'preenchida'));
                
                $user = autenticarUsuario($usuario, $senha);
                
                if ($user && !isset($user['error'])) {
                    // Login bem-sucedido
                    error_log("=== LOGIN SUCESSO ===");
                    error_log("Usuário autenticado: " . print_r($user, true));
                    
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_nome'] = $user['nome'];
                    $_SESSION['user_tipo'] = $user['tipo'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['user_usuario'] = $user['usuario'];
                    
                    // Atualizar último login
                    atualizarUltimoLogin($user['id']);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login realizado com sucesso',
                        'user' => [
                            'id' => $user['id'],
                            'nome' => $user['nome'],
                            'email' => $user['email'],
                            'usuario' => $user['usuario'],
                            'tipo' => $user['tipo']
                        ]
                    ]);
                } elseif (isset($user['error'])) {
                    error_log("=== ERRO NA AUTENTICAÇÃO ===");
                    error_log("Erro: " . $user['error']);
                    echo json_encode(['success' => false, 'message' => $user['error']]);
                } else {
                    error_log("=== LOGIN FALHOU ===");
                    error_log("Usuário ou senha incorretos para: " . $usuario);
                    echo json_encode(['success' => false, 'message' => 'Usuário ou senha incorretos']);
                }
            }
            break;
            
        case 'GET':
            // Verificar sessão ou listar usuários
            if (isset($_GET['action']) && $_GET['action'] === 'check_session') {
                if (isset($_SESSION['user_id'])) {
                    $user = buscarUsuarioPorId($_SESSION['user_id']);
                    if ($user && !isset($user['error'])) {
                        echo json_encode([
                            'success' => true,
                            'user' => $user
                        ]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Sessão inválida']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
                }
            } elseif (isset($_GET['action']) && $_GET['action'] === 'list_users') {
                // Verificar se é admin
                if (!isset($_SESSION['user_tipo']) || $_SESSION['user_tipo'] !== 'admin') {
                    echo json_encode(['success' => false, 'message' => 'Acesso negado']);
                    exit;
                }
                
                $users = listarUsuarios();
                if (is_array($users) && isset($users['error'])) {
                    echo json_encode(['success' => false, 'message' => $users['error']]);
                } else {
                    echo json_encode(['success' => true, 'users' => $users]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Ação não especificada']);
            }
            break;
            
        case 'DELETE':
            // Logout
            if (isset($_GET['action']) && $_GET['action'] === 'logout') {
                session_unset();
                session_destroy();
                echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Ação não especificada']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
            break;
    }

} catch (Exception $e) {
    error_log("=== ERRO GERAL ===");
    error_log("Erro: " . $e->getMessage());
    error_log("Trace: " . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor: ' . $e->getMessage()]);
} catch (Error $e) {
    error_log("=== ERRO FATAL ===");
    error_log("Erro: " . $e->getMessage());
    error_log("Trace: " . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => 'Erro fatal do servidor: ' . $e->getMessage()]);
}

// Finalizar output
ob_end_flush();
?>