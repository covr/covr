const os = require('os');
const Session = require('./session');

const isWin = os.platform() === 'win32';

const session = new Session({
  shell: isWin ? 'cmd' : 'bash',
  shellArgs: [],
  cols: process.stdout.columns,
  rows: process.stdout.rows,
  env: process.env,
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  style: {
    offset: 1
  }
});
