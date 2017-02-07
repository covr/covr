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

    const items = [
      { title: 'npm install', description: 'install npm dependencies' },
      { title: 'npm uninstall', description: 'remove npm dependencies' },
      { title: '3 title', description: '3 description' },
      { title: '4 title', description: '4 description' },
      { title: '5 title', description: '5 description' },
      { title: '6 title', description: '6 description' },
      { title: '7 title', description: '7 description' },
      { title: '8 title', description: '8 description' }
    ];

    this.itemHeight = 2;
    this.items = [];
    this.activeItem = -1;

    this.setItems(items);
  }

  up() {
    if (this.activeItem < 0) return;
    this.log('Active item:' + this.activeItem.toString());
    this.activeItem--;
    this.fillItems();
    this.scroll();
    this.session.screen.render();
  }

  down() {
    if (this.activeItem === this.items.length - 1) return;
    this.activeItem++;
    this.fillItems();
    this.scroll();
    this.session.screen.render();
  }

  setItems(items) {
    this.listItems = items;
    this.fillItems();
  }

  scroll() {
    const activeItem = (this.activeItem < 0) ? 0 : this.activeItem;
    let scrollTo = activeItem * this.itemHeight;
    if (scrollTo < 0 || scrollTo > ((this.listItems.length * this.itemHeight) - this.itemHeight)) return;
    if (scrollTo > this.list.height - this.itemHeight) {
      scrollTo += (this.itemHeight - 1);
    }
    this.list.scrollTo(scrollTo);
  }

  fillItems() {
    this.items.forEach(item => item.destroy);
    this.items = this.listItems.map((listItem, i) => {
      const title = `${ansyStyle.bold.open}${colorString(this.style.fg, listItem.title)}${ansyStyle.bold.close}`;
      const description = colorString(this.style.descriptionFg, listItem.description);
      let contentString = `  ${title}\n   ${description}`;

      if (i === this.activeItem) {
        contentString = contentString.split('\n').map(line => {

          return  `${ansyStyle.color.red.open}${colorString(this.style.activeItemLeftBorderColor, '│')}${ansyStyle.color.close}${line.substring(1)}`;
        }).join('\n');
        this.log(contentString);
      }

      const box = new Box({
        width: this.list.width - 1,
        height: this.itemHeight,
        top: i * this.itemHeight,
        content: contentString,
        style: {
          bg: (i === this.activeItem) ? this.style.activeItemBg : this.style.bg,
          fg: this.style.fg
        }
      });

      this.list.append(box);
      return box;
    });
  }

  isActive() {
    return this.activeItem > -1;
  }

  reset() {
    this.log('reset');
    this.activeItem = -1;
    this.fillItems();
    this.scroll();
    this.session.screen.render();
  }

  log(data) {
    log('List', data);
  }
};
