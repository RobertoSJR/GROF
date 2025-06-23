<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../models/estoqueModel.php';
require_once '../models/fornecedorModel.php';  // Garante acesso à função listarFornecedores()

$method = $_SERVER['REQUEST_METHOD'];

// Captura dados de PUT ou DELETE se necessário
parse_str(file_get_contents("php://input"), $inputData);

switch ($method) {
    case 'POST':
        if (!empty($_POST)) {
            $quantidadeKg = floatval($_POST['quantidade_kg_comprada']);
            $data = [
                'fornecedor_id' => $_POST['fornecedor_id'],
                'cidade' => $_POST['cidade'],
                'quantidade_kg_comprada' => $quantidadeKg,
                'preco_por_saca' => $_POST['preco_por_saca'],
                'estoque_kg_atual' => $quantidadeKg // Começa com total comprado
            ];
            $id = inserirEstoque($data);
            echo json_encode(['status' => 'Estoque inserido com sucesso', 'id' => $id]);
        } else {
            echo json_encode(['error' => 'Dados não enviados corretamente.']);
        }
        break;

    case 'GET':
        // Se pedir lista de fornecedores
        if (isset($_GET['fornecedores']) && $_GET['fornecedores'] == '1') {
            $fornecedores = listarFornecedores();
            echo json_encode($fornecedores);
            break;
        }

        // Se pedir estoque específico
        if (!empty($_GET['id'])) {
            $data = detalharEstoque($_GET['id']);
            echo json_encode($data);
        } else {
            $estoques = listarEstoques();
            echo json_encode($estoques);
        }
        break;

    case 'PUT':
        if (!empty($inputData['id'])) {
            $updateData = [
                'id' => $inputData['id'],
                'fornecedor_id' => $inputData['fornecedor_id'],
                'cidade' => $inputData['cidade'],
                'quantidade_kg_comprada' => $inputData['quantidade_kg_comprada'],
                'preco_por_saca' => $inputData['preco_por_saca'],
                'estoque_kg_atual' => $inputData['quantidade_kg_comprada'] // Atualiza com base na nova entrada
            ];
            $updated = editarEstoque($updateData);
            echo json_encode(
                $updated ? ['status' => 'Estoque atualizado com sucesso'] :
                ['error' => 'Falha ao atualizar estoque']
            );
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;


    case 'DELETE':
        if (!empty($inputData['id'])) {
            $deleted = deletarEstoque($inputData['id']);
            echo json_encode(
                $deleted ? ['status' => 'Estoque excluído com sucesso'] :
                ['error' => 'Falha ao excluir estoque']
            );
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;

    default:
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
