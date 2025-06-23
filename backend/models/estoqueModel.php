<?php
require_once '../config/db.php'; // Conexão com o banco de dados

// Listar todos os estoques com o nome do fornecedor
function listarEstoques() {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            SELECT e.id, e.fornecedor_id, f.nomeFornecedor, e.cidade, 
                   e.quantidade_kg_comprada, e.preco_por_saca, e.estoque_kg_atual, e.data_cadastro
            FROM estoque e
            JOIN fornecedores f ON e.fornecedor_id = f.id
            ORDER BY e.id DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log('Erro listarEstoques: ' . $e->getMessage());
        return [];
    }
}

// Inserir novo estoque
function inserirEstoque($data) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            INSERT INTO estoque 
            (fornecedor_id, cidade, quantidade_kg_comprada, preco_por_saca, estoque_kg_atual, data_cadastro)
            VALUES 
            (:fornecedor_id, :cidade, :quantidade_kg_comprada, :preco_por_saca, :estoque_kg_atual, NOW())
        ");
        $stmt->bindValue(':fornecedor_id', $data['fornecedor_id'], PDO::PARAM_INT);
        $stmt->bindValue(':cidade', $data['cidade'], PDO::PARAM_STR);
        $stmt->bindValue(':quantidade_kg_comprada', $data['quantidade_kg_comprada'], PDO::PARAM_INT);
        $stmt->bindValue(':preco_por_saca', $data['preco_por_saca']);
        $stmt->bindValue(':estoque_kg_atual', $data['estoque_kg_atual'], PDO::PARAM_INT);
        $stmt->execute();
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log('Erro inserirEstoque: ' . $e->getMessage());
        return false;
    }
}

// Detalhar um estoque específico
function detalharEstoque($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            SELECT e.id, e.fornecedor_id, f.nomeFornecedor, e.cidade, 
                   e.quantidade_kg_comprada, e.preco_por_saca, e.estoque_kg_atual, e.data_cadastro
            FROM estoque e
            JOIN fornecedores f ON e.fornecedor_id = f.id
            WHERE e.id = :id
        ");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log('Erro detalharEstoque: ' . $e->getMessage());
        return false;
    }
}

// Editar estoque
function editarEstoque($data) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            UPDATE estoque SET
            fornecedor_id = :fornecedor_id,
            cidade = :cidade,
            quantidade_kg_comprada = :quantidade_kg_comprada,
            preco_por_saca = :preco_por_saca,
            estoque_kg_atual = :estoque_kg_atual
            WHERE id = :id
        ");
        $stmt->bindValue(':id', $data['id'], PDO::PARAM_INT);
        $stmt->bindValue(':fornecedor_id', $data['fornecedor_id'], PDO::PARAM_INT);
        $stmt->bindValue(':cidade', $data['cidade'], PDO::PARAM_STR);
        $stmt->bindValue(':quantidade_kg_comprada', $data['quantidade_kg_comprada'], PDO::PARAM_INT);
        $stmt->bindValue(':preco_por_saca', $data['preco_por_saca']);
        $stmt->bindValue(':estoque_kg_atual', $data['estoque_kg_atual'], PDO::PARAM_INT);
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log('Erro editarEstoque: ' . $e->getMessage());
        return false;
    }
}

// Excluir estoque
function deletarEstoque($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM estoque WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log('Erro deletarEstoque: ' . $e->getMessage());
        return false;
    }
}