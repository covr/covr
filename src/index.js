const Session = require('./session');

const isWin = /^win/.test(process.platform);

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
