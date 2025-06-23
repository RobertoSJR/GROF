<?php
require_once '../models/fornecedorModel.php';

// Receber a requisição
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'POST':
        // Inserir um novo fornecedor
        if (!empty($_POST)) {
            $data = [
                'nomeFornecedor' => $_POST['nomeFornecedor'],
                'responsavel' => $_POST['responsavel'],
                'cnpj_cpf' => $_POST['cnpj_cpf'],
                'cidade' => $_POST['cidade'] ?? null,
                'endereco' => $_POST['endereco'] ?? null,
                'contatoFornecedor1' => $_POST['contatoFornecedor1'] ?? null,
                'contatoFornecedor2' => $_POST['contatoFornecedor2'] ?? null
            ];
            $id = inserirFornecedor($data);
            echo json_encode(['status' => 'Fornecedor inserido com sucesso', 'id' => $id]);
        } else {
            echo json_encode(['error' => 'Dados não enviados corretamente.']);
        }
        break;

    case 'GET':
        // Verificar se existe um id na URL para detalhar um fornecedor específico
        if (!empty($_GET['id'])) {
            $data = detalharFornecedor($_GET['id']);
            if (isset($data['error'])) {
                echo json_encode(['error' => $data['error']]);
            } else {
                echo json_encode($data);  // Exibe os dados detalhados
            }
        } else {
            // Listar todos os fornecedores
            $fornecedores = listarFornecedores();
            if ($fornecedores) {
                echo json_encode($fornecedores);  // Retorna todos os fornecedores se existirem
            } else {
                echo json_encode(['status' => 'Nenhum fornecedor encontrado']);  // Caso contrário, avisa
            }
        }
        break;

    case 'DELETE':
        // Deletar um fornecedor
        parse_str(file_get_contents("php://input"), $_DELETE); // Captura os dados enviados no corpo da requisição DELETE

        if (!empty($_DELETE['id'])) {
            $id = $_DELETE['id'];
            $deleted = deletarFornecedor($id);
            if ($deleted) {
                echo json_encode(['status' => 'Fornecedor excluído com sucesso']);
            } else {
                echo json_encode(['error' => 'Falha ao excluir fornecedor']);
            }
        } else {
            echo json_encode(['error' => 'ID não fornecido']);
        }
        break;

    case 'PUT':
        // Editar um fornecedor existente
        parse_str(file_get_contents("php://input"), $data); // Verifica os dados enviados

        if (!empty($data['id'])) {
            $id = $data['id'];
            $updateData = [
                'id' => $id,
                'nomeFornecedor' => $data['nomeFornecedor'],
                'responsavel' => $data['responsavel'],
                'cnpj_cpf' => $data['cnpj_cpf'],
                'cidade' => $data['cidade'] ?? null,
                'endereco' => $data['endereco'] ?? null,
                'contatoFornecedor1' => $data['contatoFornecedor1'] ?? null,
                'contatoFornecedor2' => $data['contatoFornecedor2'] ?? null
            ];

            $updated = editarFornecedor($updateData); // Função de edição do fornecedor
            if ($updated) {
                echo json_encode(['status' => 'Fornecedor atualizado com sucesso']);
            } else {
                echo json_encode(['error' => 'Falha ao atualizar fornecedor']);
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
