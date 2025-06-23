<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once '../models/caminhaoModel.php';

// Receber a requisição
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        if (!empty($_POST)) {
            $data = [
                'placa' => $_POST['placa'],
                'modelo' => $_POST['modelo'],
                'marca' => $_POST['marca'],
                'capacidade' => $_POST['capacidade'],
                'eixos' => $_POST['eixos'],
                'km_atual' => $_POST['km_atual'],
                'renavam' => $_POST['renavam'],
                'motorista' => $_POST['motorista']
            ];
            $id = inserirCaminhao($data);
            echo json_encode(['status' => 'Caminhão inserido com sucesso', 'id' => $id]);
        } else {
            echo json_encode(['error' => 'Dados não enviados corretamente.']);
        }
        break;

    case 'GET':
        if (!empty($_GET['id'])) {
            $data = detalharCaminhao($_GET['id']);
            echo json_encode($data);
        } else {
            $caminhoes = listarCaminhoes();
            echo json_encode($caminhoes ?: ['status' => 'Nenhum caminhão encontrado']);
        }
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $_DELETE);
        if (!empty($_DELETE['id'])) {
            $id = $_DELETE['id'];
            $deleted = deletarCaminhao($id);
            echo json_encode($deleted ? ['status' => 'Caminhão excluído com sucesso'] : ['error' => 'Falha ao excluir caminhão']);
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);
        if (!empty($data['id'])) {
            $updated = editarCaminhao($data);
            echo json_encode($updated ? ['status' => 'Caminhão atualizado com sucesso'] : ['error' => 'Falha ao atualizar caminhão']);
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;

    default:
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>
