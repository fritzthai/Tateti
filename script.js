// Estado de la partida. Cada jugador dispone de tres fichas.
const casillas = [...document.querySelectorAll('.casilla')];
const estado = document.querySelector('#estado');
const ayuda = document.querySelector('#ayuda');
const lineas = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
let tablero, turno, colocadas, seleccionada, terminada, ganadoras, repeticiones;

// Dos puntos son vecinos si comparten un lado (distancia de una casilla).
function sonVecinas(origen, destino) {
  const filas = Math.abs(Math.floor(origen / 3) - Math.floor(destino / 3));
  const columnas = Math.abs(origen % 3 - destino % 3);
  return filas + columnas === 1;
}

function actualizar() {
  casillas.forEach((casilla, i) => {
    casilla.textContent = tablero[i];
    casilla.disabled = terminada;
    casilla.classList.toggle('o', tablero[i] === 'O');
    casilla.classList.toggle('seleccionada', seleccionada === i);
    casilla.classList.toggle('destino', seleccionada !== null && !tablero[i] && sonVecinas(seleccionada, i));
    casilla.classList.toggle('ganadora', ganadoras.includes(i));
    casilla.setAttribute('aria-pressed', String(seleccionada === i));
    casilla.setAttribute('aria-label', `Fila ${Math.floor(i / 3) + 1}, columna ${i % 3 + 1}: ${tablero[i] || 'vacía'}`);
  });
  ['X', 'O'].forEach(jugador => {
    document.querySelector(`#fichas-${jugador}`).textContent = `${colocadas[jugador]} / 3 fichas`;
    document.querySelector(`#jugador-${jugador}`).classList.toggle('activo', !terminada && turno === jugador);
  });
  if (!terminada) estado.textContent = `Turno de ${turno} · ${colocadas.X + colocadas.O < 6 ? 'Colocar' : 'Mover'}`;
}

function finalizarJugada() {
  seleccionada = null;
  const linea = lineas.find(indices => indices.every(i => tablero[i] === turno));
  if (linea) {
    ganadoras = linea;
    terminada = true;
    estado.textContent = `¡Ganó ${turno}!`;
    ayuda.textContent = 'Tres en línea. Podés empezar una nueva partida.';
  } else {
    turno = turno === 'X' ? 'O' : 'X';
    ayuda.textContent = colocadas.X + colocadas.O < 6 ? 'Colocá una ficha en una casilla vacía.' : 'Seleccioná una ficha propia y movela a una casilla vecina vacía.';
    // La clave incluye el turno: la misma disposición con otro turno es otro estado.
    const clave = tablero.map(ficha => ficha || '-').join('') + turno;
    repeticiones.set(clave, (repeticiones.get(clave) || 0) + 1);
    if (repeticiones.get(clave) >= 3) {
      terminada = true;
      estado.textContent = 'Empate por repetición';
      ayuda.textContent = 'La misma posición y turno se repitieron tres veces.';
    }
  }
  actualizar();
}

function jugar(posicion) {
  if (terminada) return;
  if (colocadas.X + colocadas.O < 6) {
    if (tablero[posicion]) { ayuda.textContent = 'Esa casilla está ocupada. Elegí una vacía.'; return; }
    tablero[posicion] = turno;
    colocadas[turno]++;
    finalizarJugada();
    return;
  }
  if (tablero[posicion] === turno) {
    seleccionada = seleccionada === posicion ? null : posicion;
    ayuda.textContent = seleccionada === null ? 'Seleccioná una ficha propia.' : 'Elegí un destino vacío marcado con borde punteado.';
    actualizar();
    return;
  }
  if (seleccionada === null) { ayuda.textContent = 'Primero seleccioná una de tus fichas.'; return; }
  if (tablero[posicion] || !sonVecinas(seleccionada, posicion)) {
    ayuda.textContent = 'Movimiento inválido: elegí una casilla vecina vacía.';
    return;
  }
  tablero[seleccionada] = '';
  tablero[posicion] = turno;
  finalizarJugada();
}

function reiniciar() {
  tablero = Array(9).fill('');
  turno = 'X';
  colocadas = { X: 0, O: 0 };
  seleccionada = null;
  terminada = false;
  ganadoras = [];
  repeticiones = new Map();
  ayuda.textContent = 'Colocá una ficha en una casilla vacía.';
  actualizar();
}

casillas.forEach(casilla => casilla.addEventListener('click', () => jugar(Number(casilla.dataset.pos))));
document.querySelector('#reiniciar').addEventListener('click', reiniciar);
reiniciar();
