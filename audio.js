// Tudo que envolve som fica aqui.
// "modo" pode ser:
//   "sequencia" -> uma nota depois da outra (notas e intervalos)
//   "junto"     -> todas as notas ao mesmo tempo (acordes)
//
// Os instrumentos são SINTETIZADOS pelo navegador (não usam arquivos de áudio):
//   piano  -> soma de harmônicos que decaem em velocidades diferentes
//   violão -> corda dedilhada simulada (algoritmo Karplus-Strong)
//
// Para criar outro instrumento: escreva uma função como notaPiano,
// registre em FUNCOES_NOTA e acrescente o nome em INSTRUMENTOS.
const Som = (function () {
  let ctx = null;
  let instrumentoAtual = "piano";
  let bufferRuido = null;
  const cacheViolao = {};

  const INSTRUMENTOS = [
    { id: "piano", nome: "🎹 Piano" },
    { id: "violao", nome: "🎸 Violão" },
  ];

  // Converte o número midi em frequência (Lá central = 440 Hz).
  function frequencia(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function obterContexto() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // ---------- Piano ----------

  // Um estalo curto, como o martelo batendo na corda.
  function ruidoMartelo(c, inicio, volume) {
    if (!bufferRuido) {
      const n = Math.floor(c.sampleRate * 0.04);
      bufferRuido = c.createBuffer(1, n, c.sampleRate);
      const d = bufferRuido.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    const fonte = c.createBufferSource();
    fonte.buffer = bufferRuido;

    const filtro = c.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 900;
    filtro.Q.value = 0.8;

    const ganho = c.createGain();
    ganho.gain.setValueAtTime(volume * 0.7, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.03);

    fonte.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(c.destination);
    fonte.start(inicio);
  }

  function notaPiano(c, midi, inicio, volume) {
    const f0 = frequencia(midi);
    const corte = Math.max(2200, 9000 - (midi - 48) * 110);
    // Notas agudas duram menos que as graves, mas com decaimento mais suave.
    const duracao = Math.max(1.6, 3.8 - (midi - 48) * 0.045);
    const harmonicos = 7;
    const inarmonicidade = 0.0002;

    let soma = 0;
    for (let n = 1; n <= harmonicos; n++) soma += 1 / Math.pow(n, 1.45);

    for (let n = 1; n <= harmonicos; n++) {
      const f = f0 * n * Math.sqrt(1 + inarmonicidade * n * n);
      if (f > 12000) break;

      const amplitude = volume * (1 / Math.pow(n, 1.45) / soma) * 0.9;
      const fim = inicio + duracao / (1 + 0.5 * (n - 1));

      const osc = c.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = f;

      const filtro = c.createBiquadFilter();
      filtro.type = "lowpass";
      filtro.frequency.value = corte;
      filtro.Q.value = 0.7;

      const ganho = c.createGain();
      ganho.gain.setValueAtTime(0, inicio);
      ganho.gain.linearRampToValueAtTime(amplitude, inicio + 0.005);
      ganho.gain.exponentialRampToValueAtTime(0.0001, fim);

      osc.connect(filtro);
      filtro.connect(ganho);
      ganho.connect(c.destination);
      osc.start(inicio);
      osc.stop(fim + 0.05);
    }

    ruidoMartelo(c, inicio, volume * 0.18);
  }

  // ---------- Violão ----------

  // Karplus-Strong: uma "corda" digital. Começa com ruído suave
  // e a cada volta a média de duas amostras vai suavizando o som,
  // como uma corda de nylon perdendo os agudos ao vibrar.
  function criarBufferViolao(c, midi) {
    if (cacheViolao[midi]) return cacheViolao[midi];

    const sr = c.sampleRate;
    const freq = frequencia(midi);
    const total = Math.floor(sr * 2.8);
    // A média entre duas amostras vizinhas faz a volta da corda durar
    // N - 0,5 amostras (e não N). Por isso somamos 0,5 aqui.
    const N = Math.max(2, Math.round(sr / freq + 0.5));

    const buffer = c.createBuffer(1, total, sr);
    const dados = buffer.getChannelData(0);
    const linha = new Float32Array(N);

    // Ruído inicial suavizado (som mais "nylon" e menos metálico).
    let suave = 0;
    let media = 0;
    for (let i = 0; i < N; i++) {
      suave += 0.4 * (Math.random() * 2 - 1 - suave);
      linha[i] = suave;
      media += suave;
    }
    media /= N;
    for (let i = 0; i < N; i++) linha[i] -= media; // tira "chiado" constante

    // Perda por volta, calculada para a nota durar quase o mesmo
    // tempo em qualquer altura.
    const perda = Math.exp(-0.9 / freq);

    let pos = 0;
    let maximo = 0;
    for (let i = 0; i < total; i++) {
      const prox = pos + 1 === N ? 0 : pos + 1;
      const saida = linha[pos];
      dados[i] = saida;
      if (Math.abs(saida) > maximo) maximo = Math.abs(saida);
      linha[pos] = (saida + linha[prox]) * 0.5 * perda;
      pos = prox;
    }
    if (maximo > 0) {
      for (let i = 0; i < total; i++) dados[i] /= maximo;
    }

    // O tamanho da linha é um número inteiro, então a altura sairia
    // um pouco desafinada. A taxa de reprodução corrige isso, e a nota
    // toca exatamente na frequência certa (importante para o treino).
    const frequenciaReal = sr / (N - 0.5);
    const resultado = { buffer: buffer, taxa: freq / frequenciaReal };
    cacheViolao[midi] = resultado;
    return resultado;
  }

  function notaViolao(c, midi, inicio, volume) {
    const pronto = criarBufferViolao(c, midi);
    const duracao = 2.6;

    const fonte = c.createBufferSource();
    fonte.buffer = pronto.buffer;
    fonte.playbackRate.value = pronto.taxa;

    const ganho = c.createGain();
    ganho.gain.setValueAtTime(0, inicio);
    ganho.gain.linearRampToValueAtTime(volume, inicio + 0.003);
    ganho.gain.setValueAtTime(volume, inicio + duracao - 0.5);
    ganho.gain.linearRampToValueAtTime(0, inicio + duracao);

    fonte.connect(ganho);
    ganho.connect(c.destination);
    fonte.start(inicio);
    fonte.stop(inicio + duracao + 0.05);
  }

  // ---------- Interface pública ----------

  const FUNCOES_NOTA = { piano: notaPiano, violao: notaViolao };

  // Atraso entre as notas de um acorde (o violão é "dedilhado").
  const ATRASO_ACORDE = { piano: 0, violao: 0.04 };

  function definirInstrumento(id) {
    if (FUNCOES_NOTA[id]) instrumentoAtual = id;
    return instrumentoAtual;
  }

  function tocar(midis, modo) {
    const c = obterContexto();
    const agora = c.currentTime + 0.05;
    const nota = FUNCOES_NOTA[instrumentoAtual];

    if (modo === "junto") {
      // Volume dividido para o acorde não ficar muito mais alto que uma nota só.
      const volume = 0.45 / Math.sqrt(midis.length);
      const atraso = ATRASO_ACORDE[instrumentoAtual];
      midis.forEach((m, i) => nota(c, m, agora + i * atraso, volume));
    } else {
      midis.forEach((m, i) => nota(c, m, agora + i * 0.8, 0.5));
    }
  }

  return {
    tocar: tocar,
    definirInstrumento: definirInstrumento,
    instrumentoAtual: function () { return instrumentoAtual; },
    instrumentos: INSTRUMENTOS,
  };
})();
