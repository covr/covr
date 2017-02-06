const Session = require('./session');

const style = require('./default-style');

const session = new Session({
  shell: 'bash',
  shellArgs: [],
  cols: process.stdout.columns,
  rows: process.stdout.rows,
  env: process.env,
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  style
});
