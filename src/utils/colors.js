const hexColorRegex = require('hex-color-regex');
const supportsColor = require('supports-color');
const toHex = require('colornames');
const style = require('ansi-styles');

function convertToHex(color) {
  const isHex = hexColorRegex().test(color);

  if (isHex) {
    return color;
  }

  color = toHex(color);

  if (!hexColorRegex().test(color)) {
    return toHex('white');
  }

  return color.toLowerCase();
}

function colorString(color, string) {
  color = convertToHex(color);

  let colorFnName = 'ansi';

  if (supportsColor.has256) {
    colorFnName = 'ansi256';
  }

  if (supportsColor.has16m) {
    colorFnName = 'ansi16m';
  }

  const colorFn = style.color[colorFnName].hex;

  return `${colorFn(color)}${string}${style.color.close}`;
}

module.exports.convertToHex = convertToHex;
module.exports.colorString = colorString;
