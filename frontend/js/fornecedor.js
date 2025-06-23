const form = document.getElementById('formFornecedor');
const tabela = document.querySelector('#tabelaFornecedores tbody');
const campoBusca = document.getElementById('buscaFornecedor');
const botaoNovoFornecedor = document.getElementById('btnNovoFornecedor');

// Máscara para CNPJ/CPF
$('#cnpj_cpf').mask('00.000.000/0000-00', {
  onKeyPress: function (cnpj_cpf, e, field, options) {
    var mascara = cnpj_cpf.length <= 11 ? '000.000.000-00' : '00.000.000/0000-00';
    $('#cnpj_cpf').mask(mascara, options);
  }
});


// Aplica máscara dinâmica no contatoFornecedor1
$('#contatoFornecedor1').on('input', function () {
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

// Aplica máscara dinâmica no contatoFornecedor2
$('#contatoFornecedor2').on('input', function () {
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


// Mostrar formulário ao clicar em "Incluir Novo Fornecedor"
botaoNovoFornecedor.addEventListener('click', () => {
  form.style.display = 'block';
  window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
  // Limpar formulário antes de abrir para cadastro
  form.reset();
  form.id.value = ''; // Garantir que o id seja limpo caso seja um novo cadastro
});

// Cancelar edição
function cancelarEdicao() {
  form.reset();
  form.id.value = '';
  form.style.display = 'none';
}

// Submissão do formulário
form.addEventListener('submit', e => {
  e.preventDefault();

  const telefone = form.contatoFornecedor1.value.replace(/\D/g, '');
  if (telefone.length < 10 || telefone.length > 11) {
    alert('O celular deve conter entre 10 e 11 dígitos.');
    form.contatoCliente1.focus();
    return;
  }

  const formData = new FormData(form);
  // Remove máscaras antes de enviar
  formData.set('contatoFornecedor1', form.contatoFornecedor1.value.replace(/\D/g, ''));
  formData.set('contatoFornecedor2', form.contatoFornecedor2.value.replace(/\D/g, ''));
  formData.set('cpf_cnpj', form.cpf_cnpj.value.replace(/\D/g, ''));
  const idFornecedor = form.id.value; // Verificar se estamos editando um fornecedor ou criando um novo

  // Se o idFornecedor for preenchido, isso indica que estamos editando, então usamos o método PUT.
  const method = idFornecedor ? 'PUT' : 'POST'; // Se o id for preenchido, usa PUT, caso contrário, POST

  // Verifique se o id está correto
  console.log("ID Fornecedor:", idFornecedor);

  // Converter FormData para URLSearchParams
  const urlSearchParams = new URLSearchParams();
  formData.forEach((value, key) => {
    urlSearchParams.append(key, value);
  });

  // Console para verificar os dados antes de enviar
  console.log(urlSearchParams.toString());

  fetch('http://localhost/grof/backend/controllers/fornecedorController.php', {
    method: method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: urlSearchParams // Passar os dados convertidos
  })
    .then(res => res.json())
    .then(response => {
      if (response.status) {
        alert(response.status); // Sucesso na operação (cadastro ou edição)
      } else {
        alert('Erro: ' + response.error); // Caso haja erro
      }
      form.reset();
      form.style.display = 'none';
      carregarFornecedores(); // Recarregar os fornecedores após adicionar ou editar
    })
    .catch(error => {
      console.error("Erro na requisição:", error);
      alert("Erro na requisição. Tente novamente.");
    });
});

// Carregar fornecedores
function carregarFornecedores() {
  fetch('http://localhost/grof/backend/controllers/fornecedorController.php')
    .then(res => res.json())
    .then(fornecedores => {
      console.log(fornecedores); // Adicione esse log para ver a resposta da API
      tabela.innerHTML = ''; // Limpar tabela antes de inserir dados
      fornecedores.forEach(fornecedor => {
        const nomeFornecedorLower = fornecedor.nomeFornecedor ? fornecedor.nomeFornecedor.toLowerCase() : '';

        tabela.innerHTML += `
          <tr data-nome="${nomeFornecedorLower}">
            <td>${fornecedor.id}</td>
            <td>${fornecedor.nomeFornecedor}</td>
            <td>${fornecedor.responsavel}</td>          
            <td>${fornecedor.cidade ?? ''}</td>
            <td>${formatarTelefone(fornecedor.contatoFornecedor1 ?? '')}</td>
            <td>${formatarTelefone(fornecedor.contatoFornecedor2 ?? '')}</td>
            <td>
              <button onclick='editar(${JSON.stringify(fornecedor)})'>Editar</button>
              <button onclick='excluir(${fornecedor.id})'>Excluir</button>
            </td>
          </tr>`;
      });
    });
}

// Editar fornecedor
function editar(fornecedor) {
  form.style.display = 'block';
  form.id.value = fornecedor.id;
  form.nomeFornecedor.value = fornecedor.nomeFornecedor;
  form.responsavel.value = fornecedor.responsavel;
  form.cnpj_cpf.value = fornecedor.cnpj_cpf;
  form.cidade.value = fornecedor.cidade;
  form.endereco.value = fornecedor.endereco;
  form.contatoFornecedor1.value = cliente.contatoFornecedor1 ?? '';
  form.contatoFornecedor2.value = cliente.contatoFornecedor2 ?? '';

  window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
}

// Excluir fornecedor
function excluir(id) {
  if (confirm("Deseja excluir este fornecedor?")) {
    fetch('http://localhost/grof/backend/controllers/fornecedorController.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ id: id }) // Envia o id no corpo da requisição
    })
      .then(res => res.json()) // Espera a resposta JSON
      .then(response => {
        if (response.status === 'Fornecedor excluído com sucesso') {
          alert(response.status); // Exibe sucesso
          carregarFornecedores(); // Recarrega os fornecedores após a exclusão
        } else {
          alert('Erro ao excluir fornecedor: ' + response.error); // Caso a exclusão falhe
        }
      })
      .catch(error => {
        console.error("Erro ao excluir o fornecedor:", error); // Captura erros de rede ou outros problemas
        alert('Erro ao excluir o fornecedor. Por favor, tente novamente mais tarde.');
      });
  }

  // Filtro de busca por nome
  campoBusca.addEventListener('input', () => {
    const termo = campoBusca.value.toLowerCase();
    document.querySelectorAll('#tabelaFornecedores tbody tr').forEach(tr => {
      const nome = tr.getAttribute('data-nome');
      tr.style.display = nome.includes(termo) ? '' : 'none';
    });
  });

  // Formatar CNPJ/CPF para exibição
  function formatarCnpjCpf(valor) {
    const numeros = valor.replace(/\D/g, '');

    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    } else {
      return valor;
    }
  }
}


// Função para formatar CNPJ/CPF
function formatarCnpjCpf(valor) {
  if (!valor) return ''; // Se o valor não existir, retorna vazio

  // Remove qualquer caractere não numérico
  valor = valor.replace(/\D/g, '');

  // Se for um CPF
  if (valor.length === 11) {
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Se for um CNPJ
  if (valor.length === 14) {
    return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return valor; // Se não for nem CPF nem CNPJ, retorna o valor original
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



// Inicializar
carregarFornecedores();
