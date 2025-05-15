document.addEventListener("DOMContentLoaded", () => {
  const botaoConverter = document.getElementById("botao-converter");
  if (botaoConverter) {
    botaoConverter.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      converterMoeda();
    });
  }
  const existeListaMoedas = document.getElementById("lista-moedas");
  const existeFavoritas = document.querySelector(".favoritas ul");
  const formRegistro = document.getElementById("form-registro");
  const formLogin = document.getElementById("form-login");
  const dropdownLista = document.getElementById("lista-moedas");
  const inputMoeda = document.getElementById("moeda");
  const dropdownSelecionado = document.getElementById("moeda-selecionada");
  const iconePerfil = document.getElementById("icone-perfil");
  const dropdownMenu = document.getElementById("dropdown-menu");
  if (existeListaMoedas) renderizarMoedas();
  if (existeFavoritas) carregarFavoritasDoServidor();
  if (existeFavoritas) carregarFavoritas();
  if (formRegistro) {
    formRegistro.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      const confirmarSenha = document.getElementById("confirmar-senha").value;
      if (senha !== confirmarSenha) {
        alert("As senhas são diferentes!");
        return;
      }
      try {
        const resposta = await fetch("http://localhost:3000/registrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });
        const resultado = await resposta.json();
        if (resultado.sucesso) {
          localStorage.setItem("email", email);
          window.location.href = "simulador.html";
        } else {
          alert("Erro ao cadastrar: " + resultado.mensagem);
        }
      } catch (erro) {
        alert("Erro ao conectar com o servidor.");
        console.error(erro);
      }
    });
  }
  if (formLogin) {
    formLogin.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      try {
        const resposta = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });
        const resultado = await resposta.json();
        if (resultado.sucesso) {
          localStorage.setItem("email", email);
          window.location.href = "simulador.html";
        } else {
          alert("Email ou senha incorretos.");
        }
      } catch (erro) {
        alert("Erro ao conectar com o servidor.");
        console.error(erro);
      }
    });
  }
  if (dropdownSelecionado && dropdownLista) {
    dropdownSelecionado.addEventListener("click", () => {
      dropdownLista.classList.toggle("mostrar");
    });
    document.addEventListener("click", function (e) {
      if (!dropdownSelecionado.contains(e.target) && !dropdownLista.contains(e.target)) {
        dropdownLista.classList.remove("mostrar");
      }
    });
  }
  if (iconePerfil && dropdownMenu) {
    iconePerfil.addEventListener("click", function () {
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", function (e) {
      if (!iconePerfil.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  }
  carregarHistorico();
});

async function converterMoeda() {
  const moedaSelecionada = document.getElementById("moeda").value;
  const quantidade = parseFloat(document.getElementById("quantidade").value);
  if (isNaN(quantidade) || quantidade <= 0) {
    alert("Por favor, insira uma quantidade válida!");
    return;
  }
  try {
    const resposta = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${moedaSelecionada}&vs_currencies=brl,usd`);
    const dados = await resposta.json();
    if (dados[moedaSelecionada]) {
      const valorBRL = dados[moedaSelecionada].brl;
      const valorUSD = dados[moedaSelecionada].usd;
      const resultadoBRL = (quantidade * valorBRL).toFixed(2);
      const resultadoUSD = (quantidade * valorUSD).toFixed(2);
      document.getElementById("resultado-brl").innerText = `R$ ${resultadoBRL}`;
      document.getElementById("resultado-usd").innerText = `$ ${resultadoUSD}`;
      await salvarHistorico(moedaSelecionada, quantidade, resultadoBRL, resultadoUSD);
      carregarHistorico();
    } else {
      alert("Erro ao obter dados da criptomoeda selecionada.");
    }
  } catch (erro) {
    alert("Erro ao conectar com a API.");
    console.error(erro);
  }
}

async function salvarHistorico(moeda, quantidade, resultadoBRL, resultadoUSD) {
  const email = localStorage.getItem("email");
  const dados = { email, moeda, quantidade, valorBRL: resultadoBRL, valorUSD: resultadoUSD };
  try {
    const resposta = await fetch("http://localhost:3000/salvarHistorico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      console.log("Histórico salvo com sucesso.");
    }
  } catch (erro) {
    console.error("Erro ao salvar histórico:", erro);
  }
}

async function salvarFavoritas(moedaId) {
  const email = localStorage.getItem("email");
  if (!email) return;
  try {
    const resposta = await fetch("http://localhost:3000/favoritar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: moedaId, email: email }),
    });
    const resultado = await resposta.json();
    if (resultado.sucesso) {
      console.log("Favorito salvo com sucesso no servidor:", moedaId);
    } else {
      console.error("Erro ao salvar favorito no servidor:", resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro ao comunicar com o servidor para favoritar:", erro);
  }
}

function renderizarFavoritas() {
  const ul = document.querySelector(".favoritas ul");
  if (!ul) return;
  ul.innerHTML = "";
  moedasFavoritas.forEach((id) => {
    const moeda = moedasDisponiveis.find((m) => m.id === id);
    if (moeda) {
      const li = document.createElement("li");
      const coracao = document.createElement("img");
      coracao.src = "assets/IMG/coracao-cheio.png";
      coracao.alt = "Coração preenchido";
      coracao.style.width = "20px";
      coracao.style.height = "20px";
      const nomeMoeda = document.createElement("span");
      nomeMoeda.textContent = moeda.name;
      li.appendChild(coracao);
      li.appendChild(nomeMoeda);
      ul.appendChild(li);
    }
  });
}

window.alternarSenha = function (idInput, idIcone) {
  const input = document.getElementById(idInput);
  const icone = document.getElementById(idIcone);
  if (input && icone) {
    if (input.type === 'password') {
      input.type = 'text';
      icone.src = 'assets/IMG/olho2.png';
    } else {
      input.type = 'password';
      icone.src = 'assets/IMG/olho.png';
    }
  }
};

let moedasFavoritas = [];

async function carregarFavoritasDoServidor() {
  const email = localStorage.getItem("email");
  if (!email) return;
  try {
    const resposta = await fetch(`http://localhost:3000/favoritos?email=${email}`);
    const favoritosDoServidor = await resposta.json();
    moedasFavoritas = favoritosDoServidor;
    await renderizarMoedas();
    renderizarFavoritas();
  } catch (erro) {
    console.error("Erro ao carregar favoritos do servidor:", erro);
  }
}

let moedasDisponiveis = [];

async function renderizarMoedas() {
  try {
    const resposta = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");
    const moedas = await resposta.json();
    moedasDisponiveis = moedas;
    const listaMoedas = document.getElementById("lista-moedas");
    listaMoedas.innerHTML = "";
    moedas.forEach(moeda => {
      const li = document.createElement("li");
      const coracao = document.createElement("img");
      coracao.classList.add("icone-coracao");
      coracao.src = moedasFavoritas.includes(moeda.id)
        ? "assets/IMG/coracao-cheio.png"
        : "assets/IMG/coracao-vazio.png";
      coracao.alt = moedasFavoritas.includes(moeda.id) ? "Desfavoritar" : "Favoritar";
      coracao.style.width = "20px";
      coracao.style.height = "20px";
      coracao.style.cursor = "pointer";
      coracao.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (moedasFavoritas.includes(moeda.id)) {
          const index = moedasFavoritas.indexOf(moeda.id);
          if (index > -1) {
            moedasFavoritas.splice(index, 1);
            coracao.src = "assets/IMG/coracao-vazio.png";
            coracao.alt = "Favoritar";
            try {
              const respostaDesfavoritar = await fetch("http://localhost:3000/desfavoritar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: moeda.id, email: localStorage.getItem("email") }),
              });
              const resultadoDesfavoritar = await respostaDesfavoritar.json();
              if (resultadoDesfavoritar.sucesso) {
                console.log("Desfavoritado com sucesso no servidor:", moeda.id);
              } else {
                console.error("Erro ao desfavoritar no servidor:", resultadoDesfavoritar.mensagem);
              }
            } catch (erro) {
              console.error("Erro ao comunicar com o servidor para desfavoritar:", erro);
            }
          }
        } else {
          moedasFavoritas.push(moeda.id);
          coracao.src = "assets/IMG/coracao-cheio.png";
          coracao.alt = "Desfavoritar";
          await salvarFavoritas(moeda.id);
        }
        localStorage.setItem("favoritas", JSON.stringify(moedasFavoritas));
        renderizarFavoritas();
      });
      const nomeMoeda = document.createElement("span");
      nomeMoeda.textContent = moeda.name;
      nomeMoeda.classList.add("nome-moeda");
      nomeMoeda.style.cursor = "pointer";
      nomeMoeda.addEventListener("click", () => {
        const moedaSelecionada = document.getElementById("moeda");
        const moedaSelecionadaTexto = document.getElementById("moeda-selecionada");
        moedaSelecionada.value = moeda.id;
        moedaSelecionadaTexto.value = moeda.name;
        listaMoedas.classList.remove("mostrar");
      });
      li.appendChild(coracao);
      li.appendChild(nomeMoeda);
      listaMoedas.appendChild(li);
    });
  } catch (erro) {
    console.error("Erro ao carregar as moedas:", erro);
  }
}

async function carregarHistorico() {
  const email = localStorage.getItem("email");
  if (!email) return;
  try {
    const resposta = await fetch(`http://localhost:3000/historico?email=${email}`);
    const historico = await resposta.json();
    const lista = document.getElementById("lista-historico");
    if (!lista) return;
    lista.innerHTML = "";
    historico.forEach(item => {
      const li = document.createElement("li");
      const hr = document.createElement("hr");
      const br = document.createElement("br");
      li.textContent = `${item.quantidade} ${item.moeda} = R$${item.valorBRL} / $${item.valorUSD} em ${new Date(item.data).toLocaleString()}`;
      lista.appendChild(li);
      lista.appendChild(hr);
      lista.appendChild(br);
    });
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
  }
}

async function carregarFavoritas() {
  const email = localStorage.getItem("email");
  if (!email) return;
  try {
    const resposta = await fetch(`http://localhost:3000/favoritos?email=${email}`);
    const favoritosDoServidor = await resposta.json();
    const listaFavoritasElement = document.querySelector(".favoritas ul");
    if (!listaFavoritasElement) return;
    listaFavoritasElement.innerHTML = "";
    favoritosDoServidor.forEach(moedaId => {
      const moeda = moedasDisponiveis.find(m => m.id === moedaId);
      if (moeda) {
        const li = document.createElement("li");
        li.textContent = moeda.name;
        listaFavoritasElement.appendChild(li);
      }
    });
  } catch (erro) {
    console.error("Erro ao carregar favoritos:", erro);
  }
}
