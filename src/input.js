const { EventEmitter } = require('events');
const anser = require('anser');

const constants = require('./constants');

module.exports =
class Input extends EventEmitter {

  constructor({ initialBuffer, initialPosition, /* stdin, stdout, */ log }) {
    super();

    this.buffer = initialBuffer || '';
    this.position = initialPosition || 0;
    // this.stdin = stdin || process.stdin;
    // this.stdout = stdout || process.stdout;
    this.log = log;

    this.track = true;
    this.historySteps = 0;
  }

  getBuffer() {
    return this.buffer;
  }

  getState() {
    return {
      buffer: this.buffer,
      position: this.position,
      tracking: this.track
    };
  }

  setBuffer(buffer = '') {
    this.buffer = buffer;
    this.emit('change', this.buffer);
    this.emit('state', this.getState());
    // this.log(this.getState());
  }

  setPosition(position = 0) {
    this.position = position;
    this.emit('position', this.position);
    this.emit('state', this.getState());
    // this.log(this.getState());
  }

  reset() {
    this.setBuffer();
    this.setPosition();
    this.enableTracking();
    this.historySteps = 0;
  }

  moveLeft() {
    if (this.position > 0) {
      this.setPosition(this.position - 1);
    }
  }

  moveRight() {
    if (this.position < this.buffer.length) {
      this.setPosition(this.position + 1);
    }
  }

  removeCharacter() {
    if (this.position === 0) return;
    const pos = (this.position > 0) ? this.position - 1 : 0;
    this.setBuffer([this.buffer.substr(0, pos), this.buffer.substr(pos + 1, this.buffer.length)].join(''));
    this.moveLeft();
  }

  insert(data) {
    data = anser.ansiToText(data);
    this.setBuffer([this.buffer.slice(0, this.position), data, this.buffer.slice(this.position)].join(''));
    const pos = this.position + data.length;
    this.setPosition(pos);
  }

  resolve(data) {
    if (this.isAnsi('RETURN', data) || this.isAnsi('CTRL_C', data)) {
      this.reset();
      return;
    }

    if (!this.isTracking()) return;

    if (this.isAnsi('UP', data)) {
      this.historySteps++;
      return;
    }

    if (this.isAnsi('DOWN', data)) {
      this.historySteps--;
      return;
    }

    if (this.historySteps > 0) {
      return;
    }

    if (this.isAnsi('LEFT', data)) {
      this.moveLeft();
      return;
    }

    if (this.isAnsi('RIGHT', data)) {
      this.moveRight();
      return;
    }

    if (this.isAnsi('BACKSPACE', data)) {
      this.removeCharacter();
      return;
    }

    this.insert(data);
  }

  write(data) {
    const stringified = data.toString('utf8');
    if (!this.shouldIngore(data)) {
      this.resolve(stringified);
    }
  }

  isTracking() {
    return this.track;
  }

  enableTracking() {
    this.track = true;
    this.emit('tracking', this.track);
    this.emit('state', this.getState());
  }

  disableTracking() {
    this.track = false;
    this.emit('tracking', this.track);
    this.emit('state', this.getState());
  }

  isAnsi(name, value) {
    const ansiConstant = constants.ansi[name];
    if (!ansiConstant) return false;

    if (Array.isArray(ansiConstant)) {
      return ansiConstant.includes(value);
    }

    return ansiConstant === value;
  }

  shouldIngore(data) {
    if (this.isAnsi('END_OF_TEXT', data)) return false;

    return false;
  }

};
