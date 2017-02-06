const { resolve } = require('path');
const fs = require('fs');

const defaultPath = resolve(process.cwd(), 'covr.log');
let stream;

module.exports = (logPath = defaultPath) => {

  if (!stream) {
    stream = fs.createWriteStream(logPath);
  }

  process.on('exit', (code) => {
    stream.write(`${new Date()}\nProcess: exit with ${code}\n`);
    stream.close();
  });

  return function(name, data) {

    if (!data) {
      [name, data] = [data, name];
    }

    let parsed = data;
    if (data instanceof Buffer) {
      parsed = data.toString();
    } else if (typeof data === 'object') {
      parsed = JSON.stringify(data);
    }

    const str = `${new Date()}\n${name ? name + ': ' : ''}${parsed}\n\n`;
    stream.write(str);
  }

};
