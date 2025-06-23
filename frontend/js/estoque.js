const formEstoque = document.getElementById('formEstoque');
const tabelaEstoque = document.querySelector('#tabelaEstoque tbody');
const botaoNovoEstoque = document.getElementById('btnNovoEstoque');
const selectFornecedor = formEstoque.querySelector('select[name="idFornecedor"]');

const ESTOQUE_API = '../../backend/controllers/estoqueController.php';

botaoNovoEstoque.addEventListener('click', () => {
  formEstoque.style.display = 'block';
  formEstoque.reset();
  formEstoque.id.value = '';
  carregarFornecedores();
  window.scrollTo({ top: formEstoque.offsetTop, behavior: 'smooth' });
});

function cancelarEstoque() {
  formEstoque.reset();
  formEstoque.id.value = '';
  formEstoque.style.display = 'none';
}

formEstoque.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(formEstoque);
  const id = formData.get('id');
  const method = id ? 'PUT' : 'POST';

  const quantidadeSacas = parseFloat(formData.get('quantidadeSacas'));
  const quantidadeKg = quantidadeSacas * 60;

  const data = new URLSearchParams();
  if (id) data.append('id', id);
  data.append('fornecedor_id', formData.get('idFornecedor'));
  data.append('cidade', formData.get('cidade'));
  data.append('quantidade_kg_comprada', quantidadeKg);
  data.append('preco_por_saca', formData.get('precoSaca'));

  fetch(ESTOQUE_API, {
    method: method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data
  })
    .then(res => res.json())
    .then(response => {
      if (response.status) {
        alert(response.status);
        formEstoque.reset();
        formEstoque.style.display = 'none';
        carregarEstoques();
      } else {
        alert('Erro: ' + response.error);
      }
    })
    .catch(error => {
      console.error("Erro na requisição:", error);
      alert("Erro na requisição. Tente novamente.");
    });
});

function carregarEstoques() {
  fetch(ESTOQUE_API)
    .then(response => response.json())
    .then(estoques => {
      tabelaEstoque.innerHTML = '';
      estoques.forEach(estoque => {
        const sacasCompradas = (estoque.quantidade_kg_comprada / 60).toFixed(0);
        const sacasAtuais = (estoque.estoque_kg_atual / 60).toFixed(0);

        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${estoque.nomeFornecedor}</td>
          <td>${estoque.cidade}</td>
          <td>${sacasCompradas} sc - ${parseFloat(estoque.quantidade_kg_comprada).toLocaleString('pt-BR', {minimumFractionDigits: 2})} kg</td>
          <td>R$ ${parseFloat(estoque.preco_por_saca).toFixed(2).replace('.', ',')}</td>
          <td>${sacasAtuais} sc - ${parseFloat(estoque.estoque_kg_atual).toLocaleString('pt-BR', {minimumFractionDigits: 2})} kg</td>
          <td>
            <button onclick="editarEstoque(${estoque.id})">Editar</button>
            <button onclick="excluirEstoque(${estoque.id})">Excluir</button>
          </td>
        `;
        tabelaEstoque.appendChild(linha);
      });
    });
}

function editarEstoque(id) {
  fetch(`${ESTOQUE_API}?id=${id}`)
    .then(res => res.json())
    .then(estoque => {
      formEstoque.style.display = 'block';
      formEstoque.id.value = estoque.id;
      formEstoque.cidade.value = estoque.cidade;
      formEstoque.quantidadeSacas.value = (estoque.quantidade_kg_comprada / 60).toFixed(0);
      formEstoque.precoSaca.value = estoque.preco_por_saca;

      // Primeiro carrega os fornecedores, depois preenche o select
      carregarFornecedores().then(() => {
        formEstoque.querySelector('select[name="idFornecedor"]').value = estoque.fornecedor_id;
      });

      window.scrollTo({ top: formEstoque.offsetTop, behavior: 'smooth' });
    });
}


function excluirEstoque(id) {
  if (confirm("Deseja excluir este estoque?")) {
    fetch(ESTOQUE_API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id: id })
    })
      .then(res => res.json())
      .then(response => {
        if (response.status) {
          alert(response.status);
          carregarEstoques();
        } else {
          alert('Erro ao excluir estoque: ' + response.error);
        }
      });
  }
}

function carregarFornecedores() {
  return fetch(`${ESTOQUE_API}?fornecedores=1`)
    .then(res => res.json())
    .then(fornecedores => {
      selectFornecedor.innerHTML = '<option value="">Selecione um fornecedor</option>';
      fornecedores.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = f.nomeFornecedor;
        selectFornecedor.appendChild(option);
      });
    });
}

carregarEstoques();