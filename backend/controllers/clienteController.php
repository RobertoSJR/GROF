<?php
require_once '../models/clienteModel.php';

// Receber a requisição
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'POST':
        // Inserir um novo cliente
        if (!empty($_POST)) {
            $data = [
                'nomeCliente' => $_POST['nomeCliente'],
                'responsavel' => $_POST['responsavel'],
                'cpf_cnpj' => $_POST['cpf_cnpj'],
                'cidade' => $_POST['cidade'] ?? null,
                'endereco' => $_POST['endereco'] ?? null,
                'contatoCliente1' => $_POST['contatoCliente1'] ?? null,
                'contatoCliente2' => $_POST['contatoCliente2'] ?? null
            ];
            $id = inserirCliente($data);
            echo json_encode(['status' => 'Cliente inserido com sucesso', 'id' => $id]);
        } else {
            echo json_encode(['error' => 'Dados não enviados corretamente.']);
        }
        break;

    case 'GET':
        // Verificar se existe um id na URL para detalhar um cliente específico
        if (!empty($_GET['id'])) {
            $data = detalharCliente($_GET['id']);
            if (isset($data['error'])) {
                echo json_encode(['error' => $data['error']]);
            } else {
                echo json_encode($data);  // Exibe os dados detalhados
            }
        } else {
            // Listar todos os clientes
            $clientes = listarClientes();
            if ($clientes) {
                echo json_encode($clientes);  // Retorna todos os clientes se existirem
            } else {
                echo json_encode(['status' => 'Nenhum cliente encontrado']);  // Caso contrário, avisa
            }
        }
        break;

    case 'DELETE':
        // Deletar um cliente
        parse_str(file_get_contents("php://input"), $_DELETE); // Captura os dados enviados no corpo da requisição DELETE

        if (!empty($_DELETE['id'])) {
            $id = $_DELETE['id'];
            $deleted = deletarCliente($id);
            if ($deleted) {
                echo json_encode(['status' => 'Cliente excluído com sucesso']);
            } else {
                echo json_encode(['error' => 'Falha ao excluir o cliente']);
            }
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;


    case 'PUT':
        // Editar um cliente existente
        parse_str(file_get_contents("php://input"), $data); // Verifica os dados enviados

        if (!empty($data['id'])) {
            $id = $data['id'];
            $updateData = [
                'id' => $id,
                'nomeCliente' => $data['nomeCliente'],
                'responsavel' => $data['responsavel'],
                'cpf_cnpj' => $data['cpf_cnpj'],
                'cidade' => $data['cidade'] ?? null,
                'endereco' => $data['endereco'] ?? null,
                'contatoCliente1' => $data['contatoCliente1'] ?? null,
                'contatoCliente2' => $data['contatoCliente2'] ?? null
            ];

            $updated = editarCliente($updateData); // Função de edição do cliente
            if ($updated) {
                echo json_encode(['status' => 'Cliente atualizado com sucesso']);
            } else {
                echo json_encode(['error' => 'Falha ao atualizar cliente']);
            }
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;



    default:
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>