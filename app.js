// Três telas:
//   INÍCIO    -> escolher o instrumento e o exercício
//   EXERCÍCIO -> uma rodada de questões, com barra de progresso
//   RESULTADO -> resumo ao terminar a rodada
// O som está em audio.js e os exercícios estão em exercicios.js.

// Quantas questões tem cada rodada. O projeto foi ajustado para a regra da especificação:
// todas as atividades devem ter exatamente 15 questões.
const QUESTOES_POR_RODADA = 15;

const CHAVE = "ouvidoMusical.placares";
const CHAVE_ANTIGA = "ouvidoMusical.pontuacao"; // versão com um placar só
const CHAVE_INSTRUMENTO = "ouvidoMusical.instrumento";
const CHAVE_USUARIOS = "ouvidoMusical.usuarios";
const CHAVE_USUARIO_ATUAL = "ouvidoMusical.usuarioAtual";
const ORDEM_MODULOS = ["notas", "intervalos", "acordes", "funcoes-harmonicas"];

let exercicioAtual = null; // só existe depois de abrir um exercício
let questao = null;
let respondido = false;
let rodada = rodadaVazia();
let usuarioAtual = null;
let placares = {};
let tokenSessao = "";
let previaExercicio = [];
let indicePrevia = 0;

const telaLogin = document.getElementById("tela-login");
const telaInicio = document.getElementById("tela-inicio");
const telaPrevia = document.getElementById("tela-previa");
const telaExercicio = document.getElementById("tela-exercicio");
const telaResultado = document.getElementById("tela-resultado");
const formLogin = document.getElementById("form-login");
const inputUsuario = document.getElementById("login-usuario");
const inputSenha = document.getElementById("login-senha");
const loginMensagem = document.getElementById("login-mensagem");
const botaoCriarConta = document.getElementById("botao-criar-conta");
const botaoSair = document.getElementById("botao-sair");
const spanUsuarioLogado = document.getElementById("usuario-logado");
const divInstrumentos = document.getElementById("instrumentos");
const divCartoes = document.getElementById("cartoes");
const botaoVoltar = document.getElementById("voltar");
const botaoVoltarPrevia = document.getElementById("voltar-previa");
const spanTitulo = document.getElementById("titulo-exercicio");
const smallInstrumento = document.getElementById("etiqueta-instrumento");
const spanTituloPrevia = document.getElementById("titulo-previa");
const smallInstrumentoPrevia = document.getElementById("etiqueta-previa");
const previewNome = document.getElementById("preview-nome");
const previewDescricao = document.getElementById("preview-descricao");
const botaoPreviewOuvir = document.getElementById("preview-ouvir");
const botaoPreviewAnterior = document.getElementById("preview-anterior");
const botaoPreviewProxima = document.getElementById("preview-proxima");
const botaoPreviewComecar = document.getElementById("preview-comecar");
const divProgresso = document.getElementById("progresso");
const divBarra = document.getElementById("barra");
const pProgressoTexto = document.getElementById("progresso-texto");
const pInstrucao = document.getElementById("instrucao");
const botaoTocar = document.getElementById("tocar");
const divOpcoes = document.getElementById("opcoes");
const pMensagem = document.getElementById("mensagem");
const pDetalhe = document.getElementById("detalhe");
const botaoProxima = document.getElementById("proxima");
const botaoZerar = document.getElementById("zerar");
const spanAcertos = document.getElementById("acertos");
const spanErros = document.getElementById("erros");
const spanSequencia = document.getElementById("sequencia");
const spanPorcentagem = document.getElementById("porcentagem");
const pRecorde = document.getElementById("recorde");
const barraGeral = document.getElementById("barra-geral");
const textoProgressoGeral = document.getElementById("texto-progresso-geral");
const pontosGerais = document.getElementById("pontos-gerais");

const pResExercicio = document.getElementById("res-exercicio");
const pResNota = document.getElementById("res-nota");
const pResPorcentagem = document.getElementById("res-porcentagem");
const pResMensagem = document.getElementById("res-mensagem");
const pResRecorde = document.getElementById("res-recorde");
const spanResErros = document.getElementById("res-erros");
const spanResSequencia = document.getElementById("res-sequencia");
const botaoJogarDeNovo = document.getElementById("jogar-de-novo");
const botaoResVoltar = document.getElementById("res-voltar");

// ---------- Histórico salvo (um por exercício) ----------
// Guarda o total de respostas, o recorde de sequência e as rodadas concluídas.

function placarVazio() {
  return {
    acertos: 0,
    erros: 0,
    melhorSequencia: 0,
    rodadas: 0,
    melhorRodada: 0,
    ultimaTentativa: null,
    concluido: false,
    ultimaPercentual: 0,
    perfeito: false,
    tons: {},
  };
}

function limparPlacar(dados) {
  const d = dados || {};
  const tons = d.tons && typeof d.tons === "object" ? d.tons : {};
  const normalizado = {};
  Object.keys(tons).forEach((chave) => {
    normalizado[chave] = limparPlacar(tons[chave]);
  });
  return {
    acertos: Number(d.acertos) || 0,
    erros: Number(d.erros) || 0,
    melhorSequencia: Number(d.melhorSequencia) || 0,
    rodadas: Number(d.rodadas) || 0,
    melhorRodada: Number(d.melhorRodada) || 0,
    ultimaTentativa: d.ultimaTentativa || null,
    concluido: Boolean(d.concluido),
    ultimaPercentual: Number(d.ultimaPercentual) || 0,
    perfeito: Boolean(d.perfeito),
    tons: normalizado,
  };
}

function placarDoTom(exercicioId, tonica) {
  const chave = String(tonica || "geral");
  const p = placares[exercicioId] || placarVazio();
  if (!p.tons) p.tons = {};
  if (!p.tons[chave]) p.tons[chave] = placarVazio();
  return p.tons[chave];
}

function carregarPlacares() {
  let salvo = {};

  if (usuarioAtual && usuarioAtual.placares) {
    salvo = usuarioAtual.placares;
  } else {
    try {
      const texto = localStorage.getItem(CHAVE);
      if (texto) {
        salvo = JSON.parse(texto) || {};
      } else {
        const antigo = localStorage.getItem(CHAVE_ANTIGA);
        if (antigo) salvo = { notas: JSON.parse(antigo) };
      }
    } catch (e) {
      salvo = {};
    }
  }

  const resultado = {};
  EXERCICIOS.forEach((ex) => {
    resultado[ex.id] = limparPlacar(salvo[ex.id]);
  });
  return resultado;
}

function salvarPlacares() {
  if (!usuarioAtual) return;
  fetch(`/api/users/${encodeURIComponent(usuarioAtual.usuario)}/scores`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenSessao}`,
    },
    body: JSON.stringify({ placares }),
  }).catch(() => mostrarMensagemLogin("Nao foi possivel salvar o progresso."));
}

function mostrarMensagemLogin(mensagem, tipo = "erro") {
  if (!loginMensagem) return;
  loginMensagem.textContent = mensagem;
  loginMensagem.style.color = tipo === "sucesso" ? "#a7f3d0" : "#ffd3d3";
}

async function autenticarUsuario(nomeUsuario, senha) {
  const nome = String(nomeUsuario || "").trim();
  if (!nome || !senha) {
    mostrarMensagemLogin("Preencha usuário e senha.");
    return false;
  }
  try {
    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nome, password: String(senha) }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagemLogin(dados.error || "Usuário ou senha inválidos.");
      return false;
    }
    usuarioAtual = {
      usuario: dados.usuario,
      isAdmin: Boolean(dados.isAdmin),
      placares: dados.placares || {},
    };
    tokenSessao = dados.token;
    placares = carregarPlacares();
    localStorage.setItem(CHAVE_USUARIO_ATUAL, dados.usuario.toLowerCase());
    atualizarProgressoGeral();
    return true;
  } catch (error) {
    mostrarMensagemLogin("Nao foi possivel conectar ao servidor.");
    return false;
  }
}

async function criarContaUsuario(nomeUsuario, senha) {
  const nome = String(nomeUsuario || "").trim();
  if (!nome || !senha) {
    mostrarMensagemLogin("Informe um usuário e uma senha.");
    return false;
  }
  try {
    const resposta = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nome, password: String(senha) }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagemLogin(dados.error || "Nao foi possivel criar a conta.");
      return false;
    }
    mostrarMensagemLogin("Conta criada com sucesso! Faça login agora.", "sucesso");
    return true;
  } catch (error) {
    mostrarMensagemLogin("Nao foi possivel conectar ao servidor.");
    return false;
  }
}

function sairDaConta() {
  usuarioAtual = null;
  tokenSessao = "";
  localStorage.removeItem(CHAVE_USUARIO_ATUAL);
  placares = {};
  if (barraGeral) barraGeral.style.width = "0%";
  if (pontosGerais) pontosGerais.textContent = "0% · 0 pts";
  if (textoProgressoGeral) textoProgressoGeral.textContent = "0% concluído · 0 pontos";
  mostrarTela("login");
  formLogin.reset();
  mostrarMensagemLogin("Sessão encerrada.");
  inputUsuario.focus();
}

// ---------- Rodada atual (fica só na memória) ----------

function rodadaVazia() {
  return {
    numero: 0,           // número da questão que está na tela (1 a 20)
    respondidas: 0,
    acertos: 0,
    erros: 0,
    sequencia: 0,
    melhorSequencia: 0,
    concluida: false,
    porcentagem: 0,
    novoRecorde: false,
  };
}

function porcentagemDe(acertos, total) {
  return total === 0 ? 0 : Math.round((acertos / total) * 100);
}

function mostrarPlacar() {
  const p = placares[exercicioAtual.id] || placarVazio();
  spanAcertos.textContent = rodada.acertos;
  spanErros.textContent = rodada.erros;
  spanSequencia.textContent = rodada.sequencia;
  spanPorcentagem.textContent = porcentagemDe(rodada.acertos, rodada.respondidas) + "%";
  pRecorde.textContent = "Recorde de sequência: " + (p.melhorSequencia || 0);
}

function exercicioPerfeito(exercicioId) {
  const p = placares[exercicioId] || placarVazio();
  return p.rodadas > 0 && p.erros === 0 && p.melhorRodada >= 80;
}

function desempenhoDoTom(placarTom) {
  if (!placarTom || !placarTom.rodadas) return 0;
  return Math.min(100, Number(placarTom.melhorRodada) || 0);
}

function desempenhoExercicio(exercicioId) {
  const p = placares[exercicioId] || placarVazio();
  const module = moduloDe(exercicioId);

  if (module === "funcoes-harmonicas") {
    const tons = Object.values(p.tons || {});
    if (tons.length === 0) {
      return p.rodadas === 0 ? 0 : Math.min(100, Number(p.melhorRodada) || 0);
    }

    const soma = tons.reduce((total, tom) => total + desempenhoDoTom(tom), 0);
    return Math.min(100, Math.round(soma / tons.length));
  }

  if (p.rodadas === 0) return 0;
  return Math.min(100, Number(p.melhorRodada) || 0);
}

function atualizarProgressoGeral() {
  const total = EXERCICIOS.length || 1;
  const totalDesempenho = EXERCICIOS.reduce((soma, ex) => soma + desempenhoExercicio(ex.id), 0);
  const percentual = Math.min(100, Math.round(totalDesempenho / total));
  const pontos = Math.round((percentual / 100) * 1000);

  if (pontosGerais) {
    pontosGerais.textContent = percentual + "% · " + pontos + " pts";
  }

  if (barraGeral) {
    barraGeral.style.width = percentual + "%";
  }

  if (textoProgressoGeral) {
    textoProgressoGeral.textContent = percentual + "% concluído · " + pontos + " pontos · desempenho médio";
  }
}

function atualizarEstadoAtividade() {
  if (!exercicioAtual) return;
  const p = placares[exercicioAtual.id] || placarVazio();
  p.concluido = p.melhorRodada >= 80;
  p.perfeito = p.rodadas > 0 && p.erros === 0 && p.melhorRodada >= 80;
  p.ultimaPercentual = p.rodadas > 0 ? p.melhorRodada : 0;
  placares[exercicioAtual.id] = p;
  atualizarProgressoGeral();
  salvarPlacares();
}

function atualizarProgresso() {
  const feitas = rodada.respondidas;
  divBarra.style.width = (feitas / QUESTOES_POR_RODADA) * 100 + "%";
  divProgresso.setAttribute("aria-valuemin", 0);
  divProgresso.setAttribute("aria-valuemax", QUESTOES_POR_RODADA);
  divProgresso.setAttribute("aria-valuenow", feitas);
  pProgressoTexto.textContent = "Questão " + rodada.numero + " de " + QUESTOES_POR_RODADA;
}

function registrarResposta(acertou) {
  const p = placares[exercicioAtual.id] || placarVazio();
  const pTom = exercicioAtual.modulo === "funcoes-harmonicas"
    ? placarDoTom(exercicioAtual.id, exercicioAtual.tonicaSelecionada)
    : p;
  rodada.respondidas++;

  if (acertou) {
    p.acertos++;
    pTom.acertos++;
    rodada.acertos++;
    rodada.sequencia++;
    if (rodada.sequencia > rodada.melhorSequencia) rodada.melhorSequencia = rodada.sequencia;
    if (rodada.sequencia > p.melhorSequencia) p.melhorSequencia = rodada.sequencia;
    if (rodada.sequencia > pTom.melhorSequencia) pTom.melhorSequencia = rodada.sequencia;
  } else {
    p.erros++;
    pTom.erros++;
    rodada.erros++;
    rodada.sequencia = 0;
  }

  if (rodada.respondidas >= QUESTOES_POR_RODADA) concluirRodada();

  salvarPlacares();
  mostrarPlacar();
  atualizarProgresso();
}

function concluirRodada() {
  const p = placares[exercicioAtual.id] || placarVazio();
  const pTom = exercicioAtual.modulo === "funcoes-harmonicas"
    ? placarDoTom(exercicioAtual.id, exercicioAtual.tonicaSelecionada)
    : p;
  const pct = porcentagemDe(rodada.acertos, rodada.respondidas);

  rodada.porcentagem = pct;
  rodada.novoRecorde = p.rodadas > 0 && pct > p.melhorRodada;
  p.rodadas++;
  p.ultimaTentativa = new Date().toISOString();
  p.ultimaPercentual = pct;
  p.concluido = pct >= 80;
  if (pct > p.melhorRodada) p.melhorRodada = pct;

  pTom.rodadas++;
  pTom.ultimaTentativa = new Date().toISOString();
  pTom.ultimaPercentual = pct;
  pTom.concluido = pct >= 80;
  if (pct > pTom.melhorRodada) pTom.melhorRodada = pct;

  rodada.concluida = true;
  atualizarEstadoAtividade();
}

// ---------- Instrumento (piano ou violão) ----------

function carregarInstrumento() {
  try {
    const id = localStorage.getItem(CHAVE_INSTRUMENTO);
    if (id) Som.definirInstrumento(id); // ignora nomes inválidos
  } catch (e) {
    // Sem armazenamento, fica no instrumento padrão.
  }
}

function salvarInstrumento(id) {
  try {
    localStorage.setItem(CHAVE_INSTRUMENTO, id);
  } catch (e) {
    // Se o navegador não permitir salvar, o app continua funcionando.
  }
}

function nomeDoInstrumentoAtual() {
  const atual = Som.instrumentoAtual();
  const inst = Som.instrumentos.find((i) => i.id === atual);
  return inst ? inst.nome : "";
}

function criarSeletorInstrumento() {
  divInstrumentos.innerHTML = "";
  Som.instrumentos.forEach((inst) => {
    const b = document.createElement("button");
    b.textContent = inst.nome;
    b.dataset.id = inst.id;
    b.addEventListener("click", () => escolherInstrumento(inst.id));
    divInstrumentos.appendChild(b);
  });
  marcarInstrumentoAtivo();
}

function marcarInstrumentoAtivo() {
  const atual = Som.instrumentoAtual();
  divInstrumentos.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("ativa", b.dataset.id === atual);
  });
}

function escolherInstrumento(id) {
  Som.definirInstrumento(id);
  salvarInstrumento(id);
  marcarInstrumentoAtivo();
  // Toca um acorde de Dó maior como amostra do instrumento.
  Som.tocar([60, 64, 67], "junto");
}

// ---------- Tela inicial: cartões dos exercícios ----------

function criarElemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function moduloDe(exercicioId) {
  const ex = EXERCICIOS.find((item) => item.id === exercicioId);
  return ex ? ex.modulo : null;
}

function ordemNoModulo(modulo) {
  return EXERCICIOS.filter((ex) => ex.modulo === modulo).map((ex) => ex.id);
}

function exercicioLiberado(exercicioId) {
  if (usuarioAtual && usuarioAtual.isAdmin) return true;

  const modulo = moduloDe(exercicioId);
  if (!modulo) return true;
  const ordem = ordemNoModulo(modulo);
  const indice = ordem.indexOf(exercicioId);
  if (indice <= 0) return true;
  const anterior = ordem[indice - 1];
  const info = placares[anterior] || placarVazio();
  return info.concluido || info.melhorRodada >= 80;
}

function textoDoPlacar(id) {
  const p = placares[id] || placarVazio();
  if (!exercicioLiberado(id)) return "Bloqueado";
  const total = p.acertos + p.erros;
  if (total === 0) return "Ainda sem respostas";
  const textoBase = total + (total === 1 ? " resposta" : " respostas") + " · " + porcentagemDe(p.acertos, total) + "% de acertos";
  if (exercicioPerfeito(id)) return textoBase + " · Perfeito";
  return textoBase;
}

function textoDasRodadas(id) {
  const p = placares[id] || placarVazio();
  if (!exercicioLiberado(id)) return "Libera ao concluir a etapa anterior";
  if (p.rodadas === 0) return "";
  return "Rodadas: " + p.rodadas + " · Melhor: " + p.melhorRodada + "%";
}

function rotuloModulo(modulo) {
  const mapear = {
    notas: "Notas",
    intervalos: "Intervalos",
    acordes: "Acordes",
    "funcoes-harmonicas": "Funções Harmônicas",
  };
  return mapear[modulo] || modulo.toUpperCase();
}

function abrirCampoHarmonico(tonica) {
  const ex = EXERCICIOS.find((item) => item.modulo === "funcoes-harmonicas");
  if (!ex) return;
  ex.tonicaSelecionada = tonica;
  abrirExercicio(ex.id);
}

function criarCartoes() {
  divCartoes.innerHTML = "";
  ORDEM_MODULOS.forEach((modulo) => {
    const cabecalho = criarElemento("h3", "modulo-titulo", rotuloModulo(modulo));
    divCartoes.appendChild(cabecalho);

    if (modulo === "funcoes-harmonicas") {
      const seletor = criarElemento("div", "seletor-tonos");
      const ex = EXERCICIOS.find((item) => item.modulo === "funcoes-harmonicas");
      TONALIDADES_CAMPO_HARMONICO.forEach((tonica) => {
        const botao = criarElemento("button", "botao-tono");
        const pTom = ex ? placarDoTom(ex.id, tonica) : placarVazio();
        const melhor = desempenhoDoTom(pTom);

        const label = criarElemento("span", "botao-tono-label", tonica);
        const meta = criarElemento("span", "botao-tono-meta", "Tom maior");
        const progressWrap = criarElemento("div", "cartao-progress-wrap");
        const progress = criarElemento("div", "cartao-progress");
        const fill = criarElemento("span", "cartao-progress-fill");
        const percentual = criarElemento("span", "cartao-percentual", melhor + "%");
        fill.style.width = melhor + "%";
        progress.appendChild(fill);
        progressWrap.appendChild(progress);
        progressWrap.appendChild(percentual);

        const texto = criarElemento("span", "botao-tono-texto");
        texto.appendChild(label);
        texto.appendChild(meta);

        botao.appendChild(texto);
        botao.appendChild(progressWrap);
        botao.addEventListener("click", () => abrirCampoHarmonico(tonica));
        seletor.appendChild(botao);
      });
      divCartoes.appendChild(seletor);
      return;
    }

    const lista = EXERCICIOS.filter((ex) => ex.modulo === modulo);
    lista.forEach((ex) => {
      const liberado = exercicioLiberado(ex.id);
      const cartao = criarElemento("button", "cartao");
      cartao.dataset.id = ex.id;
      cartao.disabled = !liberado;
      if (!liberado) cartao.classList.add("bloqueado");

      const texto = criarElemento("span", "cartao-texto");
      const progressoLinha = criarElemento("div", "cartao-progress-wrap");
      const progresso = criarElemento("div", "cartao-progress");
      const progressoFill = criarElemento("span", "cartao-progress-fill");
      const melhor = desempenhoExercicio(ex.id);
      const percentual = criarElemento("span", "cartao-percentual", melhor + "%");
      progressoFill.style.width = melhor + "%";
      progresso.appendChild(progressoFill);
      progressoLinha.appendChild(progresso);
      progressoLinha.appendChild(percentual);
      texto.appendChild(progressoLinha);
      texto.appendChild(criarElemento("span", "cartao-titulo", ex.titulo));
      texto.appendChild(criarElemento("span", "cartao-desc", ex.descricao));
      texto.appendChild(criarElemento("span", "cartao-placar", textoDoPlacar(ex.id)));
      const rodadas = textoDasRodadas(ex.id);
      if (rodadas) texto.appendChild(criarElemento("span", "cartao-placar", rodadas));

      cartao.appendChild(criarElemento("span", "cartao-icone", ex.icone));
      cartao.appendChild(texto);
      cartao.appendChild(criarElemento("span", "cartao-seta", liberado ? "›" : "🔒"));

      if (liberado) {
        cartao.addEventListener("click", () => abrirExercicio(ex.id));
      }
      divCartoes.appendChild(cartao);
    });
  });
}

function exemplosFixosPorExercicio(exercicio) {
  const mapa = {
    "notas-1": ["Dó", "Ré", "Mi"],
    "notas-2": ["Fá", "Sol"],
    "notas-3": ["Lá", "Si"],
    "notas-4": ["Dó#", "Ré#"],
    "notas-5": ["Fá#", "Sol#"],
    "notas-6": NOMES_NOTAS,
    "notas-7": NOMES_NOTAS,
    "notas-8": NOMES_NOTAS,
    "intervalos-1": ["1ª justa", "2ª menor", "2ª maior"],
    "intervalos-2": ["3ª menor", "3ª maior"],
    "intervalos-3": ["4ª justa", "4ª aumentada"],
    "intervalos-4": ["5ª justa", "6ª menor", "6ª maior"],
    "intervalos-5": ["7ª menor", "7ª maior"],
    "intervalos-6": ["8ª justa", "9ª menor", "9ª maior"],
    "intervalos-7": ["10ª menor", "10ª maior"],
    "intervalos-8": ["11ª justa", "11ª aumentada", "12ª justa"],
    "intervalos-9": ["13ª menor", "13ª maior"],
    "intervalos-10": ["14ª menor", "14ª maior"],
    "intervalos-11": ["15ª justa"],
    "intervalos-12": INTERVALOS.map((i) => i.nome),
    "intervalos-13": INTERVALOS.map((i) => i.nome),
    "acordes-1": ["Dó maior", "Ré maior", "Mi maior"],
    "acordes-2": ["Dó maior", "Ré maior", "Mi maior"],
    "acordes-3": ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior"],
    "acordes-4": ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior", "Lá maior", "Si maior"],
    "acordes-5": ["Dó menor", "Ré menor", "Mi menor"],
    "acordes-6": ["Dó maior com sétima maior", "Ré maior com sétima maior", "Mi maior com sétima maior"],
    "acordes-7": ["Dó menor com sétima menor", "Ré menor com sétima menor", "Mi menor com sétima menor"],
    "acordes-8": ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior", "Lá maior", "Si maior", "Dó menor", "Ré menor", "Mi menor"],
    "acordes-9": ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior", "Lá maior"],
    "acordes-10": ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior", "Lá maior", "Si maior", "Dó menor", "Ré menor", "Mi menor"],
  };

  if (mapa[exercicio.id]) return mapa[exercicio.id];
  if (exercicio.modulo === "notas") return ["Dó", "Ré", "Mi", "Fá", "Sol"];
  if (exercicio.modulo === "intervalos") return ["1ª justa", "2ª menor", "2ª maior", "3ª maior", "4ª justa", "5ª justa"];
  if (exercicio.modulo === "acordes") return ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior"];
  return ["Dó", "Ré", "Mi"];
}

function nomesJaMostradosNoModulo(exercicio) {
  const indice = EXERCICIOS.findIndex((item) => item.id === exercicio.id);
  if (indice <= 0) return new Set();

  const anteriores = EXERCICIOS.slice(0, indice).filter((item) => item.modulo === exercicio.modulo);
  const vistos = new Set();

  anteriores.forEach((item) => {
    exemplosFixosPorExercicio(item).forEach((nome) => vistos.add(nome));
  });

  return vistos;
}

function gerarExemplosPrevia(exercicio) {
  if (exercicio.modulo === "funcoes-harmonicas") return [];

  const exemplos = exemplosFixosPorExercicio(exercicio);
  const nomesJaVistos = nomesJaMostradosNoModulo(exercicio);
  const listaFinal = exemplos.filter((nome) => !nomesJaVistos.has(nome));
  const exemplosParaExibir = listaFinal.length > 0 ? listaFinal : exemplos;

  return exemplosParaExibir.map((nome) => {
    if (exercicio.modulo === "notas") {
      const nota = NOTAS_CROMATICAS.find((item) => item.nome === nome) || NOTAS_NATURAIS.find((item) => item.nome === nome) || NOTAS_NATURAIS[0];
      return {
        label: nome,
        descricao: "Escute esta nota antes de responder.",
        midis: [nota.midi],
        modo: "sequencia",
      };
    }

    if (exercicio.modulo === "intervalos") {
      const intervalo = INTERVALOS.find((item) => item.nome === nome) || INTERVALOS[0];
      const base = 60;
      return {
        label: nome,
        descricao: "Escute o intervalo antes de responder.",
        midis: [base, base + intervalo.semitons].map((m) => {
          let valor = Number(m) || 0;
          while (valor > 83) valor -= 12;
          while (valor < 36) valor += 12;
          return valor;
        }),
        modo: "sequencia",
      };
    }

    if (exercicio.modulo === "acordes") {
      const texto = String(nome);
      let root = "Dó";
      let tipo = "maior";

      if (texto.includes("menor com sétima menor")) {
        root = texto.replace(" menor com sétima menor", "");
        tipo = "menor7";
      } else if (texto.includes("maior com sétima maior")) {
        root = texto.replace(" maior com sétima maior", "");
        tipo = "maior7";
      } else if (texto.includes("menor")) {
        root = texto.replace(" menor", "");
        tipo = "menor";
      } else if (texto.includes("diminuto")) {
        root = texto.replace(" diminuto", "");
        tipo = "diminuto";
      } else {
        root = texto.replace(" maior", "");
      }

      const base = gerarAcorde(root, tipo);
      return {
        label: nome,
        descricao: "Escute este acorde antes de responder.",
        midis: base.midis.map((m) => {
          let valor = Number(m) || 0;
          while (valor > 83) valor -= 12;
          while (valor < 36) valor += 12;
          return valor;
        }),
        modo: "junto",
      };
    }

    return {
      label: nome,
      descricao: "Escute este exemplo antes de começar.",
      midis: [60, 64, 67],
      modo: "junto",
    };
  });
}

function atualizarPrevia() {
  const item = previaExercicio[indicePrevia] || previaExercicio[0];
  if (!item) {
    previewNome.textContent = "";
    previewDescricao.textContent = "";
    botaoPreviewAnterior.disabled = true;
    botaoPreviewProxima.textContent = "Próxima →";
    return;
  }

  spanTituloPrevia.textContent = exercicioAtual.icone + " " + exercicioAtual.titulo;
  smallInstrumentoPrevia.textContent = nomeDoInstrumentoAtual();
  previewNome.textContent = item.label;
  previewDescricao.textContent = item.descricao;
  botaoPreviewAnterior.disabled = indicePrevia === 0;
  botaoPreviewProxima.textContent = indicePrevia === previaExercicio.length - 1 ? "Último exemplo" : "Próxima →";
}

function ouvirPreviaAtual() {
  const item = previaExercicio[indicePrevia] || previaExercicio[0];
  if (!item) return;
  Som.tocar(item.midis, item.modo);
}

// ---------- Navegação entre as telas ----------

function atualizarCabecalhoUsuario() {
  if (spanUsuarioLogado) {
    spanUsuarioLogado.textContent = usuarioAtual ? "Conta: " + usuarioAtual.usuario : "";
  }
}

function mostrarTela(nome) {
  telaLogin.hidden = nome !== "login";
  telaInicio.hidden = nome !== "inicio";
  telaPrevia.hidden = nome !== "previa";
  telaExercicio.hidden = nome !== "exercicio";
  telaResultado.hidden = nome !== "resultado";
  atualizarCabecalhoUsuario();
  window.scrollTo(0, 0);
}

function irParaInicio() {
  if (!usuarioAtual) {
    mostrarTela("login");
    return;
  }

  atualizarProgressoGeral();
  criarCartoes(); // atualiza a pontuação mostrada nos cartões
  mostrarTela("inicio");
}

function abrirExercicio(id) {
  if (!exercicioLiberado(id)) {
    const ex = EXERCICIOS.find((item) => item.id === id) || EXERCICIOS[0];
    alert("Esta atividade está bloqueada. Conclua a etapa anterior para desbloquear: " + ex.titulo);
    return;
  }

  exercicioAtual = EXERCICIOS.find((ex) => ex.id === id) || EXERCICIOS[0];
  if (exercicioAtual.modulo === "funcoes-harmonicas" && !exercicioAtual.tonicaSelecionada) {
    exercicioAtual.tonicaSelecionada = "Dó";
  }

  if (exercicioAtual.modulo === "funcoes-harmonicas") {
    spanTitulo.textContent = exercicioAtual.icone + " " + exercicioAtual.titulo;
    smallInstrumento.textContent = nomeDoInstrumentoAtual();
    pInstrucao.textContent = "Tom: " + exercicioAtual.tonicaSelecionada + " maior. " + exercicioAtual.instrucao;
    botaoTocar.textContent = exercicioAtual.botaoTocar;
    iniciarRodada();
    window.history.pushState({ tela: "exercicio" }, "");
    mostrarTela("exercicio");
    return;
  }

  previaExercicio = gerarExemplosPrevia(exercicioAtual);
  indicePrevia = 0;

  spanTitulo.textContent = exercicioAtual.icone + " " + exercicioAtual.titulo;
  smallInstrumento.textContent = nomeDoInstrumentoAtual();
  pInstrucao.textContent = exercicioAtual.instrucao;
  botaoTocar.textContent = exercicioAtual.botaoTocar;
  atualizarPrevia();

  // Registra a tela no histórico: assim o botão "voltar" do celular
  // volta para a etapa anterior em vez de fechar o app.
  window.history.pushState({ tela: "previa" }, "");

  mostrarTela("previa");
}

function voltarAoInicio() {
  const estado = window.history.state;
  if (estado && (estado.tela === "resultado" || estado.tela === "exercicio" || estado.tela === "previa")) {
    window.history.back();
    return;
  }

  irParaInicio();
}

window.addEventListener("popstate", (evento) => {
  const estado = evento.state;
  if (estado && estado.tela === "previa") {
    mostrarTela("previa");
    return;
  }

  if (estado && estado.tela === "exercicio" && questao) {
    mostrarTela(rodada.concluida ? "resultado" : "exercicio");
    return;
  }

  if (estado && estado.tela === "resultado") {
    mostrarTela("resultado");
    return;
  }

  irParaInicio();
});

// ---------- Rodada e questões ----------

function iniciarRodada() {
  rodada = rodadaVazia();
  novaQuestao();
  mostrarPlacar();
  atualizarProgresso();
}

function novaQuestao() {
  respondido = false;
  rodada.numero++;
  pMensagem.textContent = "";
  pDetalhe.textContent = "";
  botaoProxima.textContent = "Próxima";
  botaoProxima.hidden = true;

  const argumentos = exercicioAtual.modulo === "funcoes-harmonicas"
    ? [exercicioAtual.tonicaSelecionada]
    : [];
  questao = exercicioAtual.gerarQuestao(...argumentos);

  divOpcoes.classList.toggle("opcoes-relogio", exercicioAtual.modulo === "funcoes-harmonicas");
  divOpcoes.classList.toggle("opcoes-grid", exercicioAtual.modulo !== "funcoes-harmonicas");
  divOpcoes.innerHTML = "";

  const emRelogio = exercicioAtual.modulo === "funcoes-harmonicas";
  questao.alternativas.forEach((texto, indice) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texto;
    if (emRelogio) {
      b.classList.add("alternativa-relogio");
      const angulo = (360 / questao.alternativas.length) * indice - 90;
      b.style.setProperty("--angle", angulo + "deg");
    }
    b.addEventListener("click", () => responder(texto, b));
    divOpcoes.appendChild(b);
  });
}

function responder(texto, botao) {
  if (respondido) return;
  respondido = true;

  const acertou = texto === questao.correta;
  botao.classList.add(acertou ? "certa" : "errada");

  // Sempre mostra qual era a resposta certa.
  divOpcoes.querySelectorAll("button").forEach((b) => {
    b.disabled = true;
    if (b.textContent === questao.correta) b.classList.add("certa");
  });

  pMensagem.textContent = acertou
    ? "✅ Acertou!"
    : "❌ Errou. A resposta era " + questao.correta + ".";
  pDetalhe.textContent = questao.detalhe;

  registrarResposta(acertou);

  // Na última questão, o botão leva ao resultado em vez de a outra questão.
  botaoProxima.textContent = rodada.concluida ? "Ver resultado" : "Próxima";
  botaoProxima.hidden = false;
}

// ---------- Tela de resultado ----------

function mensagemDoResultado(pct) {
  if (pct >= 90) return "Excelente! Seu ouvido está afiado. 🎉";
  if (pct >= 70) return "Muito bom! Continue assim. 👏";
  if (pct >= 50) return "Bom caminho! Mais algumas rodadas e você chega lá. 💪";
  return "Continue praticando: o ouvido melhora com a repetição. 🎧";
}

function mostrarResultado() {
  const p = placares[exercicioAtual.id];

  pResExercicio.textContent = exercicioAtual.icone + " " + exercicioAtual.titulo + " · " + nomeDoInstrumentoAtual();
  pResNota.textContent = rodada.acertos + " / " + rodada.respondidas;
  pResPorcentagem.textContent = rodada.porcentagem + "% de acertos";
  pResMensagem.textContent = mensagemDoResultado(rodada.porcentagem);
  pResRecorde.textContent = rodada.novoRecorde
    ? "🏆 Novo recorde: " + rodada.porcentagem + "%!"
    : "Sua melhor rodada: " + p.melhorRodada + "%";
  spanResErros.textContent = rodada.erros;
  spanResSequencia.textContent = rodada.melhorSequencia;

  window.history.pushState({ tela: "resultado" }, "");
  mostrarTela("resultado");
}

// ---------- Botões ----------

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const nome = inputUsuario.value;
  const senha = inputSenha.value;
  if (await autenticarUsuario(nome, senha)) {
    formLogin.reset();
    mostrarMensagemLogin("Login realizado com sucesso!", "sucesso");
    irParaInicio();
  }
});

botaoCriarConta.addEventListener("click", async () => {
  const nome = inputUsuario.value.trim();
  const senha = inputSenha.value;
  if (!nome || !senha) {
    mostrarMensagemLogin("Preencha usuário e senha para criar a conta.");
    return;
  }

  if (await criarContaUsuario(nome, senha)) {
    formLogin.reset();
  }
});

botaoSair.addEventListener("click", sairDaConta);

botaoVoltar.addEventListener("click", voltarAoInicio);
botaoVoltarPrevia.addEventListener("click", voltarAoInicio);
botaoResVoltar.addEventListener("click", voltarAoInicio);

botaoPreviewOuvir.addEventListener("click", ouvirPreviaAtual);
botaoPreviewAnterior.addEventListener("click", () => {
  if (indicePrevia > 0) {
    indicePrevia--;
    atualizarPrevia();
  }
});
botaoPreviewProxima.addEventListener("click", () => {
  if (indicePrevia < previaExercicio.length - 1) {
    indicePrevia++;
    atualizarPrevia();
  }
});
botaoPreviewComecar.addEventListener("click", () => {
  iniciarRodada();
  window.history.pushState({ tela: "exercicio" }, "");
  mostrarTela("exercicio");
});

botaoTocar.addEventListener("click", () => Som.tocar(questao.midis, questao.modo));

botaoProxima.addEventListener("click", () => {
  if (rodada.concluida) {
    mostrarResultado();
    return;
  }
  novaQuestao();
  atualizarProgresso();
  Som.tocar(questao.midis, questao.modo);
});

botaoJogarDeNovo.addEventListener("click", () => {
  iniciarRodada();
  window.history.pushState({ tela: "exercicio" }, "");
  mostrarTela("exercicio");
});

botaoZerar.addEventListener("click", () => {
  const pergunta =
    "Zerar o histórico de " + exercicioAtual.titulo +
    " (respostas, recorde e melhores rodadas)? A rodada atual continua. Isso não pode ser desfeito.";
  if (confirm(pergunta)) {
    placares[exercicioAtual.id] = placarVazio();
    salvarPlacares();
    mostrarPlacar();
  }
});

// ---------- Início ----------

carregarInstrumento();
criarSeletorInstrumento();
window.history.replaceState({ tela: "inicio" }, "");
atualizarProgressoGeral();

if (!usuarioAtual) {
  mostrarTela("login");
} else {
  irParaInicio();
}
