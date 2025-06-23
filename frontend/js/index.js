
const caminhoAtual = window.location.pathname.split("/").pop();

const linksNavegacao = document.querySelectorAll(".itemNavegacao");

linksNavegacao.forEach(link => {
  const hrefArquivo = link.getAttribute("href").split("/").pop();
  if (hrefArquivo === caminhoAtual) {
    link.classList.add("ativo");
  }
});