<?php

require_once '../config/db.php';

//HASHH FUNCAO
function criarUsuarioComHash($nome, $email, $usuario, $senhaTexto, $tipo = 'usuario') {
    global $pdo;
    
    try {
        // VERIFICACAODE USUARIOS
        $sql = "SELECT id FROM usuarios WHERE usuario = ? OR email = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario, $email]);
        
        if ($stmt->fetch()) {
            $senhaHash = password_hash($senhaTexto, PASSWORD_DEFAULT);
            $sql = "UPDATE usuarios SET senha = ?, nome = ?, tipo = ? WHERE usuario = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$senhaHash, $nome, $tipo, $usuario]);
            echo "Usuário '$usuario' atualizado com nova senha.\n";
        } else {
            $senhaHash = password_hash($senhaTexto, PASSWORD_DEFAULT);
            $sql = "INSERT INTO usuarios (nome, email, usuario, senha, tipo, data) VALUES (?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nome, $email, $usuario, $senhaHash, $tipo]);
            echo "Usuário '$usuario' criado com sucesso.\n";
        }
        
    } catch (PDOException $e) {
        echo "Erro ao criar usuário '$usuario': " . $e->getMessage() . "\n";
    }
}

// COD PRA CRIAR USUARIOS TESTES
echo "Criando usuários...\n";

criarUsuarioComHash('Administrador', 'admin@grof.com', 'admin', 'admin123', 'admin');
criarUsuarioComHash('Usuário Teste', 'teste@grof.com', 'teste', 'teste123', 'usuario');

echo "Usuários criados! Use as seguintes credenciais:\n";
echo "Admin: usuario='admin', senha='admin123'\n";
echo "Teste: usuario='teste', senha='teste123'\n";
?>