const { EventEmitter } = require('events');
const { Box } = require('blessed');

const log = require('./utils/log')();

module.exports =
class Canvas extends EventEmitter {

  constructor({ session, height = 20, top = 0, left = 0, offset = 0, style }) {
    super();
    this.session = session;

    this.cords = {
      x: 0,
      y: 0
    };

    this.height = height;
    this.offset = offset + 1;
    this.isShow = false;

    this.canvas = new Box({
      parent: this.session.screen,
      height: height,
      width: '100%',
      top: top,
      left: left,
      content: '   covr',
      style: {
        bg: '#555',
        fg: '#00ff00'
      },
      border: {
        type: 'line'
      }
    });

    this.container = new Box({
      parent: this.canvas,
      top: 1,
      left: 0,
      height: this.canvas.height - 3,
      content: '',
      style: {
        bg: '#333'
      },
      padding: {
        left: 3,
        top: 1
      }
    });

  }

  setCursor(position) {
    this.log({ event: 'position', position, show: this.isShow });
    this.cords.y = position.y;
    if (this.cords.y > this.height + 1) {
      this.canvas.top = this.cords.y - (this.height + this.offset);
    } else {
      this.canvas.top = this.cords.y;
    }
  }

  show() {
    this.canvas.show();
    this.session.screen.render();
    this.isShow = true;
    this.emit('show');
  }

  hide() {
    this.canvas.hide();
    this.session.screen.render();
    this.isShow = false;
    this.emit('hide');
  }

  setContent(content) {
    this.container.content = content;
    this.session.screen.render();
  }

  // modify header
  setBuffer(buffer) {
    this.canvas.content = `   COVR. Buffer: ${buffer}`;
  }

  log(data) {
    log('Canvas', data);
  }
};
