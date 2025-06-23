// ===============================
// ELEMENTOS DO DOM
// ===============================
const form = document.getElementById('formCaminhao');
const tabela = document.querySelector('#tabelaCaminhoes tbody');
const campoBusca = document.getElementById('buscaCaminhao');
const botaoNovoCaminhao = document.getElementById('btnNovoCaminhao');
const inputCapacidade = document.getElementById('capacidade');
const inputPlaca = form.querySelector('input[name="placa"]');

// ===============================
// AÇÕES INICIAIS
// ===============================
carregarCaminhoes();

// ===============================
// BOTÃO "Incluir Novo Caminhão"
// ===============================
botaoNovoCaminhao.addEventListener('click', () => {
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

  // Validação
  const placa = form.placa.value.trim().toUpperCase();
  const marca = form.marca.value.trim();
  const eixos = parseInt(form.eixos.value);
  const renavam = form.renavam.value.trim();

  const regexPlaca = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}-\d[A-Z]\d{2}$/;
  if (!regexPlaca.test(placa)) {
    alert("Placa inválida! Use o formato ABC-1234 ou ABC-1A24.");
    return;
  }

  const marcasValidas = ["Ford", "Volkswagen"];
  if (!marcasValidas.includes(marca)) {
    alert("Marca inválida! Apenas 'Ford' ou 'Volkswagen' são permitidas.");
    return;
  }

  if (isNaN(eixos) || eixos < 2 || eixos > 9) {
    alert("Quantidade de eixos inválida! Deve ser entre 2 e 9.");
    return;
  }

  const regexRenavam = /^\d{11}$/;
  if (!regexRenavam.test(renavam)) {
    alert("RENAVAM inválido! Deve conter exatamente 11 dígitos.");
    return;
  }

  // Converter 'capacidade' para número com ponto
  const campo = form.capacidade;
  let valor = campo.value.replace(' kg', '').trim().replace(/\./g, '').replace(',', '.');
  campo.value = valor;

  // Preparar envio
  const formData = new FormData(form);
  const idCaminhao = form.id.value;
  const method = idCaminhao ? 'PUT' : 'POST';

  const urlSearchParams = new URLSearchParams();
  formData.forEach((value, key) => {
    urlSearchParams.append(key, value);
  });

  // Enviar
  fetch('http://localhost/grof/backend/controllers/caminhaoController.php', {
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
      carregarCaminhoes();
    })
    .catch(error => {
      console.error("Erro na requisição:", error);
      alert("Erro na requisição. Tente novamente.");
    });
});

// ===============================
// CARREGAR CAMINHÕES
// ===============================
function carregarCaminhoes() {
  fetch('http://localhost/grof/backend/controllers/caminhaoController.php')
    .then(res => res.json())
    .then(caminhoes => {
      tabela.innerHTML = '';
      caminhoes.forEach(caminhao => {
        const placaLower = caminhao.placa ? caminhao.placa.toLowerCase() : '';

        // Formatar a capacidade
        let capacidade = caminhao.capacidade;
        if (capacidade) {
          capacidade = parseFloat(capacidade); // Certifica-se de que é um número
          capacidade = capacidade.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }

        // Adicionar " km" na quilometragem
        let kmAtual = caminhao.km_atual;
        if (kmAtual) {
          kmAtual = kmAtual + ' km'; // Adiciona " km"
        }

        tabela.innerHTML += `
          <tr data-placa="${placaLower}">
            <td>${caminhao.id}</td>
            <td>${caminhao.placa}</td>
            <td>${caminhao.modelo}</td>
            <td>${caminhao.marca}</td>
            <td>${capacidade}</td>
            <td>${caminhao.eixos}</td>
            <td>${kmAtual}</td>
            <td>${caminhao.renavam}</td>
            <td>${caminhao.motorista}</td>
            <td>
              <button onclick='editar(${JSON.stringify(caminhao)})'>Editar</button>
              <button onclick='excluir(${caminhao.id})'>Excluir</button>
            </td>
          </tr>`;
      });
    });
}



// ===============================
// EDITAR CAMINHÃO
// ===============================
function editar(caminhao) {
  form.style.display = 'block';
  form.id.value = caminhao.id;
  form.placa.value = caminhao.placa;
  form.modelo.value = caminhao.modelo;
  form.marca.value = caminhao.marca;
  form.capacidade.value = caminhao.capacidade;
  form.eixos.value = caminhao.eixos;
  form.km_atual.value = caminhao.km_atual;
  form.renavam.value = caminhao.renavam;
  form.motorista.value = caminhao.motorista;
  window.scrollTo({ top: form.offsetTop, behavior: 'smooth' });
}

// ===============================
// EXCLUIR CAMINHÃO
// ===============================
function excluir(id) {
  if (confirm("Deseja excluir este caminhão?")) {
    fetch('http://localhost/grof/backend/controllers/caminhaoController.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ id: id })
    })
      .then(res => res.json())
      .then(response => {
        if (response.status === 'Caminhão excluído com sucesso') {
          alert(response.status);
          carregarCaminhoes();
        } else {
          alert('Erro ao excluir caminhão: ' + response.error);
        }
      })
      .catch(error => {
        console.error("Erro ao excluir o caminhão:", error);
        alert('Erro ao excluir o caminhão. Por favor, tente novamente mais tarde.');
      });
  }
}

// ===============================
// FILTRO DE BUSCA POR PLACA
// ===============================
campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase();
  document.querySelectorAll('#tabelaCaminhoes tbody tr').forEach(tr => {
    const placa = tr.getAttribute('data-placa');
    tr.style.display = placa.includes(termo) ? '' : 'none';
  });
});

// ===============================
// FORMATAÇÃO DE CAPACIDADE (input)
// ===============================
inputCapacidade.addEventListener('input', () => {
  let valor = inputCapacidade.value.replace(/\D/g, '');
  if (valor === '') {
    inputCapacidade.value = '';
    return;
  }

  const numero = parseFloat(valor) / 100;
  const formatado = numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  inputCapacidade.value = formatado;
});

// ===============================
// FORMATAÇÃO DE PLACA (input)
// ===============================
inputPlaca.maxLength = 8;

inputPlaca.addEventListener('input', () => {
  let valor = inputPlaca.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

  let letras = valor.slice(0, 3).replace(/[^A-Z]/g, '');
  let resto = valor.slice(3).replace(/[^A-Z0-9]/g, '');
  valor = letras + resto;

  if (valor.length > 3) {
    valor = valor.slice(0, 3) + '-' + valor.slice(3);
  }

  inputPlaca.value = valor.slice(0, 8);
});
