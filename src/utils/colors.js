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

function colorString(color, bgColor, string) {


  if (!string) {
    [bgColor, string] = [string, bgColor];
  }

  color = convertToHex(color);
  if (bgColor) {
    bgColor = convertToHex(bgColor);
  }

  let colorFnName = 'ansi';

  if (supportsColor.has256) {
    colorFnName = 'ansi256';
  }

  if (supportsColor.has16m) {
    colorFnName = 'ansi16m';
  }

  const colorFn = style.color[colorFnName].hex;
  const colorBgFn = style.bgColor[colorFnName].hex;

  let result = `${colorFn(color)}${string}${style.color.close}`;

  if (bgColor) {
    result = `${colorBgFn(bgColor)}${result}${style.bgColor.close}`;
  }

  return result;
}

module.exports.convertToHex = convertToHex;
module.exports.colorString = colorString;
