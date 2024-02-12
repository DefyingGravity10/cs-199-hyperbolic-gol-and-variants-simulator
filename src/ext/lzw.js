// Generated by CoffeeScript 2.7.0
(function () {
  // LZW-compress a string
  exports.lzw_encode = function (s) {
    var code, currChar, data, dict, i, out, phrase;
    if (s === "") {
      return "";
    }
    dict = {};
    data = s; //(s + "").split("")
    out = [];
    currChar = void 0;
    phrase = data[0];
    code = 256;
    i = 1;
    while (i < data.length) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        out.push(String.fromCharCode(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0)));
        dict[phrase + currChar] = code;
        code++;
        phrase = currChar;
      }
      i++;
    }
    out.push(String.fromCharCode(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0)));
    i = 0;
    return out.join("");
  };

  // Decompress an LZW-encoded string
  exports.lzw_decode = function (s) {
    var code, currChar, currCode, data, dict, i, oldPhrase, out, phrase;
    if (s === "") {
      return "";
    }
    dict = {};
    data = s; //(s + "").split("")
    currChar = data[0];
    oldPhrase = currChar;
    out = [currChar];
    code = 256;
    phrase = void 0;
    i = 1;
    while (i < data.length) {
      currCode = data[i].charCodeAt(0);
      if (currCode < 256) {
        phrase = data[i];
      } else {
        phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
      i++;
    }
    return out.join("");
  };
}).call(this);