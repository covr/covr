const { resolve } = require('path');
const { spawn } = require('node-pty');
const blessed = require('blessed');

let buf = '';
let pos = {
  x: 0,
  y: 0
};

const screen = blessed.screen({
  smartCSR: true,
  log: resolve(process.cwd(), 'shelldon.log'),
  fullUnicode: true,
  dockBorders: true,
  ignoreDockContrast: true,
  cursor: {
    artificial: false
  }
});

screen.program.disableMouse();
screen.program.showCursor();

const box = blessed.box({
  width: '100%',
  height: 15,
  content: 'asdasdasdads',
  padding: {
    left: 1,
    right: 0,
    top: 0,
    bottom: 0
  },
  shrink: false,
  bottom: 2,
  left: 0,
  style: {
    fg: 'white',
    bg: '#75787f'
  },
  border: {
    type: 'line',
    fg: 'white',
    bg: '#75787f'
  },
  shadow: false,
  wrap: false
});

const append = () => {
  screen.append(box);
};

const redrawBox = () => {
  setTimeout(() => {
    box.destroy();
    screen.render();
    // box.show();
    append();
    screen.render();
  }, 10);
};

const isDSRRegex = /[\u001b\u009b][[0-9]*;[0-9]*R/g;

const stdin = screen.program.input;
const stdout = screen.program.output;

const term = spawn('bash', [], {
  cols: stdout.columns,
  rows: stdout.rows,
  env: process.env,
  cwd: process.cwd(),
  stdio: []
});

term.on('data', data => {
  buf += data;
  stdout.write(data);
});

stdin.on('data', data => {
  
  if (isDSRRegex.test(data.toString())) {
    return;
  }

  screen.program.getCursor((err, res) => {

    pos.x = res.x;
    pos.y = res.y;

    if (pos.y < 20) {
      box.top = pos.y;
    } else {
      box.top = pos.y - 17;
    }

    screen.log(JSON.stringify(pos));
  });

  term.write(data);
  redrawBox();
});

term.on('exit', (code) => {
  process.exit(code);
});

stdin.setRawMode(true);

const restoreBuffer = () => {
  if (term.process !== 'bash') return;
  setTimeout(() => {
    box.destroy();
    screen.render();
    screen.program.clear();

    // strip bell
    buf = buf.replace(/\u0007/g, '');
    screen.program._write(buf);

  }, 20);
};

screen.key('enter', () => {
  restoreBuffer();
});

screen.key('backspace', () => {
  screen.log('should redraw box');
  // redrawBox();
});
