// Os exercícios. Cada exercício sabe gerar uma questão.
// A questão guarda o que será TOCADO e qual é a resposta CERTA,
// os dois vindos dos mesmos dados. Por isso o som e a resposta
// nunca ficam fora de sincronia.

const NOMES_NOTAS = ["Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si"];
const QUANTIDADE_QUESTOES = 15;
const MIDI_MIN_OITAVA_5 = 36;
const MIDI_MAX_OITAVA_5 = 83;

function normalizarMidiOitava5(midi) {
  let valor = Number(midi) || 0;
  while (valor > MIDI_MAX_OITAVA_5) valor -= 12;
  while (valor < MIDI_MIN_OITAVA_5) valor += 12;
  return valor;
}

function nomeNota(midi) {
  return NOMES_NOTAS[midi % 12];
}

function sortear(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function entre(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function montarAlternativas(correta, todas, quantidade = 3) {
  const opcoes = [...new Set(todas)];
  const limit = Math.min(Math.max(quantidade, 1), opcoes.length);
  const erradas = embaralhar(opcoes.filter((x) => x !== correta)).slice(0, Math.max(0, limit - 1));
  return embaralhar([correta, ...erradas]).slice(0, limit);
}

const NOTAS_NATURAIS = [
  { nome: "Dó", midi: 60 },
  { nome: "Ré", midi: 62 },
  { nome: "Mi", midi: 64 },
  { nome: "Fá", midi: 65 },
  { nome: "Sol", midi: 67 },
  { nome: "Lá", midi: 69 },
  { nome: "Si", midi: 71 },
];

const NOTAS_CROMATICAS = [
  { nome: "Dó", midi: 60 },
  { nome: "Dó#", midi: 61 },
  { nome: "Ré", midi: 62 },
  { nome: "Ré#", midi: 63 },
  { nome: "Mi", midi: 64 },
  { nome: "Fá", midi: 65 },
  { nome: "Fá#", midi: 66 },
  { nome: "Sol", midi: 67 },
  { nome: "Sol#", midi: 68 },
  { nome: "Lá", midi: 69 },
  { nome: "Lá#", midi: 70 },
  { nome: "Si", midi: 71 },
];

const CIFRAS_NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const TONALIDADES_CAMPO_HARMONICO = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó#", "Ré#", "Fá#", "Sol#", "Lá#"];

const GRAUS_CAMPO_HARMONICO = [
  { grau: "I", semitons: 0, tipo: "maior", sufixo: "" },
  { grau: "ii", semitons: 2, tipo: "menor", sufixo: "m" },
  { grau: "iii", semitons: 4, tipo: "menor", sufixo: "m" },
  { grau: "IV", semitons: 5, tipo: "maior", sufixo: "" },
  { grau: "V", semitons: 7, tipo: "maior", sufixo: "" },
  { grau: "vi", semitons: 9, tipo: "menor", sufixo: "m" },
  { grau: "vii°", semitons: 11, tipo: "diminuto", sufixo: "°" },
];

const INTERVALOS = [
  { nome: "1ª justa", semitons: 0 },
  { nome: "2ª menor", semitons: 1 },
  { nome: "2ª maior", semitons: 2 },
  { nome: "3ª menor", semitons: 3 },
  { nome: "3ª maior", semitons: 4 },
  { nome: "4ª justa", semitons: 5 },
  { nome: "4ª aumentada", semitons: 6 },
  { nome: "5ª justa", semitons: 7 },
  { nome: "6ª menor", semitons: 8 },
  { nome: "6ª maior", semitons: 9 },
  { nome: "7ª menor", semitons: 10 },
  { nome: "7ª maior", semitons: 11 },
  { nome: "8ª justa", semitons: 12 },
  { nome: "9ª menor", semitons: 13 },
  { nome: "9ª maior", semitons: 14 },
  { nome: "10ª menor", semitons: 15 },
  { nome: "10ª maior", semitons: 16 },
  { nome: "11ª justa", semitons: 17 },
  { nome: "11ª aumentada", semitons: 18 },
  { nome: "12ª justa", semitons: 19 },
  { nome: "13ª menor", semitons: 20 },
  { nome: "13ª maior", semitons: 21 },
  { nome: "14ª menor", semitons: 22 },
  { nome: "14ª maior", semitons: 23 },
  { nome: "15ª justa", semitons: 24 },
];

const QUALIDADES_ACORDE = {
  maior: { nome: "Maior", semitons: [0, 4, 7] },
  menor: { nome: "Menor", semitons: [0, 3, 7] },
  diminuto: { nome: "Diminuto", semitons: [0, 3, 6] },
  maior7: { nome: "Maior com sétima maior", semitons: [0, 4, 7, 11] },
  menor7: { nome: "Menor com sétima menor", semitons: [0, 3, 7, 10] },
};

const ACORDES_BASE = [
  { nome: "Maior", tipo: "maior" },
  { nome: "Menor", tipo: "menor" },
  { nome: "Diminuto", tipo: "diminuto" },
];

const FUNDO_ACORDE = [
  { nome: "Dó", midi: 60 },
  { nome: "Ré", midi: 62 },
  { nome: "Mi", midi: 64 },
  { nome: "Fá", midi: 65 },
  { nome: "Sol", midi: 67 },
  { nome: "Lá", midi: 69 },
  { nome: "Si", midi: 71 },
  { nome: "Dó#", midi: 61 },
  { nome: "Ré#", midi: 63 },
  { nome: "Fá#", midi: 66 },
  { nome: "Sol#", midi: 68 },
  { nome: "Lá#", midi: 70 },
];

function gerarAcorde(rootNome, tipo) {
  const root = FUNDO_ACORDE.find((n) => n.nome === rootNome) || FUNDO_ACORDE[0];
  const qual = QUALIDADES_ACORDE[tipo];
  const notas = qual.semitons.map((s) => normalizarMidiOitava5(root.midi + s));
  return {
    midis: notas,
    modo: "junto",
    correta: root.nome + " " + qual.nome.toLowerCase(),
    detalhe: root.nome + " " + qual.nome.toLowerCase() + ": " + notas.map(nomeNota).join(" – "),
  };
}

function extrairLista(lista, chaves) {
  return lista.filter((item) => chaves.includes(item.nome));
}

function gerarQuestaoCampoHarmonico(tonicaNome) {
  const tonica = NOTAS_CROMATICAS.find((nota) => nota.nome === tonicaNome) || sortear(NOTAS_CROMATICAS);
  const grau = sortear(GRAUS_CAMPO_HARMONICO);
  const raizBase = tonica.midi + grau.semitons;
  const tipo = grau.tipo;
  const semitons = {
    maior: [0, 4, 7],
    menor: [0, 3, 7],
    diminuto: [0, 3, 6],
  }[tipo];

  const deslocamentoRaiz = sortear([-12, 0, 12]);
  const raiz = normalizarMidiOitava5(raizBase + deslocamentoRaiz);

  const midis = semitons.map((s, indice) => {
    let nota = raiz + s;
    if (indice > 0 && Math.random() < 0.7) nota += 12;
    if (nota < 36) nota += 12;
    if (nota > MIDI_MAX_OITAVA_5) nota = normalizarMidiOitava5(nota - 12);
    return normalizarMidiOitava5(nota);
  });

  const nomeDaRaiz = nomeNota(raiz);
  const cifra = `${CIFRAS_NOTAS[raiz % 12]}${grau.sufixo}`;
  const alternativaCorreta = `${nomeDaRaiz} • ${cifra} • ${grau.grau}`;
  const alternativas = GRAUS_CAMPO_HARMONICO.map((item) => {
    const nota = nomeNota(tonica.midi + item.semitons);
    const cifraItem = `${CIFRAS_NOTAS[(tonica.midi + item.semitons) % 12]}${item.sufixo}`;
    return `${nota} • ${cifraItem} • ${item.grau}`;
  });

  return {
    midis,
    modo: "junto",
    correta: alternativaCorreta,
    alternativas,
    detalhe: `${tonica.nome} maior · ${nomeDaRaiz} ${cifra} · grau ${grau.grau}`,
  };
}

const EXERCICIOS = [
  {
    id: "notas-1",
    modulo: "notas",
    nivel: 1,
    titulo: "Primeiras Notas",
    icone: "🎵",
    descricao: "Dó, Ré e Mi.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(extrairLista(NOTAS_NATURAIS, ["Dó", "Ré", "Mi"]));
      const nomes = ["Dó", "Ré", "Mi"];
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes),
        detalhe: "",
      };
    },
  },
  {
    id: "notas-2",
    modulo: "notas",
    nivel: 2,
    titulo: "Ampliando as Notas",
    icone: "🎵",
    descricao: "Dó, Ré, Mi, Fá e Sol.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(extrairLista(NOTAS_NATURAIS, ["Dó", "Ré", "Mi", "Fá", "Sol"]));
      const nomes = ["Dó", "Ré", "Mi", "Fá", "Sol"];
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes),
        detalhe: "",
      };
    },
  },
  {
    id: "notas-3",
    modulo: "notas",
    nivel: 3,
    titulo: "Escala Natural Completa",
    icone: "🎵",
    descricao: "Dó, Ré, Mi, Fá, Sol, Lá e Si.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(extrairLista(NOTAS_NATURAIS, ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"]));
      const nomes = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes),
        detalhe: "",
      };
    },
  },
  {
    id: "notas-4",
    modulo: "notas",
    nivel: 4,
    titulo: "Primeiros Sustenidos",
    icone: "🎵",
    descricao: "Dó#, Ré# + notas naturais.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(extrairLista(NOTAS_CROMATICAS, ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó#", "Ré#"]));
      const nomes = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó#", "Ré#"];
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes),
        detalhe: "",
      };
    },
  },
  {
    id: "notas-5",
    modulo: "notas",
    nivel: 5,
    titulo: "Ampliando os Sustenidos",
    icone: "🎵",
    descricao: "C#, D#, F#, G# + notas naturais.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(extrairLista(NOTAS_CROMATICAS, ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó#", "Ré#", "Fá#", "Sol#"]));
      const nomes = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó#", "Ré#", "Fá#", "Sol#"];
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes),
        detalhe: "",
      };
    },
  },
  {
    id: "notas-6",
    modulo: "notas",
    nivel: 6,
    titulo: "Escala Cromática Completa",
    icone: "🎵",
    descricao: "Todas as 12 classes de altura.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(NOTAS_CROMATICAS);
      const nomes = NOTAS_CROMATICAS.map((n) => n.nome);
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes),
        detalhe: "",
      };
    },
  },
  {
    id: "notas-7",
    modulo: "notas",
    nivel: 7,
    titulo: "Todas as notas (6 alternativas)",
    icone: "🎵",
    descricao: "Todas as 12 notas em seis opções de resposta.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(NOTAS_CROMATICAS);
      const nomes = embaralhar(NOMES_NOTAS);
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes, 6),
        detalhe: "",
      };
    },
  },
  {
    id: "notas-8",
    modulo: "notas",
    nivel: 8,
    titulo: "Todas as notas (12 alternativas)",
    icone: "🎵",
    descricao: "Todas as 12 notas com todas as opções visíveis.",
    instrucao: "Ouça a nota e escolha qual é.",
    botaoTocar: "▶ Tocar nota",
    gerarQuestao() {
      const nota = sortear(NOTAS_CROMATICAS);
      const nomes = NOMES_NOTAS;
      return {
        midis: [nota.midi],
        modo: "sequencia",
        correta: nota.nome,
        alternativas: montarAlternativas(nota.nome, nomes, 12),
        detalhe: "",
      };
    },
  },
  {
    id: "intervalos-1",
    modulo: "intervalos",
    nivel: 1,
    titulo: "1ª justa e segundas",
    icone: "↕️",
    descricao: "1ª justa, 2ª menor e 2ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-2",
    modulo: "intervalos",
    nivel: 2,
    titulo: "Terças",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 3ª menor e 3ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-3",
    modulo: "intervalos",
    nivel: 3,
    titulo: "Quartas",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 4ª justa e 4ª aumentada.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-4",
    modulo: "intervalos",
    nivel: 4,
    titulo: "Quintas e sextas",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 5ª justa, 6ª menor e 6ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-5",
    modulo: "intervalos",
    nivel: 5,
    titulo: "Sétimas",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 7ª menor e 7ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior", "7ª menor", "7ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-6",
    modulo: "intervalos",
    nivel: 6,
    titulo: "Oitavas e nonas",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 8ª justa, 9ª menor e 9ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior", "7ª menor", "7ª maior", "8ª justa", "9ª menor", "9ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-7",
    modulo: "intervalos",
    nivel: 7,
    titulo: "Décimas",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 10ª menor e 10ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior", "7ª menor", "7ª maior", "8ª justa", "9ª menor", "9ª maior", "10ª menor", "10ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-8",
    modulo: "intervalos",
    nivel: 8,
    titulo: "11ª, 11ª aumentada e 12ª",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 11ª justa, 11ª aumentada e 12ª justa.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior", "7ª menor", "7ª maior", "8ª justa", "9ª menor", "9ª maior", "10ª menor", "10ª maior", "11ª justa", "11ª aumentada", "12ª justa"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-9",
    modulo: "intervalos",
    nivel: 9,
    titulo: "Décimas terceiras",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 13ª menor e 13ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior", "7ª menor", "7ª maior", "8ª justa", "9ª menor", "9ª maior", "10ª menor", "10ª maior", "11ª justa", "11ª aumentada", "12ª justa", "13ª menor", "13ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-10",
    modulo: "intervalos",
    nivel: 10,
    titulo: "Décimas quartas",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 14ª menor e 14ª maior.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior", "7ª menor", "7ª maior", "8ª justa", "9ª menor", "9ª maior", "10ª menor", "10ª maior", "11ª justa", "11ª aumentada", "12ª justa", "13ª menor", "13ª maior", "14ª menor", "14ª maior"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-11",
    modulo: "intervalos",
    nivel: 11,
    titulo: "15ª justa",
    icone: "↕️",
    descricao: "Com todos os anteriores, acrescentando 15ª justa.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = ["1ª justa", "2ª menor", "2ª maior", "3ª menor", "3ª maior", "4ª justa", "4ª aumentada", "5ª justa", "6ª menor", "6ª maior", "7ª menor", "7ª maior", "8ª justa", "9ª menor", "9ª maior", "10ª menor", "10ª maior", "11ª justa", "11ª aumentada", "12ª justa", "13ª menor", "13ª maior", "14ª menor", "14ª maior", "15ª justa"];
      const intervalo = sortear(intervalos.map((nome) => INTERVALOS.find((i) => i.nome === nome)));
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-12",
    modulo: "intervalos",
    nivel: 12,
    titulo: "Todos os intervalos (6 alternativas)",
    icone: "↕️",
    descricao: "Todos os intervalos com seis opções de resposta.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = INTERVALOS.map((i) => i.nome);
      const intervalo = sortear(INTERVALOS);
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos, 6),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "intervalos-13",
    modulo: "intervalos",
    nivel: 13,
    titulo: "Todos os intervalos (12 alternativas)",
    icone: "↕️",
    descricao: "Todos os intervalos com a lista completa visível.",
    instrucao: "Ouça as duas notas e escolha o intervalo.",
    botaoTocar: "▶ Tocar intervalo",
    gerarQuestao() {
      const intervalos = INTERVALOS.map((i) => i.nome);
      const intervalo = sortear(INTERVALOS);
      const base = entre(55, 66);
      const topo = base + intervalo.semitons;
      return {
        midis: [base, topo],
        modo: "sequencia",
        correta: intervalo.nome,
        alternativas: montarAlternativas(intervalo.nome, intervalos, 12),
        detalhe: nomeNota(base) + " → " + nomeNota(topo),
      };
    },
  },
  {
    id: "acordes-1",
    modulo: "acordes",
    nivel: 1,
    titulo: "Reconhecendo as Qualidades",
    icone: "🎶",
    descricao: "Maior, menor e diminuto.",
    instrucao: "Ouça o acorde e escolha a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const tipo = sortear(ACORDES_BASE);
      const root = sortear(FUNDO_ACORDE.filter((n) => ["Dó", "Ré", "Mi"].includes(n.nome)));
      const questao = gerarAcorde(root.nome, tipo.tipo);
      return {
        midis: questao.midis,
        modo: "junto",
        correta: tipo.nome,
        alternativas: montarAlternativas(tipo.nome, ACORDES_BASE.map((a) => a.nome)),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-2",
    modulo: "acordes",
    nivel: 2,
    titulo: "Acordes maiores I",
    icone: "🎶",
    descricao: "Dó, Ré e Mi maiores.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE.filter((n) => ["Dó", "Ré", "Mi"].includes(n.nome)));
      const questao = gerarAcorde(root.nome, "maior");
      const nomes = ["Dó maior", "Ré maior", "Mi maior"];
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-3",
    modulo: "acordes",
    nivel: 3,
    titulo: "Acordes maiores II",
    icone: "🎶",
    descricao: "Dó, Ré, Mi, Fá e Sol maiores.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE.filter((n) => ["Dó", "Ré", "Mi", "Fá", "Sol"].includes(n.nome)));
      const questao = gerarAcorde(root.nome, "maior");
      const nomes = ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior"];
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-4",
    modulo: "acordes",
    nivel: 4,
    titulo: "Acordes maiores III",
    icone: "🎶",
    descricao: "Dó, Ré, Mi, Fá, Sol, Lá e Si maiores.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE.filter((n) => ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"].includes(n.nome)));
      const questao = gerarAcorde(root.nome, "maior");
      const nomes = ["Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior", "Lá maior", "Si maior"];
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-5",
    modulo: "acordes",
    nivel: 5,
    titulo: "Acordes menores",
    icone: "🎶",
    descricao: "Dó, Ré e Mi menores.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE.filter((n) => ["Dó", "Ré", "Mi"].includes(n.nome)));
      const questao = gerarAcorde(root.nome, "menor");
      const nomes = ["Dó menor", "Ré menor", "Mi menor"];
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-6",
    modulo: "acordes",
    nivel: 6,
    titulo: "Acordes maiores com sétima",
    icone: "🎶",
    descricao: "Cmaj7, Dmaj7, Emaj7.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE.filter((n) => ["Dó", "Ré", "Mi"].includes(n.nome)));
      const questao = gerarAcorde(root.nome, "maior7");
      const nomes = ["Dó maior com sétima maior", "Ré maior com sétima maior", "Mi maior com sétima maior"];
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-7",
    modulo: "acordes",
    nivel: 7,
    titulo: "Acordes menores com sétima",
    icone: "🎶",
    descricao: "Cm7, Dm7, Em7.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE.filter((n) => ["Dó", "Ré", "Mi"].includes(n.nome)));
      const questao = gerarAcorde(root.nome, "menor7");
      const nomes = ["Dó menor com sétima menor", "Ré menor com sétima menor", "Mi menor com sétima menor"];
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-8",
    modulo: "acordes",
    nivel: 8,
    titulo: "Acordes cromáticos",
    icone: "🎶",
    descricao: "Fundamentais naturais e sustenidas.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const roots = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó#", "Ré#", "Fá#", "Sol#", "Lá#"];
      const root = sortear(FUNDO_ACORDE.filter((n) => roots.includes(n.nome)));
      const tipo = sortear(["maior", "menor", "maior7", "menor7"]);
      const questao = gerarAcorde(root.nome, tipo);
      const nomes = [
        "Dó maior", "Ré maior", "Mi maior", "Fá maior", "Sol maior", "Lá maior", "Si maior",
        "Dó menor", "Ré menor", "Mi menor", "Fá menor", "Sol menor", "Lá menor", "Si menor",
        "Dó maior com sétima maior", "Ré maior com sétima maior", "Mi maior com sétima maior",
        "Fá maior com sétima maior", "Sol maior com sétima maior", "Lá maior com sétima maior", "Si maior com sétima maior",
        "Dó menor com sétima menor", "Ré menor com sétima menor", "Mi menor com sétima menor",
        "Fá menor com sétima menor", "Sol menor com sétima menor", "Lá menor com sétima menor", "Si menor com sétima menor"
      ];
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-9",
    modulo: "acordes",
    nivel: 9,
    titulo: "Todos os acordes (6 alternativas)",
    icone: "🎶",
    descricao: "Acordes maiores em todas as notas com seis respostas.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE);
      const questao = gerarAcorde(root.nome, "maior");
      const nomes = embaralhar(FUNDO_ACORDE.map((n) => `${n.nome} maior`));
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes, 6),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "acordes-10",
    modulo: "acordes",
    nivel: 10,
    titulo: "Todos os acordes (12 alternativas)",
    icone: "🎶",
    descricao: "Acordes maiores em todas as notas com a lista completa.",
    instrucao: "Ouça o acorde e identifique a nota e a qualidade.",
    botaoTocar: "▶ Tocar acorde",
    gerarQuestao() {
      const root = sortear(FUNDO_ACORDE);
      const questao = gerarAcorde(root.nome, "maior");
      const nomes = FUNDO_ACORDE.map((n) => `${n.nome} maior`);
      return {
        midis: questao.midis,
        modo: "junto",
        correta: questao.correta,
        alternativas: montarAlternativas(questao.correta, nomes, 12),
        detalhe: questao.detalhe,
      };
    },
  },
  {
    id: "funcoes-harmonicas-1",
    modulo: "funcoes-harmonicas",
    nivel: 1,
    titulo: "Funções Harmônicas",
    icone: "🎼",
    descricao: "Escolha o tom e responda 15 questões do campo harmônico.",
    instrucao: "Ouça o acorde e escolha a nota, a cifra e o grau do campo harmônico.",
    botaoTocar: "▶ Tocar acorde",
    tonicaSelecionada: null,
    gerarQuestao(tonicaNome = this.tonicaSelecionada) {
      return gerarQuestaoCampoHarmonico(tonicaNome || "Dó");
    },
  },
];
