<?php
require_once '../config/db.php';

function autenticarUsuario($usuario, $senha) {
    global $pdo;
    try {
        // Debug: Log para verificar se a função está sendo chamada
        error_log("Tentativa de login para usuário: " . $usuario);
        
        $sql = "SELECT id, nome, email, usuario, senha, tipo, data FROM usuarios WHERE usuario = ? AND ativo = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Debug: Verificar se usuário foi encontrado
        if (!$user) {
            error_log("Usuário não encontrado: " . $usuario);
            return false;
        }
        
        error_log("Usuário encontrado: " . $user['usuario']);
        
        // Verificar senha
        if (password_verify($senha, $user['senha'])) {
            error_log("Senha verificada com sucesso");
            // Remove a senha do retorno por segurança
            unset($user['senha']);
            return $user;
        } else {
            error_log("Senha incorreta para usuário: " . $usuario);
            return false;
        }
        
    } catch (PDOException $e) {
        error_log("Erro na autenticação: " . $e->getMessage());
        return ['error' => 'Erro na autenticação: ' . $e->getMessage()];
    }
}

function criarUsuario($data) {
    global $pdo;
    try {
        // Verificar se o usuário ou email já existem
        $sql = "SELECT id FROM usuarios WHERE usuario = ? OR email = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['usuario'], $data['email']]);
        
        if ($stmt->fetch()) {
            return ['error' => 'Usuário ou email já existem'];
        }
        
        // Hash da senha
        $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO usuarios (nome, email, usuario, senha, tipo, data) 
                VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['nome'],
            $data['email'],
            $data['usuario'],
            $senhaHash,
            $data['tipo'] ?? 'usuario'
        ]);
        
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Erro ao criar usuário: " . $e->getMessage());
        return ['error' => 'Erro ao criar usuário: ' . $e->getMessage()];
    }
}

function buscarUsuarioPorId($id) {
    global $pdo;
    try {
        $sql = "SELECT id, nome, email, usuario, tipo, data FROM usuarios WHERE id = ? AND ativo = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Erro ao buscar usuário: " . $e->getMessage());
        return ['error' => 'Erro ao buscar usuário: ' . $e->getMessage()];
    }
}

function atualizarUltimoLogin($userId) {
    global $pdo;
    try {
        $sql = "UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        return true;
    } catch (PDOException $e) {
        error_log("Erro ao atualizar último login: " . $e->getMessage());
        return false;
    }
}

function listarUsuarios() {
    global $pdo;
    try {
        $sql = "SELECT id, nome, email, usuario, tipo, data FROM usuarios WHERE ativo = 1 ORDER BY nome";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Erro ao listar usuários: " . $e->getMessage());
        return ['error' => 'Erro ao listar usuários: ' . $e->getMessage()];
    }
}

function alterarSenha($userId, $senhaAtual, $novaSenha) {
    global $pdo;
    try {
        // Verificar senha atual
        $sql = "SELECT senha FROM usuarios WHERE id = ? AND ativo = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($senhaAtual, $user['senha'])) {
            return ['error' => 'Senha atual incorreta'];
        }
        
        // Atualizar senha
        $senhaHash = password_hash($novaSenha, PASSWORD_DEFAULT);
        $sql = "UPDATE usuarios SET senha = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$senhaHash, $userId]);
        
        return true;
    } catch (PDOException $e) {
        error_log("Erro ao alterar senha: " . $e->getMessage());
        return ['error' => 'Erro ao alterar senha: ' . $e->getMessage()];
    }
}
?>