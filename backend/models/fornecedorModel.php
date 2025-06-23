<?php
require_once '../config/db.php'; // Conexão com o banco de dados

// Função para listar todos os fornecedores
function listarFornecedores() {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM fornecedores");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Função para inserir um novo fornecedor
function inserirFornecedor($data) {
    global $pdo;
    $stmt = $pdo->prepare("INSERT INTO fornecedores (nomeFornecedor, responsavel, cnpj_cpf, cidade, endereco, contatoFornecedor1, contatoFornecedor2, data_cadastro) 
                           VALUES (:nomeFornecedor, :responsavel, :cnpj_cpf, :cidade, :endereco, :contatoFornecedor1, :contatoFornecedor2, NOW())");
    $stmt->bindParam(':nomeFornecedor', $data['nomeFornecedor']);
    $stmt->bindParam(':responsavel', $data['responsavel']);
    $stmt->bindParam(':cnpj_cpf', $data['cnpj_cpf']);
    $stmt->bindParam(':cidade', $data['cidade']);
    $stmt->bindParam(':endereco', $data['endereco']);
    $stmt->bindParam(':contatoFornecedor1', $data['contatoFornecedor1']);
    $stmt->bindParam(':contatoFornecedor2', $data['contatoFornecedor2']);
    $stmt->execute();
    return $pdo->lastInsertId(); // Retorna o ID do fornecedor inserido
}

// Função para detalhar um fornecedor pelo ID
function detalharFornecedor($id) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM fornecedores WHERE id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $fornecedor = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($fornecedor) {
        // Pode adicionar também os contatos, por exemplo, caso tenha uma tabela relacionada
        $stmtContatos = $pdo->prepare("SELECT * FROM contatos_fornecedores WHERE fornecedor_id = :id");
        $stmtContatos->bindParam(':id', $id);
        $stmtContatos->execute();
        $fornecedor['contatos'] = $stmtContatos->fetchAll(PDO::FETCH_ASSOC);
    }

    return $fornecedor;
}

// Função para editar um fornecedor
function editarFornecedor($data) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE fornecedores SET 
        nomeFornecedor = :nomeFornecedor, 
        responsavel = :responsavel, 
        cnpj_cpf = :cnpj_cpf, 
        cidade = :cidade, 
        endereco = :endereco, 
        contatoFornecedor1 = :contatoFornecedor1, 
        contatoFornecedor2 = :contatoFornecedor2 
        WHERE id = :id");

    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':nomeFornecedor', $data['nomeFornecedor']);
    $stmt->bindParam(':responsavel', $data['responsavel']);
    $stmt->bindParam(':cnpj_cpf', $data['cnpj_cpf']);
    $stmt->bindParam(':cidade', $data['cidade']);
    $stmt->bindParam(':endereco', $data['endereco']);
    $stmt->bindParam(':contatoFornecedor1', $data['contatoFornecedor1']);
    $stmt->bindParam(':contatoFornecedor2', $data['contatoFornecedor2']);
    return $stmt->execute();
}

// Função para excluir um fornecedor
function deletarFornecedor($id) {
    global $pdo;
    $stmt = $pdo->prepare("DELETE FROM fornecedores WHERE id = :id");
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
}
?>
