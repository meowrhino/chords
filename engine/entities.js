// entities.js — decodificación de entidades HTML, compartida por scrapers y conversor.
//
// Vive aparte porque hace falta en dos sitios y en distinto momento: al leer el
// HTML del scraper, y otra vez sobre el texto crudo ANTES de colocar acordes.
// Si se decodifica después, los acordes acaban clavados dentro de la entidad
// ("you&rsq[F#m]uo;re"), porque el transcriptor alineó su línea de acordes
// contra el texto ya renderizado: "&rsquo;" ocupa 1 columna, no 7.

const NAMED_ENTITIES = {
  quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>', amp: '&',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', sbquo: '‚', bdquo: '„',
  mdash: '—', ndash: '–', hellip: '…', bull: '•', middot: '·', deg: '°',
  laquo: '«', raquo: '»', iexcl: '¡', iquest: '¿', hearts: '♥',
  // latin-1: aparecen sin parar en letras en francés, español y portugués
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', yacute: 'ý',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  agrave: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù',
  Agrave: 'À', Egrave: 'È', Igrave: 'Ì', Ograve: 'Ò', Ugrave: 'Ù',
  acirc: 'â', ecirc: 'ê', icirc: 'î', ocirc: 'ô', ucirc: 'û',
  Acirc: 'Â', Ecirc: 'Ê', Icirc: 'Î', Ocirc: 'Ô', Ucirc: 'Û',
  auml: 'ä', euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü', yuml: 'ÿ',
  Auml: 'Ä', Euml: 'Ë', Iuml: 'Ï', Ouml: 'Ö', Uuml: 'Ü',
  atilde: 'ã', ntilde: 'ñ', otilde: 'õ',
  Atilde: 'Ã', Ntilde: 'Ñ', Otilde: 'Õ',
  ccedil: 'ç', Ccedil: 'Ç', oelig: 'œ', OElig: 'Œ', aelig: 'æ', AElig: 'Æ',
  aring: 'å', Aring: 'Å', oslash: 'ø', Oslash: 'Ø', szlig: 'ß',
};

// Una sola pasada a propósito: replace() no reescanea lo ya sustituido, así que
// "&amp;lt;" se queda en "&lt;" y no se decodifica dos veces hasta "<".
export function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => {
      const hit = NAMED_ENTITIES[name] ?? NAMED_ENTITIES[name.toLowerCase()];
      return hit ?? m;
    });
}

// Para el TEXTO de la canción, no para JSON ni atributos: UG guarda la letra
// doblemente escapada dentro de data-content, así que una pasada deja "&rsquo;"
// literal en la pantalla. Repetimos hasta que deje de cambiar (tope 3 para no
// convertir un "&amp;amp;" que el letrista quisiera de verdad en un bucle).
export function decodeEntitiesDeep(s) {
  let out = s;
  for (let i = 0; i < 3; i++) {
    const next = decodeEntities(out);
    if (next === out) break;
    out = next;
  }
  return out;
}
