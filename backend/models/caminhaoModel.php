<?php
require_once '../config/db.php';

function listarCaminhoes() {
    global $pdo;
    try {
        $sql = "SELECT * FROM caminhoes";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);  // Retorna todos os clientes como um array associativo
    } catch (PDOException $e) {
        return ['error' => 'Erro ao listar caminhões: ' . $e->getMessage()];
    }
}

function inserirCaminhao($dados) {
    global $pdo;
    $sql = "INSERT INTO caminhoes (placa, modelo, marca, capacidade, eixos, km_atual, renavam, motorista)
            VALUES (:placa, :modelo, :marca, :capacidade, :eixos, :km_atual, :renavam, :motorista)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':placa' => $dados['placa'],
        ':modelo' => $dados['modelo'],
        ':marca' => $dados['marca'],
        ':capacidade' => $dados['capacidade'],
        ':eixos' => $dados['eixos'],
        ':km_atual' => $dados['km_atual'],
        ':renavam' => $dados['renavam'],
        ':motorista' => $dados['motorista']
    ]);
    return $pdo->lastInsertId();
}

function editarCaminhao($dados) {
    global $pdo;
    $sql = "UPDATE caminhoes SET placa = :placa, modelo = :modelo, marca = :marca,
            capacidade = :capacidade, eixos = :eixos, km_atual = :km_atual, renavam = :renavam, motorista = :motorista
            WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([
        ':id' => $dados['id'],
        ':placa' => $dados['placa'],
        ':modelo' => $dados['modelo'],
        ':marca' => $dados['marca'],
        ':capacidade' => $dados['capacidade'],
        ':eixos' => $dados['eixos'],
        ':km_atual' => $dados['km_atual'],
        ':renavam' => $dados['renavam'],
        ':motorista' => $dados['motorista']
    ]);
}

function deletarCaminhao($id) {
    global $pdo;
    $sql = "DELETE FROM caminhoes WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([':id' => $id]);
}

function detalharCaminhao($id) {
    global $pdo;
    $sql = "SELECT * FROM caminhoes WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>
