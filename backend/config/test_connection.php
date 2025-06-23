<?php
// Salve este arquivo como test_connection.php na pasta backend/config/
require_once 'db.php';

echo "<h2>Teste de Conexão com Banco de Dados</h2>";

try {
    // Testar conexão
    echo "<p>✅ Conexão com banco estabelecida com sucesso!</p>";
    
    // Testar se a tabela usuarios existe
    $stmt = $pdo->query("DESCRIBE usuarios");
    echo "<p>✅ Tabela 'usuarios' encontrada!</p>";
    
    // Listar usuários
    $stmt = $pdo->query("SELECT id, nome, usuario, tipo FROM usuarios");
    $users = $stmt->fetchAll();
    
    echo "<h3>Usuários cadastrados:</h3>";
    if (count($users) > 0) {
        echo "<ul>";
        foreach ($users as $user) {
            echo "<li>ID: {$user['id']} - Nome: {$user['nome']} - Usuário: {$user['usuario']} - Tipo: {$user['tipo']}</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>❌ Nenhum usuário encontrado!</p>";
    }
    
    // Testar hash de senha
    $testPassword = "123456";
    $hash = '$2y$10$e0MYzXyjpJS7Pd0RVvHwHu7n9kJyNOj/6B3KnJh9z7zYZ9Y2xNGbW';
    
    if (password_verify($testPassword, $hash)) {
        echo "<p>✅ Verificação de senha funcionando!</p>";
    } else {
        echo "<p>❌ Problema na verificação de senha!</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Erro: " . $e->getMessage() . "</p>";
}
?>