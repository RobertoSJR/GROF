// ===============================
// ELEMENTOS DO DOM
// ===============================
const form = document.getElementById('formViagem');
const tabela = document.querySelector('#tabelaViagens tbody');
const campoBusca = document.getElementById('buscaViagem');
const botaoNovaViagem = document.getElementById('btnNovaViagem');

const selectCliente = document.getElementById('clienteViagem');
const selectFornecedor = document.getElementById('fornecedorViagem');
const selectCaminhao = document.getElementById('caminhaoViagem');

// ===============================
// AÇÕES INICIAIS
// ===============================
carregarSelects();
carregarViagens();

// ===============================
// CARREGA CLIENTES, FORNECEDORES E CAMINHÕES NOS SELECTS
// ===============================
function carregarSelects() {
    fetch('http://localhost/grof/backend/controllers/clienteController.php')
        .then(res => res.json())
        .then(clientes => {
            selectCliente.innerHTML = '<option value="">Selecione um Cliente</option>';
            clientes.forEach(c => {
                selectCliente.innerHTML += `<option value="${c.id}">${c.nomeCliente}</option>`;
            });
        });

    fetch('http://localhost/grof/backend/controllers/fornecedorController.php')
        .then(res => res.json())
        .then(fornecedores => {
            selectFornecedor.innerHTML = '<option value="">Selecione um Fornecedor</option>';
            fornecedores.forEach(f => {
                selectFornecedor.innerHTML += `<option value="${f.id}">${f.nomeFornecedor}</option>`;
            });
        });

    fetch('http://localhost/grof/backend/controllers/caminhaoController.php')
        .then(res => res.json())
        .then(caminhoes => {
            selectCaminhao.innerHTML = '<option value="">Selecione um Caminhão</option>';
            caminhoes.forEach(c => {
                selectCaminhao.innerHTML += `<option value="${c.id}">${c.placa} - ${c.modelo}</option>`;
            });
        });
}


// ===============================
// BOTÃO "Incluir Nova Viagem"
// ===============================
botaoNovaViagem.addEventListener('click', () => {
    form.style.display = 'block';
    window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
    form.reset();
    form.id.value = '';
});

// ===============================
// CANCELAR EDIÇÃO
// ===============================
function cancelarEdicao() {
    form.reset();
    form.id.value = '';
    form.style.display = 'none';
}

// ===============================
// ENVIAR FORMULÁRIO
// ===============================
form.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData(form);
    const idViagem = form.id.value;
    const method = idViagem ? 'PUT' : 'POST';

    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
        urlSearchParams.append(key, value);
    });

    fetch('http://localhost/grof/backend/controllers/viagemController.php', {
        method: method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlSearchParams
    })
        .then(res => res.json())
        .then(response => {
            if (response.status) {
                alert(response.status);
            } else {
                alert('Erro: ' + response.error);
            }
            form.reset();
            form.style.display = 'none';
            carregarViagens();
        })
        .catch(error => {
            console.error("Erro na requisição:", error);
            alert("Erro na requisição. Tente novamente.");
        });
});

// ===============================
// CARREGAR VIAGENS
// ===============================
function carregarViagens() {
    fetch('http://localhost/grof/backend/controllers/viagemController.php')
        .then(res => res.json())
        .then(viagens => {
            tabela.innerHTML = '';
            viagens.forEach(viagem => {
                tabela.innerHTML += `
          <tr data-destino="${(viagem.destino || '').toLowerCase()}">
            <td>${viagem.id}</td>
            <td>${viagem.nomeCliente}</td>
            <td>${viagem.nomeFornecedor}</td>
            <td>${viagem.placa} - ${viagem.modeloCaminhao}</td>
            <td>${parseFloat(viagem.peso_kg).toFixed(2)}</td>
            <td>R$ ${parseFloat(viagem.preco_saca).toFixed(2)}</td>
            <td>R$ ${parseFloat(viagem.preco_carga).toFixed(2)}</td>
            <td>${viagem.data_viagem}</td>
            <td>
              <button onclick='editarViagem(${viagem.id})'>Editar</button>
              <button onclick='excluir(${viagem.id})'>Excluir</button>
            </td>
          </tr>
        `;
            });
        });
}


// ===============================
// EDITAR VIAGEM
// ===============================
function editarViagem(id) {
  fetch(`http://localhost/grof/backend/controllers/viagemController.php?id=${id}`)
    .then(res => res.json())
    .then(response => {
      if (response.error) {
        alert('Erro ao carregar dados da viagem: ' + response.error);
        return;
      }

      const viagem = response;
      form.style.display = 'block';
      form.id.value = viagem.id;
      selectCliente.value = viagem.cliente_id;
      selectFornecedor.value = viagem.fornecedor_id;
      selectCaminhao.value = viagem.caminhao_id;
      form.peso_carga.value = viagem.peso_carga;
      form.preco_saca.value = viagem.preco_saca;
      form.data_viagem.value = viagem.data_viagem;

      window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
    })
    .catch(error => {
      console.error('Erro ao buscar viagem:', error);
      alert('Erro ao buscar viagem. Verifique a conexão ou o backend.');
    });
}



// ===============================
// EXCLUIR VIAGEM
// ===============================
function excluir(id) {
  if (confirm("Deseja excluir esta viagem?")) {
    fetch('http://localhost/grof/backend/controllers/viagemController.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ id: id })
    })
      .then(res => res.json())
      .then(response => {
        if (response.status === 'Viagem excluída com sucesso') {
          alert(response.status);
          carregarViagens();
        } else {
          alert('Erro ao excluir viagem: ' + (response.error || 'Resposta inesperada.'));
        }
      })
      .catch(error => {
        console.error("Erro ao excluir a viagem:", error);
        alert('Erro ao excluir a viagem. Por favor, tente novamente mais tarde.');
      });
  }
}


// ===============================
// FILTRO DE BUSCA POR DESTINO
// ===============================
campoBusca.addEventListener('input', () => {
    const termo = campoBusca.value.toLowerCase();
    document.querySelectorAll('#tabelaViagens tbody tr').forEach(tr => {
        const destino = tr.getAttribute('data-destino');
        tr.style.display = destino.includes(termo) ? '' : 'none';
    });
});
