/**
 * dashboard.js
 * 
 * Script para controlar a navegação ativa no menu e carregar notícias relacionadas à agronomia
 * utilizando a API GNews, com fallback local em caso de erro.
 */

// Seleciona o nome do arquivo da página atual para destacar o link correspondente no menu
const caminhoAtual = window.location.pathname.split("/").pop();
const linksNavegacao = document.querySelectorAll(".itemNavegacao");

// Marca o link ativo no menu de navegação
linksNavegacao.forEach(link => {
  const hrefArquivo = link.getAttribute("href").split("/").pop();
  if (hrefArquivo === caminhoAtual) {
    link.classList.add("ativo");
  }
});

/**
 * Função principal para buscar notícias da API GNews
 * Seleciona aleatoriamente um tema relacionado a agronomia para a busca.
 */
async function buscarNoticias() {
  const apiKey = "f891a9c84f2e748579771cfd725406e9";

  // Temas de busca para notícias em português sobre agronomia/agricultura
  const temasBusca = [
    "agronomia", "agricultura", "milho", "safra", "plantio", "colheita", "agronegócio", "commodities"
  ];

  // Escolhe um tema aleatório da lista
  const termoBusca = temasBusca[Math.floor(Math.random() * temasBusca.length)];

  try {
    console.log(`Buscando notícias com o termo: ${termoBusca}`);

    // Monta a URL para requisição da API GNews
    const url = `https://gnews.io/api/v4/search?q=${termoBusca}&lang=pt&country=br&max=10&apikey=${apiKey}`;
    console.log("URL da API:", url);

    const resposta = await fetch(url);

    if (resposta.ok) {
      const dados = await resposta.json();
      console.log("Dados recebidos da GNews:", dados);

      if (dados.articles && dados.articles.length > 0) {
        console.log(`Encontradas ${dados.articles.length} notícias da API GNews`);

        // Adapta os dados recebidos para o formato interno
        const noticiasAdaptadas = dados.articles.map(article => ({
          title: article.title || "Sem título",
          description: article.description || "Sem descrição disponível",
          url: article.url || "#",
          urlToImage: article.image || "../img/logoGrofSfundo.png",
          publishedAt: article.publishedAt || new Date().toISOString()
        }));

        exibirNoticias(noticiasAdaptadas);
      } else {
        console.warn("API GNews não retornou artigos. Usando backup.");
        throw new Error("Sem artigos");
      }
    } else {
      console.warn(`API GNews retornou status ${resposta.status}. Usando dados de backup.`);
      throw new Error("Erro de API");
    }
  } catch (erroAPI) {
    console.error("Erro ao acessar GNews API:", erroAPI);
    console.log("Usando dados de notícias de backup");

    const dadosBackup = gerarNoticiasFallback(termoBusca);
    exibirNoticias(dadosBackup.articles);
  }
}

/**
 * Gera um conjunto de notícias de fallback (backup) caso a API falhe
 * @param {string} termo - termo utilizado na busca para personalizar as notícias de fallback
 * @returns {Object} objeto com um array de artigos
 */
function gerarNoticiasFallback(termo) {
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const anteontem = new Date(hoje);
  anteontem.setDate(hoje.getDate() - 2);

  // Notícias de backup com títulos e descrições relacionadas ao termo
  const noticiasFallback = {
    articles: [
      {
        title: `Novas tecnologias para otimização de plantio de ${termo}`,
        description: `Pesquisadores desenvolvem inovações para aumentar a produtividade do ${termo} com menor impacto ambiental e maior rendimento para produtores rurais.`,
        url: "https://www.embrapa.br",
        urlToImage: "../img/logoGrofSfundo.png",
        publishedAt: hoje.toISOString()
      },
      {
        title: `Previsão climática favorece safra de ${termo} no próximo trimestre`,
        description: `Meteorologistas preveem condições ideais para o cultivo de ${termo} nas principais regiões produtoras do país nos próximos meses.`,
        url: "https://www.climatempo.com.br",
        urlToImage: "../img/logoGrofSfundo.png",
        publishedAt: ontem.toISOString()
      },
      {
        title: `Brasil aumenta exportações de ${termo} e bate recorde no semestre`,
        description: `Volume exportado de ${termo} cresceu 15% em comparação ao mesmo período do ano anterior, impulsionando o agronegócio brasileiro.`,
        url: "https://www.agrolink.com.br",
        urlToImage: "../img/logoGrofSfundo.png",
        publishedAt: anteontem.toISOString()
      },
      {
        title: `Novo estudo revela melhores práticas sustentáveis para cultivo de ${termo}`,
        description: `Pesquisa conduzida por universidades brasileiras aponta técnicas que podem reduzir em até 30% o uso de água na produção de ${termo}.`,
        url: "https://www.embrapa.br/noticias",
        urlToImage: "../img/logoGrofSfundo.png",
        publishedAt: anteontem.toISOString()
      },
      {
        title: `Cooperativa de produtores de ${termo} investe em tecnologia de ponta`,
        description: `Grupo de agricultores adota sistema de monitoramento por satélite e inteligência artificial para otimizar produção de ${termo} em diversas regiões.`,
        url: "https://www.noticiasagricolas.com.br",
        urlToImage: "../img/logoGrofSfundo.png",
        publishedAt: anteontem.toISOString()
      }
    ]
  };

  return noticiasFallback;
}

/**
 * Exibe as notícias no container da página, criando um carrossel com navegação
 * @param {Array} noticias - array de objetos contendo as notícias para exibir
 */
function exibirNoticias(noticias) {
  if (!noticias || noticias.length === 0) {
    exibirErroNoticias("Nenhuma notícia encontrada");
    return;
  }

  const containerNoticias = document.querySelector('.containerNoticias');
  containerNoticias.innerHTML = `
    <h3>Notícias de Agronomia</h3>
    <div class="carrosselNoticias">
      <button id="btnAnterior" class="btnNavegacao">&lt;</button>
      <div class="noticiasWrapper">
        <div class="noticiaSlides"></div>
      </div>
      <button id="btnProximo" class="btnNavegacao">&gt;</button>
    </div>
    <div class="indicadoresNoticias"></div>
  `;

  const slidesContainer = document.querySelector('.noticiaSlides');
  const indicadoresContainer = document.querySelector('.indicadoresNoticias');

  // Filtra notícias válidas e limita a 5 para exibição
  const noticiasFiltradas = noticias.filter(noticia => noticia && noticia.title && noticia.title.trim() !== '');
  const noticiasExibir = noticiasFiltradas.slice(0, 5);

  noticiasExibir.forEach((noticia, index) => {
    const slide = document.createElement('div');
    slide.className = `noticiaItem ${index === 0 ? 'ativo' : ''}`;

    // Formata data da publicação para pt-BR ou "Hoje" caso inválida
    let dataFormatada = "Hoje";
    if (noticia.publishedAt) {
      try {
        const dataPublicacao = new Date(noticia.publishedAt);
        dataFormatada = dataPublicacao.toLocaleDateString('pt-BR');
      } catch (e) {
        console.error("Erro ao formatar data:", e);
      }
    }

    // Descrição com limite de caracteres
    const descricao = noticia.description || "Clique em 'Ler mais' para ver o conteúdo completo desta notícia sobre agronomia.";
    const descricaoSegura = descricao.substring(0, 120) + (descricao.length > 120 ? '...' : '');

    slide.innerHTML = `
      <div class="noticiaImagem">
        <img src="${noticia.urlToImage || '../img/logoGrofSfundo.png'}" alt="${noticia.title}" 
             onerror="this.onerror=null; this.src='../img/logoGrofSfundo.png'">
      </div>
      <div class="noticiaConteudo">
        <h4>${noticia.title}</h4>
        <p>${descricaoSegura}</p>
        <div class="noticiaRodape">
          <span class="noticiaData">${dataFormatada}</span>
          <a href="${noticia.url}" target="_blank" class="noticiaBotao">Ler mais</a>
        </div>
      </div>
    `;
    slidesContainer.appendChild(slide);

    // Cria indicador para o carrossel
    const indicador = document.createElement('span');
    indicador.className = `indicador ${index === 0 ? 'ativo' : ''}`;
    indicador.dataset.index = index;
    indicadoresContainer.appendChild(indicador);
  });

  // Eventos dos botões do carrossel
  document.getElementById('btnAnterior').addEventListener('click', () => navegarCarrossel(-1));
  document.getElementById('btnProximo').addEventListener('click', () => navegarCarrossel(1));

  // Eventos dos indicadores para navegação direta
  document.querySelectorAll('.indicador').forEach(indicador => {
    indicador.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      mostrarSlide(index);
    });
  });

  // Inicia rotação automática do carrossel
  iniciarCarrosselAutomatico();
}

// Variável para controlar o intervalo do carrossel
let intervaloCarrossel;

/**
 * Inicia a rotação automática do carrossel a cada 5 segundos
 */
function iniciarCarrosselAutomatico() {
  clearInterval(intervaloCarrossel);

  intervaloCarrossel = setInterval(() => {
    navegarCarrossel(1);
  }, 5000);
}

/**
 * Navega para o próximo ou anterior slide no carrossel
 * @param {number} direcao - valor +1 para próximo, -1 para anterior
 */
function navegarCarrossel(direcao) {
  const slides = document.querySelectorAll('.noticiaItem');
  const indicadores = document.querySelectorAll('.indicador');

  if (!slides.length) return;

  let indiceAtivo = 0;
  slides.forEach((slide, index) => {
    if (slide.classList.contains('ativo')) {
      indiceAtivo = index;
    }
  });

  let proximoIndice = indiceAtivo + direcao;

  if (proximoIndice < 0) {
    proximoIndice = slides.length - 1;
  } else if (proximoIndice >= slides.length) {
    proximoIndice = 0;
  }

  mostrarSlide(proximoIndice);
  iniciarCarrosselAutomatico();
}

/**
 * Exibe o slide de notícias e indicador correspondente
 * @param {number} indice - índice do slide a mostrar
 */
function mostrarSlide(indice) {
  const slides = document.querySelectorAll('.noticiaItem');
  const indicadores = document.querySelectorAll('.indicador');

  slides.forEach(slide => slide.classList.remove('ativo'));
  indicadores.forEach(indicador => indicador.classList.remove('ativo'));

  slides[indice].classList.add('ativo');
  indicadores[indice].classList.add('ativo');
}

/**
 * Exibe mensagem de erro no container de notícias e botão para tentar novamente
 * @param {string} mensagem - mensagem de erro para exibir
 */
function exibirErroNoticias(mensagem = "Não foi possível carregar as notícias") {
  const containerNoticias = document.querySelector('.containerNoticias');
  containerNoticias.innerHTML = `
    <h3>Notícias de Agronomia</h3>
    <div class="noticiaConteudo erro">
      <p>${mensagem}</p>
      <button id="btnTentarNovamente" class="btnTentarNovamente">Tentar novamente</button>
    </div>
  `;

  document.getElementById('btnTentarNovamente').addEventListener('click', buscarNoticias);
}

// Inicia as funcionalidades após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function () {
  // Atualiza navegação ativa no menu
  const caminhoAtual = window.location.pathname.split("/").pop();
  const linksNavegacao = document.querySelectorAll(".itemNavegacao");

  linksNavegacao.forEach(link => {
    const hrefArquivo = link.getAttribute("href").split("/").pop();
    if (hrefArquivo === caminhoAtual) {
      link.classList.add("ativo");
    }
  });

  // Carrega as notícias
  buscarNoticias();
});
