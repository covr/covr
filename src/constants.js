module.exports = {
  ansi: {
    LEFT: ['\x1b[D', '\x1bOD'],
    RIGHT: ['\x1b[C', '\x1bOC'],
    UP: ['\x1b[A', '\x1bOA'],
    DOWN: ['\x1b[B', '\x1bOB'],
    RETURN: '\r',
    BACKSPACE: ['\b', '\x7f', '\x1b\x7f', '\x1b\b'],
    END_OF_TEXT: '\x03',
    DSR: ['\x1b[6n', '\x1bO6n'],
    CTRL_C: ['\x03', '\u0003'],
    CLEAR: ['\u001b[H\u001b[2J', '\u001bOH\u001bO2J'],
    ESCAPE: ['\u001b']
  },
  regexps: {
    DSR: /[\u001b\u009b][[0-9]*;[0-9]*R/g,
    SMCUP: /\u001b\[\?1049h/g,
    RMCUP: /\u001b\[\?1049l/g,
    BELL: /\u0007/g
  }
};
