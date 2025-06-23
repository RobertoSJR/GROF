<?php
require_once '../config/db.php';

function listarViagens() {
    global $pdo;
    try {
        $sql = "
            SELECT 
                v.id,
                v.peso_kg,
                v.preco_saca,
                v.preco_carga,
                v.data_viagem,
                v.data_cadastro,
                c.nomeCliente,
                f.nomeFornecedor,
                ca.modelo AS modeloCaminhao
            FROM viagens v
            JOIN clientes c ON v.cliente_id = c.id
            JOIN fornecedores f ON v.fornecedor_id = f.id
            JOIN caminhoes ca ON v.caminhao_id = ca.id
            ORDER BY v.data_viagem DESC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return ['error' => 'Erro ao listar viagens: ' . $e->getMessage()];
    }
}

function inserirViagem($dados) {
    global $pdo;
    $sql = "INSERT INTO viagens (cliente_id, fornecedor_id, caminhao_id, peso_kg, preco_saca, preco_carga, data_viagem)
            VALUES (:cliente_id, :fornecedor_id, :caminhao_id, :peso_kg, :preco_saca, :preco_carga, :data_viagem)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':cliente_id'    => $dados['cliente_id'],
        ':fornecedor_id' => $dados['fornecedor_id'],
        ':caminhao_id'   => $dados['caminhao_id'],
        ':peso_kg'       => $dados['peso_kg'],
        ':preco_saca'    => $dados['preco_saca'],
        ':preco_carga'   => $dados['preco_carga'],
        ':data_viagem'   => $dados['data_viagem']
    ]);
    return $pdo->lastInsertId();
}

function editarViagem($dados) {
    global $pdo;
    $sql = "UPDATE viagens SET 
                cliente_id = :cliente_id,
                fornecedor_id = :fornecedor_id,
                caminhao_id = :caminhao_id,
                peso_kg = :peso_kg,
                preco_saca = :preco_saca,
                preco_carga = :preco_carga,
                data_viagem = :data_viagem
            WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([
        ':id'            => $dados['id'],
        ':cliente_id'    => $dados['cliente_id'],
        ':fornecedor_id' => $dados['fornecedor_id'],
        ':caminhao_id'   => $dados['caminhao_id'],
        ':peso_kg'       => $dados['peso_kg'],
        ':preco_saca'    => $dados['preco_saca'],
        ':preco_carga'   => $dados['preco_carga'],
        ':data_viagem'   => $dados['data_viagem']
    ]);
}

function deletarViagem($id) {
    global $pdo;
    $sql = "DELETE FROM viagens WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([':id' => $id]);
}

function detalharViagem($id) {
    global $pdo;
    $sql = "
        SELECT 
            v.*,
            c.nomeCliente,
            f.nomeFornecedor,
            ca.modelo AS modeloCaminhao
        FROM viagens v
        JOIN clientes c ON v.cliente_id = c.id
        JOIN fornecedores f ON v.fornecedor_id = f.id
        JOIN caminhoes ca ON v.caminhao_id = ca.id
        WHERE v.id = :id
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>
