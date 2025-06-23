// Elementos do DOM
const form = document.getElementById('formCliente');
const tabela = document.querySelector('#tabelaClientes tbody');
const campoBusca = document.getElementById('buscaCliente');
const botaoNovoCliente = document.getElementById('btnNovoCliente');

// Aplica máscara dinâmica para CPF ou CNPJ no campo correspondente
$('#cpf_cnpj').mask('000.000.000-00', {
  onKeyPress: function (cpf_cnpj, e, field, options) {
    var mascara = cpf_cnpj.length <= 11 ? '000.000.000-00' : '00.000.000/0000-00';
    $('#cpf_cnpj').mask(mascara, options);
  }
});

// Aplica máscara dinâmica no contatoCliente1
$('#contatoCliente1').on('input', function () {
  const telefone = $(this).val().replace(/\D/g, '');

  if (telefone.length > 11) {
    // Limita a 11 dígitos
    $(this).val($(this).val().slice(0, -1));
    return;
  }

  if (telefone.length > 10) {
    $(this).mask('(00) 00000-0000');
  } else {
    $(this).mask('(00) 0000-0000');
  }
});

// Aplica máscara dinâmica no contatoCliente2
$('#contatoCliente2').on('input', function () {
  const telefone = $(this).val().replace(/\D/g, '');

  if (telefone.length > 11) {
    // Limita a 11 dígitos
    $(this).val($(this).val().slice(0, -1));
    return;
  }

  if (telefone.length > 10) {
    $(this).mask('(00) 00000-0000');
  } else {
    $(this).mask('(00) 0000-0000');
  }
});




// Mostrar o formulário para cadastro de novo cliente
botaoNovoCliente.addEventListener('click', () => {
  form.style.display = 'block';
  window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
  form.reset();        // Limpa os campos do formulário
  form.id.value = '';  // Garante que o id esteja vazio para novo cadastro
});

// Função para cancelar edição ou cadastro - esconde o formulário e limpa campos
function cancelarEdicao() {
  form.reset();
  form.id.value = '';
  form.style.display = 'none';
}

// Evento de submissão do formulário (cadastro/edição)
form.addEventListener('submit', e => {
  e.preventDefault();

  const telefone = form.contatoCliente1.value.replace(/\D/g, '');
  if (telefone.length < 10 || telefone.length > 11) {
    alert('O celular deve conter entre 10 e 11 dígitos.');
    form.contatoCliente1.focus();
    return;
  }


  const formData = new FormData(form);
  // Remove máscaras antes de enviar
  formData.set('contatoCliente1', form.contatoCliente1.value.replace(/\D/g, ''));
  formData.set('contatoCliente2', form.contatoCliente2.value.replace(/\D/g, ''));
  formData.set('cpf_cnpj', form.cpf_cnpj.value.replace(/\D/g, ''));

  const idCliente = form.id.value;

  // Define método HTTP: POST para novo, PUT para edição
  const method = idCliente ? 'PUT' : 'POST';

  // Converte FormData em URLSearchParams para envio via fetch
  const urlSearchParams = new URLSearchParams();
  formData.forEach((value, key) => {
    urlSearchParams.append(key, value);
  });

  fetch('http://localhost/grof/backend/controllers/clienteController.php', {
    method: method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: urlSearchParams
  })
    .then(res => res.json())
    .then(response => {
      if (response.status) {
        alert(response.status); // Sucesso
      } else {
        alert('Erro: ' + response.error);
      }
      form.reset();
      form.style.display = 'none';
      carregarClientes(); // Atualiza a lista de clientes
    })
    .catch(error => {
      console.error("Erro na requisição:", error);
      alert("Erro na requisição. Tente novamente.");
    });
});

// Função para carregar e listar os clientes na tabela
function carregarClientes() {
  fetch('http://localhost/grof/backend/controllers/clienteController.php')
    .then(res => res.json())
    .then(clientes => {
      tabela.innerHTML = ''; // Limpa tabela antes de preencher
      clientes.forEach(cliente => {
        const nomeClienteLower = cliente.nomeCliente ? cliente.nomeCliente.toLowerCase() : '';

        tabela.innerHTML += `
  <tr data-nome="${nomeClienteLower}">
    <td>${cliente.id}</td>
    <td>${cliente.nomeCliente}</td>
    <td>${cliente.responsavel}</td>

    <td>${cliente.cidade ?? ''}</td>

    <td>${formatarTelefone(cliente.contatoCliente1 ?? '')}</td>
    <td>${formatarTelefone(cliente.contatoCliente2 ?? '')}</td>
    <td>
      <button onclick='editar(${JSON.stringify(cliente)})'>Editar</button>
      <button onclick='excluir(${cliente.id})'>Excluir</button>
      <button onclick='detalharCliente(${cliente.id})'>Detalhar</button>
    </td>
  </tr>`;

      });
    });
}

// Função para preencher o formulário com os dados do cliente para edição
function editar(cliente) {
  form.style.display = 'block';
  form.id.value = cliente.id;
  form.nomeCliente.value = cliente.nomeCliente;
  form.responsavel.value = cliente.responsavel;
  form.cpf_cnpj.value = cliente.cpf_cnpj;
  form.cidade.value = cliente.cidade;
  form.endereco.value = cliente.endereco;
  form.contatoCliente1.value = cliente.contatoCliente1 ?? '';
  form.contatoCliente2.value = cliente.contatoCliente2 ?? '';

  window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
}

// Função para excluir cliente após confirmação
function excluir(id) {
  if (confirm("Deseja excluir este cliente?")) {
    fetch('http://localhost/grof/backend/controllers/clienteController.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id: id }) // Envia id para exclusão
    })
      .then(res => res.json())
      .then(response => {
        if (response.status === 'Cliente excluído com sucesso') {
          alert(response.status);
          carregarClientes(); // Atualiza lista após exclusão
        } else {
          alert('Erro ao excluir cliente: ' + response.error);
        }
      })
      .catch(error => {
        console.error("Erro ao excluir o cliente:", error);
        alert('Erro ao excluir o cliente. Por favor, tente novamente mais tarde.');
      });
  }
}

// Filtro de busca na tabela conforme o texto digitado no input
campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase();
  document.querySelectorAll('#tabelaClientes tbody tr').forEach(tr => {
    const nome = tr.getAttribute('data-nome');
    tr.style.display = nome.includes(termo) ? '' : 'none';
  });
});

// Formata a string de CPF ou CNPJ para exibição padrão
function formatarCpfCnpj(valor) {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 11) {
    // Formato CPF: 000.000.000-00
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (numeros.length === 14) {
    // Formato CNPJ: 00.000.000/0000-00
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  } else {
    return valor; // Caso o valor não tenha 11 ou 14 dígitos, retorna como está
  }
}

function formatarTelefone(numero) {
  const numeros = numero.replace(/\D/g, '');

  if (numeros.length === 11) {
    // Formato celular com DDD: (00) 00000-0000
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    // Formato fixo com DDD: (00) 0000-0000
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return numero; // Caso não tenha 10 ou 11 dígitos, retorna como está
  }
}



// Função para buscar e exibir os detalhes do cliente no modal (sem contatos)
function detalharCliente(id) {
  fetch(`http://localhost/grof/backend/controllers/clienteController.php?id=${id}`)
    .then(res => res.json())
    .then(data => {
      const modal = document.getElementById('detalhesModal');

      // Preenche os campos do modal com os dados do cliente
      modal.querySelector('#nomeCliente').innerText = data.cliente.nomeCliente;
      modal.querySelector('#responsavel').innerText = data.cliente.responsavel;
      modal.querySelector('#cpfCnpj').innerText = formatarCpfCnpj(data.cliente.cpf_cnpj);
      modal.querySelector('#cidade').innerText = data.cliente.cidade ?? 'N/A';
      modal.querySelector('#endereco').innerText = data.cliente.endereco ?? 'N/A';
      modal.querySelector('#contatoCliente1').innerText = formatarTelefone(data.cliente.contatoCliente1 ?? '');
      modal.querySelector('#contatoCliente2').innerText = formatarTelefone(data.cliente.contatoCliente2 ?? '');



      modal.style.display = 'block'; // Mostra o modal
    });
}

// Função para fechar o modal de detalhes
function fecharModal() {
  const modal = document.getElementById('detalhesModal');
  modal.style.display = 'none';
}

// Inicializa carregando os clientes na tabela assim que a página carrega
carregarClientes();
