const Session = require('./session');

const session = new Session({
  shell: 'bash',
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
