const { EventEmitter } = require('events');
const { Box } = require('blessed');
const ansyStyle = require('ansi-styles');

const { colorString } = require('./utils/colors');
const log = require('./utils/log')();

module.exports =
class CovrList extends EventEmitter {

  constructor({ canvas, session, style }) {
    super();

    this.canvas = canvas;
    this.session = session;
    this.style = style;

    this.list = new Box({
      parent: canvas,
      top: 1,
      left: 0,
      height: canvas.height - 1,
      width: '100%',
      // content: ,
      style: {
        bg: style.bg
      },
      padding: {
        left: 0,
        top: 0
      },
      scrollable: true,
      scrollbar: {
        style: {
          bg: style.scrollBg
        }
      }
    });

    const entries = [
      { title: 'npm plugin', type: 'header' },
      { title: 'npm install', description: 'install npm dependencies', type: 'item' },
      { title: 'npm uninstall', description: 'remove npm dependencies', type: 'item'  },
      { title: 'plugin name', type: 'header' },
      { title: '3 title', description: '3 description', type: 'item'  },
      { title: '4 title', description: '4 description', type: 'item'  },
      { title: '5 title', description: '5 description', type: 'item'  },
      { title: '6 title', description: '6 description', type: 'item'  },
      { title: '7 title', description: '7 description', type: 'item'  },
      { title: '8 title', description: '8 description', type: 'item'  }
    ];

    this.itemHeight = 2;
    this.headerHeight = 1;
    this.entries = [];
    this.activeItem = -1;
    this.itemsCount = 0;
    this.fullListeight = 0;

    this.setEntries(entries);
  }

  up() {
    if (this.activeItem < 0) return;
    this.log('Active item:' + this.activeItem.toString());
    this.activeItem--;
    this.renderEntries();
    this.scroll();
    this.session.screen.render();
  }

  down() {
    if (this.activeItem === this.itemsCount - 1) return;
    this.activeItem++;
    this.renderEntries();
    this.scroll();
    this.session.screen.render();
  }

  setEntries(entries) {
    this.listEntries = entries;
    this.renderEntries();
  }

  scroll() {
    const activeItem = (this.activeItem < 0) ? 0 : this.activeItem;
    /* let scrollTo = activeItem * this.itemHeight;
    if (scrollTo < 0 || scrollTo > ((this.listEntries.length * this.itemHeight) - this.itemHeight)) return;
    if (scrollTo > this.list.height - this.itemHeight) {
      scrollTo += (this.itemHeight - 1);
    }*/

    const scrollTo = this.calculateScrollPosition();
    this.log('Scroll to: ' + scrollTo.toString());
    if (scrollTo !== false) {
      this.list.scrollTo(scrollTo);
    }

  }

  calculateScrollPosition() {
    const activeItem = (this.activeItem < 0) ? 0 : this.activeItem;

    if (activeItem === 0) return 0;

    let entriesIterator = 0;
    let scrollPosition = 0;

    this.entries.every(entry => {

      if (entriesIterator === this.activeItem) {
        if (scrollPosition > this.list.height - entry.height) {
          scrollPosition += (entry.height - 1);
        }
        return false;
      }

      scrollPosition += entry.height;
      if (entry.entryType === 'item') {
        entriesIterator++;
      }

      return true;
    });

    if (scrollPosition < 0 || scrollPosition > this.fullListeight) return false;
    return scrollPosition;
  }

  renderEntries() {
    this.entries.forEach(entry => entry.destroy);

    let itemsIterator = 0;
    let currentTopPosition = 0;

    this.entries = this.listEntries.map((entry, i) => {

      const isItem = entry.type === 'item';

      let contentString = '';
      if (isItem) {
        contentString = this.getItemContent(entry, itemsIterator === this.activeItem);
      } else {
        contentString = ` ${entry.title}`;
      }

      let boxBg;
      if (isItem) {
        boxBg = (itemsIterator === this.activeItem) ? this.style.activeItemBg : this.style.bg;
      } else {
        boxBg = this.style.headerBg;
      }

      const box = new Box({
        width: this.list.width - 1,
        height: isItem ? this.itemHeight : this.headerHeight,
        top: currentTopPosition,
        content: contentString,
        style: {
          bg: boxBg,
          fg: isItem ? this.style.fg : this.style.headerFg
        }
      });
      box.entryType = entry.type;

      this.list.append(box);

      currentTopPosition += isItem ? this.itemHeight : this.headerHeight;
      if (isItem) {
        itemsIterator++;
      }
      return box;
    });

    this.itemsCount = itemsIterator;
    this.fullListeight = currentTopPosition;
  }

  getItemContent(entry, active) {
    const title = `${ansyStyle.bold.open}${colorString(this.style.fg, entry.title)}${ansyStyle.bold.close}`;
    const description = colorString(this.style.descriptionFg, entry.description);
    let contentString = `  ${title}\n   ${description}`;

    if (active) {
      // add left border if item is active
      contentString = contentString.split('\n').map(line => {
        return  `${ansyStyle.color.red.open}${colorString(this.style.activeItemLeftBorderColor, '│')}${ansyStyle.color.close}${line.substring(1)}`;
      }).join('\n');
    }

    return contentString;
  }

  isActivated() {
    return this.activeItem > -1;
  }

  reset() {
    this.log('reset');
    this.activeItem = -1;
    this.renderEntries();
    this.scroll();
    this.session.screen.render();
  }

  log(data) {
    log('List', data);
  }
};
