<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

header('Content-Type: application/json');

require_once '../models/viagemModel.php';
require_once '../models/estoqueModel.php'; // IMPORTANTE para atualizar estoque

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        if (
            !empty($_POST['cliente']) && !empty($_POST['fornecedor']) && !empty($_POST['caminhao']) &&
            isset($_POST['peso_carga']) && isset($_POST['preco_saca']) && isset($_POST['data_viagem'])
        ) {
            $peso_kg = floatval($_POST['peso_carga']);
            $preco_saca = floatval($_POST['preco_saca']);
            $preco_carga = ($peso_kg / 60) * $preco_saca;

            $data = [
                'cliente_id' => $_POST['cliente'],
                'fornecedor_id' => $_POST['fornecedor'],
                'caminhao_id' => $_POST['caminhao'],
                'peso_kg' => $peso_kg,
                'preco_saca' => $preco_saca,
                'preco_carga' => $preco_carga,
                'data_viagem' => $_POST['data_viagem']
            ];

            // Tenta cadastrar a viagem
            $id = inserirViagem($data);

            if ($id) {
                // Buscar estoque atual do fornecedor
                $estoque = buscarEstoquePorFornecedor($_POST['fornecedor']);

                if ($estoque && $estoque['estoque_kg_atual'] >= $peso_kg) {
                    $novoEstoque = $estoque['estoque_kg_atual'] - $peso_kg;

                    // Atualiza o estoque
                    atualizarEstoqueFornecedor($_POST['fornecedor'], $novoEstoque);

                    echo json_encode([
                        'status' => 'Viagem inserida com sucesso',
                        'id' => $id,
                        'preco_carga' => $preco_carga
                    ]);
                } else {
                    echo json_encode([
                        'error' => 'Estoque insuficiente para o fornecedor selecionado'
                    ]);
                }
            } else {
                echo json_encode(['error' => 'Falha ao inserir viagem']);
            }

        } else {
            echo json_encode(['error' => 'Dados incompletos']);
        }
        break;

    case 'GET':
        if (!empty($_GET['id'])) {
            $data = detalharViagem($_GET['id']);
            echo json_encode($data ?: ['error' => 'Viagem não encontrada']);
        } else {
            $viagens = listarViagens();
            echo json_encode($viagens ?: ['status' => 'Nenhuma viagem encontrada']);
        }
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $_DELETE);
        if (!empty($_DELETE['id'])) {
            $id = $_DELETE['id'];
            $deleted = deletarViagem($id);
            echo json_encode($deleted ? ['status' => 'Viagem excluída com sucesso'] : ['error' => 'Falha ao excluir viagem']);
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);
        if (!empty($data['id'])) {
            $updated = editarViagem($data);
            echo json_encode($updated ? ['status' => 'Viagem atualizada com sucesso'] : ['error' => 'Falha ao atualizar viagem']);
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;

    default:
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>