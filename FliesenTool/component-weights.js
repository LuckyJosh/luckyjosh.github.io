


const sketch = (p5Inst) => {
  p5Inst.getDivomathConfig = function() { return DivomathConfig() }
  p5Inst.getDivomathPreviousSubmission = function() { return DivomathPreviousSubmission }

  //begin:globals 
  let DEVICETYPES = {
    PC: 1 << 0,
    TOUCHDEVICE: 1 << 1
  }

  let DEBUGCOUNT = 0;
  let deviceType;
  let globaltest;
  let debugbuffer;
  let MAXNUMCUBES;
  let CUBESIZE;
  let cubeStackBuffers, cubesCompact, cubesSplit;
  let cubeStackSplit;
  let cubeStackSplitTranslation;
  let cubeStackCompact;
  let cubeStackCompactTranslation;
  let cubeStackTranslation;
  let seesawboard;
  let seesawBoardCenter;

  const smallPivotShift = (buf) => buf.rF.P(-0.075, 1 - 0.99);
  let bgImgsBuffer;
  let seesawBoardBuffer;
  let seesawBoardBufferW;
  let seesawBoardTranslation;
  let sliderBuffer;
  let mouseBuffer;
  let seesawPivotFrontBuffer;
  let seesawPivotBackBuffer;
  let seesawPivotBufferW;
  let seesawPivotBuffersOffset;
  let blockDrawerBuffers;
  let blockDrawerCompact;
  let blockDrawerSplit;
  let allowedBlocksBySide = {
    "compact": ["I", "X", "C", "M"],
    "split": ["I", "X", "C", "M"]
  }
  let drawBlocksInDrawer = {
    "compact": true,
    "split": true
  };
  let TC2S;
  let TC2C;
  let TC2SB;
  let TC2SPB;
  let TC2SPF;
  let TsB2sPF;
  let TsB2sPB;
  let TSB2S;
  let TSB2C;
  //end:globals
  // let mylog = (...args) => { console.log("###JL###:", ...args) };
  let mylog = (...args) => { };
  mylog("begin Instance");
  let p5 = require("p5");
  let initialData = p5Inst.getDivomathConfig();
  let initialConfig = {};
  if (initialData.configuration) {
    for (var [k, v] of Object.entries(initialData.configuration)) {
      initialConfig[k] = v;
    }
  }
  console.log("InitialConfig:", initialConfig, "Config:", initialData.configuration);
  let lastState = initialData.divomathVarState;
  let lastSubmission = p5Inst.getDivomathPreviousSubmission();

  let defaultAppState = {
    "USELOCALSTORAGE": true,
    "LOCKSEESAW": false,
    "CENTERSCALE100TICKSCOMPACT": true,
    "CENTERSCALELABELSSPLIT": true,
    "CENTERSCALELABELSCOMPACT": true,
    "EDGEWIDTH1000CUBEKG": 4,
    "EDGEWIDTH1000CUBEG": 4,
    "DISPLAYSPLITSCALE": true,
    "DISPLAYCOMPACTSCALE": true,
    "COMPACTSCALEMODEFIXED": false,
    "COMPACTSCALEMODEINTEGER": true,
    "DRAGGINGBLOCK.splitI": false,
    "DRAGGINGBLOCK.splitX": false,
    "DRAGGINGBLOCK.splitC": false,
    "DRAGGINGBLOCK.splitM": false,
    "DRAGGINGBLOCK.compactI": false,
    "DRAGGINGBLOCK.compactX": false,
    "DRAGGINGBLOCK.compactC": false,
    "DRAGGINGBLOCK.compactM": false,
    "DRAGGINGBLOCK.destack": false,
    "BLOCKDRAWERS.SPLITISOPEN": false,
    "BLOCKDRAWERS.COMPACTISOPEN": false,
    "NUMCUBES.COMPACT": 0,
    "NUMCUBES.SPLIT": 0
  };

  let AppState = defaultAppState;
  let isResumed = [...Object.keys(lastState)].toString() == [...Object.keys(defaultAppState)].toString();
  p5Inst.print("keys:", [...Object.keys(lastState)], [...Object.keys(defaultAppState)])
  if (isResumed) {

    p5Inst.print("lastState:", lastState);
    let lastAppState = fixAppState(lastState, true);
    p5Inst.print("lastAppState:", lastAppState);
    AppState = lastAppState;
    // if (isNaN(AppState["NUMCUBES.COMPACT"])) {
    //   AppState["NUMCUBES.COMPACT"] = 0;
    // }
    // if (isNaN(AppState["NUMCUBES.SPLIT"])) {
    //   AppState["NUMCUBES.SPLIT"] = 0;
    // }
    // fix the shift to avoid having a Zero 
  }


  p5Inst.print(`The app was resumed: ${isResumed}`)
  p5Inst.print("AppState:", AppState);

  // from gobal to instace mode
  let sin = Math.sin;
  let cos = Math.cos;
  let tan = Math.tan;
  let abs = Math.abs;
  let ceil = Math.ceil;
  let floor = Math.floor;
  let pow = Math.pow;
  let max = Math.max;
  let min = Math.min;

  // Plugins 
  //begin: LZString {{{
  // Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
  // This work is free. You can redistribute it and/or modify it
  // under the terms of the WTFPL, Version 2
  // For more information see LICENSE.txt or http://www.wtfpl.net/
  //
  // For more information, the home page:
  // http://pieroxy.net/blog/pages/lz-string/testing.html
  //
  // LZ-based compression algorithm, version 1.4.4
  var LZString = (function() {

    // private property
    var f = String.fromCharCode;
    var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
    var baseReverseDic = {};

    function getBaseValue(alphabet, character) {
      if (!baseReverseDic[alphabet]) {
        baseReverseDic[alphabet] = {};
        for (var i = 0; i < alphabet.length; i++) {
          baseReverseDic[alphabet][alphabet.charAt(i)] = i;
        }
      }
      return baseReverseDic[alphabet][character];
    }

    var LZString = {
      compressToBase64: function(input) {
        if (input == null) return "";
        var res = LZString._compress(input, 6, function(a) { return keyStrBase64.charAt(a); });
        switch (res.length % 4) { // To produce valid Base64
          default: // When could this happen ?
          case 0: return res;
          case 1: return res + "===";
          case 2: return res + "==";
          case 3: return res + "=";
        }
      },

      decompressFromBase64: function(input) {
        if (input == null) return "";
        if (input == "") return null;
        return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
      },

      compressToUTF16: function(input) {
        if (input == null) return "";
        return LZString._compress(input, 15, function(a) { return f(a + 32); }) + " ";
      },

      decompressFromUTF16: function(compressed) {
        if (compressed == null) return "";
        if (compressed == "") return null;
        return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
      },

      //compress into uint8array (UCS-2 big endian format)
      compressToUint8Array: function(uncompressed) {
        var compressed = LZString.compress(uncompressed);
        var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

        for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
          var current_value = compressed.charCodeAt(i);
          buf[i * 2] = current_value >>> 8;
          buf[i * 2 + 1] = current_value % 256;
        }
        return buf;
      },

      //decompress from uint8array (UCS-2 big endian format)
      decompressFromUint8Array: function(compressed) {
        if (compressed === null || compressed === undefined) {
          return LZString.decompress(compressed);
        } else {
          var buf = new Array(compressed.length / 2); // 2 bytes per character
          for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
            buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
          }

          var result = [];
          buf.forEach(function(c) {
            result.push(f(c));
          });
          return LZString.decompress(result.join(''));

        }

      },


      //compress into a string that is already URI encoded
      compressToEncodedURIComponent: function(input) {
        if (input == null) return "";
        return LZString._compress(input, 6, function(a) { return keyStrUriSafe.charAt(a); });
      },

      //decompress from an output of compressToEncodedURIComponent
      decompressFromEncodedURIComponent: function(input) {
        if (input == null) return "";
        if (input == "") return null;
        input = input.replace(/ /g, "+");
        return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
      },

      compress: function(uncompressed) {
        return LZString._compress(uncompressed, 16, function(a) { return f(a); });
      },
      _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
        if (uncompressed == null) return "";
        var i, value,
          context_dictionary = {},
          context_dictionaryToCreate = {},
          context_c = "",
          context_wc = "",
          context_w = "",
          context_enlargeIn = 2, // Compensate for the first entry which should not count
          context_dictSize = 3,
          context_numBits = 2,
          context_data = [],
          context_data_val = 0,
          context_data_position = 0,
          ii;

        for (ii = 0; ii < uncompressed.length; ii += 1) {
          context_c = uncompressed.charAt(ii);
          if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
            context_dictionary[context_c] = context_dictSize++;
            context_dictionaryToCreate[context_c] = true;
          }

          context_wc = context_w + context_c;
          if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
            context_w = context_wc;
          } else {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
              if (context_w.charCodeAt(0) < 256) {
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = (context_data_val << 1);
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 8; i++) {
                  context_data_val = (context_data_val << 1) | (value & 1);
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              } else {
                value = 1;
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = (context_data_val << 1) | value;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = 0;
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 16; i++) {
                  context_data_val = (context_data_val << 1) | (value & 1);
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              delete context_dictionaryToCreate[context_w];
            } else {
              value = context_dictionary[context_w];
              for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }


            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
            // Add wc to the dictionary.
            context_dictionary[context_wc] = context_dictSize++;
            context_w = String(context_c);
          }
        }

        // Output the code for w.
        if (context_w !== "") {
          if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
            if (context_w.charCodeAt(0) < 256) {
              for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1);
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
              }
              value = context_w.charCodeAt(0);
              for (i = 0; i < 8; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            } else {
              value = 1;
              for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1) | value;
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = 0;
              }
              value = context_w.charCodeAt(0);
              for (i = 0; i < 16; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
            delete context_dictionaryToCreate[context_w];
          } else {
            value = context_dictionary[context_w];
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }


          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
        }

        // Mark the end of the stream
        value = 2;
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }

        // Flush the last char
        while (true) {
          context_data_val = (context_data_val << 1);
          if (context_data_position == bitsPerChar - 1) {
            context_data.push(getCharFromInt(context_data_val));
            break;
          }
          else context_data_position++;
        }
        return context_data.join('');
      },

      decompress: function(compressed) {
        if (compressed == null) return "";
        if (compressed == "") return null;
        return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
      },

      _decompress: function(length, resetValue, getNextValue) {
        var dictionary = [],
          next,
          enlargeIn = 4,
          dictSize = 4,
          numBits = 3,
          entry = "",
          result = [],
          i,
          w,
          bits, resb, maxpower, power,
          c,
          data = { val: getNextValue(0), position: resetValue, index: 1 };

        for (i = 0; i < 3; i += 1) {
          dictionary[i] = i;
        }

        bits = 0;
        maxpower = Math.pow(2, 2);
        power = 1;
        while (power != maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }

        switch (next = bits) {
          case 0:
            bits = 0;
            maxpower = Math.pow(2, 8);
            power = 1;
            while (power != maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }
            c = f(bits);
            break;
          case 1:
            bits = 0;
            maxpower = Math.pow(2, 16);
            power = 1;
            while (power != maxpower) {
              resb = data.val & data.position;
              data.position >>= 1;
              if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }
            c = f(bits);
            break;
          case 2:
            return "";
        }
        dictionary[3] = c;
        w = c;
        result.push(c);
        while (true) {
          if (data.index > length) {
            return "";
          }

          bits = 0;
          maxpower = Math.pow(2, numBits);
          power = 1;
          while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }

          switch (c = bits) {
            case 0:
              bits = 0;
              maxpower = Math.pow(2, 8);
              power = 1;
              while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }

              dictionary[dictSize++] = f(bits);
              c = dictSize - 1;
              enlargeIn--;
              break;
            case 1:
              bits = 0;
              maxpower = Math.pow(2, 16);
              power = 1;
              while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                  data.position = resetValue;
                  data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              dictionary[dictSize++] = f(bits);
              c = dictSize - 1;
              enlargeIn--;
              break;
            case 2:
              return result.join('');
          }

          if (enlargeIn == 0) {
            enlargeIn = Math.pow(2, numBits);
            numBits++;
          }

          if (dictionary[c]) {
            entry = dictionary[c];
          } else {
            if (c === dictSize) {
              entry = w + w.charAt(0);
            } else {
              return null;
            }
          }
          result.push(entry);

          // Add w+entry[0] to the dictionary.
          dictionary[dictSize++] = w + entry.charAt(0);
          enlargeIn--;

          w = entry;

          if (enlargeIn == 0) {
            enlargeIn = Math.pow(2, numBits);
            numBits++;
          }

        }
      }
    };
    return LZString;
  })();

  if (typeof define === 'function' && define.amd) {
    define(function() { return LZString; });
  } else if (typeof module !== 'undefined' && module != null) {
    module.exports = LZString
  } else if (typeof angular !== 'undefined' && angular != null) {
    angular.module('LZString', [])
      .factory('LZString', function() {
        return LZString;
      });
  }

  //end: LZString }}}


  //begin: collide2D {{{

  console.log("### p5.collide v0.7.3 ###")

  p5.prototype._collideDebug = false;

  p5.prototype.collideDebug = function(debugMode) {
    _collideDebug = debugMode;
  }

  /*~++~+~+~++~+~++~++~+~+~ 2D ~+~+~++~+~++~+~+~+~+~+~+~+~+~+~+*/

  p5.prototype.collideRectRect = function(x, y, w, h, x2, y2, w2, h2) {
    //2d
    //add in a thing to detect rectMode p5Inst.CENTER
    if (x + w >= x2 &&    // r1 right edge past r2 left
      x <= x2 + w2 &&    // r1 left edge past r2 right
      y + h >= y2 &&    // r1 top edge past r2 bottom
      y <= y2 + h2) {    // r1 bottom edge past r2 top
      return true;
    }
    return false;
  };

  // p5.vector version of collideRectRect
  p5.prototype.collideRectRectVector = function(p1, sz, p2, sz2) {
    return p5.prototype.collideRectRect(p1.x, p1.y, sz.x, sz.y, p2.x, p2.y, sz2.x, sz2.y)
  }


  p5.prototype.collideRectCircle = function(rx, ry, rw, rh, cx, cy, diameter) {
    //2d
    // temporary variables to set edges for testing
    var testX = cx;
    var testY = cy;

    // which edge is closest?
    if (cx < rx) {
      testX = rx       // left edge
    } else if (cx > rx + rw) { testX = rx + rw }   // right edge

    if (cy < ry) {
      testY = ry       // top edge
    } else if (cy > ry + rh) { testY = ry + rh }   // bottom edge

    // // get distance from closest edges
    var distance = this.dist(cx, cy, testX, testY)

    // if the distance is less than the radius, collision!
    if (distance <= diameter / 2) {
      return true;
    }
    return false;
  };

  // p5.vector version of collideRectCircle
  p5.prototype.collideRectCircleVector = function(r, sz, c, diameter) {
    return p5.prototype.collideRectCircle(r.x, r.y, sz.x, sz.y, c.x, c.y, diameter)
  }

  p5.prototype.collideCircleCircle = function(x, y, d, x2, y2, d2) {
    //2d
    if (this.dist(x, y, x2, y2) <= (d / 2) + (d2 / 2)) {
      return true;
    }
    return false;
  };


  // p5.vector version of collideCircleCircle
  p5.prototype.collideCircleCircleVector = function(p1, d, p2, d2) {
    return p5.prototype.collideCircleCircle(p1.x, p1.y, d, p2.x, p2.y, d2)
  }


  p5.prototype.collidePointCircle = function(x, y, cx, cy, d) {
    //2d
    if (this.dist(x, y, cx, cy) <= d / 2) {
      return true;
    }
    return false;
  };

  // p5.vector version of collidePointCircle
  p5.prototype.collidePointCircleVector = function(p, c, d) {
    return p5.prototype.collidePointCircle(p.x, p.y, c.x, c.y, d)
  }

  p5.prototype.collidePointEllipse = function(x, y, cx, cy, dx, dy) {
    //2d
    var rx = dx / 2, ry = dy / 2;
    // Discarding the points outside the bounding box
    if (x > cx + rx || x < cx - rx || y > cy + ry || y < cy - ry) {
      return false;
    }
    // Compare the point to its equivalent on the ellipse
    var xx = x - cx, yy = y - cy;
    var eyy = ry * this.sqrt(this.abs(rx * rx - xx * xx)) / rx;
    return yy <= eyy && yy >= -eyy;
  };

  // p5.vector version of collidePointEllipse
  p5.prototype.collidePointEllipseVector = function(p, c, d) {
    return p5.prototype.collidePointEllipse(p.x, p.y, c.x, c.y, d.x, d.y);
  }

  p5.prototype.collidePointRect = function(pointX, pointY, x, y, xW, yW) {
    //2d
    if (pointX >= x &&         // right of the left edge AND
      pointX <= x + xW &&    // left of the right edge AND
      pointY >= y &&         // below the top AND
      pointY <= y + yW) {    // above the bottom
      return true;
    }
    return false;
  };

  // p5.vector version of collidePointRect
  p5.prototype.collidePointRectVector = function(point, p1, sz) {
    return p5.prototype.collidePointRect(point.x, point.y, p1.x, p1.y, sz.x, sz.y);
  }

  p5.prototype.collidePointLine = function(px, py, x1, y1, x2, y2, buffer) {
    // get distance from the point to the two ends of the line
    var d1 = this.dist(px, py, x1, y1);
    var d2 = this.dist(px, py, x2, y2);

    // get the length of the line
    var lineLen = this.dist(x1, y1, x2, y2);

    // since floats are so minutely accurate, add a little buffer zone that will give collision
    if (buffer === undefined) { buffer = 0.1; }   // higher # = less accurate

    // if the two distances are equal to the line's length, the point is on the line!
    // note we use the buffer here to give a range, rather than one #
    if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
      return true;
    }
    return false;
  }

  // p5.vector version of collidePointLine
  p5.prototype.collidePointLineVector = function(point, p1, p2, buffer) {
    return p5.prototype.collidePointLine(point.x, point.y, p1.x, p1.y, p2.x, p2.y, buffer);
  }

  p5.prototype.collideLineCircle = function(x1, y1, x2, y2, cx, cy, diameter) {
    // is either end INSIDE the circle?
    // if so, return true immediately
    var inside1 = this.collidePointCircle(x1, y1, cx, cy, diameter);
    var inside2 = this.collidePointCircle(x2, y2, cx, cy, diameter);
    if (inside1 || inside2) return true;

    // get length of the line
    var distX = x1 - x2;
    var distY = y1 - y2;
    var len = this.sqrt((distX * distX) + (distY * distY));

    // get dot product of the line and circle
    var dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / this.pow(len, 2);

    // find the closest point on the line
    var closestX = x1 + (dot * (x2 - x1));
    var closestY = y1 + (dot * (y2 - y1));

    // is this point actually on the line segment?
    // if so keep going, but if not, return false
    var onSegment = this.collidePointLine(closestX, closestY, x1, y1, x2, y2);
    if (!onSegment) return false;

    // draw a debug circle at the closest point on the line
    if (this._collideDebug) {
      this.ellipse(closestX, closestY, 10, 10);
    }

    // get distance to closest point
    distX = closestX - cx;
    distY = closestY - cy;
    var distance = this.sqrt((distX * distX) + (distY * distY));

    if (distance <= diameter / 2) {
      return true;
    }
    return false;
  }

  // p5.vector version of collideLineCircle
  p5.prototype.collideLineCircleVector = function(p1, p2, c, diameter) {
    return p5.prototype.collideLineCircle(p1.x, p1.y, p2.x, p2.y, c.x, c.y, diameter);
  }
  p5.prototype.collideLineLine = function(x1, y1, x2, y2, x3, y3, x4, y4, calcIntersection) {

    var intersection;

    // calculate the distance to intersection point
    var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {

      if (this._collideDebug || calcIntersection) {
        // calc the point where the lines meet
        var intersectionX = x1 + (uA * (x2 - x1));
        var intersectionY = y1 + (uA * (y2 - y1));
      }

      if (this._collideDebug) {
        this.ellipse(intersectionX, intersectionY, 10, 10);
      }

      if (calcIntersection) {
        intersection = {
          "x": intersectionX,
          "y": intersectionY
        }
        return intersection;
      } else {
        return true;
      }
    }
    if (calcIntersection) {
      intersection = {
        "x": false,
        "y": false
      }
      return intersection;
    }
    return false;
  }


  // p5.vector version of collideLineLine
  p5.prototype.collideLineLineVector = function(p1, p2, p3, p4, calcIntersection) {
    return p5.prototype.collideLineLine(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, calcIntersection);
  }

  p5.prototype.collideLineRect = function(x1, y1, x2, y2, rx, ry, rw, rh, calcIntersection) {

    // check if the line has hit any of the rectangle's sides. uses the collideLineLine function above
    var left, right, top, bottom, intersection;

    if (calcIntersection) {
      left = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh, true);
      right = this.collideLineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh, true);
      top = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry, true);
      bottom = this.collideLineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh, true);
      intersection = {
        "left": left,
        "right": right,
        "top": top,
        "bottom": bottom
      }
    } else {
      //return booleans
      left = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
      right = this.collideLineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
      top = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
      bottom = this.collideLineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
    }

    // if ANY of the above are true, the line has hit the rectangle
    if (left || right || top || bottom) {
      if (calcIntersection) {
        return intersection;
      }
      return true;
    }
    return false;
  }

  // p5.vector version of collideLineRect
  p5.prototype.collideLineRectVector = function(p1, p2, r, rsz, calcIntersection) {
    return p5.prototype.collideLineRect(p1.x, p1.y, p2.x, p2.y, r.x, r.y, rsz.x, rsz.y, calcIntersection);
  }

  p5.prototype.collidePointPoly = function(px, py, vertices) {
    var collision = false;

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"

      // compare position, flip 'collision' variable back and forth
      if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
        (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
        collision = !collision;
      }
    }
    return collision;
  }

  // p5.vector version of collidePointPoly
  p5.prototype.collidePointPolyVector = function(p1, vertices) {
    return p5.prototype.collidePointPoly(p1.x, p1.y, vertices);
  }

  // POLYGON/CIRCLE
  p5.prototype.collideCirclePoly = function(cx, cy, diameter, vertices, interior) {

    if (interior === undefined) {
      interior = false;
    }

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"

      // check for collision between the circle and a line formed between the two vertices
      var collision = this.collideLineCircle(vc.x, vc.y, vn.x, vn.y, cx, cy, diameter);
      if (collision) return true;
    }

    // test if the center of the circle is inside the polygon
    if (interior === true) {
      var centerInside = this.collidePointPoly(cx, cy, vertices);
      if (centerInside) return true;
    }

    // otherwise, after all that, return false
    return false;
  }

  // p5.vector version of collideCirclePoly
  p5.prototype.collideCirclePolyVector = function(c, diameter, vertices, interior) {
    return p5.prototype.collideCirclePoly(c.x, c.y, diameter, vertices, interior);
  }

  p5.prototype.collideRectPoly = function(rx, ry, rw, rh, vertices, interior) {
    if (interior == undefined) {
      interior = false;
    }

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"

      // check against all four sides of the rectangle
      var collision = this.collideLineRect(vc.x, vc.y, vn.x, vn.y, rx, ry, rw, rh);
      if (collision) return true;

      // optional: test if the rectangle is INSIDE the polygon note that this iterates all sides of the polygon again, so only use this if you need to
      if (interior === true) {
        var inside = this.collidePointPoly(rx, ry, vertices);
        if (inside) return true;
      }
    }

    return false;
  }

  // p5.vector version of collideRectPoly
  p5.prototype.collideRectPolyVector = function(r, rsz, vertices, interior) {
    return p5.prototype.collideRectPoly(r.x, r.y, rsz.x, rsz.y, vertices, interior);
  }

  p5.prototype.collideLinePoly = function(x1, y1, x2, y2, vertices) {

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position extract X/Y coordinates from each
      var x3 = vertices[current].x;
      var y3 = vertices[current].y;
      var x4 = vertices[next].x;
      var y4 = vertices[next].y;

      // do a Line/Line comparison if true, return 'true' immediately and stop testing (faster)
      var hit = this.collideLineLine(x1, y1, x2, y2, x3, y3, x4, y4);
      if (hit) {
        return true;
      }
    }
    // never got a hit
    return false;
  }


  // p5.vector version of collideLinePoly
  p5.prototype.collideLinePolyVector = function(p1, p2, vertice) {
    return p5.prototype.collideLinePoly(p1.x, p1.y, p2.x, p2.y, vertice);
  }

  p5.prototype.collidePolyPoly = function(p1, p2, interior) {
    if (interior === undefined) {
      interior = false;
    }

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < p1.length; current++) {

      // get next vertex in list, if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === p1.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = p1[current];    // c for "current"
      var vn = p1[next];       // n for "next"

      //use these two points (a line) to compare to the other polygon's vertices using polyLine()
      var collision = this.collideLinePoly(vc.x, vc.y, vn.x, vn.y, p2);
      if (collision) return true;

      //check if the either polygon is INSIDE the other
      if (interior === true) {
        collision = this.collidePointPoly(p2[0].x, p2[0].y, p1);
        if (collision) return true;
        collision = this.collidePointPoly(p1[0].x, p1[0].y, p2);
        if (collision) return true;
      }
    }

    return false;
  }

  p5.prototype.collidePolyPolyVector = function(p1, p2, interior) {
    return p5.prototype.collidePolyPoly(p1, p2, interior);
  }

  p5.prototype.collidePointTriangle = function(px, py, x1, y1, x2, y2, x3, y3) {

    // get the area of the triangle
    var areaOrig = this.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));

    // get the area of 3 triangles made between the point and the corners of the triangle
    var area1 = this.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
    var area2 = this.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
    var area3 = this.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));

    // if the sum of the three areas equals the original, we're inside the triangle!
    if (area1 + area2 + area3 === areaOrig) {
      return true;
    }
    return false;
  }

  // p5.vector version of collidePointTriangle
  p5.prototype.collidePointTriangleVector = function(p, p1, p2, p3) {
    return p5.prototype.collidePointTriangle(p.x, p.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  }

  p5.prototype.collidePointPoint = function(x, y, x2, y2, buffer) {
    if (buffer === undefined) {
      buffer = 0;
    }

    if (this.dist(x, y, x2, y2) <= buffer) {
      return true;
    }

    return false;
  };

  // p5.vector version of collidePointPoint
  p5.prototype.collidePointPointVector = function(p1, p2, buffer) {
    return p5.prototype.collidePointPoint(p1.x, p1.y, p2.x, p2.y, buffer);
  }

  p5.prototype.collidePointArc = function(px, py, ax, ay, arcRadius, arcHeading, arcAngle, buffer) {

    if (buffer === undefined) {
      buffer = 0;
    }
    // point
    var point = this.createVector(px, py);
    // arc center point
    var arcPos = this.createVector(ax, ay);
    // arc radius vector
    var radius = this.createVector(arcRadius, 0).rotate(arcHeading);

    var pointToArc = point.copy().sub(arcPos);

    if (point.dist(arcPos) <= (arcRadius + buffer)) {
      var dot = radius.dot(pointToArc);
      var angle = radius.angleBetween(pointToArc);
      if (dot > 0 && angle <= arcAngle / 2 && angle >= -arcAngle / 2) {
        return true;
      }
    }
    return false;
  }

  // p5.vector version of collidePointArc
  p5.prototype.collidePointArcVector = function(p1, a, arcRadius, arcHeading, arcAngle, buffer) {
    return p5.prototype.collidePointArc(p1.x, p1.y, a.x, a.y, arcRadius, arcHeading, arcAngle, buffer);
  }

  //end: collide2D }}}


  //begin: screen-position {{{
  // Acknowledgement to Thibault Coppex (@tcoppex) for the 3d-modelview-projection-math.
  // Had to adjust it a bit maybe because p5js changed the way webgl is handled since 2016.

  // See: https://editor.p5js.org/bohnacker/sketches/nUk3bVW7b on how to use it


  function addScreenPositionFunction(p5Instance) {
    let p = p5Instance || this;

    // find out which context we're in (2D or WEBGL)
    const R_2D = 0;
    const R_WEBGL = 1;
    let context = getObjectName(p._renderer.drawingContext).search("2D") >= 0 ? R_2D : R_WEBGL;

    // the stack to keep track of matrices when using push and pop
    if (context == R_2D) {
      p._renderer.matrixStack = [new p5.Matrix()];
    }

    // replace all necessary functions to keep track of transformations

    if (p.draw instanceof Function) {
      let drawNative = p.draw;
      p.draw = function(...args) {
        if (context == R_2D) p._renderer.matrixStack = [new p5.Matrix()];
        drawNative.apply(p, args);
      };
    }


    if (p.resetMatrix instanceof Function) {
      let resetMatrixNative = p.resetMatrix;
      p.resetMatrix = function(...args) {
        if (context == R_2D) p._renderer.matrixStack = [new p5.Matrix()];
        resetMatrixNative.apply(p, args);
      };
    }

    if (p.translate instanceof Function) {
      let translateNative = p.translate;
      p.translate = function(...args) {
        if (context == R_2D) last(p._renderer.matrixStack).translate(args);
        translateNative.apply(p, args);
      };
    }

    if (p.rotate instanceof Function) {
      let rotateNative = p.rotate;
      p.rotate = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateZ(rad);
        }
        rotateNative.apply(p, args);
      };
    }

    if (p.rotateX instanceof Function) {
      let rotateXNative = p.rotateX;
      p.rotateX = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateX(rad);
        }
        rotateXNative.apply(p, args);
      };
    }
    if (p.rotateY instanceof Function) {
      let rotateYNative = p.rotateY;
      p.rotateY = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateY(rad);
        }
        rotateYNative.apply(p, args);
      };
    }
    if (p.rotateZ instanceof Function) {
      let rotateZNative = p.rotateZ;
      p.rotateZ = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateZ(rad);
        }
        rotateZNative.apply(p, args);
      };
    }

    if (p.scale instanceof Function) {
      let scaleNative = p.scale;
      p.scale = function(...args) {
        if (context == R_2D) {
          let m = last(p._renderer.matrixStack);
          let sx = args[0];
          let sy = args[1] || sx;
          let sz = context == R_2D ? 1 : args[2];
          m.scale([sx, sy, sz]);
        }
        scaleNative.apply(p, args);
      };
    }

    // Help needed: don't know what transformation matrix to use 
    // Solved: Matrix multiplication had to be in reversed order. 
    // Still, this looks like it could be simplified.

    if (p.shearX instanceof Function) {
      let shearXNative = p.shearX;
      p.shearX = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          let stack = p._renderer.matrixStack;
          let m = last(stack);
          let sm = new p5.Matrix();
          sm.mat4[4] = Math.tan(rad);
          sm.mult(m);
          stack[stack.length - 1] = sm;
        }
        shearXNative.apply(p, args);
      };
    }

    if (p.shearY instanceof Function) {
      let shearYNative = p.shearY;
      p.shearY = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          let stack = p._renderer.matrixStack;
          let m = last(stack);
          let sm = new p5.Matrix();
          sm.mat4[1] = Math.tan(rad);
          sm.mult(m);
          stack[stack.length - 1] = sm;
        }
        shearYNative.apply(p, args);
      };
    }


    if (p.applyMatrix instanceof Function) {
      let applyMatrixNative = p.applyMatrix;
      p.applyMatrix = function(...args) {
        if (context == R_2D) {
          let stack = p._renderer.matrixStack;
          let m = last(stack);
          let sm = new p5.Matrix();
          sm.mat4[0] = args[0];
          sm.mat4[1] = args[1];
          sm.mat4[4] = args[2];
          sm.mat4[5] = args[3];
          sm.mat4[12] = args[4];
          sm.mat4[13] = args[5];
          sm.mult(m);
          stack[stack.length - 1] = sm;
        }
        applyMatrixNative.apply(p, args);
      };
    }


    if (p.push instanceof Function) {
      let pushNative = p.push;
      p.push = function(...args) {
        if (context == R_2D) {
          let m = last(p._renderer.matrixStack);
          p._renderer.matrixStack.push(m.copy());
        }
        pushNative.apply(p, args);
      };
    }
    if (p.pop instanceof Function) {
      let popNative = p.pop;
      p.pop = function(...args) {
        if (context == R_2D) p._renderer.matrixStack.pop();
        popNative.apply(p, args);
      };
    }



    p.screenPosition = function(x, y, z) {
      if (x instanceof p5.Vector) {
        let v = x;
        x = v.x;
        y = v.y;
        z = v.z;
      } else if (x instanceof Array) {
        let rg = x;
        x = rg[0];
        y = rg[1];
        z = rg[2] || 0;
      }
      z = z || 0;

      if (context == R_2D) {
        let m = last(p._renderer.matrixStack);
        // probably not needed:
        // let mInv = (new p5.Matrix()).invert(m);

        let v = p.createVector(x, y, z);
        let vCanvas = multMatrixVector(m, v);
        // console.log(vCanvas);
        return vCanvas;

      } else {
        let v = p.createVector(x, y, z);

        // Calculate the ModelViewProjection Matrix.
        let mvp = (p._renderer.uMVMatrix.copy()).mult(p._renderer.uPMatrix);

        // Transform the vector to Normalized Device Coordinate.
        let vNDC = multMatrixVector(mvp, v);

        // Transform vector from NDC to Canvas coordinates.
        let vCanvas = p.createVector();
        vCanvas.x = 0.5 * vNDC.x * p.width;
        vCanvas.y = 0.5 * -vNDC.y * p.height;
        vCanvas.z = 0;

        return vCanvas;
      }

    }


    // helper functions ---------------------------

    function last(arr) {
      return arr[arr.length - 1];
    }

    function getObjectName(obj) {
      var funcNameRegex = /function (.{1,})\(/;
      var results = (funcNameRegex).exec((obj).constructor.toString());
      return (results && results.length > 1) ? results[1] : "";
    };


    /* Multiply a 4x4 homogeneous matrix by a Vector4 considered as point
     * (ie, subject to translation). */
    function multMatrixVector(m, v) {
      if (!(m instanceof p5.Matrix) || !(v instanceof p5.Vector)) {
        p5Inst.print('multMatrixVector : Invalid arguments');
        return;
      }

      var _dest = p.createVector();
      var mat = m.mat4;

      // Multiply in column major order.
      _dest.x = mat[0] * v.x + mat[4] * v.y + mat[8] * v.z + mat[12];
      _dest.y = mat[1] * v.x + mat[5] * v.y + mat[9] * v.z + mat[13];
      _dest.z = mat[2] * v.x + mat[6] * v.y + mat[10] * v.z + mat[14];
      var w = mat[3] * v.x + mat[7] * v.y + mat[11] * v.z + mat[15];

      if (Math.abs(w) > Number.EPSILON) {
        _dest.mult(1.0 / w);
      }

      return _dest;
    }

  }

  //end: screen-position }}}



  //begin: lib.js
  mylog("begin lib.js");
  // ####################################
  //  Declaration of Variables {{{

  // debugging
  // let DEBUGMODE = true;
  let DEBUGMODE = false;
  p5.disableFriendlyErrors = !DEBUGMODE;
  let DEBUGFUNCS;
  function debugprint(...args) {
    if (DEBUGMODE) {
      p5Inst.print("### DEBUG (begin) ###");
      for (const arg of args) {
        p5Inst.print(JSON.stringify(arg));
      }
      p5Inst.print("### DEBUG (end) ###");
    }
  }

  function fixAppState(AppState, undo = false) {
    let tempAppState = {};
    Object.entries(AppState).forEach(([k, v], i) => tempAppState[k] = v);
    p5Inst.print(tempAppState, tempAppState == AppState, tempAppState === AppState)
    let change = (!undo) ? 1 : -1
    tempAppState["NUMCUBES.COMPACT"] = tempAppState["NUMCUBES.COMPACT"] + change;
    tempAppState["NUMCUBES.SPLIT"] = tempAppState["NUMCUBES.SPLIT"] + change;
    return tempAppState
  }

  let cubeStackCompactScaleTextPos;
  let cubeStackSplitScaleTextPos;
  let bgImgsLocalStorageLabel = "bgImgs";
  let PIXELDENSITY = 2;
  let bgImgs;
  let cube;
  let hit;
  let sliderdragged = false;
  let activeSampleI = false;
  let canvasBuffer;
  // let openBlockDrawer;
  let cubecolor;
  let v0;
  let slider, sliderPositionOffset, sliderPosition;
  let stack, stackxy;
  let stackleft, stackleftxy;
  let SEESAWANGLE;
  // let cubeStackSettings.cube.size, samplesize;
  let sliderOffset;

  let htmlSketch;


  let CANVASASPECT;
  let displaySplitScale = true;
  let displayCompactScale = true;
  let displayCompactDecimal = false;

  let blockAmounts;
  let generators;
  let stackingMode = false;

  let cubeStackSettings;

  let sliderBufferPadding;
  let frameRateTime = new Array(32);
  let unfocusedCount = 0;

  let ZEROVECTOR;
  let MODELXCUBE;


  // }}}

  // ####################################

  // ####################################
  // Utilities {{{

  function convertMap2Object(map) {//{{{
    const obj = {}
    for (let [k, v] of map)
      obj[k] = v
    return obj
  }//}}}


  function getDeviceType() {//{{{
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return "mobile";
    }
    return "desktop";
  };//}}}



  function decomposeInt(integer, base = 10) {//{{{
    if (integer < pow(base, 4)) {

      let digit1000s = parseInt(integer / 1000);
      let digit100s = parseInt((integer % 1000) / 100);
      let digit10s = parseInt((integer % 100) / 10);
      let digit1s = parseInt((integer % 10));

      return [digit1s, digit10s, digit100s, digit1000s]
    } else {
      throw (`Integer ${integer} has to be less than ${pow(base, 4)} !`)
    }


  }//}}}
  function roundToNext(num, place) {
    return Math.round(num / place) * place
  }

  const getSizeInBytes = obj => {// {{{
    let str = null;
    if (typeof obj === 'string') {
      // If obj is a string, then use it
      str = obj;
    } else {
      // Else, make obj into a string
      str = JSON.stringify(obj);
    }
    // Get the length of the Uint8Array
    const bytes = new TextEncoder().encode(str).length;
    return bytes;
  };// }}}


  // Definiton of 3 linesyles/ strokePatterns avialable via html5Canvas but not from p5.js 
  function strokePattern(pattern) {// {{{
    // pattern: alternating number of pixels with the "pen on" and "pen off" the canvas
    drawingContext.setLineDash(pattern);
  }
  let DASHED = [5, 5];
  let DOTTED = [2];
  let SOLID = [];
  // }}}

  class Clickable {// {{{
    static allClickables = new Map();

    constructor(label) {
      this.isClicked = false;
      if (this.constructor == Clickable) {
        throw new Error("Abstract class Movable cannot be instantiated.");
      }


      if (Clickable.allClickables.has(label)) {
        let old = Clickable.allClickables.get(label);
        this.isClicked = old.isClicked;
      }

      Clickable.allClickables.set(label, this);
    }

    area() {
      throw new Error("Abstract Method has to be implemented");
    }

    mouseInArea() {
      throw new Error("Abstract Method has to be implemented");
    }

    mousePressed() {
      if (this.mouseInArea()) this.isClicked = true;
      return this.isClicked
    }

    mouseReleased() { this.isClicked = false; }

  }// }}}

  class Movable {// {{{
    static Movables = [];

    constructor() {
      this.isDragged = false;
      this.offset2ReferencePoint = p5Inst.createVector(0, 0);
      if (this.constructor == Movable) {
        throw new Error("Abstract class Movable cannot be instantiated.");
      }

      Movable.Movables.push(this);
    }

    mouseInArea() {
      throw new Error("Abstract Method has to be implemented");
    }

    updateReferencePoint(dx, dy) {
      throw new Error("Abstract Method has to be implemented");
    }

    get referencePoint() {
      throw new Error("Abstract Method has to be implemented");
    }

    set referencePoint(vector) {
      throw new Error("Abstract Method has to be implemented");
    }


    mousePressed() {

      if (this.mouseInArea()) {
        this.isDragged = true;
        this.offset2ReferencePoint = p5Inst.createVector(
          p5Inst.mouseX - this.referencePoint.x,
          p5Inst.mouseY - this.referencePoint.y);

        // print(`mouseX = ${p5Inst.mouseX}, mouseY = ${p5Inst.mouseY}`);
        // print(this);
        return true

      }

      return false

    }

    mouseDragged() {
      if (this.isDragged) {
        // print(`mouseX = ${p5Inst.mouseX}, mouseY = ${p5Inst.mouseY}`);
        // print(`refX = ${this.offset2ReferencePoint.x}, refY = ${this.offset2ReferencePoint.y}`);
        let dx = p5Inst.mouseX - this.offset2ReferencePoint.x;
        let dy = p5Inst.mouseY - this.offset2ReferencePoint.y;
        // print(`dx = ${dx}, dy = ${dy}`)
        this.referencePoint = this.updateReferencePoint(dx, dy);
        // print("updated", this);
        return false
      }

    }

    mouseReleased() {
      this.isDragged = false;
    }

  }// }}}


  // example implementation of the Movable 'Interface'
  // class movableRect extends Movable {// {{{
  //   constructor(x0, y0, w, h) {
  //     super();
  //     this.x0 = x0;
  //     this.y0 = y0;
  //     this.w = w;
  //     this.h = h;
  //   }

  //   get referencePoint() {
  //     return p5Inst.createVector(this.x0, this.y0)
  //   }

  //   set referencePoint(vector) {
  //     this.x0 = vector.x;
  //     this.y0 = vector.y
  //   }

  //   mouseInArea() {
  //     return p5Inst.collidePointRect(p5Inst.mouseX, p5Inst.mouseY,
  //       this.x0, this.y0, this.w, this.h)
  //   }

  //   updateReferencePoint(dx, dy) {
  //     // print(this.referencePoint.x, this.referencePoint.y );
  //     // print(this.referencePoint.x + dx, this.referencePoint.y + dy);
  //     return p5Inst.createVector(dx, dy)
  //   }

  //   draw() {rect(this.x0, this.y0, this.w, this.h);

  //   }

  // }// }}}

  function roman2arabic(num) {
    let result;
    switch (num) {
      case 'I':
        result = 1
        break;
      case 'X':
        result = 10
        break;
      case 'C':
        result = 100
        break;
      case 'M':
        result = 1000
        break;
    }
    return result
  }

  // shorthand functions for p5.Vectors
  let vadd = p5.Vector.add;
  let vsub = p5.Vector.sub;
  let vmult = p5.Vector.mult;
  let vnorm = p5.Vector.mag;
  let vdist = p5.Vector.dist;
  let vlerp = p5.Vector.lerp;
  p5.Vector.prototype.__defineGetter__("xy", function() { return [this.x, this.y] });
  p5.Vector.prototype.__defineGetter__("xz", function() { return [this.x, this.z] });
  p5.Vector.prototype.__defineGetter__("yz", function() { return [this.y, this.z] });
  p5.Vector.prototype.__defineGetter__("xyz", function() { return this.array() });

  // matrix classes to ease the tranformaiton between referenceFrames 
  //@improvment @refactor: the 3DMatrix multiplication is functional but unnecessarly complex
  class Matrix2D {//{{{
    constructor(a, b, c, d) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.entries = [a, b, c, d];
      this.rows = [p5Inst.createVector(a, b), p5Inst.createVector(c, d)];
    }
    get det() {
      return this.a * this.d - this.c * this.b
    }
    get inv() {
      return new Matrix2D(...([this.d, -this.b, -this.c, this.a].map(x => x / this.det)))
    }

    get transpose() {
      return new Matrix2D(this.a, this.c, this.b, this.d)
    }

    get T() {
      return this.transpose
    }

    toString() {
      return `[${this.a}, ${this.b}]\n[${this.c}, ${this.d}]`
    }
    dot(vector) {
      return this.rows.map(row => p5.Vector.dot(row, p5Inst.createVector(...vector))).slice(0, 2)
    }



    mult(matrix2d) {
      let product = [];
      let transposed = matrix2d.transpose;
      product.push(...this.dot(transposed.rows[0].array()));
      product.push(...this.dot(transposed.rows[1].array()));
      return new Matrix2D(...product).T
    }

  }//}}}

  class Matrix {//{{{
    constructor(matrix2D, translation) {

      this.matrix2D = matrix2D;
      this.M = matrix2D.entries;
      this.translation = translation;
      this.b = translation;

      this.rows = [
        p5Inst.createVector(this.M[0], this.M[1], this.b[0]),
        p5Inst.createVector(this.M[2], this.M[3], this.b[1]),
        p5Inst.createVector(0, 0, 1)];
    };

    get det() {
      return this.matrix2D.det
    }


    get inv() {
      return new Matrix(this.matrix2D.inv, this.matrix2D.inv.dot(this.translation).map(x => -x));
    }

    dot(vector) {
      return p5Inst.createVector(...this.rows.map(row => p5.Vector.dot(row, vector)))
    }

    //@improvment: Why am I splitting this up ... should be a 3d matrix multipliciton
    mult(matrix) {
      let productM = this.matrix2D.mult(matrix.matrix2D);
      let productb = vadd(p5Inst.createVector(...this.translation), this.dot(p5Inst.createVector(...matrix.translation))).xy;
      return new Matrix(productM, productb)
    }



    toString() {
      return this.rows.map(row => {
        return row.toString().split(":")[1].trim()
      }).join("\n")
    }


  }//}}}

  // plain-javascript-array functions
  function all(arr, value = true) {
    return arr.map((it) => (it == value)).reduce((prev, cur) => prev && cur)
  }
  function any(arr, value) {
    return arr.map((it) => (it == value)).reduce((prev, cur) => prev || cur)
  }
  function sum(arr) {
    return arr.reduce((prev, cur) => prev + cur)
  }
  function mean(arr) {
    return sum(arr) / arr.length
  }

  // property functions 
  function isString(arg) {
    return Object.prototype.toString.call(arg) === "[object String]"
  }

  // floats compare function 
  function isClose(value1, value2, abseps = 1e-6) {
    return abs(value1 - value2) < abseps
  }


  function withContexts(contexts, buffer = undefined) {// {{{
    if (isString(contexts)) { contexts = [contexts]; }

    if (buffer == undefined) { buffer = window; }

    return (actions) => {
      buffer.push();
      for (var ctx of contexts) {
        drawingContexts.get(ctx)(buffer);
      }
      actions(buffer);
      buffer.pop();
    }
  }// }}}

  function pushDEBUGFUNC(func) {
    if (p5Inst.frameCount == 0 || p5Inst.frameCount == 1) {

      DEBUGFUNCS.push(func)
    }
  }

  function pointOnCircle(m, r, phi) {
    return vadd(m, p5Inst.createVector(r * cos(phi), r * sin(phi)))
  }
  function drawDebugBuffer(drawFrames) {// {{{
    if (drawFrames) {
      for (let frame of Frame.allFrames) {
        frame.drawFrame();
      }
    }
    debugbuffer.push();
    // debugbuffer.textSize(20);
    frameRateTime[p5Inst.frameCount % 32] = p5Inst.frameRate();

    debugbuffer.push();
    debugbuffer.translate(...debugbuffer.rF.P(0, -0.25).xy);
    debugbuffer.push();
    if (mean(frameRateTime).toFixed(3) > 45) { debugbuffer.fill(p5Inst.color(0, 230, 20)) };
    if (mean(frameRateTime).toFixed(3) < 45) { debugbuffer.fill(p5Inst.color(240, 120, 120)) };
    if (mean(frameRateTime).toFixed(3) < 30) { debugbuffer.fill(p5Inst.color(240, 0, 20)) };
    // debugbuffer.text(`FR:${mean(frameRateTime).toFixed(3)}\nFC:${p5Inst.frameCount}`, ...debugbuffer.rF.P(0.825, 0.9).xy);
    debugbuffer.pop();

    // debugbuffer.text(`Aspect:${p5Inst.canvas.offsetWidth}:${p5Inst.canvas.offsetHeight}=${(p5Inst.canvas.offsetWidth / p5Inst.canvas.offsetHeight).toFixed(3)}`, ...canvasBuffer.rF.P(0.825, 0.96).xy)

    debugbuffer.push();
    debugbuffer.textSize(16);

    // debugbuffer.text(`CubeCount:${JSON.stringify(convertMap2Object(CUBECOUNT), null, ' ')}`, ...debugbuffer.rF.P(0.825, 0.98).xy);
    debugbuffer.pop();

    debugbuffer.pop();
    // debugbuffer.noFill();
    // debugbuffer.rect(...canvasBuffer.rF.P(0.025, 0.025).xy, ...canvasBuffer.rF.P(0.075, 0.1).xy);
    // if (DEBUGMODE && (p5Inst.frameCount > 5000)) { location.reload() };

    debugbuffer.pop();
    for (var funcs of DEBUGFUNCS) {
      debugbuffer.push();
      funcs(debugbuffer);
      debugbuffer.pop();
    }




  }// }}}


  function maskBuffer(buffer, areaVertices) {
    mask = p5Inst.createGraphics(buffer.width, buffer.height);
    mask.pixelDensity(buffer.pixelDensity());
    mask.background(p5Inst.color('#0000'));
    mask.fill(p5Inst.color('#000F'));
    mask.noStroke();
    mask.beginShape();
    areaVertices.forEach((it) => mask.vertex(...it));
    mask.endShape(p5Inst.CLOSE);
    buffer.mask(mask)

    return buffer


  }




  // }}}
  // ####################################

  // ####################################
  // Recources   {{{

  function DEBUGCOLOR(alpha = 100) {
    return p5Inst.color(200, 0, 0, alpha);
  }

  // definitions of resources
  let colors_birch = new Map([
    ["light", "#ddd1b1"],
    ["lighter", "#dbd2ad"],
    ["normal", "#ccc19f"],
    ["darker", "#bbb08e"],
    ["dark", "#a19477"],
    ["darkest", "#584937"],
    ["reddark", "#543737"]
  ])

  /* https://lawlesscreation.github.io/hex-color-visualiser/
  // big differences
    // green
  #1bc537
  #083b22
  #0f6f41
  #37e490
  
    // blue
  #1ed6ef
  #55e0f3
  #0b8ea0
  #075d69
  
  
  // smaller differences
    //green
  #1bc537
  #0f6f41
  #149155
  #26e187
    // blue
  #1ed6ef
  #0eaec4
  #0b8ea0
  #43ddf2
   
   
    */



  let colors_greens = new Map([
    ["base+10", "#5ae8a4"],
    ["base", "#1bc537"],
    ["base-20", "#149155"],
    ["base-25", "#0f6f41"],
  ])

  let colors_blues = new Map([
    ["base+20", "#7ae7f6"],
    ["base+10", "#1ed6ef"],
    ["base", "#1ed6ef"],
    ["base-5", "#0eaec4"],
    ["base-15", "#0b8ea0"],
  ])

  let drawingContexts = new Map([
    ["debug",
      (B) => { B.stroke(DEBUGCOLOR(150)); B.fill(DEBUGCOLOR(150)); }],
    ["seesaw",
      (B) => { B.fill(seesawSettings.board.color); B.strokeWeight(1); }],
    ["scaleDisplayText",
      (B) => {
        B.textAlign(p5Inst.CENTER), B.textSize(16);
        // B.fill(p5Inst.color(colors_birch.get("reddark")));
        // B.stroke(p5Inst.color(colors_birch.get("reddark")));

        // B.fill(p5Inst.color(colors_birch.get("reddark")));
        // B.stroke(p5Inst.color(colors_birch.get("reddark")));
        B.fill(0);
        B.stroke(0);
        // B.fill(p5Inst.color(colors_birch.get("darkest"))); 
        // B.stroke(p5Inst.color(colors_birch.get("darkest")));
        B.strokeWeight(1.25);
      }]
  ])

  // }}}
  // ####################################

  // ####################################
  // Cubes / CubeStack {{{

  const Faces = { ALL: 0b111, FRONT: 0b001, RIGHT: 0b010, TOP: 0b100 };
  let CUBECOUNT = new Map([]);
  class Cube2D {//{{{

    constructor(v0, cubeSettings, countID) {
      //mylog("begin Cube2D.constructor");
      if (CUBECOUNT.has(countID)) {
        CUBECOUNT.set(countID, CUBECOUNT.get(countID) + 1);
      } else {
        CUBECOUNT.set(countID, 1);
      }

      //size, zangle = TAU * 0.125, zscale = 0.5) 
      //@refactor: change v0 to be the back-lower-left vertex of the Stack

      this.v0 = v0;

      this.size = cubeSettings.size;

      this.sizex = cubeSettings.size;
      this.sizey = cubeSettings.size;

      this.zangle = cubeSettings.zangle;
      this.zscale = cubeSettings.zscale;
      this.edgescale = [1, 1, 1];

      this.xEdge = p5Inst.createVector(this.size, 0);

      this.yEdge = p5Inst.createVector(0, -this.size);
      this.zEdge = vmult(p5Inst.createVector(1, -tan(this.zangle)).normalize(), this.zscale * this.size);
      this.index = [0, 0, 0];
      this.vertices = { FRONT: [], RIGHT: [], TOP: [] };
      this.vertices.FRONT = [
        this.v0,
        vadd(this.v0, this.xEdge),
        vadd(this.v0, vadd(this.xEdge, this.yEdge)),
        vadd(this.v0, this.yEdge)];

      this.vertices.RIGHT = [
        vadd(this.v0, this.xEdge),
        vadd(this.v0, vadd(this.xEdge, this.zEdge)),
        vadd(this.v0, vadd(vadd(this.xEdge, this.zEdge), this.yEdge)),
        vadd(this.v0, vadd(this.xEdge, this.yEdge))];

      this.vertices.TOP = [
        vadd(this.v0, this.yEdge),
        vadd(this.v0, vadd(this.yEdge, this.xEdge)),
        vadd(this.v0, vadd(vadd(this.yEdge, this.xEdge), this.zEdge)),
        vadd(this.v0, vadd(this.yEdge, this.zEdge))];

      this.color = "";
      this.number = 1;
      //mylog("end Cube2D.constructor");
    }

    rescale(xscale = 1, yscale = 1, zscale = 1) {
      this.xEdge.mult(xscale);
      this.yEdge.mult(yscale);
      this.zEdge.mult(zscale);

      this.sizex *= xscale;
      this.sizey *= yscale;

      // if resized by different x and y scales, this.size has no meaning anymore
      this.size = (isClose(xscale, yscale)) ? this.sizex : undefined;

      this.edgescale = [xscale, yscale, zscale];

      this.vertices.FRONT = [this.v0, vadd(this.v0, this.xEdge), vadd(this.v0, vadd(this.xEdge, this.yEdge)), vadd(this.v0, this.yEdge)];
      this.vertices.RIGHT = [
        vadd(this.v0, this.xEdge),
        vadd(this.v0, vadd(this.xEdge, this.zEdge)),
        vadd(this.v0, vadd(vadd(this.xEdge, this.zEdge), this.yEdge)),
        vadd(this.v0, vadd(this.xEdge, this.yEdge))];

      this.vertices.TOP = [
        vadd(this.v0, this.yEdge),
        vadd(this.v0, vadd(this.yEdge, this.xEdge)),
        vadd(this.v0, vadd(vadd(this.yEdge, this.xEdge), this.zEdge)),
        vadd(this.v0, vadd(this.yEdge, this.zEdge))];


    }
    static fromcube(v0, cube, countID) {
      let newcube = new Cube2D(v0, { size: cube.size, zangle: cube.zangle, zscale: cube.zscale }, countID);
      if (sum(cube.edgescale) != 3) {
        newcube.rescale(...cube.edgescale);
      }
      return newcube

    }

    get convexHull() {
      return [
        this.vertices.FRONT[0],
        this.vertices.FRONT[1],
        this.vertices.RIGHT[1],
        this.vertices.RIGHT[2],
        // this.vertices.RIGHT[3],
        this.vertices.TOP[3],
        this.vertices.TOP[0]
      ]
    }

    Rsize(buf) {
      return {
        xy: buf.rF.R(this.sizex, this.sizey),
        zxy: buf.rF.R(...this.zEdge.xy),
        // z: buf.rF.R(...this.zEdge.xy).mag(),
      };
    }

    translate(vec) {
      //@refactor: maybe do not translate the cubes, but just the canvas/buffer via buf.translate(...) #CubeTranslation
      for (let side in this.vertices) {
        this.vertices[side].map(x => x.add(vec));
      }
    }

    draw(buf = window, faces = 0b111) {//{{{
      // front face
      if (faces & Faces.FRONT) {
        // print("verts:", this.vertices.FRONT.map(it => it.xy).flat());
        // buf.quad(...this.vertices.FRONT.map(it => it.xy).flat());
        buf.beginShape();
        for (var vert of this.vertices.FRONT) {
          buf.vertex(...vert.array());
        }
        buf.endShape(p5Inst.CLOSE);
      }
      // right face
      if (faces & Faces.RIGHT) {
        buf.beginShape();
        for (var vert of this.vertices.RIGHT) {
          buf.vertex(...vert.array());
        }
        buf.endShape(p5Inst.CLOSE);
      }
      // top face
      if (faces & Faces.TOP) {
        buf.beginShape();
        for (var vert of this.vertices.TOP) {
          buf.vertex(...vert.array());
        }
        buf.endShape(p5Inst.CLOSE);
      }
    }//}}}

  }//}}}

  function numcubeslike(ncubes, cube, countID, highlight = false, genrange = [0, -1]) {//{{{

    let base = 10;
    let digits = decomposeInt(ncubes, base = base);
    let offset;

    if (genrange[1] == -1) { genrange[1] = ncubes }
    if (genrange[0] > 0 && genrange[0] == genrange[1]) { genrange[0] = genrange[1] }
    // console.log(`${ kmax }: ${ jmax } : ${ imax } `);
    let cubes = [];
    // for (var l = 0; l <= digits[3]; l++) {

    // kmax = l <= digits[3] - 1 ? 10 : digits[2];

    let kmax = parseInt(ncubes / 100);
    let jmax, imax;
    for (var k = 0; k <= kmax; k++) {

      jmax = k <= kmax - 1 ? 10 : digits[1];

      for (var j = 0; j <= jmax; j++) {

        // @hack: I did not find another way to do this
        if (j < 10) {
          imax = j <= jmax - 1 ? 10 : digits[0];

          for (var i = 0; i < imax; i++) {

            if (i + j * 10 + k * 100 < genrange[0] || i + j * 10 + k * 100 - 1 > genrange[1]) { continue; }
            offset = p5Inst.createVector(0, 0);
            offset.add(vmult(cube.xEdge, i));
            offset.add(vmult(cube.zEdge, -j));
            offset.add(vmult(cube.yEdge, k));
            // offset.add(vmult(cube.yEdge, 10 * l));
            let nextCube = Cube2D.fromcube(vadd(cube.v0, offset), cube, `numCubesLike:${countID}`);
            if (cube.color != "") { nextCube.color = cube.color }

            // nextCube.index = [i, j, k, l];
            nextCube.number = (i + j * 10 + k * 100 + 1);//cubes.length > 0) ? cubes[cubes.length - 1].number + 1 : 1;
            nextCube.index = [i, j, k];
            cubes.push(nextCube);
          }
        }
      }
    }
    // }


    // let flags = 0;
    // if (ncubes % 1000 == 0) {
    //   flags = flags | 4
    // } else if (ncubes % 100 == 0) {
    //   flags = flags | 2
    // } else if (ncubes % 10 == 0) {
    //   flags = flags | 1
    // }
    if (highlight) {
      digits = decomposeInt(ncubes);

      if (digits[3] > 0) {
        cubes.convexHull = [
          ...cubes[90].convexHull.slice(0, 2),
          ...cubes[99].convexHull.slice(1, 3),
          ...cubes[9].convexHull.slice(2, 4),
          ...cubes[ncubes - 91].convexHull.slice(3, 4),
          ...cubes[ncubes - 100].convexHull.slice(4, 5),
          ...cubes[ncubes - 10].convexHull.slice(4, 6)
        ];

      } else if (digits[3] == 0 && digits[2] > 0) {
        cubes.convexHull = [
          ...cubes[90].convexHull.slice(0, 2),
          ...cubes[ncubes - 1].convexHull.slice(1, 3),
          ...cubes[9].convexHull.slice(1, 4),
          ...cubes[0].convexHull.slice(4, 5),
          ...cubes[90].convexHull.slice(5, 6)
        ];

      } else if (digits[3] == 0 && digits[2] == 0 && digits[1] > 0) {

        cubes.convexHull = [
          ...cubes[0].convexHull.slice(0, 2),
          ...cubes[9].convexHull.slice(1, 4),
          ...cubes[0].convexHull.slice(4, 6)
        ];
      } else {
        cubes.convexHull = cubes[ncubes - 1].convexHull;
      }
    }

    return cubes;
  }//}}}


  function drawcubes(buf, cubes, ncubes, compact = false, fullStack = false) {//{{{
    buf.strokeWeight(1);
    // print("buffer", buf);
    // print("bufferrefFrame", buf.rF);
    // print(cubes);
    // throw Error("!!!")

    let base = 10;
    // if (cubes.length == 0) return;
    if (ncubes == 0) return;

    let bufC = buf;
    if (buf === window || buf === canvasBuffer) {
      buf = window;
      bufC = canvasBuffer;
    }


    let maxdigits = decomposeInt(ncubes, base = base);
    let coloridx = 1;
    let curdigits;
    let currentCube, curheight;
    let cubeFaces = 0; Faces.ALL;
    let cube = cubes[0];


    let maxheight = parseInt(ncubes / 100);

    let starting100 = (fullStack) ? 0 : maxdigits[2];
    let starting1000 = (fullStack) ? 0 : maxdigits[3];
    buf.push();
    // buf.strokeJoin(MITER);
    // buf.strokeCap(SQUARE);
    // buf.translate(buf.width / 2, -buf.height / 2);
    // if (mirror) { buf.applyMatrix(-1, 0, 0, 1, 0, 0) };



    // draw compacted cuboids 

    if (compact) {//{{{
      // if not fullStack, draw the bg-Images first
      if (!fullStack) {
        buf.push();
        buf.translate(...vmult(cubeStackCompactTranslation, -1).xy);
        let TC2Buf = canvasBuffer.rF.T(buf);
        //1000-cubes
        let bgImgOffset = 0;
        for (var it = 1; it <= maxdigits[3]; it++) {
          buf.scale(0.5);
          buf.image(bgImgs.compact.M, 0, PIXELDENSITY * buf.height - bgImgs.compact.M.height - bgImgOffset);
          // buf.noFill();
          // buf.rect(0, PIXELDENSITY * buf.height - bgImgs.compact.M.height, bgImgs.compact.M.width, bgImgs.compact.M.height);
          buf.scale(2);
          bgImgOffset = bgImgOffset + PIXELDENSITY * cubeStackSettings.cube.size * 10;
        }

        // @improvment: The wireframe ontop of the last 1000-cube is shadowed by the images drawn above
        // bgImgOffset = bgImgOffset + 1;
        //100-cubes
        for (var it = 1; it <= maxdigits[2]; it++) {
          buf.scale(0.5);
          buf.image(bgImgs.compact.C, 0, PIXELDENSITY * buf.height - bgImgs.compact.M.height - bgImgOffset);
          buf.scale(2);
          bgImgOffset = bgImgOffset + PIXELDENSITY * cubeStackSettings.cube.size;

          // print(bgImgs.compact.M);

        }
        buf.pop();


      }

      let faces;
      // 1000-cubes
      buf.fill(p5Inst.color(colors_blues.get("base-15")));//colors_birch.get("light")));
      let bigcube;
      let bigv0;
      let bigsize = base * cube.size;
      for (var it = 1 + starting1000; it <= maxdigits[3]; it++) {
        bigv0 = vadd(vadd(cube.v0, vmult(cube.zEdge, -9)), vmult(cube.yEdge, 10 * (it - 1)));
        bigcube = new Cube2D(bigv0, { size: bigsize, zangle: cube.zangle, zscale: cube.zscale }, "Mcube");

        faces = Faces.FRONT | Faces.RIGHT;
        if (it == maxdigits[3]) {
          faces = faces | Faces.TOP;
          buf.stroke(p5Inst.color("#111"));//colors_birch.get("reddark")));
          buf.strokeJoin(p5Inst.ROUND);
          // p5Inst.print("Hier:", AppSettings.EDGEWIDTH1000CUBEKG);
          buf.strokeWeight(AppState["EDGEWIDTH1000CUBEKG"]);
        }


        bigcube.draw(buf, faces);

        // p5Inst.print("Hier2:", AppSettings.EDGEWIDTH1000CUBEKG);
        buf.strokeWeight(1);
        buf.stroke("black");


      }

      // 100-plates
      let plate;
      let platev0 = vadd(cube.v0, vadd(vmult(cube.yEdge, maxdigits[3] * (base) - 1), vmult(cube.zEdge, -base + 1)));
      for (var it = 1 + starting100; it <= maxdigits[2]; it++) {
        platev0 = vadd(platev0, cube.yEdge);
        plate = new Cube2D(platev0, { size: cube.size, zangle: cube.zangle, zscale: cube.zscale }, "Ccube");
        plate.rescale(base, 1, base);

        // coloridx = (it % 2 == 0) ? 1 : -1;
        // buf.fill(coloridx == 1 ? color(colors_birch.get("light")) : color(colors_birch.get("darker")));
        buf.fill(p5Inst.color(colors_blues.get("base-5")));

        faces = Faces.FRONT | Faces.RIGHT;
        if (it == maxdigits[2]) faces = faces | Faces.TOP;
        plate.draw(buf, faces);

      }
      // 10-sticks
      // let zerovector = p5Inst.createVector(0, 0);
      let stickv0 = vadd(vadd(cube.v0, vmult(cube.yEdge, (maxdigits[3]) * (base) + maxdigits[2])), cube.zEdge);
      // let stick = new Cube2D(zerovector, { size: cube.size, zangle: cube.zangle, zscale: cube.zscale }, "Xcube");
      // stick.rescale(base, 1, 1);
      for (var it = 0; it < maxdigits[1]; it++) {
        stickv0 = vadd(stickv0, vmult(cube.zEdge, -1));
        // stick = new Cube2D(stickv0, { size: cube.size, zangle: cube.zangle, zscale: cube.zscale }, "Xcube");
        MODELXCUBE.translate(stickv0);


        // coloridx = (it % 2 == 0) ? 1 : -1;
        // buf.fill(coloridx == 1 ? color(colors_birch.get("light")) : color(colors_birch.get("darker")));

        buf.fill(p5Inst.color(colors_blues.get("base+10")));
        faces = Faces.FRONT | Faces.RIGHT | Faces.TOP;
        MODELXCUBE.draw(buf, faces);
        MODELXCUBE.translate(vmult(stickv0, -1));

      }

      buf.strokeWeight(1);
    }//}}}




    // draw small cubes
    // if not fullStack, draw the bg-Images first
    if (!compact) {//{{{
      if (!fullStack) {
        buf.push();
        buf.translate(...vmult(cubeStackCompactTranslation, -1).xy);
        let TC2Buf = canvasBuffer.rF.T(buf);
        //1000-cubes
        let bgImgOffset = 0;
        for (var it = 1; it <= maxdigits[3]; it++) {
          buf.scale(0.5);
          buf.image(bgImgs.split.M, 0, PIXELDENSITY * buf.height - bgImgs.split.M.height - bgImgOffset);
          // buf.noFill();
          // buf.rect(0, PIXELDENSITY * buf.height - bgImgs.split.M.height, bgImgs.split.M.width, bgImgs.split.M.height);
          buf.scale(2);
          bgImgOffset = bgImgOffset + PIXELDENSITY * cubeStackSettings.cube.size * 10;
        }

        // @improvment: The wireframe ontop of the last 1000-cube is shadowed by the images drawn above
        // bgImgOffset = bgImgOffset + 1;
        //100-cubes
        for (var it = 1; it <= maxdigits[2]; it++) {
          buf.scale(0.5);
          buf.image(bgImgs.split.C, 0, PIXELDENSITY * buf.height - bgImgs.split.M.height - bgImgOffset);
          buf.scale(2);
          bgImgOffset = bgImgOffset + PIXELDENSITY * cubeStackSettings.cube.size;

          // print(bgImgs.split.M);

        }
        buf.pop();


      }
    }//}}}

    // print("length", cubescopy.length);
    for (var it = 0; it < ncubes; it++) {

      // if not a fullstack do not draw the M and C cubes
      if (it < starting1000 * 1000 + starting100 * 100) { continue; }

      cubeFaces = 0;
      currentCube = cubes[it];
      curdigits = decomposeInt(it, base = base);
      curheight = parseInt(it / 100);
      if (compact) {
        if ((curheight < maxheight) || currentCube.index[1] < maxdigits[1]) {
          continue;
        }
      }


      // print("index:", it);
      // print("copy:", cubescopy);

      // print("elem:", cubescopy[it]);
      // print("current:", currentCube);
      // print("currentheight:", curheight);
      if (curheight == maxheight) {

        // coloridx = (currentCube.index[1] % 2 == 0) ? 1 : -1;
        // buf.fill(coloridx == 1 ? color(colors_birch.get("light")) : color(colors_birch.get("dark")));
        if (compact) {
          buf.fill(p5Inst.color(colors_blues.get("base+20")));
        } else {



          if ((maxdigits[1] - curdigits[1]) > 0) {

            buf.fill(p5Inst.color(colors_greens.get("base")));
          }
          else {//if ((ncubes - it) < 10) {
            buf.fill(p5Inst.color(colors_greens.get("base+10")));
          }




        }
      } else {

        // print("here");

        // print(currentCube);
        // coloridx = (currentCube.index[2] % 2 == 0) ? 1 : -1;
        // buf.fill(coloridx == 1 ? p5Inst.color(colors_birch.get("light")) : p5Inst.color(colors_birch.get("darker")));

        // if (compact) {
        //   buf.fill(p5Inst.color(colors_blues.get("base+20")));
        // } else {

        if ((maxdigits[3] - curdigits[3]) > 0) {
          buf.fill(p5Inst.color(colors_greens.get("base-25")));
        }
        else {//if ((ncubes - it) < 10) {
          buf.fill(p5Inst.color(colors_greens.get("base-20")));
        }





        // }

      }

      if (it == ncubes - 1) {

        hit = p5Inst.collidePointPoly(p5Inst.mouseX, p5Inst.mouseY, cubes[it].vertices.FRONT);
        // print(`${ cubescopy[it].vertices.FRONT },${ hit } `);
        // buf.fill(p5Inst.color(hit ? "yellow" : colors_birch.get("reddark")));
      }

      //selection of faces to be drawn
      if (curheight < maxheight) {//{{{

        if (currentCube.index[1] == base - 1) {
          cubeFaces = cubeFaces | Faces.FRONT;// Faces.FRONT;
        }

        if (currentCube.index[0] == base - 1) {

          cubeFaces = cubeFaces | Faces.RIGHT;// Faces.FRONT;
        }
        if (curheight == maxheight - 1) {
          cubeFaces = cubeFaces | Faces.TOP;
        }

      } else {

        if (currentCube.index[1] <= maxdigits[1]) {
          cubeFaces = cubeFaces | Faces.TOP;
        }
        if (currentCube.index[1] == maxdigits[1] - 1) {

          if (maxdigits[0] <= currentCube.index[0] && currentCube.index[0] <= base - 1) {
            cubeFaces = cubeFaces | Faces.FRONT;// Faces.FRONT;
          }

        }
        if (currentCube.index[1] == maxdigits[1]) {
          cubeFaces = cubeFaces | Faces.FRONT;// Faces.FRONT;

          // console.log(curdigits);
          // console.log(maxdigits[0]);
          if (curdigits[0] == maxdigits[0] - 1) {
            cubeFaces = cubeFaces | Faces.RIGHT;// Faces.FRONT;
          }
        }


        if (currentCube.index[1] < maxdigits[1]) {
          if (currentCube.index[0] == base - 1) {
            cubeFaces = cubeFaces | Faces.RIGHT;// Faces.FRONT
          }
        }
      }//}}}

      if (ncubes == 1 && currentCube.color != "") { buf.fill(currentCube.color) }

      currentCube.draw(buf, cubeFaces);


    }



    if (!compact && maxdigits[3] > 0) {
      let flags;
      let wireframe;
      let bigv0;
      let bigsize = base * cube.size;
      buf.push();
      buf.noFill();
      buf.stroke("#111");//colors_birch.get("reddark")));
      buf.strokeJoin(p5Inst.ROUND);
      buf.strokeWeight(AppState["EDGEWIDTH1000CUBEG"]);
      for (var it = 1 + starting1000; it <= maxdigits[3]; it++) {
        // for (var it = 1; it <= maxdigits[3]; it++) {
        bigv0 = vadd(vadd(cube.v0, vmult(cube.zEdge, -9)), vmult(cube.yEdge, 10 * (it - 1)));
        wireframe = new Cube2D(bigv0, { size: bigsize, zangle: cube.zangle, zscale: cube.zscale }, "Wireframe");
        flags = Faces.FRONT | Faces.RIGHT;
        if (ncubes % 1000 == 0 && it == maxdigits[3]) flags |= Faces.TOP;
        wireframe.draw(buf, flags);
      }
      if (ncubes % 1000 == 0 && it == maxdigits[3]) flags |= Faces.TOP;

      buf.pop();

    }

    buf.pop();
  }//}}}

  function allFacesVertices(vertices) {
    return [...vertices.FRONT, ...vertices.RIGHT, ...vertices.TOP]

  }



  function getCubeStackSettings(cubesize, zscale, zangle, maxStackCubes) {// {{{
    let sinzangle = p5Inst.sin(zangle);
    let coszangle = p5Inst.sin(zangle);
    let zsize = zscale * cubesize;
    let zsizex = zsize * coszangle;
    let zsizey = zsize * sinzangle;

    function numCPlates(ncubes) { return ncubes / 100; }
    let maxNumCPlates = numCPlates(maxStackCubes);



    return {
      cube: {// {{{
        size: cubesize,
        zscale: zscale,
        zsize: zsize,
        zsizex: zsize * coszangle,
        zsizey: zsize * sinzangle,
        zangle: zangle,
        sinzangle: sinzangle,
        coszangle: coszangle
      },// }}}
      stack: {// {{{
        size: 10 * cubesize,
        zsize: 10 * zsize,
        zsizex: 10 * zsize * coszangle,
        zsizey: 10 * zsize * sinzangle,
        maxNumCubes: maxStackCubes,
        maxNumCPlates: maxNumCPlates,
        //@refactor: Do not translate the Cubes, translate the canvas/buffer #CubeTranslation
        verticies: (PX, PY, ncubes = maxStackCubes) => {
          if (PX == undefined || PY == undefined) {
            throw ("PX and PY have to be given to function 'verticies'!")
          }
          let [numI, numX, numC, numM] = decomposeInt(ncubes);
          return {
            // @refactor:  #calculateMaxStack
            fll: [-9 * zsizex + PX, 9 * zsizey + PY],
            flc: [5 * cubesize - 9 * zsizex + PX, 9 * zsizey + PY],
            flr: [10 * cubesize - 9 * zsizex + PX, 9 * zsizey + PY],
            ful: [-9 * zsizex + PX, cubesize * numCPlates(ncubes) - 9 * zsizey + PY],
            fuc: [5 * cubesize - 9 * zsizex + PX, cubesize * numCPlates(ncubes) - 9 * zsizey + PY],
            fur: [10 * cubesize - 9 * zsizex + PX, cubesize * numCPlates(ncubes) - 9 * zsizey + PY],
            bll: [zsizex + PX, -zsizey + PY],
            blc: [5 * cubesize + zsizex + PX, -zsizey + PY],
            blr: [10 * cubesize + zsizex + PX, -zsizey + PY],
            bul: [zsizex + PX, -cubesize * numCPlates(ncubes) - zsizey + PY],
            buc: [5 * cubesize + zsizex + PX, -cubesize * numCPlates(ncubes) - zsizey + PY],
            bur: [10 * cubesize + zsizex + PX, -cubesize * numCPlates(ncubes) - zsizey + PY],

            // all rectangles have the same width
            // StackWidth: 10 * (cubesize + zsizex),// = bur.x - ful.x = 10 * cubesize + zsizex + PX - (-9*zsizex + PX) 

            // Use the front rectangle of the respective stackpart as a click area for MStack and CStack
            MStackStart: [-9 * zsizex + PX, 9 * zsizey + PY],
            MStackEnd: [-9 * zsizex + PX, -cubesize * 10 * numM + 9 * zsizey + PY], // the Mcube is 10x the hight of a Icube
            //@improvement: maybe add a safety margin between *End and *Start
            CStackStart: [-9 * zsizex + PX, -cubesize * 10 * numM + 9 * zsizey + PY],
            CtackEnd: [-9 * zsizex + PX, -cubesize * (10 * numM + numC) + 9 * zsizey + PY],
            // both the XStack and IStack are located in the rectangel starting with the End of the CStack
            // up to the height of the 'bul' of the whole stack
            IStackStart: [-9 * zsizex + PX, -cubesize * (10 * numM + numC) + 9 * zsizey + PY],
            // IStackHeight: cubesize * 10*numC,
            XStackEnd: [-9 * zsizex + PX, -cubesize * (1 + numC + 10 * numM) - zsizey + PY],
            // XStackHeight: cubesize * 10*numC,
            XStackStart: [-9 * zsizex + PX, -cubesize * (numC + 10 * numM) - zsizey + PY + zsizey * numX],
            IStackEnd: [-9 * zsizex + PX, -cubesize * (numC + 10 * numM) - zsizey + PY + zsizey * numX],
            eachfll: function(n) {
              let arr = [...Array(floor(maxStackCubes / n)).keys()].map((i) => [-9 * zsizex + PX, 9 * zsizey + PY - parseInt(n / 100) * parseInt(i) * cubesize]);
              return arr
              // arr.forEach((a) => cubeStackSplit.circle(...cubeStackSplit.coords(...vadd(cubeStackSplit.coordsInvVec(a[0], a[1]), p5Inst.createVector(...stackPosSplit)).xy), 10))

            }
          }
        }
      },// }}}
      buffers: {
        canvasRelativeHeight: 1,
        canvasRelativeWidth: 0.25, //half width of seesawboard
      }
    }
  }
  // }}}


  function stackConvexHull(stackBuffer, num,) {
    let buffer;
    switch (stackBuffer) {
      case "Split": buffer = cubeStackSplit; break;
      case "Compact": buffer = cubeStackCompact; break;
      default: throw new Error("Only stackBuffer = 'Split','Compact' is allowed in 'stackConvexHull', but got " + `stackBuffer=${stackBuffer}`);
    }

    c = new Cube2D(p5Inst.createVector(0, 0), cubeStackSettings.cube, "convexHull");
    switch (num) {
      case (10): c.rescale(10, 1, 1); break;
      case (100): c.rescale(10, 10, 1); break;
      case (1000): c.rescale(10, 10, 1); break;
      default: throw new Error("Only num = 10,100,1000 is allowed in 'stackConvexHull', but got " + `num=${num}`)
    }
    translate(...cubeStackSettings.stack.verticies(0, 0).fll);
    translate(stackBuffer.rF.T(debugbuffer).PP(...cubeStackCompactTranslation.xy));

    b.fill(p5Inst.color('#C591B9'));
    c.convexHull.forEach((it) => b.circle(...it.xy, 10))
  }




  // }}}
  // ####################################

  // ####################################
  // Canvas / Buffer / Frames {{{

  class clickRect extends Clickable {// {{{
    constructor(x, y, width, height, buffer, label) {
      super(label);
      if (width < 0) x = x + height;
      if (height < 0) y = y + height;
      this.x = x;
      this.y = y;
      this.width = Math.abs(width);
      this.height = Math.abs(height);

      this.label = label;
      this.buffer = buffer;
    }

    area() {
      return [this.x, this.y, this.width, this.height]
    }
    mouseInArea() {
      let mouseX = p5Inst.mouseX;
      let mouseY = p5Inst.mouseY;
      let buffer = p5Inst;
      let pos = this.area().slice(0, 2);
      if (this.buffer != null) {
        buffer = this.buffer;
        let bufTrafo = canvasBuffer.rF.T(buffer);
        [mouseX, mouseY] = bufTrafo.PP(mouseX, mouseY).xy;
        // p5Inst.print("position-mouse:", this.label, mouseX,mouseY);
        // p5Inst.print("position-rect:", this.area());
        // p5Inst.print("position-rect:", this.rect);
        // p5Inst.print("position-result:",buffer.collidePointRect(mouseX,mouseY,...this.rect));
      }
      return buffer.collidePointRect(mouseX, mouseY, ...this.rect)
    }

    get rect() {
      return this.area()
    }

  }//}}}

  class Frame extends Clickable {// {{{
    static allLabels = new Map([]);
    static allFrames = [];
    static deferredDraws = [];
    static transformMatricies = new Map([]);

    static initCanvas() {
      return new Frame("Canvas", 0, 0, 1.0, 1.0);
    }


    constructor(label, frameRX, frameRY, frameRWidth, frameRHeight) {//{{{
      if (Frame.allFrames.length == 0 && label != "Canvas") {
        console.error("The canvas must be the first Frame created, with the label 'Canvas'! Call Frame.initCanvas() before creating other instances of this class.");
      }
      super(label);

      //@refactor: remove canvasBuffer and replace it by Frame.allFrames[0] (the canvas)
      this.id = (Frame.allFrames.length == 0) ? 0 : Frame.allFrames[Frame.allFrames.length - 1].id + 1;
      this.label = label;

      //this.randomNumber = random(-10, 10);
      //frameColor = p5Inst.color(random(0, 255), 100, 100, 55);
      // this.frameColor.mode = "hsl";

      this.offset = (this.label != "Canvas") ? canvasBuffer.rF.P(frameRX, frameRY).xy : [0, 0];
      this.b = this.offset;

      this.size = (this.label != "Canvas") ? canvasBuffer.rF.P(frameRWidth, frameRHeight) : p5Inst.createVector(p5Inst.canvas.offsetWidth, p5Inst.canvas.offsetHeight);
      this.width = this.size.x;
      this.height = this.size.y;


      this.oTrafoMatrix = new Matrix(new Matrix2D(this.width, 0, 0, this.height), this.offset)
      this.oM = new Matrix(new Matrix2D(this.width, 0, 0, this.height), this.offset)

      this.iTrafoMatrix = new Matrix(new Matrix2D(this.width, 0, 0, this.height), [0, 0])
      this.iM = new Matrix(new Matrix2D(this.width, 0, 0, this.height), [0, 0])

      Frame.allFrames[this.id] = this;
      Frame.allLabels.set(label, this.id);

    }//}}}

    //implementation of Clickable-Interface
    area() {
      return [...this.offset, this.width, this.height];
    }

    mouseInArea() {
      return p5Inst.collidePointRect(p5Inst.mouseX, p5Inst.mouseY, ...this.area());
    }

    delete() {
      //@improvement: handle return values?

      if (this.label == "Canvas") {
        console.error("The Frame for the Canvas must not be deleted");
      }
      Frame.allLabels.delete(this.label);
      delete Frame.allFrames[this.id]
    }


    P(RX, RY) {
      let position = this.iTrafoMatrix.dot(p5Inst.createVector(RX, RY, 1)).xy;
      return p5Inst.createVector(...position);
    }

    Px(RX) {
      return this.P(RX, 0).x
    }

    Py(RY) {
      return this.P(0, RY).y
    }


    Dx(RX1, RX2) {
      return this.P(RX2, 0).x - this.P(RX1, 0).x
    }

    Dy(RY1, RY2) {
      return this.P(0, RY2).y - this.P(0, RY1).y
    }


    D(RX1, RY1, RX2, RY2) {
      return p5Inst.createVector(this.Dx(RX1, RX2), this.Dy(RY1, RY2))
    }

    // this is way to complicated to remember => use trafos
    // // returns the abolute 'outer' coordinate 
    // //shorthand for: cubeStackSplit.rF.tR2P(canvasBuffer)(0.5, 0.5).xy)
    // oP(RX, RY, asVector = false) {
    //   let position = this.oTrafoMatrix.dot(p5Inst.createVector(RX, RY, 1)).xy;
    //   if (asVector) return p5Inst.createVector(...position);
    //   return position
    // }

    // returns the relative 'inner' Coordinate for a given relative 'inner' coordinate
    R(PX, PY) {
      let coords = this.iTrafoMatrix.inv.dot(p5Inst.createVector(PX, PY, 1)).xy;
      return p5Inst.createVector(...coords);
    }

    Rx(PX) {
      return this.R(PX, 0).x
    }

    Ry(PY) {
      return this.R(0, PY).y
    }

    // this is way to complicated to rememeber => use trafos
    // // returns the relative 'inner' Coordinate for a given absolute 'outer' coordinate
    // // shorthand for:   canvasBuffer.rF.tP2R(cubeStackSplit)(PX,PY);
    // oR(PX, PY, asVector = false) {
    //   let coords = this.oTrafoMatrix.inv.dot(p5Inst.createVector(PX, PY, 1)).xy;
    //   if (asVector) return p5Inst.createVector(...coords);
    //   return coords
    // }



    drawFrame(buffer) {// {{{
      if (buffer == undefined) { buffer = debugbuffer };
      buffer.push();
      buffer.stroke(0);
      // strokePattern(DASHED);

      buffer.strokeWeight(2);

      buffer.fill(p5Inst.color("#9995"));
      buffer.rect(...this.offset, this.width, this.height);

      // textBuffer.strokeWeight(1.2);
      buffer.strokeWeight(1.0);
      // strokePattern(SOLID);
      // textBuffer.fill(0);
      // textBuffer.textSize(18);
      // textBuffer.textAlign(p5Inst.CENTER);
      buffer.stroke(0);
      buffer.fill(0);

      buffer.textSize(20);
      // textAlign(p5Inst.CENTER);
      // let framelabel = `Frame#${this.id}: "${this.label}"`;
      // rectMode(p5Inst.CENTER);
      // let labelHeight = textAscent(framelabel) + textDescent(framelabel);
      // let labelWidth = p5Inst.textWidth(framelabel);
      // fill(255);
      // rect(...this.P(0.50, 0.05), labelWidth, labelHeight);
      // buffer.fill(0);
      let textpos = this.transformP2P(buffer)(25, 25 + 20 * this.id);
      buffer.line(...this.offset, textpos.x, textpos.y);
      buffer.text(`#${this.id}:${this.label}`, ...textpos.xy);

      buffer.pop();

    }// }}}

    static getFrameObject(obj) {// {{{
      if (obj instanceof Frame) {
        return obj
      }
      if (obj.hasOwnProperty("refFrame") || obj.hasOwnProperty("rF")) {
        return obj.refFrame
      }
      throw new Error("The given Object is neither an instanceof `Frame` nor has a property called `refFrame`/`rF`!");

    }// }}}


    static transformationLabel(src, srcType, dest, destType) {
      return `${src.label}${srcType}:${dest.label}${destType}`;
    }

    static transformationLabelInv(transformationlabel) {
      return transformationlabel.split(":").reverse().join(":")
    }

    static inv(transformation) {
      let tl = transformation.transformationlabel;

      let matrix, trafo;
      let tlinv = Frame.transformationLabelInv(tl);
      if (!Frame.transformMatricies.has(tlinv)) {
        throw new Error(`This should not happen: No inverse trafo for ${tl}=${tlinv} found!`)
      }

      matrix = Frame.transformMatricies.get(tlinv);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = tlinv;
      return trafo
    }

    transformation(dest) {
      dest = Frame.getFrameObject(dest);

      let rr = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "R", dest, "R");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {

          // print(transformationlabel);
          // print(this.oM.toString());
          // print(dest.oM.inv.mult(this.oM).toString());
          matrix = dest.oM.inv.mult(this.oM);
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      let rp = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "R", dest, "P");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {

          // print(transformationlabel);
          // print(this.oM.toString());
          // print(dest.oM.inv.mult(this.oM).toString());
          // print(dest.iM.mult(dest.oM.inv.mult(this.oM)).toString());
          matrix = dest.iM.mult(dest.oM.inv.mult(this.oM));
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      let pp = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "P", dest, "P");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {
          // print(transformationlabel);
          // print(this.iM.inv.toString());
          // print(this.oM.mult(this.iM.inv).toString());
          // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
          // print(dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv))).toString());

          matrix = dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv)));
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      let pr = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "P", dest, "R");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {

          // print(transformationlabel);
          // print(this.iM.inv.toString());
          // print(this.oM.mult(this.iM.inv).toString());
          // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
          matrix = dest.oM.inv.mult(this.oM.mult(this.iM.inv));
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      return {
        RR: rr(dest), RP: rp(dest), PP: pp(dest), PR: pr(dest),
      }
    }

    T = this.transformation;


    transformR2R(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "R", dest, "R");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {

        // print(transformationlabel);
        // print(this.oM.toString());
        // print(dest.oM.inv.mult(this.oM).toString());
        matrix = dest.oM.inv.mult(this.oM);
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    //shorthand function name for transformR2R
    tR2R(dest) {
      return this.transformR2R(dest);
    }

    transformR2P(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "R", dest, "P");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {

        // print(transformationlabel);
        // print(this.oM.toString());
        // print(dest.oM.inv.mult(this.oM).toString());
        // print(dest.iM.mult(dest.oM.inv.mult(this.oM)).toString());
        matrix = dest.iM.mult(dest.oM.inv.mult(this.oM));
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    tR2P(dest) {
      return this.transformR2P(dest);
    }


    transformP2P(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "P", dest, "P");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {
        // print(transformationlabel);
        // print(this.iM.inv.toString());
        // print(this.oM.mult(this.iM.inv).toString());
        // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
        // print(dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv))).toString());

        matrix = dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv)));
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    tP2P(dest) {
      return this.transformP2P(dest);
    }

    transformP2R(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "P", dest, "R");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {

        // print(transformationlabel);
        // print(this.iM.inv.toString());
        // print(this.oM.mult(this.iM.inv).toString());
        // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
        matrix = dest.oM.inv.mult(this.oM.mult(this.iM.inv));
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    tP2R(dest) {
      return this.transformP2R(dest);
    }
  }
  // }}}

  function setupCanvas(parentId = 'sketch', bgcolor = "#FFFFFFFF", pixel_density = 2) {//{{{
    mylog("begin setupCanvas()");
    htmlSketch = document.getElementById("defaultCanvas0").parentElement;//document.getElementById(parentId);
    htmlSketch.id = parentId;
    mylog("after htmlSketch");
    // print(htmlSketch);
    // sketchDiv = createDiv();
    // sketchDiv.elt.id = "scaledsketch";
    // sketchDiv.parent(parentId)
    // sketchDiv.elt.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
    // sketchDiv.elt.offsetHeight = htmlSketch.offsetHeight;
    // sketchDiv.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
    // sketchDiv.offsetHeight = htmlSketch.offsetHeight;

    let currentCanvas;
    // currentCanvas = p5Inst.createCanvas(Math.ceil(htmlSketch.offsetHeight * CANVASASPECT), htmlSketch.offsetHeight);
    let [widthRatio, heightRatio] = [0.99, 0.99];
    currentCanvas = p5Inst.createCanvas(Math.ceil(htmlSketch.offsetWidth * widthRatio), Math.ceil(htmlSketch.offsetHeight * heightRatio));
    // switch (deviceType) {
    //   case DEVICETYPES.PC: currentCanvas = p5Inst.createCanvas(Math.ceil(htmlSketch.offsetHeight * CANVASASPECT), htmlSketch.offsetHeight);
    //     break;
    //   case DEVICETYPES.TOUCHDEVICE: currentCanvas = p5Inst.createCanvas(htmlSketch.offsetWidth, htmlSketch.offsetHeight);
    //     break;
    //   default: throw new Error(`Found unknown DeviceType '${deviceType}'}`)
    // }
    mylog("after currentCanvas");
    // currentCanvas.position((htmlSketch.offsetWidth - htmlSketch.offsetHeight * CANVASASPECT) / 2, 0);
    currentCanvas.position(Math.ceil((htmlSketch.offsetWidth * (1 - widthRatio) - htmlSketch.offsetLeft) / 2), Math.ceil((htmlSketch.offsetHeight * (1 - heightRatio) - htmlSketch.offsetTop) / 2));
    // print(htmlSketch.offsetWidth, htmlSketch.offsetHeight);
    mylog("after position");
    //sketchDiv.position(currentCanvas.offsetWidth/2, 0);
    currentCanvas.parent(parentId);
    mylog("after canvas settings");
    // print(sketchDiv);

    currentCanvas.trafoMatrix = new Matrix(new Matrix2D(htmlSketch.offsetWidth, 0, 0, htmlSketch.offsetHeight), [0, 0])

    currentCanvas.coords = function(coordX, coordY) {
      return this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy
    };
    currentCanvas.coordsVec = function(coordX, coordY) {
      return p5Inst.createVector(...this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy, 0)
    };
    currentCanvas.coordsInv = function(pixelX, pixelY) {
      return this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy
    };
    currentCanvas.coordsInvVec = function(pixelX, pixelY) {
      return p5Inst.createVector(...this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy, 0)
    };
    mylog("after trafos");
    addScreenPositionFunction(p5Inst);
    mylog("?");
    currentCanvas.refFrame = Frame.initCanvas();
    mylog("??");
    currentCanvas.__defineGetter__('rF', function() { return this.refFrame; })
    mylog("after rF");
    p5Inst.pixelDensity(pixel_density);
    p5Inst.background(p5Inst.color(1));

    currentCanvas.Rsize = function(cube) { return cube.Rsize(this) }
    mylog("end of setupCanvas()");
    return currentCanvas
  }//}}}
  let allBuffers = {};
  function setupBuffer(label, bufferCoordX, bufferCoordY, bufferCoordWidth, bufferCoordHeight, bgcolor = "#FFFFFFFF", pixel_density = 2) {//{{{

    mylog("begin setupBuffer()");

    let frame = new Frame(label, bufferCoordX, bufferCoordY, bufferCoordWidth, bufferCoordHeight);
    mylog("1");

    let offset = canvasBuffer.rF.P(bufferCoordX, bufferCoordY).xy;
    mylog("2");
    let bufferSize = canvasBuffer.rF.P(bufferCoordWidth, bufferCoordHeight);
    // print(`${label}; bufferSize = ${ bufferSize } `);
    mylog("3");
    mylog(this);
    let buffer = p5Inst.createGraphics(bufferSize.x, bufferSize.y);

    mylog("after buffer");
    // print(buffer.width);
    buffer.trafoMatrix2Canvas = new Matrix(new Matrix2D(buffer.width, 0, 0, buffer.height), offset)
    buffer.trafoMatrix = new Matrix(new Matrix2D(buffer.width, 0, 0, buffer.height), [0, 0])

    buffer.coords = function(coordX, coordY) {
      return this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy
    };
    buffer.coordsVec = function(coordX, coordY) {
      return p5Inst.createVector(...this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy, 0)
    };
    buffer.coordsInv = function(pixelX, pixelY) {
      return this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy
    };
    buffer.coordsInvVec = function(pixelX, pixelY) {
      return p5Inst.createVector(...this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy, 0)
    };
    buffer.coordsCanvas = function(coordX, coordY) {
      return this.trafoMatrix2Canvas.dot(p5Inst.createVector(coordX, coordY, 1)).xy
    };
    buffer.coordsCanvasVec = function(coordX, coordY) {
      return p5Inst.createVector(...this.trafoMatrix2Canvas.dot(p5Inst.createVector(coordX, coordY, 1)).xy, 0)
    };
    buffer.coordsCanvasInv = function(pixelX, pixelY) {
      return this.trafoMatrix2Canvas.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy
    };
    buffer.coordsCanvasInvVec = function(pixelX, pixelY) {
      return p5Inst.createVector(...this.trafoMatrix2Canvas.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy, 0)
    };
    mylog("after coords");
    buffer.drawImage = function(x, y) {
      let pos = (x == undefined && y == undefined) ? this.trafoMatrix2Canvas.b : [x, y];

      p5Inst.image(this, ...pos); this.clear()
    }
    buffer.drawImageUnclear = function(x, y) {
      let pos = (x == undefined && y == undefined) ? this.trafoMatrix2Canvas.b : [x, y];

      p5Inst.image(this, ...pos);
    }
    mylog("draw image");
    addScreenPositionFunction(buffer);

    buffer.refFrame = frame;
    buffer.__defineGetter__('rF', function() { return this.refFrame; })
    buffer.bgcolor = bgcolor;
    buffer.background(p5Inst.color(bgcolor));
    buffer.pixelDensity(pixel_density);
    // the attributes with default values are set by a method
    buffer.setbackground = function(bg = bgcolor) { this.background(bg) }
    buffer.setpixelDensity = function(pd = pixel_density) { buffer.pixel_density(pd) }
    buffer.Rsize = function(cube) { return cube.Rsize(this) }
    mylog("end of setupBuffer()");
    allBuffers[label] = buffer;
    return buffer
  }
  //}}}

  function releaseCanvas(canvas) {
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx && ctx.clearRect(0, 0, 1, 1);
    canvas.remove();
  }

  let bs = [...document.getElementsByTagName("button")].filter(it => it.className == "sc-bTfYFJ fQegFw").filter(it => it.firstChild.classList.length == 4);

  bs.map(it => it.onclick.toString())


  bs.forEach(btn => {
    let code = btn.onclick.toString();
    console.log(code);

    btn.onclick = function() {
      [...document.getElementsByTagName("canvas")].forEach(releaseCanvas);
      console.log("released Canvases")
      allBuffers = {}
    }
  })

  function generateBackgroundImages(cube, cubeStackTranslation, cubeStackBuffers, seesawBoardBufferW) {// {{{

    let TC2S = canvasBuffer.rF.T(cubeStackBuffers.split);
    let bgImgsBufferH = canvasBuffer.rF.Ry(cubeStackSettings.stack.zsizey + 10 * cubeStackSettings.cube.size + (cubeStackBuffers.split.rF.Py(1) - cubeStackTranslation.Split.y));
    // bgImgsBufferH = canvasBuffer.rF.Ry(cubeStackSettings.stack.zsizey + 10 * cubeStackSettings.cube.size + (cubeStackSplit.rF.Py(1) - cubeStackSplitTranslation.y));
    let bgImgsBuffer = setupBuffer("bgImages",
      ...vsub(TC2S.RR.inv(0, 1), p5Inst.createVector(0, bgImgsBufferH)).xy,
      seesawBoardBufferW / 3,
      bgImgsBufferH,
      "#FFF0");
    let bgImgLabels = [
      "bgImg-Split-1", "bgImg-Split-10", "bgImg-Split-100", "bgImg-Split-1000",
      "bgImg-Compact-1", "bgImg-Compact-10", "bgImg-Compact-100", "bgImg-Compact-1000"];
    let bgImgsBase64 = p5Inst.getItem(bgImgsLocalStorageLabel);
    let i = p5Inst.millis();
    // if ()
    if ((bgImgsBase64 == null) || !AppState["USELOCALSTORAGE"]) {
      let splitLabel, c, stack, pos;

      bgImgsBase64 = [];
      for (var label of bgImgLabels) {
        // bgImgsBuffer.setbackground("#1A51");
        splitLabel = label.split("-");
        stack = { type: splitLabel[1], size: parseInt(splitLabel[2]) };
        c = numcubeslike(stack.size, cube, "bgImages");

        pos = vsub(bgImgsBuffer.rF.size, vsub(cubeStackBuffers[splitLabel[1].toLowerCase()].rF.size, cubeStackTranslation[stack.type]));

        bgImgsBuffer.push();
        bgImgsBuffer.translate(pos.x, pos.y);
        drawcubes(bgImgsBuffer, c, stack.size, stack.type == "Compact", true);

        bgImgsBuffer.pop();
        bgImgsBase64.push(bgImgsBuffer.canvas.toDataURL("png"));

        // console.log(bgImgsBuffer.canvas.toDataURL("png"))
        // bgImgsBuffer.save(`${stack.type}-${stack.size}.png`)
        bgImgsBuffer.clear();
      }
      bgImgsBase64 = LZString.compress(bgImgsBase64.join('::'));
      p5Inst.storeItem(bgImgsLocalStorageLabel, bgImgsBase64);

      let f = p5Inst.millis();
      p5Inst.print("timing bgImgs:", f - i);
      // bgImgsBase64.map(it => console.log(it));
    } else {
      p5Inst.print("loaded bgImgs from localStorage");
    }

    bgImgsBase64 = p5Inst.getItem(bgImgsLocalStorageLabel);
    bgImgs = LZString.decompress(bgImgsBase64).split("::").map(x => p5Inst.loadImage(x));

    return [bgImgsBuffer, {
      split: {
        I: bgImgs[0],
        X: bgImgs[1],
        C: bgImgs[2],
        M: bgImgs[3]
      },
      compact: {
        I: bgImgs[4],
        X: bgImgs[5],
        C: bgImgs[6],
        M: bgImgs[7]
      },
    }]
  }// }}}




  //}}}
  // ####################################

  // ####################################
  // Sketch Components {{{

  class weightSlider {// {{{
    constructor(startposition, endposition, value = 0, interactive = true, isSplit = false) {
      this.interactive = interactive;
      this.startposition = startposition;
      this.endposition = endposition;
      this.isSplit = isSplit;
      // this.min = min;
      // this.max = max;
      //@improvement: get() and set() to be able to set the value and get a response from the handle 

      this.value = Array.isArray(value) ? value : [value, value];
      this.length = vdist(p5Inst.createVector(...this.startposition), p5Inst.createVector(...this.endposition));
      let maxcubes = cubeStackSettings.stack.maxNumCubes;
      let maxcubesdigits = decomposeInt(maxcubes)
      this.lengthPerValue = cubeStackSettings.cube.size / 100;

      let numMticks = maxcubesdigits[3] + 1;
      let numCticks = maxcubesdigits[3] * 10 + maxcubesdigits[2] + ((maxcubes % 100 == 0) ? 1 : 0);
      this.ticksY = {
        M: [...Array(numMticks).keys()].map(i => this.startposition[1] - i / (maxcubes / 1000) * this.length),
        C: [...Array(numCticks).keys()].map(i => this.startposition[1] - i / (maxcubes / 100) * this.length),
      }

      this.widthHandle = 1.5 * cubeStackSettings.cube.size
      this.heightHandle = 0.3 * cubeStackSettings.cube.size;
      this.hoverHandle = [false, false];
      this.draggingHandle = [false, false];
      this.pressedOffset = [null, null];

      // on construction the position has to be set by the given value
      // afterwards the value is updated according to the position
      this.handlePosition = this.value.map((it) => { return this.startposition[1] - it * this.lengthPerValue });
      this.snapped = [false, false];
      this.handleTargets();
    }

    handleTargets() {
      return [
        new clickRect(this.startposition[0] - 1.9 * this.widthHandle,
          this.handlePosition[0] - 4 * this.heightHandle,
          (this.widthHandle * 2), this.heightHandle * 10,
          sliderBuffer, "sliderhandlecompact"),
        new clickRect(this.startposition[0] + 0.1 * this.widthHandle,
          this.handlePosition[1] - 4 * this.heightHandle,
          (2 * this.widthHandle), this.heightHandle * 10,
          sliderBuffer, "sliderhandlesplit")];
    }

    _handlePosition(value) {
      if (value == undefined) { value = this.value };
      value = Array.isArray(value) ? value : [value, value];
      return value.map((it) => { return this.startposition[1] - it * this.lengthPerValue });
    }
    //@refactor: copy paste from here :thermometer

    display(buffer) {
      // print(this);
      if (buffer == undefined) { buffer = window };
      // print("Pos:", this.handlePosition);
      // print("value:", this.value);
      buffer.push();
      buffer.strokeWeight(2);
      buffer.stroke(0);
      let x = this.startposition[0];
      let y0 = this.startposition[1];
      buffer.line(...this.startposition, ...this.endposition);
      // 100g-ticks for the
      function show100Ticks(value) {

        if (AppState["CENTERSCALE100TICKSCOMPACT"] == "auto") { return (value < 1000) };
        return AppState["CENTERSCALE100TICKSCOMPACT"]
      }
      for (let [i, y] of this.ticksY.C.entries()) {
        let size = (i % 5 != 0) ? cubeStackSettings.cube.size / 2 : cubeStackSettings.cube.size * 2 / 3;
        buffer.line(x - (show100Ticks(this.value[0]) ? size : 0), y, x + size, y);
      }
      // 1000g/1kg - ticks an labeling on each side
      let textpos = (sign, y) => { return [x + sign * 6.5 * cubeStackSettings.cube.size, y + buffer.textSize() / 3] };
      let textposkg = (sign, y) => { return [x + sign * 2 * cubeStackSettings.cube.size, y + buffer.textSize() / 3] };
      for (let [i, y] of this.ticksY.M.entries()) {
        buffer.push();
        buffer.strokeWeight(3);
        buffer.line(x - cubeStackSettings.cube.size, y, x + cubeStackSettings.cube.size, y);

        buffer.textAlign("right");
        buffer.textSize(16);
        buffer.strokeWeight(0.8);
        if (AppState["CENTERSCALELABELSCOMPACT"]) {
          buffer.text(`${i} kg`, ...textposkg(-1, y));
        }
        buffer.textAlign("right");

        if (AppState["CENTERSCALELABELSSPLIT"]) {
          buffer.text(`${i * 1000} g`, ...textpos(1, y));
        }
        buffer.pop();
      }

      if (this.interactive) {
        buffer.push();


        buffer.translate(0, this.heightHandle * 0.75);
        // buffer.push();
        buffer.fill("#DDD");
        buffer.stroke("#DDD");
        //left handle
        buffer.rect(
          this.startposition[0] - this.widthHandle,
          this.handlePosition[0] - this.heightHandle,
          (this.widthHandle), this.heightHandle);

        //right handle
        buffer.rect(
          this.startposition[0],
          this.handlePosition[1] - this.heightHandle,
          (this.widthHandle), this.heightHandle);
        // buffer.push();
        // buffer.scale(0.25);
        // buffer.image(gaugeImg, this.startposition[0] - this.widthHandle / 2, this.handlePosition - this.heightHandle / 2);
        // buffer.pop();
        let thermometerwidth = 0.875;
        let thermometeralpha = "AA";

        let fillColor = colors_blues.get("base");
        let strokeColor = colors_blues.get("base");
        let fillColorAlpha = fillColor + thermometeralpha;
        let strokeColorAlpha = strokeColor + thermometeralpha;



        buffer.fill(fillColorAlpha);
        buffer.stroke(strokeColorAlpha);
        // buffer.noStroke();
        // x,y: (top, left)-corner
        buffer.rect(
          this.startposition[0] - this.widthHandle,
          this.handlePosition[0] - this.heightHandle,
          thermometerwidth * (this.widthHandle), this.startposition[1] - this.handlePosition[0] - 0.5 * this.heightHandle);
        buffer.fill(fillColor);
        buffer.stroke(strokeColor);

        buffer.rect(
          this.startposition[0] - this.widthHandle,
          this.handlePosition[0] - this.heightHandle / 2,
          thermometerwidth * (this.widthHandle), this.heightHandle);


        fillColor = colors_greens.get("base");
        strokeColor = colors_greens.get("base");
        fillColorAlpha = fillColor + thermometeralpha;
        strokeColorAlpha = strokeColor + thermometeralpha;


        buffer.fill(fillColorAlpha);
        buffer.stroke(strokeColorAlpha);
        // buffer.noStroke();

        buffer.rect(
          this.startposition[0] + (1 - thermometerwidth) * this.widthHandle,
          this.handlePosition[1] - this.heightHandle,
          thermometerwidth * (this.widthHandle), this.startposition[1] - this.handlePosition[1] - 0.5 * this.heightHandle);

        buffer.fill(fillColor);
        buffer.stroke(strokeColor);

        buffer.rect(
          this.startposition[0] + (1 - thermometerwidth) * this.widthHandle,
          this.handlePosition[1] - this.heightHandle / 2,
          thermometerwidth * (this.widthHandle), this.heightHandle
        );


        buffer.pop();
      }
      // this.handleTargets();
      // let t1 = Clickable.allClickables.get("sliderhandlesplit");
      // let t2 = Clickable.allClickables.get("sliderhandlecompact");
      // buffer.fill("#DDD9")
      // buffer.rect(t1.x, t1.y, t1.width, t1.height);
      // buffer.rect(t2.x, t2.y, t2.width, t2.height);
      buffer.pop();

    }

    updateValue() {

      // p5Inst.print("value:", this.value);
      let tmp = this.handlePosition.map((it) => { return floor((this.startposition[1] - it) / this.lengthPerValue) });
      tmp = tmp.map((it) => { return (it % 10 != 0) ? it + 1 : it });
      let onesplace = tmp.map((it) => decomposeInt(it)[0]);

      let fixed = (onesplace < 5) ? tmp - onesplace : tmp + (10 - onesplace);
      this.value = tmp;
      // print("updateValue:", tmp, onesplace, fixed);
      for (var i in this.value) {
        if (this.snapped[i] && onesplace[i] == 9) {
          this.value[i] = tmp[i] + 1
        }
      }
      // if (!this.isSplit) this.value = [this.value[0], this.value[0]];
      this.snapped = [false, false];
      // p5Inst.print(this.value);
    }

    mousePressed(buffer) {
      let mouse = buffer.coordsVec(...buffer.coordsCanvasInv(p5Inst.mouseX, p5Inst.mouseY))
      let hoverHandle = [null, null];
      let targetWidth = this.widthHandle * 0.75 * ((this.isSplit) ? 1 : 2);
      debugprint(this.widthHandle / 2, targetWidth);
      for (var i in this.handlePosition) {

        let targetPos = buffer.coordsCanvas(...buffer.coordsInv(this.startposition[0] - ((-1) ** i) * this.widthHandle * 0.75, this.handlePosition[i]))
        hoverHandle[i] = p5Inst.collidePointCircle(p5Inst.mouseX, p5Inst.mouseY,
          ...buffer.coordsCanvas(...targetPos, targetWidth));
        // p5Inst.circle(...targetPos, targetWidth * 2);
      }
      // let hoverHandle = this.handlePosition.map((it) => {
      // return collidePointCircle(mouseX, mouseY,
      // ...buffer.coordsCanvas(...buffer.coordsInv(this.startposition[0], it)), this.widthHandle/2)
      // });

      debugprint(mouse);
      debugprint(hoverHandle);

      this.handleTargets().forEach((it, i) => {
        if (it.isClicked) {
          this.draggingHandle[i] = true;
          this.pressedOffset[i] = p5Inst.createVector(mouse.x - this.startposition[0], mouse.y - this.handlePosition[i]);
        }
      })

      // for (var i in hoverHandle) {
      //   if (hoverHandle[i]) {
      //     this.draggingHandle[i] = true;
      //     this.pressedOffset[i] = p5Inst.createVector(mouse.x - this.startposition[0], mouse.y - this.handlePosition[i]);
      //   }
      // }
      return any(this.handleTargets().map(it => it.isClicked))//hoverHandle)

    }

    mouseDragged(buffer) {
      let mouse = buffer.coordsVec(...buffer.coordsCanvasInv(p5Inst.mouseX, p5Inst.mouseY))
      for (var i in this.draggingHandle) {
        if (this.draggingHandle[i]) {
          this.handlePosition[i] = max(min(mouse.y - this.pressedOffset[i].y, this.startposition[1]), this.endposition[1]);

          if (!this.isSplit) this.handlePosition = [this.handlePosition[i], this.handlePosition[i]];
          this.updateValue();
        }
      }

    }

    mouseReleased(buffer) {
      this.handleTargets();
      //sorting is not really necessary, there should never be two left after filterring
      let nearbyMs = this.handlePosition.map((it) => {
        return ([...this.ticksY.M.entries()]).map(([k, v]) => [k, abs(v - it)]).filter(([k, v]) => v < 4).sort((f, s) => f[1] - s[1])
      });

      // print(nearbyMs);
      for (var i in nearbyMs) {
        if (nearbyMs[i].length > 0) {
          // print(this.value, this.handlePosition);

          this.handlePosition[i] = this.ticksY.M[nearbyMs[i][0][0]];
          this.snapped[i] = true;
          this.updateValue();
          // print(this.value, this.handlePosition);
        }
      }

      let nearbyCs = this.handlePosition.map((it) => {
        return [...this.ticksY.C.entries()].map(([k, v]) => [k, abs(v - it)]).filter(([k, v]) => v < 4).sort((f, s) => f[1] - s[1])
      });

      // print(nearbyMs);
      for (var i in nearbyCs) {
        if (nearbyCs[i].length > 0) {
          // print(this.value, this.handlePosition);

          this.handlePosition[i] = this.ticksY.C[nearbyCs[i][0][0]];
          this.snapped[i] = true;
          this.updateValue();
          // print(this.value, this.handlePosition);
        }
      }

      this.draggingHandle = [false, false];
    }


  }// }}}

  //@refactor: add functions for the different App modes here, like the drawers in stack mode etc


  function drawerHandle(side, open) {
    let blockDrawer = blockDrawerBuffers[side];
    let TBD2C = blockDrawer.rF.T(canvasBuffer);
    let anglesRight = [0, -2 * Math.PI / 3, -4 * Math.PI / 3];
    let anglesLeft = [Math.PI, Math.PI / 3, -1 * Math.PI / 3];
    let m;
    let angles = anglesLeft;
    if ((side == "split" && open) || (side == "compact" && !open)) {
      angles = anglesRight;
    }


    if (open) {
      p5Inst.push();
      p5Inst.noStroke();
      p5Inst.rectMode(p5Inst.CORNERS);
      p5Inst.fill("#AAA");
      let cup, clow, mid;
      if (side == "compact") {
        cup = TBD2C.PP(blockDrawer.rF.P(0.9925, 0));
        clow = vadd(cup, p5Inst.createVector(50, 50));
        mid = vadd(cup, p5Inst.createVector(25, 25));
        let target = new clickRect(...cup.xy, 50, 50, null, "drawerhandlecompact");
        // let [w, h] = [blockDrawer.rF.Dx(posx[side] + Math.sign(posx[side]) * 0.25, posx[side]), blockDrawer.rF.Dy(0, 0.05)];
      } else if (side == "split") {
        cup = vadd(TBD2C.PP(blockDrawer.rF.P(0.015, 0)), p5Inst.createVector(canvasBuffer.width - blockDrawer.width, 0));

        clow = vsub(cup, p5Inst.createVector(50, -50));
        mid = vsub(cup, p5Inst.createVector(25, -25));
        let target = new clickRect(...clow.xy, 50, -50, null, "drawerhandlesplit");

      } else {
        throw new Error("side has to be 'split' or 'compact'")
      }
      p5Inst.rect(...cup.xy, ...clow.xy);
      p5Inst.fill("#000");
      p5Inst.circle(...mid.xy, 10);
      p5Inst.triangle(...angles.map(phi => pointOnCircle(mid, 15, phi).xy).flat());
      p5Inst.pop();

    } else {
      p5Inst.push();
      p5Inst.noStroke();
      p5Inst.rectMode(p5Inst.CORNERS);
      p5Inst.fill("#AAA");
      let cup, clow, mid;
      if (side == "compact") {
        cup = canvasBuffer.rF.P(0, 0);
        clow = vadd(cup, p5Inst.createVector(50, 50));
        mid = vadd(cup, p5Inst.createVector(25, 25));
        let target = new clickRect(...cup.xy, 50, 50, null, "drawerhandlecompact");
        // let [w, h] = [blockDrawer.rF.Dx(posx[side] + Math.sign(posx[side]) * 0.25, posx[side]), blockDrawer.rF.Dy(0, 0.05)];
      } else if (side == "split") {
        cup = canvasBuffer.rF.P(1, 0);

        clow = vsub(cup, p5Inst.createVector(50, -50));
        mid = vsub(cup, p5Inst.createVector(25, -25));
        let target = new clickRect(...clow.xy, 50, -50, null, "drawerhandlesplit");

      } else {
        throw new Error("side has to be 'split' or 'compact'")
      }
      p5Inst.rect(...cup.xy, ...clow.xy);
      p5Inst.fill("#000");
      p5Inst.circle(...mid.xy, 10);
      p5Inst.triangle(...angles.map(phi => pointOnCircle(mid, 15, phi).xy).flat());
      p5Inst.pop();

    }



    // let bboxcenters;
    // switch (deviceType) {
    //   case DEVICETYPES.TOUCHDEVICE:
    //     bboxcenters = { "M": [0.40, 0.5], "C": [0.51, 0.74], "X": [0.69, 0.65], "I": [0.25, 0.65] };
    //     break;

    //   case DEVICETYPES.PC:
    //   default:
    //     bboxcenters = { "M": [0.1, 0.5], "C": [0.1, 0.74], "X": [0.2, 0.65], "I": [-0.2, 0.65] };


  }

  let drawerscale = 0.25;
  let blockX;
  let blockY;
  let pos;
  let img;

  function drawblockDrawer(side) {


    let blockDrawer = blockDrawerBuffers[side];
    let TC2BD = canvasBuffer.rF.T(blockDrawer);
    blockDrawer.push();

    let imgwidth = bgImgs[side].I.width;
    let imgheight = bgImgs[side].I.height;
    let trimedImage = [0, 0, imgwidth, imgheight];
    // @improvement: URLParam: rightblocks=Supset{"IXCM"} => show only those blocks
    let blocks = allowedBlocksBySide[side];//["I", "X", "C", "M"];

    let yskip = 1 / blocks.length * 1 / drawerscale;
    let ystart = 1 / (2 * blocks.length) * 1 / drawerscale;
    let centers = [...Array(blocks.length).keys()].map(it => yskip * it + ystart);
    // let Mskip = 0.125;

    // switch (blocks.length) {
    //   case 4:
    //     blockY = [0, 0.20, 0.40, 0.6 + Mskip].map(it => it * 2.5);
    //     break;
    //   case 3:
    //     blockY = [0.1, 0.35, 0.6 + ((blocks[blocks.length - 1] == "M") ? Mskip : 0)].map(it => it * 2.5);
    //     break;
    //   case 2:
    //     blockY = [0.15, 0.50 + ((blocks[blocks.length - 1] == "M") ? Mskip : 0)].map(it => it * 2.5);
    //     break;
    //   case 1:
    //     blockY = [0.5].map(it => it * 2.5);
    //     break;
    //   default:
    // }



    blockDrawer.scale(drawerscale);
    blockDrawer.stroke("#FFF0");
    blockDrawer.fill("#FFF0");
    // centers.forEach((it, i) => {
    //   blockDrawer.circle(...blockDrawer.rF.P(0.5 / drawerscale, it).xy, 100);
    // });

    function drawblock(block, i) {

      let bboxcenters = { "M": [0.40, 0.5], "C": [0.51, 0.74], "X": [0.69, 0.65], "I": [0.25, 0.65] };

      img = bgImgs[side][block].get(...trimedImage);
      // let blockX = ((side == 'split') ? 0.3 : 0);

      // blockX = abs(0.5 - (TC2BD.RP.inv(bboxscenter[block][0] * img.width, 0).x)) / drawerscale - 0.45 / drawerscale;

      blockX = (0.5 - (TC2BD.RP.inv(bboxcenters[block][0] / drawerscale * img.width, 0).x - TC2BD.RP.inv(0, 0).x));
      blockY = centers[i] - TC2BD.RP.inv(0, bboxcenters[block][1] * img.height).y;
      // blockX = 0;
      // blockY = yskip * i * 2 + 0.55;

      pos = blockDrawer.rF.P(blockX, blockY);
      // blockDrawer.circle(...pos.xy, 30);

      // var posHover = blockDrawer.rF.P(blockX, blockY[i] + 0.1 * ((block != 'M') ? i : 0));

      // blockDrawer.rect(...posHover.xy, blockDrawer.width * 2, img.height);
      let clickTarget = new clickRect(pos.xy[0] * drawerscale, pos.xy[1] * drawerscale, imgwidth * drawerscale, imgheight * drawerscale, blockDrawer, `${side}${block}`);
      blockDrawer.rect(...clickTarget.rect.map(it => it / drawerscale));
      blockDrawer.image(img, ...pos.xy);
    }


    if (drawBlocksInDrawer[side]) {
      if (p5Inst.frameCount > 2) drawBlocksInDrawer[side] = false;
      blockDrawer.setbackground();
      blocks.forEach(drawblock);

    }
    blockDrawer.pop();
  }
  // }}}
  // ####################################

  // ####################################
  // Settings {{{



  blockAmounts = {// {{{
    "Sample.I": { compact: undefined, numcubes: 1 },
    "Sample.X": { compact: false, numcubes: 10 },
    "Sample.STICK": { compact: true, numcubes: 10 },
    "Sample.C": { compact: false, numcubes: 100 },
    "Sample.PLATE": { compact: true, numcubes: 100 },
    "Sample.M": { compact: false, numcubes: 1000 },
    "Sample.BIG": { compact: true, numcubes: 1000 }
  }// }}}

  let seesawSettings = {// {{{
    board: {
      scaleXYZ: [
        60, //* 15 / cubeStackSettings.cube.size,
        2, /// cubeStackSettings.cube.size,
        11 /// cubeStackSettings.cube.size,
      ],
      color: undefined
    },
    boardBoth: {
      scaleXYZ: [
        40, //* 15 / cubeStackSettings.cube.size,
        2, /// cubeStackSettings.cube.size,
        11 /// cubeStackSettings.cube.size,
      ],
      color: undefined
    },
    boardSingle: {
      scaleXYZ: [
        18, //* 15 / cubeStackSettings.cube.size,
        2, /// cubeStackSettings.cube.size,
        11 /// cubeStackSettings.cube.size,
      ],
      color: undefined
    }
  }// }}}

  let sliderSettings = {// {{{
    slider: {

    },

    background: {
      scaleXYZ: [80, 2, 15],
      color: seesawSettings.board.color,
    }
  }// }}}

  const AppModes = {
    SLIDERSINGLE: 1 << 0,          // both sliders are connected and both stacks are allways of the same height
    SLIDERSPLIT: 1 << 1,           // both slider are independent of each other
    STACKINGBARS: 1 << 2,          // the 'thermometer'bars are displayed on the center scale
    STACKINGNOBARS: 1 << 3,        // the 'thermometer'bars are not displayed
    STACKINGNOSCALE: 1 << 4,      // the center scale is not displayed
    STACKINGONLYBOTH: 1 << 5,     // no other features but stacking, both stacks are shown
    STACKINGONLYSPLIT: 1 << 6,    // no other features but stacking, only the g stack is shown
    STACKINGONLYCOMPACT: 1 << 7, // no other features but stacking, only the kg stack is shown
  }
  function excludeAppModes(...excluded) {
    let numModes = Object.entries(AppModes).length;
    let allModes = (1 << numModes) - 1;
    return allModes ^ excluded.reduce((prev, cur) => { return prev ^ cur })
  }
  // collections of Modes
  // any of the slider modes
  AppModes.SLIDER = AppModes.SLIDERSINGLE ^ AppModes.SLIDERSPLIT;
  AppModes.STACKING = excludeAppModes(AppModes.SLIDERSINGLE, AppModes.SLIDERSPLIT);
  // no other features but stacking
  AppModes.STACKINGONLY = AppModes.STACKINGONLYBOTH ^ AppModes.STACKINGONLYSPLIT ^ AppModes.STACKINGONLYCOMPACT;


  let AppMode;
  // }}}
  // ####################################

  // ####################################
  // Sketch functions

  function getFromParams_num(defaultValue) {
    if (params.num != undefined) {
      if (params.num == "random") {

        debugprint("1");
        return parseInt(p5Inst.random(0, cubeStackSettings.stack.maxNumCubes));
      }
      debugprint("2");
      return parseInt(params.num)
    }
    debugprint("3");
    return defaultValue
  }


  mylog("end lib.js");
  //end: lib.js

  function validOption(configkey, validOptions) {
    let isValid = validOptions.includes(initialConfig[configkey])
    if (!isValid) console.warn(`Thie configkey '${configkey}' is set to '${initialConfig[configkey]}' but only [${validOptions}] are valid.`);
    return isValid
  }

  //p5Inst.sendDivomathResult({ RESULT: 50 });
  p5Inst.preload = function() {
    mylog("begin preload()");
    if (!validOption("nocache", [true, false])) initialConfig.nocache = false;
    if (!validOption("digitalscaleKG", [true, false, "integer", "decimal"])) initialConfig.digitalscaleKG = true;
    if (!validOption("digitalscaleG", [true, false])) initialConfig.digitalscaleG = true;
    if (!initialConfig.lockseesaw) initialConfig.lockseesaw = false;
    if (!validOption("scaleKG100Ticks", [true, false, "auto"])) initialConfig.scaleKG100Ticks = true;
    if (!validOption("scaleKGLabels", [true, false])) initialConfig.scaleKGLabels = true;
    if (!validOption("scaleGLabels", [true, false])) initialConfig.scaleGLabels = true;
    switch (initialConfig.mode) {
      case "stacking":
        AppMode = AppModes.STACKINGNOSCALE;
        if (initialConfig.centerscale) {
          AppMode = AppModes.STACKINGNOBARS;
          if (initialConfig.barsonscale) AppMode = AppModes.STACKINGBARS;
        }
        if (initialConfig.onlystacking) {
          switch (initialConfig.onlystacking) {

            case 'KG': AppMode = AppModes.STACKINGONLYCOMPACT;
              initialConfig.digitalscaleG = false;
              break;
            case 'G': AppMode = AppModes.STACKINGONLYSPLIT;
              initialConfig.digitalscaleKG = false;
              break;
            case 'both':
            default: AppMode = AppModes.STACKINGONLYBOTH;
          }
        }
        break;
      case "slider":
      default:
        AppMode = AppModes.SLIDERSINGLE;
        if (initialConfig.splitslider) AppMode = AppModes.SLIDERSPLIT;
    }
    function config2SettingIfPresent(config, setting, totype) {
      if (totype == undefined) { totype = (arg) => arg }
      if (initialConfig[config] != undefined) { AppState[setting] = totype(initialConfig[config]) }
    }


    // if (initialConfig.ticksmodeKG) { AppSettings.CENTERSCALE100TICKSCOMPACT = initialConfig.ticksmodeKG };
    config2SettingIfPresent("edgewidth1000cubeKG", "EDGEWIDTH1000CUBEKG", (arg) => parseFloat(arg))
    config2SettingIfPresent("edgewidth1000cubeG", "EDGEWIDTH1000CUBEG", (arg) => parseFloat(arg))
    stackingMode = !!(AppModes.STACKING & AppMode);
    if (!isResumed) {
      AppState["LOCKSEESAW"] = (AppMode & AppModes.STACKINGONLY) ? true : (initialConfig.lockseesaw);
      AppState["USELOCALSTORAGE"] = !initialConfig.nocache;

      AppState["NUMCUBES.SPLIT"] = initialConfig.numofcubesG;
      if ((AppMode & AppModes.SLIDER) || (initialConfig.numofcubesG == undefined)) {
        AppState["NUMCUBES.SPLIT"] = (initialConfig.numofcubes != undefined) ? initialConfig.numofcubes : 0;
      }

      AppState["NUMCUBES.COMPACT"] = initialConfig.numofcubesKG;
      if ((AppMode & AppModes.SLIDER) || (initialConfig.numofcubesKG == undefined)) {
        AppState["NUMCUBES.COMPACT"] = (initialConfig.numofcubes != undefined) ? initialConfig.numofcubes : 0;
      }

      AppState["CENTERSCALE100TICKSCOMPACT"] = initialConfig.scaleKG100Ticks;
      AppState["CENTERSCALELABELSCOMPACT"] = initialConfig.scaleKGLabels;
      AppState["CENTERSCALELABELSSPLIT"] = initialConfig.scaleGLabels;

      AppState["DISPLAYSPLITSCALE"] = initialConfig.digitalscaleG;
      AppState["DISPLAYCOMPACTSCALE"] = (initialConfig.digitalscaleKG != false);
      AppState["COMPACTSCALEMODEFIXED"] = (initialConfig.digitalscaleKG != true)
      if (AppState["COMPACTSCALEMODEFIXED"]) {
        AppState["COMPACTSCALEMODEINTEGER"] = (initialConfig.digitalscaleKG == "integer");
      }
    }
    console.log("AppMode", AppMode);
    mylog("end preload()");

  };

  p5Inst.setup = function() {

    mylog("begin setup()");
    // just a heuristic method using the width and height of the canvas
    //let c = p5Inst.newCanvas()

    p5Inst.randomSeed(123456789);
    // Set global variables
    CANVASASPECT = outerWidth / outerHeight;
    DEBUGFUNCS = [];
    SEESAWANGLE = 0;// p5Inst.TAU*0.01;

    //canvas and debug buffer
    mylog("Before Canvas");
    canvasBuffer = setupCanvas();
    mylog("After Canvas");
    debugbuffer = setupBuffer("debug", 0, 0, 1, 1, "#FFF0");

    // @improvement: a single settings object should surfice
    CUBESIZE = 10;
    MAXNUMCUBES = canvasBuffer.height * 0.8 / CUBESIZE / 10;//floor(((0.85 - (0.01 + 2 * canvasBuffer.Rsize(cube).xy.y)) / canvasBuffer.Rsize(cube).xy.y)) * 100;
    MAXNUMCUBES = (floor(MAXNUMCUBES) + (((MAXNUMCUBES - floor(MAXNUMCUBES)) > 0.5) ? 0.5 : 0)) * 1000;//floor(((0.85 - (0.01 + 2 * canvasBuffer.Rsize(cube).xy.y)) / canvasBuffer.Rsize(cube).xy.y)) * 100;


    cubeStackSettings = getCubeStackSettings(CUBESIZE, 0.5, p5Inst.TAU / 8, MAXNUMCUBES);

    // Set the Component setting
    seesawSettings.board.color = p5Inst.color(colors_birch.get("dark"));//color("#999");




    AppState["BLOCKDRAWERS.SPLITISOPEN"] = !!(AppMode & (AppModes.STACKINGONLYSPLIT ^ AppModes.STACKINGONLYBOTH));
    AppState["BLOCKDRAWERS.COMPACTISOPEN"] = !!(AppMode & (AppModes.STACKINGONLYCOMPACT ^ AppModes.STACKINGONLYBOTH));
    mylog("begin setup of cubes");
    // The 'model' cube
    cube = new Cube2D(p5Inst.createVector(0, 0), cubeStackSettings.cube, "modelCube");
    //ZEROVECTOR = p5Inst.createVector(0, 0);
    MODELXCUBE = new Cube2D(p5Inst.createVector(0, 0), cubeStackSettings.cube, "Xcube");;
    MODELXCUBE.rescale(10, 1, 1);
    mylog("end setup of cubes");
    mylog("begin setup of buffers");

    // Setup of the buffers


    // copy/paste: relative height of the front pivot, marking the maximum for the last tick on the scale :SCALELIMIT:


    // using media query to improve upon the device size heuristic doesnot work on firefox !!! WTF
    // let isTouchInput = !!(window.matchMedia("(any-hover: none)").matches);
    // let isTouchInput = !!(window.matchMedia("(any-hover: none)").matches);
    // if (isTouchInput) {
    //   deviceType = DEVICETYPES.TOUCHDEVICE
    // } else {
    //   deviceType = DEVICETYPES.PC
    // }
    deviceType = DEVICETYPES.TOUCHDEVICE
    p5Inst.print("deviceType:", deviceType, canvasBuffer.width, canvasBuffer.height);
    let bgcolor;
    debugbuffer = setupBuffer("debug", 0, 0, 1, 1, bgcolor = "#FFF0");

    mylog("after canvas buffer");


    function seesawBoardBufferSetup(seesawBoardScaling, label) {// {{{
      // console.log("AppMode: Stackingonly{split,compact}");
      let seesawboard = new Cube2D(p5Inst.createVector(0, 0), cubeStackSettings.cube, "seesawBoard");
      // seesawboard.rescale(...seesawSettings.boardSingle.scaleXYZ);
      seesawboard.rescale(...seesawBoardScaling);
      seesawboard.color = seesawSettings.board.color;
      // Setup of the buffers
      // p5Inst.print("scaling (single):", seesawSettings.boardSingle.scaleXYZ);


      // the seesaw components
      let seesawBoardBufferW = (
        canvasBuffer.Rsize(seesawboard).xy.x
        + canvasBuffer.Rsize(seesawboard).zxy.x
        * 1.15);

      // Height
      let seesawBoardBufferH = abs(
        canvasBuffer.Rsize(seesawboard).xy.y
        + canvasBuffer.Rsize(seesawboard).zxy.y
        * 2.15);

      let seesawBoardBuffersOffset = p5Inst.createVector(
        0.5 - seesawBoardBufferW / 2, 0.8
      );


      seesawBoardBuffer = setupBuffer("seesawBoard" + label,
        seesawBoardBuffersOffset.x, seesawBoardBuffersOffset.y - seesawBoardBufferH * 8,
        seesawBoardBufferW,
        seesawBoardBufferH * 9,
        bgcolor = "#FFF0");

      return [seesawBoardBuffer, seesawBoardBufferW, seesawboard]
    }// }}}

    // the seesaw components and The cube stacks


    // setup base seesaw for pregeneration of images
    let [base_seesawBoardBuffer, base_seesawBoardBufferW, base_seesawboard] = seesawBoardBufferSetup(seesawSettings.board.scaleXYZ, "-base");
    //cube stack settings 
    let base_Rxy = [2 / 3, 0];
    let base_stackWidthG = 1 / 3;
    let base_stackWidthKG = 1 / 3;

    let Rxy, stackWidthKG, stackWidthG;

    if (AppMode & (AppModes.STACKINGONLYSPLIT ^ AppModes.STACKINGONLYCOMPACT)) {
      [seesawBoardBuffer, seesawBoardBufferW, seesawboard] = seesawBoardBufferSetup(seesawSettings.boardSingle.scaleXYZ, "")
      //cube stack settings 
      Rxy = [0, 0];
      stackWidthG = 1;
      stackWidthKG = 1;
    } else if (AppMode & AppModes.STACKINGONLYBOTH) {
      [seesawBoardBuffer, seesawBoardBufferW, seesawboard] = seesawBoardBufferSetup(seesawSettings.boardBoth.scaleXYZ, "")
      //cube stack settings 
      Rxy = [375 / 729, 0];
      stackWidthG = 1 / 2;
      stackWidthKG = 1;
    } else {
      [seesawBoardBuffer, seesawBoardBufferW, seesawboard] = seesawBoardBufferSetup(seesawSettings.board.scaleXYZ, "");
      //cube stack settings 
      Rxy = base_Rxy;//[2 / 3, 0];
      stackWidthG = base_stackWidthG;// 1 / 3;
      stackWidthKG = base_stackWidthKG;// 1 / 3;
    }
    function seesawPivotSetup(canvasBuffer, seesawBoardBuffer, seesawboard, label) {
      let seesawPivotBufferW = (
        canvasBuffer.Rsize(seesawboard).xy.x
        + canvasBuffer.Rsize(seesawboard).zxy.x
        * 1.15) * 25 / 60;

      let seesawPivotBuffersOffset = p5Inst.createVector(
        seesawBoardBuffer.rF.T(canvasBuffer).RR(0.5, 0).x - seesawPivotBufferW / 2
        , 0
      );

      seesawPivotFrontBuffer = setupBuffer("seesawPivotFront" + label,
        ...seesawPivotBuffersOffset.xy,
        seesawPivotBufferW,
        cubeStackSettings.buffers.canvasRelativeHeight,
        bgcolor = "#FFF0");

      seesawPivotBackBuffer = setupBuffer("seesawPivotBack" + label,
        ...seesawPivotBuffersOffset.xy,
        seesawPivotBufferW,
        cubeStackSettings.buffers.canvasRelativeHeight,
        bgcolor = "#FFF0");

      return [seesawPivotFrontBuffer, seesawPivotBackBuffer, seesawPivotBufferW, seesawPivotBuffersOffset]
    }


    // cubestack Buffers
    function cubeStackBuffersSetup(canvasBuffer, seesawBoardBuffer, seesawBoardBufferW, Rxy, stackWidthScales, label) {// {{{
      let [stackWidthG, stackWidthKG] = stackWidthScales;
      cubeStackCompact = setupBuffer("cubeStackCompact" + label,
        seesawBoardBuffer.rF.T(canvasBuffer).RR(0, 0).x,
        0,
        seesawBoardBufferW * stackWidthKG,// / 3,
        seesawBoardBuffer.rF.T(canvasBuffer).RR(0, 1).y,
        bgcolor = "#FFF0");

      cubeStackSplit = setupBuffer("cubeStackSplit" + label,
        seesawBoardBuffer.rF.T(canvasBuffer).RR(...Rxy).x,
        0,
        seesawBoardBufferW * stackWidthG,// / 3,
        seesawBoardBuffer.rF.T(canvasBuffer).RR(0, 1).y,
        bgcolor = "#FFF0");

      return {
        split: cubeStackSplit,
        compact: cubeStackCompact
      }
    }// }}}
    let [base_seesawPivotFrontBuffer,
      base_seesawPivotBackBuffer,
      base_seesawPivotBufferW,
      base_seesawPivotBuffersOffset] = seesawPivotSetup(canvasBuffer, base_seesawBoardBuffer, base_seesawboard, "-base")

    let base_cubeStackBuffers = cubeStackBuffersSetup(canvasBuffer, base_seesawBoardBuffer, base_seesawBoardBufferW, base_Rxy, [base_stackWidthG, base_stackWidthKG], "-base");

    [seesawPivotFrontBuffer,
      seesawPivotBackBuffer,
      seesawPivotBufferW,
      seesawPivotBuffersOffset] = seesawPivotSetup(canvasBuffer, seesawBoardBuffer, seesawboard, "")

    cubeStackBuffers = cubeStackBuffersSetup(canvasBuffer, seesawBoardBuffer, seesawBoardBufferW, Rxy, [stackWidthG, stackWidthKG], "");

    cubeStackSplit = cubeStackBuffers.split;
    cubeStackCompact = cubeStackBuffers.compact;
    // 'real' center of the front verticies
    let seesawBoardFrontCenter = (seesawboard.vertices.FRONT.reduce((p, c) => {
      return vadd(p, c)
    }).mult(0.25)).add(seesawBoardBuffer.rF.P(0, 1));
    // moved to the buffer center
    seesawBoardCenter = p5Inst.createVector(seesawBoardBuffer.rF.Px(0.5), seesawBoardFrontCenter.y);
    seesawBoardTranslation = seesawBoardBuffer.rF.P(0.005, 0.99);

    let base_seesawBoardTranslation = base_seesawBoardBuffer.rF.P(0.005, 0.99);

    // cubes = numcubeslike(numcubes, cube);
    cubesCompact = numcubeslike(cubeStackSettings.stack.maxNumCubes, cube, "compact");
    cubesSplit = numcubeslike(cubeStackSettings.stack.maxNumCubes, cube, "split");
    mylog("canvas Trafos");
    //Trafo-Objects Canvas > Buffer 
    TC2S = canvasBuffer.rF.T(cubeStackSplit);
    TC2C = canvasBuffer.rF.T(cubeStackCompact);
    TC2SB = canvasBuffer.rF.T(seesawBoardBuffer);
    TC2SPB = canvasBuffer.rF.T(seesawPivotBackBuffer);
    TC2SPF = canvasBuffer.rF.T(seesawPivotFrontBuffer);


    //}}}

    // let bgImgscubeStackTranslation = cubeStackTranslation;

    // if (AppMode & (AppModes.STACKINGONLYSPLIT ^ AppModes.STACKINGONLYCOMPACT)) {
    // }

    // let bgImgsBufferH;
    // console.log("Before");
    // if (AppMode & (AppModes.STACKINGONLYSPLIT ^ AppModes.STACKINGONLYCOMPACT)) {// {{{
    //   console.log("first");
    //   console.log("AppMode: Stackingonly{split,compact}");
    //   cubeStackTranslation = {
    //     Compact: TSB2C.PP(...vsub(vadd(seesawboard.vertices.FRONT[3], seesawBoardTranslation),
    //       p5Inst.createVector(-2 * cubeStackSettings.stack.zsizex, cubeStackSettings.stack.zsizey)).xy),
    //     Split: TSB2S.PP(...vsub(vadd(seesawboard.vertices.FRONT[3], seesawBoardTranslation),
    //       p5Inst.createVector(-2 * cubeStackSettings.stack.zsizex, cubeStackSettings.stack.zsizey)).xy)
    //   }
    //   cubeStackSplitTranslation = cubeStackTranslation.Split;//TSB2S.PP(...vsub(vadd(seesawboard.vertices.FRONT[2], seesawBoardTranslation), p5Inst.createVector(cubeStackSettings.stack.size, cubeStackSettings.stack.zsizey)).xy);
    //   cubeStackCompactTranslation = cubeStackTranslation.Compact; //TSB2C.PP(...vsub(vadd(seesawboard.vertices.FRONT[3], seesawBoardTranslation), p5Inst.createVector(-2 * cubeStackSettings.stack.zsizex, cubeStackSettings.stack.zsizey)).xy);
    //   bgImgsBufferH = canvasBuffer.rF.Ry(cubeStackSettings.stack.zsizey + 10 * cubeStackSettings.cube.size + (cubeStackSplit.rF.Py(1) - cubeStackSplitTranslation.y));
    //   console.log("AppMode: Stackingonly{split,compact}");
    //   bgImgsBuffer = setupBuffer("bgImages",
    //     ...vsub(TC2S.RR.inv(0, 1), p5Inst.createVector(0, bgImgsBufferH)).xy,
    //     seesawBoardBufferW,
    //     bgImgsBufferH,
    //     bgcolor = "#FFF0");
    // } else {
    function cubeStackTranslationSetup(cubeStackBuffers, seesawBoardBuffer, seesawboard, seesawBoardTranslation) {
      let TSB2S = seesawBoardBuffer.rF.T(cubeStackBuffers.split);
      let TSB2C = seesawBoardBuffer.rF.T(cubeStackBuffers.compact);
      return {
        Compact: TSB2C.PP(...vsub(vadd(seesawboard.vertices.FRONT[3], seesawBoardTranslation), //p5Inst.createVector(0, 0, 0)).xy),
          p5Inst.createVector(-2 * cubeStackSettings.stack.zsizex, 1.1 * cubeStackSettings.stack.zsizey)).xy),
        Split: TSB2S.PP(...vsub(vadd(seesawboard.vertices.FRONT[2], seesawBoardTranslation),
          p5Inst.createVector(cubeStackSettings.stack.size, 1.1 * cubeStackSettings.stack.zsizey)).xy)
      }
    }
    cubeStackTranslation = cubeStackTranslationSetup(cubeStackBuffers, seesawBoardBuffer, seesawboard, seesawBoardTranslation);
    cubeStackSplitTranslation = cubeStackTranslation.Split;//TSB2S.PP(...vsub(vadd(seesawboard.vertices.FRONT[2], seesawBoardTranslation), p5Inst.createVector(cubeStackSettings.stack.size, cubeStackSettings.stack.zsizey)).xy);
    cubeStackCompactTranslation = cubeStackTranslation.Compact; //TSB2C.PP(...vsub(vadd(seesawboard.vertices.FRONT[3], seesawBoardTranslation), p5Inst.createVector(-2 * cubeStackSettings.stack.zsizex, cubeStackSettings.stack.zsizey)).xy);

    // buffer for the pregeneration of C and M blocks to be used as background image, 
    // to improve performance be reducing the number of 'things' that need to be drawn
    // every frame.
    // Buffer Size: "Height" of the zEdge (stack.zsizey) + 10 *cube.size + stack offset from bottom
    // to allocate enough room for a M-Block
    let base_cubeStackTranslation = cubeStackTranslationSetup(base_cubeStackBuffers, base_seesawBoardBuffer, base_seesawboard, base_seesawBoardTranslation);
    // }//}}}

    // throw new Error();
    [bgImgsBuffer, bgImgs] = generateBackgroundImages(cube, base_cubeStackTranslation, base_cubeStackBuffers, base_seesawBoardBufferW);






    let seesawPivotUpperW = (
      canvasBuffer.Rsize(seesawboard).xy.x
      + canvasBuffer.Rsize(seesawboard).zxy.x
      * 1.15);

    let seesawPivotLowerW = 0.8;//TC2SPF.RR(1, 0).x;
    seesawPivotUpperW = 0.5;
    let seesawPivotTopW = 0.15;
    TsB2sPF = seesawBoardBuffer.rF.T(seesawPivotFrontBuffer);
    TsB2sPB = seesawBoardBuffer.rF.T(seesawPivotBackBuffer);


    withContexts(["seesaw"], seesawPivotFrontBuffer)((buf) => {//{{{


      let heightofboard = TsB2sPF.RR(0, 1).y;
      let hLowerW = seesawPivotLowerW / 2;
      let hUpperW = seesawPivotUpperW / 2;
      let hTopW = seesawPivotTopW / 2;



      // relative height of the front pivot, marking the maximum for the last tick on the scale :SCALELIMIT:
      let height = 0.01;
      if (AppMode & AppModes.STACKINGNOSCALE) {
        height = 0.75 // same as in the seesawPivotBackBuffer
      };
      let verts = [
        [0.5 - hLowerW, 0.985],
        [0.5 + hLowerW, 0.985],
        [0.5 + hUpperW, heightofboard],
        [0.5 + hUpperW, seesawPivotTopW / 4 + height],
        [0.5 + hTopW, height],
        [0.5 - hTopW, height],
        [0.5 - seesawPivotUpperW / 2, seesawPivotTopW / 4 + height],
        [0.5 - seesawPivotUpperW / 2, heightofboard]];


      let pivotVertsFront = (verts).map(x => buf.rF.P(...x).xy);
      let pivotVertsBack = (verts).map(
        x => vadd(buf.rF.P(...x),
          p5Inst.createVector(2 * cubeStackSettings.cube.zsizex, -2 * cubeStackSettings.cube.zsizey)).xy);
      buf.push();
      buf.strokeJoin(p5Inst.ROUND);
      buf.translate(...smallPivotShift(buf).xy);
      buf.beginShape();
      for (var v of pivotVertsFront) {
        buf.vertex(...v);
      }
      buf.endShape(p5Inst.CLOSE);
      for (var i = 0; i < 5; i++) {
        buf.quad(...[...pivotVertsFront.slice(1 + i, 3 + i), ...pivotVertsBack.slice(1 + i, 3 + i).reverse()].flat());
      }
      buf.pop();

    })
    //}}}

    withContexts(["seesaw"], seesawPivotBackBuffer)((buf) => {//{{{

      let heightofboard = TsB2sPB.RR(0, 1).y;
      let hLowerW = seesawPivotLowerW / 2;
      let hUpperW = seesawPivotUpperW / 2;
      let hTopW = seesawPivotTopW / 2;

      let height = 0.75;
      let verts = [
        [0.5 - hLowerW, 0.985],
        [0.5 + hLowerW, 0.985],
        [0.5 + hUpperW, heightofboard],
        [0.5 + hUpperW, seesawPivotTopW / 4 + height],
        [0.5 + hTopW, height],
        [0.5 - hTopW, height],
        [0.5 - seesawPivotUpperW / 2, seesawPivotTopW / 4 + height],
        [0.5 - seesawPivotUpperW / 2, heightofboard]];

      let pivotVertsFront = (verts).map(x => buf.rF.P(...x).xy);
      let pivotVertsBack = (verts).map(x => vadd(buf.rF.P(...x), p5Inst.createVector(2 * cubeStackSettings.cube.zsizex, -2 * cubeStackSettings.cube.zsizey)).xy);

      buf.push();
      buf.translate(...seesawboard.zEdge.xy);
      buf.translate(...smallPivotShift(buf).xy);
      buf.beginShape();
      for (var v of pivotVertsFront) {
        buf.vertex(...v);
      }
      buf.endShape(p5Inst.CLOSE);
      for (var i = 0; i < 5; i++) {
        buf.quad(...[...pivotVertsFront.slice(1 + i, 3 + i), ...pivotVertsBack.slice(1 + i, 3 + i).reverse()].flat());
      }
      buf.pop();

    })//}}}

    let TS2B = cubeStackCompact.rF.T(seesawBoardBuffer);
    let stackverts = cubeStackSettings.stack.verticies(...cubeStackCompactTranslation.xy);
    cubeStackCompactScaleTextPos = TS2B.PP(
      ...vadd(p5Inst.createVector(...stackverts.fll), p5Inst.createVector(cubeStackSettings.stack.size / 2, 1.1 * seesawSettings.board.scaleXYZ[1] * cubeStackSettings.cube.size)).xy);
    TS2B = cubeStackSplit.rF.T(seesawBoardBuffer);
    stackverts = cubeStackSettings.stack.verticies(...cubeStackCompactTranslation.xy);
    cubeStackSplitScaleTextPos = TS2B.PP(
      ...vadd(p5Inst.createVector(...stackverts.fll), p5Inst.createVector(cubeStackSettings.stack.size / 2, 1.1 * seesawSettings.board.scaleXYZ[1] * cubeStackSettings.cube.size)).xy);




    let heightofboard = TsB2sPF.RR(0, 1).y;

    let hLowerW = seesawPivotLowerW / 2;



    // Position of the Value 0 of the slider in Rcoords of the canvasBuffer

    // x: center of the pivot -0.075 (see function smallPivotShift)
    let sliderPosX = seesawPivotFrontBuffer.rF.T(canvasBuffer).RR(0.5 - 0.075, 0).x;

    // y: the y-value of the lower cubestack edge
    let sliderStartHeight = TC2S.RP.inv(...cubeStackSettings.stack.verticies(...cubeStackSplitTranslation.xy).fll).y;

    // let sliderEndHeight = (0.01 + 2 * canvasBuffer.Rsize(cube).xy.y);
    // cubeStackSettings.stack.maxNumCubes = floor(((0.85 - (0.01 + 2 * canvasBuffer.Rsize(cube).xy.y)) / canvasBuffer.Rsize(cube).xy.y)) * 100;
    // Position of the Value  of the slider in Rcoords of the canvasBuffer
    // y: start position + height of maxStack
    let sliderEndHeight = sliderStartHeight - canvasBuffer.rF.Ry(cubeStackSettings.cube.size * parseInt(cubeStackSettings.stack.maxNumCubes / 100));

    // pushDEBUGFUNC((b) => print(seesawPivotFrontBuffer.rF.T(b).RP(0.5, 0.5).xy));
    pushDEBUGFUNC((b) => b.circle(...seesawPivotFrontBuffer.rF.T(b).RP(0.5, 0.5).xy, 10));
    // pushDEBUGFUNC((b) => print(seesawPivotFrontBuffer.rF.T(b).RP(...sliderStartPosition).xy));
    pushDEBUGFUNC((b) => b.circle(...canvasBuffer.rF.T(b).RP(sliderPosX, sliderStartHeight).xy, 10));
    pushDEBUGFUNC((b) => { b.fill('red'); b.circle(...canvasBuffer.rF.T(b).RP(sliderPosX, sliderEndHeight).xy, 10) });

    // lower left vertex of the split-stack
    // pushDEBUGFUNC((b) => b.circle(...cubeStackSplit.rF.T(b).PP(...(cubeStackSettings.stack.verticies(...cubeStackSplitTranslation.xy).fll)).xy, 10));


    sliderBuffer = setupBuffer(
      "slider",
      ...seesawPivotBuffersOffset.xy,
      seesawPivotBufferW,
      cubeStackSettings.buffers.canvasRelativeHeight,
      bgcolor = "#FFF0");

    let TC2SLB = canvasBuffer.rF.T(sliderBuffer);
    let x = 0.5;//sliderBuffer.rF.T(seesaw )coordsCanvasInv(...seesawBoardBuffer.coordsCanvas(0.47, 0))[0];
    let ylow = 0;
    let yhigh = 1;
    let initialNumCubes = [AppState["NUMCUBES.COMPACT"], AppState["NUMCUBES.SPLIT"]];
    // if (AppMode & AppModes.SLIDERSPLIT) initialNumCubes = [roundToNext(AppState["NUMCUBES.COMPACT"], 10), roundToNext(AppState["NUMCUBES.SPLIT"], 10)];
    slider = new weightSlider(TC2SLB.RP(sliderPosX, sliderStartHeight).xy, TC2SLB.RP(sliderPosX, sliderEndHeight).xy, initialNumCubes, !stackingMode, !!(AppMode & AppModes.SLIDERSPLIT));

    let drawerWidth = 0.1;
    blockDrawerCompact = setupBuffer("blockDrawerCompact", 0, 0, drawerWidth, 1, bgcolor = "#CCCD");
    blockDrawerSplit = setupBuffer("blockDrawerSplit", (1 - drawerWidth), 0, drawerWidth, 1, bgcolor = "#CCCD");
    blockDrawerBuffers = { split: blockDrawerSplit, compact: blockDrawerCompact };

    // the height has to be 0.5 ... thanks to Safari
    mouseBuffer = setupBuffer("mouse", 0.2, 0.2, 0.25, 0.5, bgcolor = "#FFF0");

    // Events handler{{{
    //to 'reanimate' the animation after the focus is back to the window
    // window.addEventListener("focus", () => p5Inst.redraw());
    // window.onresize = function() {
    //   //@hack: this is a workaround for 'window.location.reload()' which does not work in FireFox
    //   location = location.href.split('#')[0];
    // }
    // }}}


    p5Inst.background(250);

    mylog("end setup()");

  }

  p5Inst.getDivomathVarState = () => {

    let tempAppState = fixAppState(AppState, false);
    return tempAppState
  };

  p5Inst.draw = function() {
    const _draw = () => {


      p5Inst.background(250);
      // p5Inst.background(color("#AAA0"));


      debugbuffer.setbackground();
      // cubeStackSplit.setbackground("#0C57");
      // cubeStackCompact.setbackground("#05C7");
      // seesawBoardBuffer.setbackground("#C504");
      // mouseBuffer.setbackground("#C057");
      cubeStackSplit.setbackground();
      cubeStackCompact.setbackground();
      seesawBoardBuffer.setbackground();
      mouseBuffer.setbackground();
      sliderBuffer.setbackground();

      mylog("draw 1");
      if (AppMode & (AppModes.SLIDER)) {
        AppState["NUMCUBES.COMPACT"] = slider.value[0];
        AppState["NUMCUBES.SPLIT"] = slider.value[1];
      }
      mylog("draw 2");

      seesawBoardBuffer.push();
      seesawBoardBuffer.translate(...seesawBoardTranslation.xy);
      drawcubes(seesawBoardBuffer, [seesawboard], 1, false, false);
      seesawBoardBuffer.pop();


      mylog("draw 3", cubesSplit, AppState["NUMCUBES.SPLIT"]);

      cubeStackSplit.push();
      cubeStackSplit.translate(...cubeStackSplitTranslation.xy);
      drawcubes(cubeStackSplit, cubesSplit, AppState["NUMCUBES.SPLIT"], false, false);
      cubeStackSplit.pop();

      mylog("draw 4", cubesCompact, AppState["NUMCUBES.COMPACT"]);
      cubeStackCompact.push();
      cubeStackCompact.translate(...cubeStackCompactTranslation.xy);
      drawcubes(cubeStackCompact, cubesCompact, AppState["NUMCUBES.COMPACT"], true, false);
      cubeStackCompact.pop();

      mylog("draw 5");
      cubeStackCompact.push();

      cubeStackCompact.pop();


      if (AppMode & (excludeAppModes(AppModes.STACKINGONLYSPLIT, AppModes.STACKINGONLYCOMPACT, AppModes.STACKINGONLYBOTH))) {
        seesawPivotBackBuffer.drawImageUnclear();
      }

      if (AppMode & (AppModes.SLIDERSINGLE ^ AppModes.SLIDERSPLIT ^ AppModes.STACKINGBARS ^ AppModes.STACKINGNOBARS)) {
        slider.display(sliderBuffer);
      }

      if (AppMode & AppModes.STACKINGBARS) {

        let thermometerwidth = 0.875;
        let thermometeralpha = "AA";
        // copy/paste from the weightSlider.display method :thermometer
        let fillColor = colors_blues.get("base");
        let strokeColor = colors_blues.get("base");
        let fillColorAlpha = fillColor + thermometeralpha;
        let strokeColorAlpha = strokeColor + thermometeralpha;

        sliderBuffer.push();
        sliderBuffer.fill(fillColorAlpha);
        sliderBuffer.stroke(strokeColorAlpha);
        // buffer.noStroke();
        if (AppState["NUMCUBES.COMPACT"] > 0) {
          let handlePosition = slider._handlePosition(AppState["NUMCUBES.COMPACT"])[0];
          sliderBuffer.rect(
            slider.startposition[0] - slider.widthHandle / 2,
            handlePosition, // + slider.heightHandle / 2,
            thermometerwidth * (slider.widthHandle / 2), slider.startposition[1] - handlePosition);// * slider.heightHandle);

          sliderBuffer.fill(fillColor);
          sliderBuffer.stroke(strokeColor);
          sliderBuffer.rect(
            slider.startposition[0] - slider.widthHandle / 2,
            handlePosition, // + slider.heightHandle / 2,
            thermometerwidth * (slider.widthHandle / 2), slider.heightHandle);// * slider.heightHandle);
        }

        fillColor = colors_greens.get("base");
        strokeColor = colors_greens.get("base");
        fillColorAlpha = fillColor + thermometeralpha;
        strokeColorAlpha = strokeColor + thermometeralpha;

        sliderBuffer.fill(fillColorAlpha);
        sliderBuffer.stroke(strokeColorAlpha);
        // buffer.noStroke();
        if (AppState["NUMCUBES.SPLIT"] > 0) {
          let handlePosition = slider._handlePosition(AppState["NUMCUBES.SPLIT"])[1];

          sliderBuffer.rect(
            slider.startposition[0] + (1 - thermometerwidth) * slider.widthHandle / 2,
            handlePosition, // + slider.heightHandle / 2,
            thermometerwidth * (slider.widthHandle / 2), slider.startposition[1] - handlePosition);// * slider.heightHandle);

          sliderBuffer.fill(fillColor);
          sliderBuffer.stroke(strokeColor);

          sliderBuffer.rect(
            slider.startposition[0] + (1 - thermometerwidth) * slider.widthHandle / 2,
            handlePosition,
            thermometerwidth * (slider.widthHandle / 2), slider.heightHandle
          );
        }
        sliderBuffer.pop();
      }

      if (!AppState["LOCKSEESAW"]) {

        SEESAWANGLE = (Math.PI / 180) * 14 * (((AppState["NUMCUBES.SPLIT"] - AppState["NUMCUBES.COMPACT"])) / cubeStackSettings.stack.maxNumCubes);
      }

      withContexts(["scaleDisplayText"], seesawBoardBuffer)((buf) => {//{{{

        // Compact cube stack digital scale    
        if (AppState["DISPLAYCOMPACTSCALE"]) {
          let textpos = cubeStackCompactScaleTextPos;

          mylog(textpos);
          let curtext = `${floor(AppState["NUMCUBES.COMPACT"] / 1000)} kg  ${AppState["NUMCUBES.COMPACT"] % 1000} g`;
          // if (!AppSettings.COMPACTSCALEMODEFIXED) curtext = curtext + "◓"
          if (!AppState["COMPACTSCALEMODEINTEGER"]) {
            curtext = `${floor(AppState["NUMCUBES.COMPACT"] / 1000)}, ${String(AppState["NUMCUBES.COMPACT"] % 1000).padStart(3, '0')} kg`;
            // if (!AppSettings.COMPACTSCALEMODEFIXED) curtext = curtext + "◒"
          }
          mylog(textpos);
          buf.text(curtext, ...textpos.xy);

          //@refactor: magicnumber '/2'
          let shift = vadd(
            seesawBoardCenter,
            p5Inst.createVector(smallPivotShift(seesawPivotFrontBuffer).x / 2, 0));//, cubeStackSplit.coordsCanvas(0,0));

          let switcharea = [
            vadd(textpos,
              p5Inst.createVector(-seesawBoardBuffer.textWidth(curtext) / 2,
                -0.75 * seesawSettings.board.scaleXYZ[1] * cubeStackSettings.cube.size)),
            vadd(textpos,
              p5Inst.createVector(seesawBoardBuffer.textWidth(curtext) / 2,
                0.5 * seesawSettings.board.scaleXYZ[1] * cubeStackSettings.cube.size))
          ];
          // @improvement: this seems stupid
          let switchareaRotated = [
            vadd(vsub(switcharea[0], shift).rotate(SEESAWANGLE), shift),
            vadd(vsub(switcharea[1], shift).rotate(SEESAWANGLE), shift)
          ];

          if (!AppState["COMPACTSCALEMODEFIXED"]) {
            let target = new clickRect(...switchareaRotated[0].xy, ...(vsub(switchareaRotated[1], switchareaRotated[0])).xy, buf, "digitalScaleKGSwitch");

            buf.push()
            buf.fill("#FFF3");
            buf.noStroke();
            buf.rectMode(p5Inst.CORNERS);
            if (!AppState["DISPLAYCOMPACTSCALE"] || AppState["COMPACTSCALEMODEFIXED"]) {
              buf.noFill();
            }
            buf.rect(...switcharea[0].xy, ...switcharea[1].xy);
            buf.pop()

          }
        }

        //Split cube stack digital scale    
        if (AppState["DISPLAYSPLITSCALE"]) {
          let textpos = cubeStackSplitScaleTextPos;
          let curtext = `${AppState["NUMCUBES.SPLIT"]} g`;
          buf.text(curtext, ...textpos.xy);
        }
      })//}}}



      // SeesawRotation: all components that ar rotated are drawn inside this push/pop block
      p5Inst.push();

      //Center of the board front as rotation center
      let shift = vadd(
        TC2SPF.PR.inv(0.5, TsB2sPF.PR(0, seesawBoardCenter.y).y),
        p5Inst.createVector(smallPivotShift(seesawPivotFrontBuffer).x, 0));//, cubeStackSplit.coordsCanvas(0,0));


      // pushDEBUGFUNC((b) => { b.fill('#000000'); b.circle(...shift.xy, 10) });

      p5Inst.translate(...vmult(shift, 1).xy);
      p5Inst.rotate(SEESAWANGLE);
      p5Inst.translate(...vmult(shift, -1).xy);


      // if ((AppMode != AppModes.STACKINGONLYSPLIT) && (AppMode != AppModes.STACKINGONLYCOMPACT)) {
      seesawBoardBuffer.drawImage();
      // }

      if (AppMode & AppModes.STACKINGONLYSPLIT) { AppState["NUMCUBES.COMPACT"] = 0; debugprint("yes") }
      if (AppMode & AppModes.STACKINGONLYCOMPACT) { AppState["NUMCUBES.SPLIT"] = 0; debugprint("no") }
      let verts = cubeStackSettings.stack.verticies(...cubeStackCompactTranslation.xy, AppState["NUMCUBES.COMPACT"]);
      let [numI, numX, numC, numM] = decomposeInt(AppState["NUMCUBES.COMPACT"]);
      let xy, w, h;
      w = 10 * (cubeStackSettings.cube.size + cubeStackSettings.cube.zsizex);// = bur.x - ful.x = 10 * cubesize + zsizex + PX - (-9*zsizex + PX) 
      if (numM > 0) {
        xy = verts.MStackStart;
        h = cubeStackSettings.cube.size * 10 * numM;
        cubeStackCompact.push();
        cubeStackCompact.fill("#A119");
        let MStackTarget = new clickRect(...xy, w, -h, cubeStackCompact, "MStackcompact");
        cubeStackCompact.pop();
      }

      if (numC > 0) {
        xy = verts.CStackStart;
        h = cubeStackSettings.cube.size * numC;
        cubeStackCompact.push();
        cubeStackCompact.fill("#1A19");
        let CStackTarget = new clickRect(...xy, w, -h, cubeStackCompact, "CStackcompact");
        cubeStackCompact.pop();
      }
      if (numI > 0) {
        xy = verts.IStackStart;
        h = (verts.IStackStart[1] - verts.IStackEnd[1]);
        cubeStackCompact.push();
        cubeStackCompact.fill("#11A9");
        let IStackTarget = new clickRect(...xy, w, -h, cubeStackCompact, "IStackcompact");
        cubeStackCompact.pop();
      }
      if (numX > 0) {
        xy = verts.XStackStart;
        //all rectangles have the same width
        // h = cubeStackSettings.cube.size + cubeStackSettings.cube.zsizey * 10 ;
        h = (verts.XStackStart[1] - verts.XStackEnd[1]);
        // p5Inst.print("xy,w,h", xy,w,h)
        cubeStackCompact.push();
        cubeStackCompact.fill("#A1A9");
        let XStackTarget = new clickRect(...xy, w, -h, cubeStackCompact, "XStackcompact");
        // cubeStackCompact.rect(...xy, w, -h);
        cubeStackCompact.pop();
      }
      verts = cubeStackSettings.stack.verticies(...cubeStackSplitTranslation.xy, AppState["NUMCUBES.SPLIT"]);

      [numI, numX, numC, numM] = decomposeInt(AppState["NUMCUBES.SPLIT"]);

      w = 10 * (cubeStackSettings.cube.size + cubeStackSettings.cube.zsizex);// = bur.x - ful.x = 10 * cubesize + zsizex + PX - (-9*zsizex + PX) 
      if (numM > 0) {
        xy = verts.MStackStart;
        h = cubeStackSettings.cube.size * 10 * numM;
        cubeStackSplit.push();
        cubeStackSplit.fill("#A119");
        let MStackTarget = new clickRect(...xy, w, -h, cubeStackSplit, "MStacksplit");
        cubeStackSplit.pop();
      }
      if (numC > 0) {
        xy = verts.CStackStart;
        h = cubeStackSettings.cube.size * numC;
        cubeStackSplit.push();
        cubeStackSplit.fill("#1A19");
        let CStackTarget = new clickRect(...xy, w, -h, cubeStackSplit, "CStacksplit");
        cubeStackSplit.pop();
      }
      if (numI > 0) {
        xy = verts.IStackStart;
        h = (verts.IStackStart[1] - verts.IStackEnd[1]);
        cubeStackSplit.push();
        cubeStackSplit.fill("#11A9");
        let IStackTarget = new clickRect(...xy, w, -h, cubeStackSplit, "IStacksplit");
        cubeStackSplit.pop();
      }
      if (numX > 0) {
        xy = verts.XStackStart;
        h = (verts.XStackStart[1] - verts.XStackEnd[1]);
        cubeStackSplit.push();
        cubeStackSplit.fill("#A1A9");
        let XStackTarget = new clickRect(...xy, w, -h, cubeStackSplit, "XStacksplit");
        cubeStackSplit.pop();

      }

      let _TC2BC = canvasBuffer.rF.T(cubeStackCompact);
      let _TC2BS = canvasBuffer.rF.T(cubeStackSplit);
      debugbuffer.text(`mouseX, mouseY = ${[p5Inst.mouseX, p5Inst.mouseY]}`, ...debugbuffer.rF.P(0.25, .05 + 0.04).xy);
      debugbuffer.text(`Split: mouseX, mouseY = ${_TC2BS.PP(p5Inst.mouseX, p5Inst.mouseY).xy}`, ...debugbuffer.rF.P(0.25, .05 + 0.06).xy);
      debugbuffer.text(`Compact: mouseX, mouseY = ${_TC2BC.PP(p5Inst.mouseX, p5Inst.mouseY).xy}`, ...debugbuffer.rF.P(0.25, .05 + 0.08).xy);
      debugbuffer.text(`Split,Compact Click: ${Array.from(Clickable.allClickables.values()).filter(it => it.label == "MStackcompact").map(it => [it.label, it.isClicked, `[${it.rect}]`])}`, ...debugbuffer.rF.P(0.25, .05 + 0.10).xy);
      debugbuffer.text(`Split,Compact Click: ${Array.from(Clickable.allClickables.values()).length}`, ...debugbuffer.rF.P(0.25, .05 + 0.12).xy);
      debugbuffer.text(`${[outerWidth, outerHeight, innerWidth, innerHeight, window.devicePixelRatio, navigator.userAgent]}`, ...debugbuffer.rF.P(0.25, .05 + 0.16).xy);
      cubeStackSplit.drawImage();
      cubeStackCompact.drawImage();

      p5Inst.pop();
      pushDEBUGFUNC((b) => { seesawBoardBuffer.rF.drawFrame() })
      pushDEBUGFUNC((b) => { cubeStackSplit.rF.drawFrame() })
      pushDEBUGFUNC((b) => { cubeStackCompact.rF.drawFrame() })
      bgImgsBuffer.drawImage();



      //@refactor: move this function to the top of the file
      function vecFromNormAndX(norm, x) {
        return p5Inst.createVector(x, sqrt(norm * norm - x * x))
      }
      let axisloc = vadd(
        TsB2sPF.PP(...seesawBoardCenter.xy),
        p5Inst.createVector(smallPivotShift(seesawPivotFrontBuffer).x, 0));//, cubeStackSplit.coordsCanvas(0,0));
      seesawPivotFrontBuffer.push();
      seesawPivotFrontBuffer.fill(colors_birch.get("darkest"));
      seesawPivotFrontBuffer.circle(...axisloc.xy, 22);
      seesawPivotFrontBuffer.strokeJoin(p5Inst.BEVEL);
      seesawPivotFrontBuffer.strokeWeight(2);
      seesawPivotFrontBuffer.line(
        ...vadd(axisloc, p5Inst.createVector(-10, 0).rotate(SEESAWANGLE)).xy,
        ...vadd(axisloc, p5Inst.createVector(10, 0).rotate(SEESAWANGLE)).xy);
      seesawPivotFrontBuffer.pop();

      if ((AppMode != AppModes.STACKINGONLYSPLIT) && (AppMode != AppModes.STACKINGONLYCOMPACT) && (AppMode != AppModes.STACKINGONLYBOTH)) {
        seesawPivotFrontBuffer.drawImageUnclear();
      }



      sliderBuffer.drawImage();


      if (stackingMode) {

        // handle the split drawer
        if (AppState["BLOCKDRAWERS.SPLITISOPEN"]) {
          // blockDrawerSplit.setbackground();
          drawblockDrawer("split");
          if (AppMode != AppModes.STACKINGONLYSPLIT) {
            drawerHandle("split", true);
          }
        } else {
          drawerHandle("split", false);
        }
        if (AppState["BLOCKDRAWERS.COMPACTISOPEN"]) {

          // handle the compact drawer
          // blockDrawerCompact.setbackground();
          drawblockDrawer("compact");
          if (AppMode != AppModes.STACKINGONLYCOMPACT) {
            drawerHandle("compact", true);
          }
        } else {
          drawerHandle("compact", false);
        }

        // Only draw a single stack if on of the modes 'onlyKG' or 'onlyG' is chosen
        if ((AppMode != AppModes.STACKINGONLYCOMPACT)) {
          blockDrawerSplit.drawImageUnclear();
        }
        if ((AppMode != AppModes.STACKINGONLYSPLIT)) {
          blockDrawerCompact.drawImageUnclear();
        }


        for (var side of ["split", "compact"]) {
          for (var block of ["I", "X", "C", "M"]) {
            if (AppState[`DRAGGINGBLOCK.${side}${block}`]) {
              mouseBuffer.push();
              mouseBuffer.scale(0.4);
              mouseBuffer.translate(0.10 * mouseBuffer.width, 0.65 * mouseBuffer.height);
              // if (deviceType == DEVICETYPES.PC) mouseBuffer.translate(0.65 * mouseBuffer.width, -0.25 * mouseBuffer.height);
              mouseBuffer.image(bgImgs[side][block], 0, 0);
              mouseBuffer.pop();
            }
          }
        }



        mouseBuffer.drawImage(p5Inst.mouseX - 0.5 * mouseBuffer.width, p5Inst.mouseY - 0.5 * mouseBuffer.height);
      }


      let TC2BC = canvasBuffer.rF.T(blockDrawerCompact);
      let TC2BS = canvasBuffer.rF.T(blockDrawerSplit);
      let TC2S = canvasBuffer.rF.T(sliderBuffer);
      debugbuffer.text(`mouseX, mouseY = ${p5Inst.mouseX}, ${p5Inst.mouseY} `, ...debugbuffer.rF.P(0.01, .05 + 0.02).xy);
      // debugbuffer.text(`Split: mouseX, mouseY = ${TC2BS.PP(p5Inst.mouseX, p5Inst.mouseY).xy}`, ...debugbuffer.rF.P(0.01, .05 + 0.04).xy);
      // debugbuffer.text(`Compact: mouseX, mouseY = ${TC2BC.PP(p5Inst.mouseX, p5Inst.mouseY).xy}`, ...debugbuffer.rF.P(0.01, .05 + 0.06).xy);
      debugbuffer.text(`slidre: mouseX, mouseY = ${TC2C.PP(p5Inst.mouseX, p5Inst.mouseY).xy}`, ...debugbuffer.rF.P(0.01, .05 + 0.06).xy);
      debugbuffer.text(`slidre: mouseX, mouseY = ${TC2C.PR(p5Inst.mouseX, p5Inst.mouseY).xy}`, ...debugbuffer.rF.P(0.01, .05 + 0.08).xy);

      if (DEBUGMODE) {
        // drawDebugBuffer(true);
        // drawDebugBuffer(drawFrames = false);
        debugbuffer.drawImage();
      }

      debugbuffer.clear();
      cubeStackSplit.clear();
      cubeStackCompact.clear();
      seesawBoardBuffer.clear();
      sliderBuffer.clear();
      mouseBuffer.clear();



    };
    setTimeout(_draw, 150);
    // _draw()

  };


  p5Inst.mousePressed = function() {//{{{
    let canvas = Clickable.allClickables.get("Canvas");
    if (canvas.mouseInArea()) {
      Array.from(Clickable.allClickables.values()).forEach(m => m.mousePressed());
      //handle Click on Slider 
      // p5Inst.print(Clickable.allClickables.get("sliderhandlesplit"));
      // p5Inst.print(Clickable.allClickables.get("sliderhandlecompact"));
      slider.mousePressed(sliderBuffer);

      let digitalScaleSwitch = Clickable.allClickables.get("digitalScaleKGSwitch");
      if ((digitalScaleSwitch != undefined) && (!AppState["COMPACTSCALEMODEFIXED"]) && (digitalScaleSwitch.isClicked)) {
        AppState["COMPACTSCALEMODEINTEGER"] = !AppState["COMPACTSCALEMODEINTEGER"];
      }


      if (AppMode & AppModes.STACKING) {
        if (AppMode & (AppModes.STACKINGBARS ^ AppModes.STACKINGNOBARS ^ AppModes.STACKINGNOSCALE)) {

          let drawerHandleSplit = Clickable.allClickables.get("drawerhandlesplit");
          if ((drawerHandleSplit != undefined) && drawerHandleSplit.isClicked) {
            p5Inst.print("clicked");
            AppState["BLOCKDRAWERS.SPLITISOPEN"] = !AppState["BLOCKDRAWERS.SPLITISOPEN"];
            blockDrawerSplit.clear()
            drawBlocksInDrawer["split"] = true;

          }
          let drawerHandleCompact = Clickable.allClickables.get("drawerhandlecompact");
          if ((drawerHandleCompact != undefined) && drawerHandleCompact.isClicked) {
            p5Inst.print("clicked");
            AppState["BLOCKDRAWERS.COMPACTISOPEN"] = !AppState["BLOCKDRAWERS.COMPACTISOPEN"];
            blockDrawerCompact.clear()
            drawBlocksInDrawer["compact"] = true;

          }
        }


        for (var side of ["split", "compact"]) {
          for (var block of ["I", "X", "C", "M"]) {
            let drawerBlock = Clickable.allClickables.get(`${side}${block}`);
            if ((drawerBlock != undefined) && drawerBlock.isClicked) {
              AppState[`DRAGGINGBLOCK.${side}${block}`] = true;

            }

            let target = Clickable.allClickables.get(`${block}Stack${side}`);

            let dragging = !!(Object.keys(AppState).filter(it => it.startsWith("DRAGGINGBLOCK")).map(it => AppState[it]).reduce((p, c) => p + c, false));
            if (!dragging && ((target != undefined) && (target.isClicked))) {
              let delta;
              switch (block) {
                case "M": delta = 1000;
                  break;
                case "C": delta = 100;
                  break;
                case "X": delta = 10;
                  break;
                case "I": delta = 1;
                  break;
              }

              if ((side == "split") && (delta <= AppState["NUMCUBES.SPLIT"])) {
                AppState["NUMCUBES.SPLIT"] -= delta;
                AppState[`DRAGGINGBLOCK.${side}${block}`] = true;
                AppState["BLOCKDRAWERS.SPLITISOPEN"] = true;
              } else if ((side == "compact") && (delta <= AppState["NUMCUBES.COMPACT"])) {
                AppState["NUMCUBES.COMPACT"] -= delta;
                AppState[`DRAGGINGBLOCK.${side}${block}`] = true;
                AppState["BLOCKDRAWERS.COMPACTISOPEN"] = true;
              }

            }
          }
        }
      }

      return false
    }
  }//}}}


  p5Inst.mouseDragged = function() {// {{{
    Movable.Movables.forEach(m => m.mouseDragged());

    slider.mouseDragged(sliderBuffer);
    return false
  }// }}}

  p5Inst.mouseReleased = function() {//{{{
    Array.from(Clickable.allClickables.values()).forEach(m => m.mouseReleased());

    slider.mouseReleased(sliderBuffer);

    if (stackingMode) {

      for (var side of ["split", "compact"]) {
        for (var block of ["I", "X", "C", "M"]) {
          if (AppState[`DRAGGINGBLOCK.${side}${block}`]) {
            let drawerTarget = Clickable.allClickables.get(`${side}${block}`);
            let stackTarget = cubeStackBuffers[side];
            if (drawerTarget.mouseInArea() || stackTarget.rF.mouseInArea()) {

              AppState[`DRAGGINGBLOCK.${side}${block}`] = false
            }
            if (side == "split" &&
              cubeStackSplit.collidePointRect(...TC2S.PP(p5Inst.mouseX, p5Inst.mouseY).xy, 0, 0, cubeStackSplit.width, cubeStackSplit.height)) {
              if ((AppState["NUMCUBES.SPLIT"] + roman2arabic(block)) <= cubeStackSettings.stack.maxNumCubes) { AppState["NUMCUBES.SPLIT"] += roman2arabic(block) };

            }
            if (side == "compact" &&
              cubeStackCompact.collidePointRect(...TC2C.PP(p5Inst.mouseX, p5Inst.mouseY).xy, 0, 0, cubeStackCompact.width, cubeStackCompact.height)) {
              if ((AppState["NUMCUBES.COMPACT"] + roman2arabic(block)) <= cubeStackSettings.stack.maxNumCubes) { AppState["NUMCUBES.COMPACT"] += roman2arabic(block) };
            }
          }
        }
      }
    }
  }//}}}
};



