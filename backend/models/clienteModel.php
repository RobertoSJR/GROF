<?php
require_once '../config/db.php';

function inserirCliente($data) {
    global $pdo;
    try {
        $sql = "INSERT INTO clientes (nomeCliente, responsavel, cpf_cnpj, cidade, endereco, contatoCliente1, contatoCliente2)
                VALUES (:nome, :responsavel, :cpf_cnpj, :cidade, :endereco, :contato1, :contato2)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome' => $data['nomeCliente'],
            ':responsavel' => $data['responsavel'],
            ':cpf_cnpj' => $data['cpf_cnpj'],
            ':cidade' => $data['cidade'] ?? null,
            ':endereco' => $data['endereco'] ?? null,
            ':contato1' => $data['contatoCliente1'] ?? null,
            ':contato2' => $data['contatoCliente2'] ?? null
        ]);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        return ['error' => 'Erro ao inserir cliente: ' . $e->getMessage()];
    }
}

function listarClientes() {
    global $pdo;
    try {
        $sql = "SELECT * FROM clientes";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => 'Erro ao listar clientes: ' . $e->getMessage()];
    }
}

function editarCliente($data) {
    global $pdo;
    try {
        $sql = "UPDATE clientes 
                SET nomeCliente = :nome, responsavel = :responsavel, cpf_cnpj = :cpf_cnpj, cidade = :cidade, endereco = :endereco,
                    contatoCliente1 = :contato1, contatoCliente2 = :contato2
                WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome' => $data['nomeCliente'],
            ':responsavel' => $data['responsavel'],
            ':cpf_cnpj' => $data['cpf_cnpj'],
            ':cidade' => $data['cidade'] ?? null,
            ':endereco' => $data['endereco'] ?? null,
            ':contato1' => $data['contatoCliente1'] ?? null,
            ':contato2' => $data['contatoCliente2'] ?? null,
            ':id' => $data['id']
        ]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        return false;
    }
}

function deletarCliente($id) {
    global $pdo;
    try {
        $sql = "DELETE FROM clientes WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        return ['error' => 'Erro ao excluir cliente: ' . $e->getMessage()];
    }
}

function detalharCliente($id) {
    global $pdo;
    try {
        $stmtCliente = $pdo->prepare("SELECT * FROM clientes WHERE id = :id");
        $stmtCliente->execute([':id' => $id]);
        $cliente = $stmtCliente->fetch(PDO::FETCH_ASSOC);

        if (!$cliente) {
            return ['error' => 'Cliente não encontrado'];
        }

        $stmtContatos = $pdo->prepare("SELECT * FROM contatos_clientes WHERE id_cliente = :id");
        $stmtContatos->execute([':id' => $id]);
        $contatos = $stmtContatos->fetchAll(PDO::FETCH_ASSOC);

        return [
            'cliente' => $cliente,
            'contatos' => $contatos
        ];
    } catch (PDOException $e) {
        return ['error' => 'Erro ao detalhar cliente: ' . $e->getMessage()];
    }
}
?>
