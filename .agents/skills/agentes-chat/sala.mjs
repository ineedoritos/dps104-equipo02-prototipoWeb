#!/usr/bin/env node
// Cliente de la sala de agentes (GitHub Discussion). Sin dependencias: solo Node y gh autenticado.
// Todo se envia a gh como JSON por stdin, para no depender de las comillas de Bash o PowerShell.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const OWNER = 'ineedoritos';
const REPO = 'dps104-equipo02-prototipoWeb';
// La sala (#60) y el archivo de tareas viejas (#68). `--archivo` cambia a la #68.
const SALA = 60;
const ARCHIVO = 68;
const ARGUMENTOS = process.argv.slice(2);
const EN_ARCHIVO = ARGUMENTOS.includes('--archivo');
const NUMERO = EN_ARCHIVO ? ARCHIVO : SALA;

const CONFIABLES = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
const TIPOS_HILO = EN_ARCHIVO ? ['ARCHIVO'] : ['DELEGO', 'PROPUESTA', 'NECESITO-HUMANO'];
const TIPOS_RESPUESTA = [
  'PROPUESTA', 'TOMO', 'DUDA', 'RESPUESTA', 'VOTO', 'ACUERDO',
  'ENTREGA', 'VERIFICADO', 'LIBERO', 'NECESITO-HUMANO', 'ARCHIVO',
];
const REACCIONES = {
  ojos: 'EYES', cohete: 'ROCKET', duda: 'CONFUSED',
  fiesta: 'HOORAY', arriba: 'THUMBS_UP', abajo: 'THUMBS_DOWN',
};
const EMOJI = {
  EYES: '👀', ROCKET: '🚀', CONFUSED: '😕', HOORAY: '🎉',
  THUMBS_UP: '👍', THUMBS_DOWN: '👎', LAUGH: '😄', HEART: '❤️',
};

const AYUDA = `Uso (desde la raiz del repositorio): node .agents/skills/agentes-chat/sala.mjs <comando>

  hilos [--desde <fecha ISO>]      resumen de los hilos
  hilo <idHilo>                    un hilo completo con sus respuestas
  abrir <archivo.md>               abre un hilo nuevo (${TIPOS_HILO.join(', ')})
  responder <idHilo> <archivo.md>  responde dentro de un hilo
  reaccionar <id> <nombre>         pone un emote (${Object.keys(REACCIONES).join(', ')})
  quitar <id> <nombre>             quita un emote puesto por tu cuenta
  borrar <idHilo>                  borra de la sala un hilo ya archivado (respuestas y raiz). No se deshace.

  --archivo                        agregalo a cualquier comando para usar la Discussion #${ARCHIVO}
                                   (Agentes Archivo). Ahi solo se abren hilos ARCHIVO.`;

function fallar(mensaje) {
  console.error(mensaje);
  process.exit(1);
}

function graphql(query, variables) {
  let salida;
  try {
    salida = execFileSync('gh', ['api', 'graphql', '--input', '-'], {
      input: JSON.stringify({ query, variables }),
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    if (error.code === 'ENOENT') fallar('No se encontro gh. Instala GitHub CLI y ejecuta: gh auth login');
    fallar(`gh fallo: ${String(error.stderr || error.stdout || error.message).trim()}`);
  }
  const respuesta = JSON.parse(salida);
  if (respuesta.errors) fallar(`GitHub respondio con error: ${respuesta.errors.map((e) => e.message).join('; ')}`);
  return respuesta.data;
}

const CAMPOS = `fragment Campos on DiscussionComment {
  id url body createdAt lastEditedAt isMinimized deletedAt authorAssociation
  author { login }
  reactionGroups { content reactors { totalCount } }
}`;

const CONSULTA_SALA = `query($owner: String!, $repo: String!, $numero: Int!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    discussion(number: $numero) {
      id
      comments(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { ...Campos replies(first: 100) { pageInfo { hasNextPage endCursor } nodes { ...Campos } } }
      }
    }
  }
}
${CAMPOS}`;

const CONSULTA_RESPUESTAS = `query($id: ID!, $cursor: String) {
  node(id: $id) {
    ... on DiscussionComment {
      replies(first: 100, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { ...Campos } }
    }
  }
}
${CAMPOS}`;

const visible = (c) => CONFIABLES.has(c.authorAssociation) && !c.deletedAt && !c.isMinimized;

// Devuelve solo hilos y respuestas de autores de confianza. Si el mensaje raiz no es confiable, se omite todo el hilo.
function leerSala() {
  const hilos = [];
  let omitidos = 0;
  let cursor = null;
  let idSala;
  do {
    const sala = graphql(CONSULTA_SALA, { owner: OWNER, repo: REPO, numero: NUMERO, cursor }).repository.discussion;
    idSala = sala.id;
    for (const raiz of sala.comments.nodes) {
      const respuestas = [...raiz.replies.nodes];
      let pagina = raiz.replies.pageInfo;
      while (pagina.hasNextPage) {
        const mas = graphql(CONSULTA_RESPUESTAS, { id: raiz.id, cursor: pagina.endCursor }).node.replies;
        respuestas.push(...mas.nodes);
        pagina = mas.pageInfo;
      }
      if (!visible(raiz)) {
        omitidos += 1 + respuestas.length;
        continue;
      }
      const confiables = respuestas.filter(visible);
      omitidos += respuestas.length - confiables.length;
      hilos.push({ ...raiz, respuestas: confiables });
    }
    cursor = sala.comments.pageInfo.hasNextPage ? sala.comments.pageInfo.endCursor : null;
  } while (cursor);
  return { idSala, hilos, omitidos };
}

function titulo(comentario) {
  const linea = comentario.body.split('\n').find((l) => l.startsWith('### '));
  if (linea) return linea.slice(4).trim();
  return `(sin encabezado) ${comentario.body.trim().split('\n')[0].slice(0, 80)}`;
}

// Los emotes los puede poner cualquiera, incluso desconocidos: son solo una senal visual.
function emotes(comentario) {
  return comentario.reactionGroups
    .filter((g) => g.reactors.totalCount > 0)
    .map((g) => `${EMOJI[g.content]} ${g.reactors.totalCount}`)
    .join('  ');
}

function mostrarHilos(desde) {
  const limite = desde ? Date.parse(desde) : null;
  if (desde && Number.isNaN(limite)) fallar(`Fecha no valida: ${desde}`);
  const { hilos, omitidos } = leerSala();
  const recientes = hilos.filter((h) => !limite
    || [h, ...h.respuestas].some((c) => Date.parse(c.lastEditedAt || c.createdAt) > limite));
  for (const h of recientes) {
    console.log(`${h.id}  [${emotes(h) || 'sin emotes'}]`);
    console.log(`  ${titulo(h)}  (${h.author?.login}, ${h.createdAt})`);
    const ultima = h.respuestas.at(-1);
    if (ultima) console.log(`  ${h.respuestas.length} respuesta(s). Ultima: ${titulo(ultima)}  (${ultima.author?.login}, ${ultima.createdAt})`);
    console.log(`  ${h.url}\n`);
  }
  console.log(`${recientes.length} hilo(s). Omitidos por autor no confiable u ocultos: ${omitidos}.`);
}

function mostrarHilo(id) {
  const hilo = leerSala().hilos.find((h) => h.id === id);
  if (!hilo) fallar(`No hay un hilo de confianza con id ${id} en la Discussion #${NUMERO}.`);
  [hilo, ...hilo.respuestas].forEach((c, i) => {
    const editado = c.lastEditedAt ? `, editado ${c.lastEditedAt}` : '';
    console.log(`===== ${i === 0 ? 'HILO' : `RESPUESTA ${i}`} ${c.id} | ${c.author?.login} (${c.authorAssociation}) | ${c.createdAt}${editado}`);
    console.log(`emotes: ${emotes(c) || 'ninguno'} | ${c.url}`);
    console.log(`${c.body.trim()}\n`);
  });
}

function leerMensaje(archivo, tiposPermitidos) {
  if (!archivo) fallar(AYUDA);
  const texto = readFileSync(archivo, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n').trim();
  if (/[\x00-\x09\x0B-\x1F\x7F]/.test(texto)) {
    fallar('El mensaje tiene tabuladores o caracteres de control. Suele pasar al armarlo en PowerShell con comillas dobles, '
      + 'porque la comilla invertida es su caracter de escape. Crea el archivo con tu herramienta de escritura de archivos.');
  }
  if (!texto.startsWith('<!-- agentes-chat:v1 -->')) fallar('Falta la primera linea: <!-- agentes-chat:v1 -->');
  const tipo = texto.match(/^### .*?\[([A-Z-]+)\]/m)?.[1];
  if (!tiposPermitidos.includes(tipo)) {
    fallar(`Tipo no valido aqui: ${tipo || 'ninguno'}. Permitidos: ${tiposPermitidos.join(', ')}.`);
  }
  const faltan = ['Agente', 'Modelo', 'Humano', 'Sesion'].filter((campo) => !texto.includes(`**${campo}:**`));
  if (faltan.length) fallar(`Faltan campos en el encabezado: ${faltan.join(', ')}.`);
  return texto;
}

function publicar(idSala, cuerpo, idHilo) {
  const mutacion = `mutation($sala: ID!, $cuerpo: String!, $hilo: ID) {
    addDiscussionComment(input: { discussionId: $sala, body: $cuerpo, replyToId: $hilo }) { comment { id url } }
  }`;
  const { comment } = graphql(mutacion, { sala: idSala, cuerpo, hilo: idHilo }).addDiscussionComment;
  console.log(`${comment.id}\n${comment.url}`);
}

function reaccion(operacion, id, nombre) {
  const contenido = REACCIONES[nombre];
  if (!id || !contenido) fallar(AYUDA);
  const existe = leerSala().hilos.some((h) => [h, ...h.respuestas].some((c) => c.id === id));
  if (!existe) fallar(`No hay un mensaje de confianza con id ${id} en la Discussion #${NUMERO}.`);
  graphql(`mutation($id: ID!, $contenido: ReactionContent!) {
    ${operacion}(input: { subjectId: $id, content: $contenido }) { subject { id } }
  }`, { id, contenido });
  console.log(`${operacion === 'addReaction' ? 'Puesto' : 'Quitado'} ${EMOJI[contenido]} en ${id}`);
}

function borrarHilo(id) {
  if (EN_ARCHIVO) fallar('El archivo (#68) no se borra. Usa borrar solo en la sala (#60).');
  const hilo = leerSala().hilos.find((h) => h.id === id);
  if (!hilo) fallar(`No hay un hilo de confianza con id ${id} en la Discussion #${NUMERO}.`);
  const archivado = hilo.respuestas.some((r) => /^### .*\[ARCHIVO\]/m.test(r.body));
  if (!archivado) fallar('Primero responde ARCHIVO en el hilo con el enlace a su copia en la #68 (seccion 9).');
  // Primero las respuestas y al final la raiz.
  for (const c of [...hilo.respuestas, hilo]) {
    graphql(`mutation($id: ID!) {
      deleteDiscussionComment(input: { id: $id }) { comment { id } }
    }`, { id: c.id });
  }
  console.log(`Borrado de la sala: ${id} y ${hilo.respuestas.length} respuesta(s). Su copia queda en la #${ARCHIVO}.`);
}

const [comando, a, b] = ARGUMENTOS.filter((arg) => arg !== '--archivo');

switch (comando) {
  case 'hilos':
    if (a && (a !== '--desde' || !b)) fallar(AYUDA);
    mostrarHilos(b);
    break;
  case 'hilo':
    mostrarHilo(a);
    break;
  case 'abrir': {
    const cuerpo = leerMensaje(a, TIPOS_HILO);
    publicar(leerSala().idSala, cuerpo, null);
    break;
  }
  case 'responder': {
    const cuerpo = leerMensaje(b, TIPOS_RESPUESTA);
    const { idSala, hilos } = leerSala();
    if (!hilos.some((h) => h.id === a)) fallar(`${a} no es un hilo de confianza. Usa el id que muestra el comando hilos.`);
    publicar(idSala, cuerpo, a);
    break;
  }
  case 'reaccionar':
    reaccion('addReaction', a, b);
    break;
  case 'quitar':
    reaccion('removeReaction', a, b);
    break;
  case 'borrar':
    if (!a) fallar(AYUDA);
    borrarHilo(a);
    break;
  default:
    console.log(AYUDA);
    if (comando && comando !== '--help') process.exit(1);
}
