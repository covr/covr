const { EventEmitter } = require('events');
const { basename } = require('path');
const { fork } = require('node-pty');
const { Screen, Program } = require('blessed');

const constants = require('./constants');
const Input = require('./input');
const Canvas = require('./canvas');
const log = require('./utils/log')();

module.exports =
class Session extends EventEmitter {

  constructor({
    shell,
    shellArgs,
    cols,
    rows,
    env,
    cwd,
    stdin,
    stdout,
    style = {}
  }) {
    super();

    this.stdin = stdin;
    this.stdout = stdout;
    this.shell = shell;
    this.initialCursorPosition = undefined;

    this.program = new Program({
      input: this.stdin,
      output: this.stdout
    });

    this.program.getCursor((err, data) => {
      if (err) return;
      this.initialCursorPosition = {
        x: data.x,
        y: data.y
      };
    });

    this.isPrimaryScreen = true;
    this.buf = '';

    this.stdin.setRawMode(true);
    this.screen = new Screen({
      program: this.program,
      smartCSR: true,
      fullUnicode: true,
      cursor: {
        artificial: false
      }
    });

    this.term = fork(shell, shellArgs, {
      cols,
      rows,
      env,
      cwd,
      stdio: []
    });

    this.canvas = new Canvas({
      session: this,
      offset: style.offset || 0,
      height: 15
    });

    this.input = new Input({});

    this.program = this.screen.program;
    this.program.disableMouse();
    this.program.showCursor();

    this.term.on('exit', code => {
      this.screen.destroy();
      if (typeof this.initialCursorPosition === 'object') {
        this.stdin.write(this.cursorTo(this.initialCursorPosition.x, this.initialCursorPosition.y));
      }
      process.exit(code);
    });

    this.screen.on('resize', () => {
      this.term.resize(this.screen.cols, this.screen.rows);
    });

    this.canvas.on('hide', this.rebuf.bind(this));

    this.input.on('change', buffer => {
      if (buffer.length === 0) {
        this.canvas.hide();
        return;
      }

      if (!this.canvas.isShow) {
        this.canvas.show();
      }

      this.canvas.setBuffer(buffer);
      this.canvas.setContent('should contains autocomplete items but...');
    });

    this.term.on('data', data => {
      if (this.isShell()) {
        this.deferredUpdateCursorPosition();
      }

      // rmcup handler
      // prevent rmcup
      if (constants.regexps.RMCUP.test(data)) {
        this.log('rmcup');
        this.isPrimaryScreen = true;
        this.rebuf();
        // sometimes cursor is dissapear
        this.program.showCursor();
        return;
      }

      // smcup handler
      if (constants.regexps.SMCUP.test(data)) {
        this.log('smcup');
        this.isPrimaryScreen = false;
      }

      if (this.isPrimaryScreen) {
        this.buf += data;
      }

      this.stdout.write(data);
    });

    this.stdin.on('data', data => {
      // hack. need to undertand why first check sometimes wrong
      if (this.isDSR(data) || this.isDSR(data.toString())) {
        return;
      }

      if (this.isShell()) {
        this.input.write(data);
        this.deferredUpdateCursorPosition();
      }

      this.term.write(data);
    });
  }

  isShell() {
    return this.shell && this.term && this.term.process === basename(this.shell);
  }

  isDSR(data) {
    return constants.regexps.DSR.test(data.toString());
  }

  normalizeData(data) {
    return data;
  }

  rebuf() {
    // strip bell
    this.buf = this.buf.replace(constants.regexps.BELL, '');

    this.program.clear();
    this.program._write(this.buf);
  }

  updateCursorPositon() {
    this.program.getCursor((err, position) => {
      if (err) return;

      this.emit('cursor', position.status);
      this.canvas.setCursor(position.status);
    });
  }

  deferredUpdateCursorPosition() {
    setTimeout(this.updateCursorPositon.bind(this), 50);
  }

  cursorTo(x, y) {
    return `\u001b[${y + 1};${x + 1}H`;
  }

  log(data) {
    log('Session', data);
  }
};
