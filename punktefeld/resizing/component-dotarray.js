const APPMODE = "RESIZING";
const sketch =

  (p5) => {  // remove const sketch 
    //begin: remove lines

    p5.getDivomathConfig = function() { return DivomathConfig() }  //remove line
    p5.getDivomathPreviousSubmission = function() { return DivomathPreviousSubmission }
    p5.sendDivomathResult = function() { return sendDivomathResult }
    p5.getDivomathVarState = () => state;
    p5.newCanvas = () => { return p5.createCanvas(innerWidth * 0.975, innerHeight * 0.96) };

    // end: remove line


    //begin:globals {{{
    let isTouchDevice = false;
    let undoTimestamp;
    let draggingVector;
    let draggingDirection;
    let countUnits;
    let clickMouseX, clickMouseY;
    let undoButton, redoButton, descButton, cutButton;
    let DYNAMICCUT = false;
    let DYNAMICDRAW = false;
    let newSteps = []

    let p5js = require("p5");
    let initialData = p5.getDivomathConfig();
    let initialConfig = { "tiles": [] };
    if (initialData.configuration) {
      for (var [k, v] of Object.entries(initialData.configuration)) {
        initialConfig[k] = v;
      }
    }

    console.log("InitialConfig:", initialConfig, "Config:", initialData.configuration, "State:", initialData.divomathVarState);
    let lastState = (Object.keys(initialData.divomathVarState).includes("json")) ? JSON.parse(initialData.divomathVarState.json) : {};
    let lastSubmission = p5.getDivomathPreviousSubmission();
    let state = {}; lastState ? lastState : {};

    let defaultAppState = {
      TILES: [],
      RESULT: "",
      ALWAYSRELOAD: false,
      UNDOBUTTON: false,
      UNDOBUTTONLOCATION: [],
      DESCBUTTON: false,
      DESCBUTTONLOCATION: [],
      SHOWDESC: true,
      ISCUTTING: false,
      CUTSTART: undefined,
      CUTEND: undefined,
      UNDOTREE: { STEPS: [], INDEX: -1 },
      INTERACTIVE: true,
      ID: undefined,
      ISRESUMED: false
    }

    let AppState = defaultAppState;
    //let isResumed = [...Object.keys(lastState)].toString() == [...Object.keys(defaultAppState)].toString();
    let isResumed = lastState["ISRESUMED"];
    p5.print("keys:", [...Object.keys(lastState)], [...Object.keys(defaultAppState)])
    if (isResumed) {
      p5.print("lastState:", lastState);
      let lastAppState = lastState;
      p5.print("lastAppState:", lastAppState);
      AppState = lastAppState;
      // if (isNaN(AppState["NUMCUBES.COMPACT"])) {
      //   AppState["NUMCUBES.COMPACT"] = 0;
      // }
      // if (isNaN(AppState["NUMCUBES.SPLIT"])) {
      //   AppState["NUMCUBES.SPLIT"] = 0;
      // }
      // fix the shift to avoid having a Zero 
    }


    p5.print(`The app was resumed: ${isResumed}`)
    p5.print("AppState:", AppState);
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

    let print = p5.print;
    let canvasBuffer;
    let debugbuffer;
    //end:globals}}}


    //begin: chroma.js //{{{

    /**
     * chroma.js - JavaScript library for color conversions
     *
     * Copyright (c) 2011-2019, Gregor Aisch
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are met:
     *
     * 1. Redistributions of source code must retain the above copyright notice, this
     * list of conditions and the following disclaimer.
     *
     * 2. Redistributions in binary form must reproduce the above copyright notice,
     * this list of conditions and the following disclaimer in the documentation
     * and/or other materials provided with the distribution.
     *
     * 3. The name Gregor Aisch may not be used to endorse or promote products
     * derived from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
     * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
     * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
     * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
     * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     *
     * -------------------------------------------------------
     *
     * chroma.js includes colors from colorbrewer2.org, which are released under
     * the following license:
     *
     * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
     * and The Pennsylvania State University.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing,
     * software distributed under the License is distributed on an
     * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
     * either express or implied. See the License for the specific
     * language governing permissions and limitations under the License.
     *
     * ------------------------------------------------------
     *
     * Named colors are taken from X11 Color Names.
     * http://www.w3.org/TR/css3-color/#svg-color
     *
     * @preserve
     */

    (function(global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
          (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.chroma = factory());
    })(this, (function() {
      'use strict';

      var limit$2 = function(x, min, max) {
        if (min === void 0) min = 0;
        if (max === void 0) max = 1;

        return x < min ? min : x > max ? max : x;
      };

      var limit$1 = limit$2;

      var clip_rgb$3 = function(rgb) {
        rgb._clipped = false;
        rgb._unclipped = rgb.slice(0);
        for (var i = 0; i <= 3; i++) {
          if (i < 3) {
            if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
            rgb[i] = limit$1(rgb[i], 0, 255);
          } else if (i === 3) {
            rgb[i] = limit$1(rgb[i], 0, 1);
          }
        }
        return rgb;
      };

      // ported from jQuery's $.type
      var classToType = {};
      for (var i$1 = 0, list$1 = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i$1 < list$1.length; i$1 += 1) {
        var name = list$1[i$1];

        classToType[("[object " + name + "]")] = name.toLowerCase();
      }
      var type$p = function(obj) {
        return classToType[Object.prototype.toString.call(obj)] || "object";
      };

      var type$o = type$p;

      var unpack$B = function(args, keyOrder) {
        if (keyOrder === void 0) keyOrder = null;

        // if called with more than 3 arguments, we return the arguments
        if (args.length >= 3) { return Array.prototype.slice.call(args); }
        // with less than 3 args we check if first arg is object
        // and use the keyOrder string to extract and sort properties
        if (type$o(args[0]) == 'object' && keyOrder) {
          return keyOrder.split('')
            .filter(function(k) { return args[0][k] !== undefined; })
            .map(function(k) { return args[0][k]; });
        }
        // otherwise we just return the first argument
        // (which we suppose is an array of args)
        return args[0];
      };

      var type$n = type$p;

      var last$4 = function(args) {
        if (args.length < 2) { return null; }
        var l = args.length - 1;
        if (type$n(args[l]) == 'string') { return args[l].toLowerCase(); }
        return null;
      };

      var PI$2 = Math.PI;

      var utils = {
        clip_rgb: clip_rgb$3,
        limit: limit$2,
        type: type$p,
        unpack: unpack$B,
        last: last$4,
        PI: PI$2,
        TWOPI: PI$2 * 2,
        PITHIRD: PI$2 / 3,
        DEG2RAD: PI$2 / 180,
        RAD2DEG: 180 / PI$2
      };

      var input$h = {
        format: {},
        autodetect: []
      };

      var last$3 = utils.last;
      var clip_rgb$2 = utils.clip_rgb;
      var type$m = utils.type;
      var _input = input$h;

      var Color$D = function Color() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var me = this;
        if (type$m(args[0]) === 'object' &&
          args[0].constructor &&
          args[0].constructor === this.constructor) {
          // the argument is already a Color instance
          return args[0];
        }

        // last argument could be the mode
        var mode = last$3(args);
        var autodetect = false;

        if (!mode) {
          autodetect = true;
          if (!_input.sorted) {
            _input.autodetect = _input.autodetect.sort(function(a, b) { return b.p - a.p; });
            _input.sorted = true;
          }
          // auto-detect format
          for (var i = 0, list = _input.autodetect; i < list.length; i += 1) {
            var chk = list[i];

            mode = chk.test.apply(chk, args);
            if (mode) { break; }
          }
        }

        if (_input.format[mode]) {
          var rgb = _input.format[mode].apply(null, autodetect ? args : args.slice(0, -1));
          me._rgb = clip_rgb$2(rgb);
        } else {
          throw new Error('unknown format: ' + args);
        }

        // add alpha channel
        if (me._rgb.length === 3) { me._rgb.push(1); }
      };

      Color$D.prototype.toString = function toString() {
        if (type$m(this.hex) == 'function') { return this.hex(); }
        return ("[" + (this._rgb.join(',')) + "]");
      };

      var Color_1 = Color$D;

      var chroma$k = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(chroma$k.Color, [null].concat(args)));
      };

      chroma$k.Color = Color_1;
      chroma$k.version = '2.4.2';

      var chroma_1 = chroma$k;

      var unpack$A = utils.unpack;
      var max$2 = Math.max;

      var rgb2cmyk$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$A(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var k = 1 - max$2(r, max$2(g, b));
        var f = k < 1 ? 1 / (1 - k) : 0;
        var c = (1 - r - k) * f;
        var m = (1 - g - k) * f;
        var y = (1 - b - k) * f;
        return [c, m, y, k];
      };

      var rgb2cmyk_1 = rgb2cmyk$1;

      var unpack$z = utils.unpack;

      var cmyk2rgb = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        args = unpack$z(args, 'cmyk');
        var c = args[0];
        var m = args[1];
        var y = args[2];
        var k = args[3];
        var alpha = args.length > 4 ? args[4] : 1;
        if (k === 1) { return [0, 0, 0, alpha]; }
        return [
          c >= 1 ? 0 : 255 * (1 - c) * (1 - k), // r
          m >= 1 ? 0 : 255 * (1 - m) * (1 - k), // g
          y >= 1 ? 0 : 255 * (1 - y) * (1 - k), // b
          alpha
        ];
      };

      var cmyk2rgb_1 = cmyk2rgb;

      var chroma$j = chroma_1;
      var Color$C = Color_1;
      var input$g = input$h;
      var unpack$y = utils.unpack;
      var type$l = utils.type;

      var rgb2cmyk = rgb2cmyk_1;

      Color$C.prototype.cmyk = function() {
        return rgb2cmyk(this._rgb);
      };

      chroma$j.cmyk = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$C, [null].concat(args, ['cmyk'])));
      };

      input$g.format.cmyk = cmyk2rgb_1;

      input$g.autodetect.push({
        p: 2,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$y(args, 'cmyk');
          if (type$l(args) === 'array' && args.length === 4) {
            return 'cmyk';
          }
        }
      });

      var unpack$x = utils.unpack;
      var last$2 = utils.last;
      var rnd = function(a) { return Math.round(a * 100) / 100; };

      /*
       * supported arguments:
       * - hsl2css(h,s,l)
       * - hsl2css(h,s,l,a)
       * - hsl2css([h,s,l], mode)
       * - hsl2css([h,s,l,a], mode)
       * - hsl2css({h,s,l,a}, mode)
       */
      var hsl2css$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var hsla = unpack$x(args, 'hsla');
        var mode = last$2(args) || 'lsa';
        hsla[0] = rnd(hsla[0] || 0);
        hsla[1] = rnd(hsla[1] * 100) + '%';
        hsla[2] = rnd(hsla[2] * 100) + '%';
        if (mode === 'hsla' || (hsla.length > 3 && hsla[3] < 1)) {
          hsla[3] = hsla.length > 3 ? hsla[3] : 1;
          mode = 'hsla';
        } else {
          hsla.length = 3;
        }
        return (mode + "(" + (hsla.join(',')) + ")");
      };

      var hsl2css_1 = hsl2css$1;

      var unpack$w = utils.unpack;

      /*
       * supported arguments:
       * - rgb2hsl(r,g,b)
       * - rgb2hsl(r,g,b,a)
       * - rgb2hsl([r,g,b])
       * - rgb2hsl([r,g,b,a])
       * - rgb2hsl({r,g,b,a})
       */
      var rgb2hsl$3 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        args = unpack$w(args, 'rgba');
        var r = args[0];
        var g = args[1];
        var b = args[2];

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);

        var l = (max + min) / 2;
        var s, h;

        if (max === min) {
          s = 0;
          h = Number.NaN;
        } else {
          s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        }

        if (r == max) { h = (g - b) / (max - min); }
        else if (g == max) { h = 2 + (b - r) / (max - min); }
        else if (b == max) { h = 4 + (r - g) / (max - min); }

        h *= 60;
        if (h < 0) { h += 360; }
        if (args.length > 3 && args[3] !== undefined) { return [h, s, l, args[3]]; }
        return [h, s, l];
      };

      var rgb2hsl_1 = rgb2hsl$3;

      var unpack$v = utils.unpack;
      var last$1 = utils.last;
      var hsl2css = hsl2css_1;
      var rgb2hsl$2 = rgb2hsl_1;
      var round$6 = Math.round;

      /*
       * supported arguments:
       * - rgb2css(r,g,b)
       * - rgb2css(r,g,b,a)
       * - rgb2css([r,g,b], mode)
       * - rgb2css([r,g,b,a], mode)
       * - rgb2css({r,g,b,a}, mode)
       */
      var rgb2css$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var rgba = unpack$v(args, 'rgba');
        var mode = last$1(args) || 'rgb';
        if (mode.substr(0, 3) == 'hsl') {
          return hsl2css(rgb2hsl$2(rgba), mode);
        }
        rgba[0] = round$6(rgba[0]);
        rgba[1] = round$6(rgba[1]);
        rgba[2] = round$6(rgba[2]);
        if (mode === 'rgba' || (rgba.length > 3 && rgba[3] < 1)) {
          rgba[3] = rgba.length > 3 ? rgba[3] : 1;
          mode = 'rgba';
        }
        return (mode + "(" + (rgba.slice(0, mode === 'rgb' ? 3 : 4).join(',')) + ")");
      };

      var rgb2css_1 = rgb2css$1;

      var unpack$u = utils.unpack;
      var round$5 = Math.round;

      var hsl2rgb$1 = function() {
        var assign;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        args = unpack$u(args, 'hsl');
        var h = args[0];
        var s = args[1];
        var l = args[2];
        var r, g, b;
        if (s === 0) {
          r = g = b = l * 255;
        } else {
          var t3 = [0, 0, 0];
          var c = [0, 0, 0];
          var t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var t1 = 2 * l - t2;
          var h_ = h / 360;
          t3[0] = h_ + 1 / 3;
          t3[1] = h_;
          t3[2] = h_ - 1 / 3;
          for (var i = 0; i < 3; i++) {
            if (t3[i] < 0) { t3[i] += 1; }
            if (t3[i] > 1) { t3[i] -= 1; }
            if (6 * t3[i] < 1) { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
            else if (2 * t3[i] < 1) { c[i] = t2; }
            else if (3 * t3[i] < 2) { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
            else { c[i] = t1; }
          }
          (assign = [round$5(c[0] * 255), round$5(c[1] * 255), round$5(c[2] * 255)], r = assign[0], g = assign[1], b = assign[2]);
        }
        if (args.length > 3) {
          // keep alpha channel
          return [r, g, b, args[3]];
        }
        return [r, g, b, 1];
      };

      var hsl2rgb_1 = hsl2rgb$1;

      var hsl2rgb = hsl2rgb_1;
      var input$f = input$h;

      var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
      var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
      var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
      var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
      var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
      var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

      var round$4 = Math.round;

      var css2rgb$1 = function(css) {
        css = css.toLowerCase().trim();
        var m;

        if (input$f.format.named) {
          try {
            return input$f.format.named(css);
          } catch (e) {
            // eslint-disable-next-line
          }
        }

        // rgb(250,20,0)
        if ((m = css.match(RE_RGB))) {
          var rgb = m.slice(1, 4);
          for (var i = 0; i < 3; i++) {
            rgb[i] = +rgb[i];
          }
          rgb[3] = 1;  // default alpha
          return rgb;
        }

        // rgba(250,20,0,0.4)
        if ((m = css.match(RE_RGBA))) {
          var rgb$1 = m.slice(1, 5);
          for (var i$1 = 0; i$1 < 4; i$1++) {
            rgb$1[i$1] = +rgb$1[i$1];
          }
          return rgb$1;
        }

        // rgb(100%,0%,0%)
        if ((m = css.match(RE_RGB_PCT))) {
          var rgb$2 = m.slice(1, 4);
          for (var i$2 = 0; i$2 < 3; i$2++) {
            rgb$2[i$2] = round$4(rgb$2[i$2] * 2.55);
          }
          rgb$2[3] = 1;  // default alpha
          return rgb$2;
        }

        // rgba(100%,0%,0%,0.4)
        if ((m = css.match(RE_RGBA_PCT))) {
          var rgb$3 = m.slice(1, 5);
          for (var i$3 = 0; i$3 < 3; i$3++) {
            rgb$3[i$3] = round$4(rgb$3[i$3] * 2.55);
          }
          rgb$3[3] = +rgb$3[3];
          return rgb$3;
        }

        // hsl(0,100%,50%)
        if ((m = css.match(RE_HSL))) {
          var hsl = m.slice(1, 4);
          hsl[1] *= 0.01;
          hsl[2] *= 0.01;
          var rgb$4 = hsl2rgb(hsl);
          rgb$4[3] = 1;
          return rgb$4;
        }

        // hsla(0,100%,50%,0.5)
        if ((m = css.match(RE_HSLA))) {
          var hsl$1 = m.slice(1, 4);
          hsl$1[1] *= 0.01;
          hsl$1[2] *= 0.01;
          var rgb$5 = hsl2rgb(hsl$1);
          rgb$5[3] = +m[4];  // default alpha = 1
          return rgb$5;
        }
      };

      css2rgb$1.test = function(s) {
        return RE_RGB.test(s) ||
          RE_RGBA.test(s) ||
          RE_RGB_PCT.test(s) ||
          RE_RGBA_PCT.test(s) ||
          RE_HSL.test(s) ||
          RE_HSLA.test(s);
      };

      var css2rgb_1 = css2rgb$1;

      var chroma$i = chroma_1;
      var Color$B = Color_1;
      var input$e = input$h;
      var type$k = utils.type;

      var rgb2css = rgb2css_1;
      var css2rgb = css2rgb_1;

      Color$B.prototype.css = function(mode) {
        return rgb2css(this._rgb, mode);
      };

      chroma$i.css = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$B, [null].concat(args, ['css'])));
      };

      input$e.format.css = css2rgb;

      input$e.autodetect.push({
        p: 5,
        test: function(h) {
          var rest = [], len = arguments.length - 1;
          while (len-- > 0) rest[len] = arguments[len + 1];

          if (!rest.length && type$k(h) === 'string' && css2rgb.test(h)) {
            return 'css';
          }
        }
      });

      var Color$A = Color_1;
      var chroma$h = chroma_1;
      var input$d = input$h;
      var unpack$t = utils.unpack;

      input$d.format.gl = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var rgb = unpack$t(args, 'rgba');
        rgb[0] *= 255;
        rgb[1] *= 255;
        rgb[2] *= 255;
        return rgb;
      };

      chroma$h.gl = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$A, [null].concat(args, ['gl'])));
      };

      Color$A.prototype.gl = function() {
        var rgb = this._rgb;
        return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3]];
      };

      var unpack$s = utils.unpack;

      var rgb2hcg$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$s(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var c = delta * 100 / 255;
        var _g = min / (255 - delta) * 100;
        var h;
        if (delta === 0) {
          h = Number.NaN;
        } else {
          if (r === max) { h = (g - b) / delta; }
          if (g === max) { h = 2 + (b - r) / delta; }
          if (b === max) { h = 4 + (r - g) / delta; }
          h *= 60;
          if (h < 0) { h += 360; }
        }
        return [h, c, _g];
      };

      var rgb2hcg_1 = rgb2hcg$1;

      var unpack$r = utils.unpack;
      var floor$3 = Math.floor;

      /*
       * this is basically just HSV with some minor tweaks
       *
       * hue.. [0..360]
       * chroma .. [0..1]
       * grayness .. [0..1]
       */

      var hcg2rgb = function() {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        args = unpack$r(args, 'hcg');
        var h = args[0];
        var c = args[1];
        var _g = args[2];
        var r, g, b;
        _g = _g * 255;
        var _c = c * 255;
        if (c === 0) {
          r = g = b = _g;
        } else {
          if (h === 360) { h = 0; }
          if (h > 360) { h -= 360; }
          if (h < 0) { h += 360; }
          h /= 60;
          var i = floor$3(h);
          var f = h - i;
          var p = _g * (1 - c);
          var q = p + _c * (1 - f);
          var t = p + _c * f;
          var v = p + _c;
          switch (i) {
            case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
            case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
            case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
            case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
            case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
            case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
          }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      var hcg2rgb_1 = hcg2rgb;

      var unpack$q = utils.unpack;
      var type$j = utils.type;
      var chroma$g = chroma_1;
      var Color$z = Color_1;
      var input$c = input$h;

      var rgb2hcg = rgb2hcg_1;

      Color$z.prototype.hcg = function() {
        return rgb2hcg(this._rgb);
      };

      chroma$g.hcg = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$z, [null].concat(args, ['hcg'])));
      };

      input$c.format.hcg = hcg2rgb_1;

      input$c.autodetect.push({
        p: 1,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$q(args, 'hcg');
          if (type$j(args) === 'array' && args.length === 3) {
            return 'hcg';
          }
        }
      });

      var unpack$p = utils.unpack;
      var last = utils.last;
      var round$3 = Math.round;

      var rgb2hex$2 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$p(args, 'rgba');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var a = ref[3];
        var mode = last(args) || 'auto';
        if (a === undefined) { a = 1; }
        if (mode === 'auto') {
          mode = a < 1 ? 'rgba' : 'rgb';
        }
        r = round$3(r);
        g = round$3(g);
        b = round$3(b);
        var u = r << 16 | g << 8 | b;
        var str = "000000" + u.toString(16); //#.toUpperCase();
        str = str.substr(str.length - 6);
        var hxa = '0' + round$3(a * 255).toString(16);
        hxa = hxa.substr(hxa.length - 2);
        switch (mode.toLowerCase()) {
          case 'rgba': return ("#" + str + hxa);
          case 'argb': return ("#" + hxa + str);
          default: return ("#" + str);
        }
      };

      var rgb2hex_1 = rgb2hex$2;

      var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      var RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

      var hex2rgb$1 = function(hex) {
        if (hex.match(RE_HEX)) {
          // remove optional leading #
          if (hex.length === 4 || hex.length === 7) {
            hex = hex.substr(1);
          }
          // expand short-notation to full six-digit
          if (hex.length === 3) {
            hex = hex.split('');
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          }
          var u = parseInt(hex, 16);
          var r = u >> 16;
          var g = u >> 8 & 0xFF;
          var b = u & 0xFF;
          return [r, g, b, 1];
        }

        // match rgba hex format, eg #FF000077
        if (hex.match(RE_HEXA)) {
          if (hex.length === 5 || hex.length === 9) {
            // remove optional leading #
            hex = hex.substr(1);
          }
          // expand short-notation to full eight-digit
          if (hex.length === 4) {
            hex = hex.split('');
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
          }
          var u$1 = parseInt(hex, 16);
          var r$1 = u$1 >> 24 & 0xFF;
          var g$1 = u$1 >> 16 & 0xFF;
          var b$1 = u$1 >> 8 & 0xFF;
          var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
          return [r$1, g$1, b$1, a];
        }

        // we used to check for css colors here
        // if _input.css? and rgb = _input.css hex
        //     return rgb

        throw new Error(("unknown hex color: " + hex));
      };

      var hex2rgb_1 = hex2rgb$1;

      var chroma$f = chroma_1;
      var Color$y = Color_1;
      var type$i = utils.type;
      var input$b = input$h;

      var rgb2hex$1 = rgb2hex_1;

      Color$y.prototype.hex = function(mode) {
        return rgb2hex$1(this._rgb, mode);
      };

      chroma$f.hex = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$y, [null].concat(args, ['hex'])));
      };

      input$b.format.hex = hex2rgb_1;
      input$b.autodetect.push({
        p: 4,
        test: function(h) {
          var rest = [], len = arguments.length - 1;
          while (len-- > 0) rest[len] = arguments[len + 1];

          if (!rest.length && type$i(h) === 'string' && [3, 4, 5, 6, 7, 8, 9].indexOf(h.length) >= 0) {
            return 'hex';
          }
        }
      });

      var unpack$o = utils.unpack;
      var TWOPI$2 = utils.TWOPI;
      var min$2 = Math.min;
      var sqrt$4 = Math.sqrt;
      var acos = Math.acos;

      var rgb2hsi$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
        */
        var ref = unpack$o(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r /= 255;
        g /= 255;
        b /= 255;
        var h;
        var min_ = min$2(r, g, b);
        var i = (r + g + b) / 3;
        var s = i > 0 ? 1 - min_ / i : 0;
        if (s === 0) {
          h = NaN;
        } else {
          h = ((r - g) + (r - b)) / 2;
          h /= sqrt$4((r - g) * (r - g) + (r - b) * (g - b));
          h = acos(h);
          if (b > g) {
            h = TWOPI$2 - h;
          }
          h /= TWOPI$2;
        }
        return [h * 360, s, i];
      };

      var rgb2hsi_1 = rgb2hsi$1;

      var unpack$n = utils.unpack;
      var limit = utils.limit;
      var TWOPI$1 = utils.TWOPI;
      var PITHIRD = utils.PITHIRD;
      var cos$4 = Math.cos;

      /*
       * hue [0..360]
       * saturation [0..1]
       * intensity [0..1]
       */
      var hsi2rgb = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
        */
        args = unpack$n(args, 'hsi');
        var h = args[0];
        var s = args[1];
        var i = args[2];
        var r, g, b;

        if (isNaN(h)) { h = 0; }
        if (isNaN(s)) { s = 0; }
        // normalize hue
        if (h > 360) { h -= 360; }
        if (h < 0) { h += 360; }
        h /= 360;
        if (h < 1 / 3) {
          b = (1 - s) / 3;
          r = (1 + s * cos$4(TWOPI$1 * h) / cos$4(PITHIRD - TWOPI$1 * h)) / 3;
          g = 1 - (b + r);
        } else if (h < 2 / 3) {
          h -= 1 / 3;
          r = (1 - s) / 3;
          g = (1 + s * cos$4(TWOPI$1 * h) / cos$4(PITHIRD - TWOPI$1 * h)) / 3;
          b = 1 - (r + g);
        } else {
          h -= 2 / 3;
          g = (1 - s) / 3;
          b = (1 + s * cos$4(TWOPI$1 * h) / cos$4(PITHIRD - TWOPI$1 * h)) / 3;
          r = 1 - (g + b);
        }
        r = limit(i * r * 3);
        g = limit(i * g * 3);
        b = limit(i * b * 3);
        return [r * 255, g * 255, b * 255, args.length > 3 ? args[3] : 1];
      };

      var hsi2rgb_1 = hsi2rgb;

      var unpack$m = utils.unpack;
      var type$h = utils.type;
      var chroma$e = chroma_1;
      var Color$x = Color_1;
      var input$a = input$h;

      var rgb2hsi = rgb2hsi_1;

      Color$x.prototype.hsi = function() {
        return rgb2hsi(this._rgb);
      };

      chroma$e.hsi = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$x, [null].concat(args, ['hsi'])));
      };

      input$a.format.hsi = hsi2rgb_1;

      input$a.autodetect.push({
        p: 2,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$m(args, 'hsi');
          if (type$h(args) === 'array' && args.length === 3) {
            return 'hsi';
          }
        }
      });

      var unpack$l = utils.unpack;
      var type$g = utils.type;
      var chroma$d = chroma_1;
      var Color$w = Color_1;
      var input$9 = input$h;

      var rgb2hsl$1 = rgb2hsl_1;

      Color$w.prototype.hsl = function() {
        return rgb2hsl$1(this._rgb);
      };

      chroma$d.hsl = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$w, [null].concat(args, ['hsl'])));
      };

      input$9.format.hsl = hsl2rgb_1;

      input$9.autodetect.push({
        p: 2,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$l(args, 'hsl');
          if (type$g(args) === 'array' && args.length === 3) {
            return 'hsl';
          }
        }
      });

      var unpack$k = utils.unpack;
      var min$1 = Math.min;
      var max$1 = Math.max;

      /*
       * supported arguments:
       * - rgb2hsv(r,g,b)
       * - rgb2hsv([r,g,b])
       * - rgb2hsv({r,g,b})
       */
      var rgb2hsl = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        args = unpack$k(args, 'rgb');
        var r = args[0];
        var g = args[1];
        var b = args[2];
        var min_ = min$1(r, g, b);
        var max_ = max$1(r, g, b);
        var delta = max_ - min_;
        var h, s, v;
        v = max_ / 255.0;
        if (max_ === 0) {
          h = Number.NaN;
          s = 0;
        } else {
          s = delta / max_;
          if (r === max_) { h = (g - b) / delta; }
          if (g === max_) { h = 2 + (b - r) / delta; }
          if (b === max_) { h = 4 + (r - g) / delta; }
          h *= 60;
          if (h < 0) { h += 360; }
        }
        return [h, s, v]
      };

      var rgb2hsv$1 = rgb2hsl;

      var unpack$j = utils.unpack;
      var floor$2 = Math.floor;

      var hsv2rgb = function() {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        args = unpack$j(args, 'hsv');
        var h = args[0];
        var s = args[1];
        var v = args[2];
        var r, g, b;
        v *= 255;
        if (s === 0) {
          r = g = b = v;
        } else {
          if (h === 360) { h = 0; }
          if (h > 360) { h -= 360; }
          if (h < 0) { h += 360; }
          h /= 60;

          var i = floor$2(h);
          var f = h - i;
          var p = v * (1 - s);
          var q = v * (1 - s * f);
          var t = v * (1 - s * (1 - f));

          switch (i) {
            case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
            case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
            case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
            case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
            case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
            case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
          }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      var hsv2rgb_1 = hsv2rgb;

      var unpack$i = utils.unpack;
      var type$f = utils.type;
      var chroma$c = chroma_1;
      var Color$v = Color_1;
      var input$8 = input$h;

      var rgb2hsv = rgb2hsv$1;

      Color$v.prototype.hsv = function() {
        return rgb2hsv(this._rgb);
      };

      chroma$c.hsv = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$v, [null].concat(args, ['hsv'])));
      };

      input$8.format.hsv = hsv2rgb_1;

      input$8.autodetect.push({
        p: 2,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$i(args, 'hsv');
          if (type$f(args) === 'array' && args.length === 3) {
            return 'hsv';
          }
        }
      });

      var labConstants = {
        // Corresponds roughly to RGB brighter/darker
        Kn: 18,

        // D65 standard referent
        Xn: 0.950470,
        Yn: 1,
        Zn: 1.088830,

        t0: 0.137931034,  // 4 / 29
        t1: 0.206896552,  // 6 / 29
        t2: 0.12841855,   // 3 * t1 * t1
        t3: 0.008856452,  // t1 * t1 * t1
      };

      var LAB_CONSTANTS$3 = labConstants;
      var unpack$h = utils.unpack;
      var pow$a = Math.pow;

      var rgb2lab$2 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$h(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2xyz(r, g, b);
        var x = ref$1[0];
        var y = ref$1[1];
        var z = ref$1[2];
        var l = 116 * y - 16;
        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
      };

      var rgb_xyz = function(r) {
        if ((r /= 255) <= 0.04045) { return r / 12.92; }
        return pow$a((r + 0.055) / 1.055, 2.4);
      };

      var xyz_lab = function(t) {
        if (t > LAB_CONSTANTS$3.t3) { return pow$a(t, 1 / 3); }
        return t / LAB_CONSTANTS$3.t2 + LAB_CONSTANTS$3.t0;
      };

      var rgb2xyz = function(r, g, b) {
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS$3.Xn);
        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS$3.Yn);
        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS$3.Zn);
        return [x, y, z];
      };

      var rgb2lab_1 = rgb2lab$2;

      var LAB_CONSTANTS$2 = labConstants;
      var unpack$g = utils.unpack;
      var pow$9 = Math.pow;

      /*
       * L* [0..100]
       * a [-100..100]
       * b [-100..100]
       */
      var lab2rgb$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        args = unpack$g(args, 'lab');
        var l = args[0];
        var a = args[1];
        var b = args[2];
        var x, y, z, r, g, b_;

        y = (l + 16) / 116;
        x = isNaN(a) ? y : y + a / 500;
        z = isNaN(b) ? y : y - b / 200;

        y = LAB_CONSTANTS$2.Yn * lab_xyz(y);
        x = LAB_CONSTANTS$2.Xn * lab_xyz(x);
        z = LAB_CONSTANTS$2.Zn * lab_xyz(z);

        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

        return [r, g, b_, args.length > 3 ? args[3] : 1];
      };

      var xyz_rgb = function(r) {
        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$9(r, 1 / 2.4) - 0.055)
      };

      var lab_xyz = function(t) {
        return t > LAB_CONSTANTS$2.t1 ? t * t * t : LAB_CONSTANTS$2.t2 * (t - LAB_CONSTANTS$2.t0)
      };

      var lab2rgb_1 = lab2rgb$1;

      var unpack$f = utils.unpack;
      var type$e = utils.type;
      var chroma$b = chroma_1;
      var Color$u = Color_1;
      var input$7 = input$h;

      var rgb2lab$1 = rgb2lab_1;

      Color$u.prototype.lab = function() {
        return rgb2lab$1(this._rgb);
      };

      chroma$b.lab = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$u, [null].concat(args, ['lab'])));
      };

      input$7.format.lab = lab2rgb_1;

      input$7.autodetect.push({
        p: 2,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$f(args, 'lab');
          if (type$e(args) === 'array' && args.length === 3) {
            return 'lab';
          }
        }
      });

      var unpack$e = utils.unpack;
      var RAD2DEG = utils.RAD2DEG;
      var sqrt$3 = Math.sqrt;
      var atan2$2 = Math.atan2;
      var round$2 = Math.round;

      var lab2lch$2 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$e(args, 'lab');
        var l = ref[0];
        var a = ref[1];
        var b = ref[2];
        var c = sqrt$3(a * a + b * b);
        var h = (atan2$2(b, a) * RAD2DEG + 360) % 360;
        if (round$2(c * 10000) === 0) { h = Number.NaN; }
        return [l, c, h];
      };

      var lab2lch_1 = lab2lch$2;

      var unpack$d = utils.unpack;
      var rgb2lab = rgb2lab_1;
      var lab2lch$1 = lab2lch_1;

      var rgb2lch$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$d(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2lab(r, g, b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch$1(l, a, b_);
      };

      var rgb2lch_1 = rgb2lch$1;

      var unpack$c = utils.unpack;
      var DEG2RAD = utils.DEG2RAD;
      var sin$3 = Math.sin;
      var cos$3 = Math.cos;

      var lch2lab$2 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.
    
        A saturation multiplier was added by Gregor Aisch
        */
        var ref = unpack$c(args, 'lch');
        var l = ref[0];
        var c = ref[1];
        var h = ref[2];
        if (isNaN(h)) { h = 0; }
        h = h * DEG2RAD;
        return [l, cos$3(h) * c, sin$3(h) * c]
      };

      var lch2lab_1 = lch2lab$2;

      var unpack$b = utils.unpack;
      var lch2lab$1 = lch2lab_1;
      var lab2rgb = lab2rgb_1;

      var lch2rgb$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        args = unpack$b(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab$1(l, c, h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = lab2rgb(L, a, b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      var lch2rgb_1 = lch2rgb$1;

      var unpack$a = utils.unpack;
      var lch2rgb = lch2rgb_1;

      var hcl2rgb = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var hcl = unpack$a(args, 'hcl').reverse();
        return lch2rgb.apply(void 0, hcl);
      };

      var hcl2rgb_1 = hcl2rgb;

      var unpack$9 = utils.unpack;
      var type$d = utils.type;
      var chroma$a = chroma_1;
      var Color$t = Color_1;
      var input$6 = input$h;

      var rgb2lch = rgb2lch_1;

      Color$t.prototype.lch = function() { return rgb2lch(this._rgb); };
      Color$t.prototype.hcl = function() { return rgb2lch(this._rgb).reverse(); };

      chroma$a.lch = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$t, [null].concat(args, ['lch'])));
      };
      chroma$a.hcl = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$t, [null].concat(args, ['hcl'])));
      };

      input$6.format.lch = lch2rgb_1;
      input$6.format.hcl = hcl2rgb_1;

      ['lch', 'hcl'].forEach(function(m) {
        return input$6.autodetect.push({
          p: 2,
          test: function() {
            var args = [], len = arguments.length;
            while (len--) args[len] = arguments[len];

            args = unpack$9(args, m);
            if (type$d(args) === 'array' && args.length === 3) {
              return m;
            }
          }
        });
      });

      /**
        X11 color names
    
        http://www.w3.org/TR/css3-color/#svg-color
      */

      var w3cx11$1 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
      };

      var w3cx11_1 = w3cx11$1;

      var Color$s = Color_1;
      var input$5 = input$h;
      var type$c = utils.type;

      var w3cx11 = w3cx11_1;
      var hex2rgb = hex2rgb_1;
      var rgb2hex = rgb2hex_1;

      Color$s.prototype.name = function() {
        var hex = rgb2hex(this._rgb, 'rgb');
        for (var i = 0, list = Object.keys(w3cx11); i < list.length; i += 1) {
          var n = list[i];

          if (w3cx11[n] === hex) { return n.toLowerCase(); }
        }
        return hex;
      };

      input$5.format.named = function(name) {
        name = name.toLowerCase();
        if (w3cx11[name]) { return hex2rgb(w3cx11[name]); }
        throw new Error('unknown color name: ' + name);
      };

      input$5.autodetect.push({
        p: 5,
        test: function(h) {
          var rest = [], len = arguments.length - 1;
          while (len-- > 0) rest[len] = arguments[len + 1];

          if (!rest.length && type$c(h) === 'string' && w3cx11[h.toLowerCase()]) {
            return 'named';
          }
        }
      });

      var unpack$8 = utils.unpack;

      var rgb2num$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$8(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        return (r << 16) + (g << 8) + b;
      };

      var rgb2num_1 = rgb2num$1;

      var type$b = utils.type;

      var num2rgb = function(num) {
        if (type$b(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
          var r = num >> 16;
          var g = (num >> 8) & 0xFF;
          var b = num & 0xFF;
          return [r, g, b, 1];
        }
        throw new Error("unknown num color: " + num);
      };

      var num2rgb_1 = num2rgb;

      var chroma$9 = chroma_1;
      var Color$r = Color_1;
      var input$4 = input$h;
      var type$a = utils.type;

      var rgb2num = rgb2num_1;

      Color$r.prototype.num = function() {
        return rgb2num(this._rgb);
      };

      chroma$9.num = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$r, [null].concat(args, ['num'])));
      };

      input$4.format.num = num2rgb_1;

      input$4.autodetect.push({
        p: 5,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          if (args.length === 1 && type$a(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
            return 'num';
          }
        }
      });

      var chroma$8 = chroma_1;
      var Color$q = Color_1;
      var input$3 = input$h;
      var unpack$7 = utils.unpack;
      var type$9 = utils.type;
      var round$1 = Math.round;

      Color$q.prototype.rgb = function(rnd) {
        if (rnd === void 0) rnd = true;

        if (rnd === false) { return this._rgb.slice(0, 3); }
        return this._rgb.slice(0, 3).map(round$1);
      };

      Color$q.prototype.rgba = function(rnd) {
        if (rnd === void 0) rnd = true;

        return this._rgb.slice(0, 4).map(function(v, i) {
          return i < 3 ? (rnd === false ? v : round$1(v)) : v;
        });
      };

      chroma$8.rgb = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$q, [null].concat(args, ['rgb'])));
      };

      input$3.format.rgb = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var rgba = unpack$7(args, 'rgba');
        if (rgba[3] === undefined) { rgba[3] = 1; }
        return rgba;
      };

      input$3.autodetect.push({
        p: 3,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$7(args, 'rgba');
          if (type$9(args) === 'array' && (args.length === 3 ||
            args.length === 4 && type$9(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
            return 'rgb';
          }
        }
      });

      /*
       * Based on implementation by Neil Bartlett
       * https://github.com/neilbartlett/color-temperature
       */

      var log$1 = Math.log;

      var temperature2rgb$1 = function(kelvin) {
        var temp = kelvin / 100;
        var r, g, b;
        if (temp < 66) {
          r = 255;
          g = temp < 6 ? 0 : -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * log$1(g);
          b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * log$1(b);
        } else {
          r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * log$1(r);
          g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * log$1(g);
          b = 255;
        }
        return [r, g, b, 1];
      };

      var temperature2rgb_1 = temperature2rgb$1;

      /*
       * Based on implementation by Neil Bartlett
       * https://github.com/neilbartlett/color-temperature
       **/

      var temperature2rgb = temperature2rgb_1;
      var unpack$6 = utils.unpack;
      var round = Math.round;

      var rgb2temperature$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var rgb = unpack$6(args, 'rgb');
        var r = rgb[0], b = rgb[2];
        var minTemp = 1000;
        var maxTemp = 40000;
        var eps = 0.4;
        var temp;
        while (maxTemp - minTemp > eps) {
          temp = (maxTemp + minTemp) * 0.5;
          var rgb$1 = temperature2rgb(temp);
          if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
            maxTemp = temp;
          } else {
            minTemp = temp;
          }
        }
        return round(temp);
      };

      var rgb2temperature_1 = rgb2temperature$1;

      var chroma$7 = chroma_1;
      var Color$p = Color_1;
      var input$2 = input$h;

      var rgb2temperature = rgb2temperature_1;

      Color$p.prototype.temp =
        Color$p.prototype.kelvin =
        Color$p.prototype.temperature = function() {
          return rgb2temperature(this._rgb);
        };

      chroma$7.temp =
        chroma$7.kelvin =
        chroma$7.temperature = function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          return new (Function.prototype.bind.apply(Color$p, [null].concat(args, ['temp'])));
        };

      input$2.format.temp =
        input$2.format.kelvin =
        input$2.format.temperature = temperature2rgb_1;

      var unpack$5 = utils.unpack;
      var cbrt = Math.cbrt;
      var pow$8 = Math.pow;
      var sign$1 = Math.sign;

      var rgb2oklab$2 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        // OKLab color space implementation taken from
        // https://bottosson.github.io/posts/oklab/
        var ref = unpack$5(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = [rgb2lrgb(r / 255), rgb2lrgb(g / 255), rgb2lrgb(b / 255)];
        var lr = ref$1[0];
        var lg = ref$1[1];
        var lb = ref$1[2];
        var l = cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
        var m = cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
        var s = cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

        return [
          0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
          1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
        ];
      };

      var rgb2oklab_1 = rgb2oklab$2;

      function rgb2lrgb(c) {
        var abs = Math.abs(c);
        if (abs < 0.04045) {
          return c / 12.92;
        }
        return (sign$1(c) || 1) * pow$8((abs + 0.055) / 1.055, 2.4);
      }

      var unpack$4 = utils.unpack;
      var pow$7 = Math.pow;
      var sign = Math.sign;

      /*
       * L* [0..100]
       * a [-100..100]
       * b [-100..100]
       */
      var oklab2rgb$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        args = unpack$4(args, 'lab');
        var L = args[0];
        var a = args[1];
        var b = args[2];

        var l = pow$7(L + 0.3963377774 * a + 0.2158037573 * b, 3);
        var m = pow$7(L - 0.1055613458 * a - 0.0638541728 * b, 3);
        var s = pow$7(L - 0.0894841775 * a - 1.291485548 * b, 3);

        return [
          255 * lrgb2rgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
          255 * lrgb2rgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
          255 * lrgb2rgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
          args.length > 3 ? args[3] : 1
        ];
      };

      var oklab2rgb_1 = oklab2rgb$1;

      function lrgb2rgb(c) {
        var abs = Math.abs(c);
        if (abs > 0.0031308) {
          return (sign(c) || 1) * (1.055 * pow$7(abs, 1 / 2.4) - 0.055);
        }
        return c * 12.92;
      }

      var unpack$3 = utils.unpack;
      var type$8 = utils.type;
      var chroma$6 = chroma_1;
      var Color$o = Color_1;
      var input$1 = input$h;

      var rgb2oklab$1 = rgb2oklab_1;

      Color$o.prototype.oklab = function() {
        return rgb2oklab$1(this._rgb);
      };

      chroma$6.oklab = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$o, [null].concat(args, ['oklab'])));
      };

      input$1.format.oklab = oklab2rgb_1;

      input$1.autodetect.push({
        p: 3,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack$3(args, 'oklab');
          if (type$8(args) === 'array' && args.length === 3) {
            return 'oklab';
          }
        }
      });

      var unpack$2 = utils.unpack;
      var rgb2oklab = rgb2oklab_1;
      var lab2lch = lab2lch_1;

      var rgb2oklch$1 = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        var ref = unpack$2(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2oklab(r, g, b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch(l, a, b_);
      };

      var rgb2oklch_1 = rgb2oklch$1;

      var unpack$1 = utils.unpack;
      var lch2lab = lch2lab_1;
      var oklab2rgb = oklab2rgb_1;

      var oklch2rgb = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        args = unpack$1(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab(l, c, h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = oklab2rgb(L, a, b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
      };

      var oklch2rgb_1 = oklch2rgb;

      var unpack = utils.unpack;
      var type$7 = utils.type;
      var chroma$5 = chroma_1;
      var Color$n = Color_1;
      var input = input$h;

      var rgb2oklch = rgb2oklch_1;

      Color$n.prototype.oklch = function() {
        return rgb2oklch(this._rgb);
      };

      chroma$5.oklch = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return new (Function.prototype.bind.apply(Color$n, [null].concat(args, ['oklch'])));
      };

      input.format.oklch = oklch2rgb_1;

      input.autodetect.push({
        p: 3,
        test: function() {
          var args = [], len = arguments.length;
          while (len--) args[len] = arguments[len];

          args = unpack(args, 'oklch');
          if (type$7(args) === 'array' && args.length === 3) {
            return 'oklch';
          }
        }
      });

      var Color$m = Color_1;
      var type$6 = utils.type;

      Color$m.prototype.alpha = function(a, mutate) {
        if (mutate === void 0) mutate = false;

        if (a !== undefined && type$6(a) === 'number') {
          if (mutate) {
            this._rgb[3] = a;
            return this;
          }
          return new Color$m([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
        }
        return this._rgb[3];
      };

      var Color$l = Color_1;

      Color$l.prototype.clipped = function() {
        return this._rgb._clipped || false;
      };

      var Color$k = Color_1;
      var LAB_CONSTANTS$1 = labConstants;

      Color$k.prototype.darken = function(amount) {
        if (amount === void 0) amount = 1;

        var me = this;
        var lab = me.lab();
        lab[0] -= LAB_CONSTANTS$1.Kn * amount;
        return new Color$k(lab, 'lab').alpha(me.alpha(), true);
      };

      Color$k.prototype.brighten = function(amount) {
        if (amount === void 0) amount = 1;

        return this.darken(-amount);
      };

      Color$k.prototype.darker = Color$k.prototype.darken;
      Color$k.prototype.brighter = Color$k.prototype.brighten;

      var Color$j = Color_1;

      Color$j.prototype.get = function(mc) {
        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
          var i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
          if (i > -1) { return src[i]; }
          throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
          return src;
        }
      };

      var Color$i = Color_1;
      var type$5 = utils.type;
      var pow$6 = Math.pow;

      var EPS = 1e-7;
      var MAX_ITER = 20;

      Color$i.prototype.luminance = function(lum) {
        if (lum !== undefined && type$5(lum) === 'number') {
          if (lum === 0) {
            // return pure black
            return new Color$i([0, 0, 0, this._rgb[3]], 'rgb');
          }
          if (lum === 1) {
            // return pure white
            return new Color$i([255, 255, 255, this._rgb[3]], 'rgb');
          }
          // compute new color using...
          var cur_lum = this.luminance();
          var mode = 'rgb';
          var max_iter = MAX_ITER;

          var test = function(low, high) {
            var mid = low.interpolate(high, 0.5, mode);
            var lm = mid.luminance();
            if (Math.abs(lum - lm) < EPS || !max_iter--) {
              // close enough
              return mid;
            }
            return lm > lum ? test(low, mid) : test(mid, high);
          };

          var rgb = (cur_lum > lum ? test(new Color$i([0, 0, 0]), this) : test(this, new Color$i([255, 255, 255]))).rgb();
          return new Color$i(rgb.concat([this._rgb[3]]));
        }
        return rgb2luminance.apply(void 0, (this._rgb).slice(0, 3));
      };


      var rgb2luminance = function(r, g, b) {
        // relative luminance
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        r = luminance_x(r);
        g = luminance_x(g);
        b = luminance_x(b);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      var luminance_x = function(x) {
        x /= 255;
        return x <= 0.03928 ? x / 12.92 : pow$6((x + 0.055) / 1.055, 2.4);
      };

      var interpolator$1 = {};

      var Color$h = Color_1;
      var type$4 = utils.type;
      var interpolator = interpolator$1;

      var mix$1 = function(col1, col2, f) {
        if (f === void 0) f = 0.5;
        var rest = [], len = arguments.length - 3;
        while (len-- > 0) rest[len] = arguments[len + 3];

        var mode = rest[0] || 'lrgb';
        if (!interpolator[mode] && !rest.length) {
          // fall back to the first supported mode
          mode = Object.keys(interpolator)[0];
        }
        if (!interpolator[mode]) {
          throw new Error(("interpolation mode " + mode + " is not defined"));
        }
        if (type$4(col1) !== 'object') { col1 = new Color$h(col1); }
        if (type$4(col2) !== 'object') { col2 = new Color$h(col2); }
        return interpolator[mode](col1, col2, f)
          .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
      };

      var Color$g = Color_1;
      var mix = mix$1;

      Color$g.prototype.mix =
        Color$g.prototype.interpolate = function(col2, f) {
          if (f === void 0) f = 0.5;
          var rest = [], len = arguments.length - 2;
          while (len-- > 0) rest[len] = arguments[len + 2];

          return mix.apply(void 0, [this, col2, f].concat(rest));
        };

      var Color$f = Color_1;

      Color$f.prototype.premultiply = function(mutate) {
        if (mutate === void 0) mutate = false;

        var rgb = this._rgb;
        var a = rgb[3];
        if (mutate) {
          this._rgb = [rgb[0] * a, rgb[1] * a, rgb[2] * a, a];
          return this;
        } else {
          return new Color$f([rgb[0] * a, rgb[1] * a, rgb[2] * a, a], 'rgb');
        }
      };

      var Color$e = Color_1;
      var LAB_CONSTANTS = labConstants;

      Color$e.prototype.saturate = function(amount) {
        if (amount === void 0) amount = 1;

        var me = this;
        var lch = me.lch();
        lch[1] += LAB_CONSTANTS.Kn * amount;
        if (lch[1] < 0) { lch[1] = 0; }
        return new Color$e(lch, 'lch').alpha(me.alpha(), true);
      };

      Color$e.prototype.desaturate = function(amount) {
        if (amount === void 0) amount = 1;

        return this.saturate(-amount);
      };

      var Color$d = Color_1;
      var type$3 = utils.type;

      Color$d.prototype.set = function(mc, value, mutate) {
        if (mutate === void 0) mutate = false;

        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
          var i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
          if (i > -1) {
            if (type$3(value) == 'string') {
              switch (value.charAt(0)) {
                case '+':
                  src[i] += +value;
                  break;
                case '-':
                  src[i] += +value;
                  break;
                case '*':
                  src[i] *= +value.substr(1);
                  break;
                case '/':
                  src[i] /= +value.substr(1);
                  break;
                default:
                  src[i] = +value;
              }
            } else if (type$3(value) === 'number') {
              src[i] = value;
            } else {
              throw new Error("unsupported value for Color.set");
            }
            var out = new Color$d(src, mode);
            if (mutate) {
              this._rgb = out._rgb;
              return this;
            }
            return out;
          }
          throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
          return src;
        }
      };

      var Color$c = Color_1;

      var rgb = function(col1, col2, f) {
        var xyz0 = col1._rgb;
        var xyz1 = col2._rgb;
        return new Color$c(
          xyz0[0] + f * (xyz1[0] - xyz0[0]),
          xyz0[1] + f * (xyz1[1] - xyz0[1]),
          xyz0[2] + f * (xyz1[2] - xyz0[2]),
          'rgb'
        )
      };

      // register interpolator
      interpolator$1.rgb = rgb;

      var Color$b = Color_1;
      var sqrt$2 = Math.sqrt;
      var pow$5 = Math.pow;

      var lrgb = function(col1, col2, f) {
        var ref = col1._rgb;
        var x1 = ref[0];
        var y1 = ref[1];
        var z1 = ref[2];
        var ref$1 = col2._rgb;
        var x2 = ref$1[0];
        var y2 = ref$1[1];
        var z2 = ref$1[2];
        return new Color$b(
          sqrt$2(pow$5(x1, 2) * (1 - f) + pow$5(x2, 2) * f),
          sqrt$2(pow$5(y1, 2) * (1 - f) + pow$5(y2, 2) * f),
          sqrt$2(pow$5(z1, 2) * (1 - f) + pow$5(z2, 2) * f),
          'rgb'
        )
      };

      // register interpolator
      interpolator$1.lrgb = lrgb;

      var Color$a = Color_1;

      var lab = function(col1, col2, f) {
        var xyz0 = col1.lab();
        var xyz1 = col2.lab();
        return new Color$a(
          xyz0[0] + f * (xyz1[0] - xyz0[0]),
          xyz0[1] + f * (xyz1[1] - xyz0[1]),
          xyz0[2] + f * (xyz1[2] - xyz0[2]),
          'lab'
        )
      };

      // register interpolator
      interpolator$1.lab = lab;

      var Color$9 = Color_1;

      var _hsx = function(col1, col2, f, m) {
        var assign, assign$1;

        var xyz0, xyz1;
        if (m === 'hsl') {
          xyz0 = col1.hsl();
          xyz1 = col2.hsl();
        } else if (m === 'hsv') {
          xyz0 = col1.hsv();
          xyz1 = col2.hsv();
        } else if (m === 'hcg') {
          xyz0 = col1.hcg();
          xyz1 = col2.hcg();
        } else if (m === 'hsi') {
          xyz0 = col1.hsi();
          xyz1 = col2.hsi();
        } else if (m === 'lch' || m === 'hcl') {
          m = 'hcl';
          xyz0 = col1.hcl();
          xyz1 = col2.hcl();
        } else if (m === 'oklch') {
          xyz0 = col1.oklch().reverse();
          xyz1 = col2.oklch().reverse();
        }

        var hue0, hue1, sat0, sat1, lbv0, lbv1;
        if (m.substr(0, 1) === 'h' || m === 'oklch') {
          (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
          (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
        }

        var sat, hue, lbv, dh;

        if (!isNaN(hue0) && !isNaN(hue1)) {
          // both colors have hue
          if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
          } else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
          } else {
            dh = hue1 - hue0;
          }
          hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
          hue = hue0;
          if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
        } else if (!isNaN(hue1)) {
          hue = hue1;
          if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
        } else {
          hue = Number.NaN;
        }

        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
        lbv = lbv0 + f * (lbv1 - lbv0);
        return m === 'oklch' ? new Color$9([lbv, sat, hue], m) : new Color$9([hue, sat, lbv], m);
      };

      var interpolate_hsx$5 = _hsx;

      var lch = function(col1, col2, f) {
        return interpolate_hsx$5(col1, col2, f, 'lch');
      };

      // register interpolator
      interpolator$1.lch = lch;
      interpolator$1.hcl = lch;

      var Color$8 = Color_1;

      var num = function(col1, col2, f) {
        var c1 = col1.num();
        var c2 = col2.num();
        return new Color$8(c1 + f * (c2 - c1), 'num')
      };

      // register interpolator
      interpolator$1.num = num;

      var interpolate_hsx$4 = _hsx;

      var hcg = function(col1, col2, f) {
        return interpolate_hsx$4(col1, col2, f, 'hcg');
      };

      // register interpolator
      interpolator$1.hcg = hcg;

      var interpolate_hsx$3 = _hsx;

      var hsi = function(col1, col2, f) {
        return interpolate_hsx$3(col1, col2, f, 'hsi');
      };

      // register interpolator
      interpolator$1.hsi = hsi;

      var interpolate_hsx$2 = _hsx;

      var hsl = function(col1, col2, f) {
        return interpolate_hsx$2(col1, col2, f, 'hsl');
      };

      // register interpolator
      interpolator$1.hsl = hsl;

      var interpolate_hsx$1 = _hsx;

      var hsv = function(col1, col2, f) {
        return interpolate_hsx$1(col1, col2, f, 'hsv');
      };

      // register interpolator
      interpolator$1.hsv = hsv;

      var Color$7 = Color_1;

      var oklab = function(col1, col2, f) {
        var xyz0 = col1.oklab();
        var xyz1 = col2.oklab();
        return new Color$7(
          xyz0[0] + f * (xyz1[0] - xyz0[0]),
          xyz0[1] + f * (xyz1[1] - xyz0[1]),
          xyz0[2] + f * (xyz1[2] - xyz0[2]),
          'oklab'
        );
      };

      // register interpolator
      interpolator$1.oklab = oklab;

      var interpolate_hsx = _hsx;

      var oklch = function(col1, col2, f) {
        return interpolate_hsx(col1, col2, f, 'oklch');
      };

      // register interpolator
      interpolator$1.oklch = oklch;

      var Color$6 = Color_1;
      var clip_rgb$1 = utils.clip_rgb;
      var pow$4 = Math.pow;
      var sqrt$1 = Math.sqrt;
      var PI$1 = Math.PI;
      var cos$2 = Math.cos;
      var sin$2 = Math.sin;
      var atan2$1 = Math.atan2;

      var average = function(colors, mode, weights) {
        if (mode === void 0) mode = 'lrgb';
        if (weights === void 0) weights = null;

        var l = colors.length;
        if (!weights) { weights = Array.from(new Array(l)).map(function() { return 1; }); }
        // normalize weights
        var k = l / weights.reduce(function(a, b) { return a + b; });
        weights.forEach(function(w, i) { weights[i] *= k; });
        // convert colors to Color objects
        colors = colors.map(function(c) { return new Color$6(c); });
        if (mode === 'lrgb') {
          return _average_lrgb(colors, weights)
        }
        var first = colors.shift();
        var xyz = first.get(mode);
        var cnt = [];
        var dx = 0;
        var dy = 0;
        // initial color
        for (var i = 0; i < xyz.length; i++) {
          xyz[i] = (xyz[i] || 0) * weights[0];
          cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
          if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
            var A = xyz[i] / 180 * PI$1;
            dx += cos$2(A) * weights[0];
            dy += sin$2(A) * weights[0];
          }
        }

        var alpha = first.alpha() * weights[0];
        colors.forEach(function(c, ci) {
          var xyz2 = c.get(mode);
          alpha += c.alpha() * weights[ci + 1];
          for (var i = 0; i < xyz.length; i++) {
            if (!isNaN(xyz2[i])) {
              cnt[i] += weights[ci + 1];
              if (mode.charAt(i) === 'h') {
                var A = xyz2[i] / 180 * PI$1;
                dx += cos$2(A) * weights[ci + 1];
                dy += sin$2(A) * weights[ci + 1];
              } else {
                xyz[i] += xyz2[i] * weights[ci + 1];
              }
            }
          }
        });

        for (var i$1 = 0; i$1 < xyz.length; i$1++) {
          if (mode.charAt(i$1) === 'h') {
            var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
            while (A$1 < 0) { A$1 += 360; }
            while (A$1 >= 360) { A$1 -= 360; }
            xyz[i$1] = A$1;
          } else {
            xyz[i$1] = xyz[i$1] / cnt[i$1];
          }
        }
        alpha /= l;
        return (new Color$6(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
      };


      var _average_lrgb = function(colors, weights) {
        var l = colors.length;
        var xyz = [0, 0, 0, 0];
        for (var i = 0; i < colors.length; i++) {
          var col = colors[i];
          var f = weights[i] / l;
          var rgb = col._rgb;
          xyz[0] += pow$4(rgb[0], 2) * f;
          xyz[1] += pow$4(rgb[1], 2) * f;
          xyz[2] += pow$4(rgb[2], 2) * f;
          xyz[3] += rgb[3] * f;
        }
        xyz[0] = sqrt$1(xyz[0]);
        xyz[1] = sqrt$1(xyz[1]);
        xyz[2] = sqrt$1(xyz[2]);
        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
        return new Color$6(clip_rgb$1(xyz));
      };

      // minimal multi-purpose interface

      // @requires utils color analyze

      var chroma$4 = chroma_1;
      var type$2 = utils.type;

      var pow$3 = Math.pow;

      var scale$2 = function(colors) {

        // constructor
        var _mode = 'rgb';
        var _nacol = chroma$4('#ccc');
        var _spread = 0;
        // const _fixed = false;
        var _domain = [0, 1];
        var _pos = [];
        var _padding = [0, 0];
        var _classes = false;
        var _colors = [];
        var _out = false;
        var _min = 0;
        var _max = 1;
        var _correctLightness = false;
        var _colorCache = {};
        var _useCache = true;
        var _gamma = 1;

        // private methods

        var setColors = function(colors) {
          colors = colors || ['#fff', '#000'];
          if (colors && type$2(colors) === 'string' && chroma$4.brewer &&
            chroma$4.brewer[colors.toLowerCase()]) {
            colors = chroma$4.brewer[colors.toLowerCase()];
          }
          if (type$2(colors) === 'array') {
            // handle single color
            if (colors.length === 1) {
              colors = [colors[0], colors[0]];
            }
            // make a copy of the colors
            colors = colors.slice(0);
            // convert to chroma classes
            for (var c = 0; c < colors.length; c++) {
              colors[c] = chroma$4(colors[c]);
            }
            // auto-fill color position
            _pos.length = 0;
            for (var c$1 = 0; c$1 < colors.length; c$1++) {
              _pos.push(c$1 / (colors.length - 1));
            }
          }
          resetCache();
          return _colors = colors;
        };

        var getClass = function(value) {
          if (_classes != null) {
            var n = _classes.length - 1;
            var i = 0;
            while (i < n && value >= _classes[i]) {
              i++;
            }
            return i - 1;
          }
          return 0;
        };

        var tMapLightness = function(t) { return t; };
        var tMapDomain = function(t) { return t; };

        // const classifyValue = function(value) {
        //     let val = value;
        //     if (_classes.length > 2) {
        //         const n = _classes.length-1;
        //         const i = getClass(value);
        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
        //     }
        //     return val;
        // };

        var getColor = function(val, bypassMap) {
          var col, t;
          if (bypassMap == null) { bypassMap = false; }
          if (isNaN(val) || (val === null)) { return _nacol; }
          if (!bypassMap) {
            if (_classes && (_classes.length > 2)) {
              // find the class
              var c = getClass(val);
              t = c / (_classes.length - 2);
            } else if (_max !== _min) {
              // just interpolate between min/max
              t = (val - _min) / (_max - _min);
            } else {
              t = 1;
            }
          } else {
            t = val;
          }

          // domain map
          t = tMapDomain(t);

          if (!bypassMap) {
            t = tMapLightness(t);  // lightness correction
          }

          if (_gamma !== 1) { t = pow$3(t, _gamma); }

          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

          t = Math.min(1, Math.max(0, t));

          var k = Math.floor(t * 10000);

          if (_useCache && _colorCache[k]) {
            col = _colorCache[k];
          } else {
            if (type$2(_colors) === 'array') {
              //for i in [0.._pos.length-1]
              for (var i = 0; i < _pos.length; i++) {
                var p = _pos[i];
                if (t <= p) {
                  col = _colors[i];
                  break;
                }
                if ((t >= p) && (i === (_pos.length - 1))) {
                  col = _colors[i];
                  break;
                }
                if (t > p && t < _pos[i + 1]) {
                  t = (t - p) / (_pos[i + 1] - p);
                  col = chroma$4.interpolate(_colors[i], _colors[i + 1], t, _mode);
                  break;
                }
              }
            } else if (type$2(_colors) === 'function') {
              col = _colors(t);
            }
            if (_useCache) { _colorCache[k] = col; }
          }
          return col;
        };

        var resetCache = function() { return _colorCache = {}; };

        setColors(colors);

        // public interface

        var f = function(v) {
          var c = chroma$4(getColor(v));
          if (_out && c[_out]) { return c[_out](); } else { return c; }
        };

        f.classes = function(classes) {
          if (classes != null) {
            if (type$2(classes) === 'array') {
              _classes = classes;
              _domain = [classes[0], classes[classes.length - 1]];
            } else {
              var d = chroma$4.analyze(_domain);
              if (classes === 0) {
                _classes = [d.min, d.max];
              } else {
                _classes = chroma$4.limits(d, 'e', classes);
              }
            }
            return f;
          }
          return _classes;
        };


        f.domain = function(domain) {
          if (!arguments.length) {
            return _domain;
          }
          _min = domain[0];
          _max = domain[domain.length - 1];
          _pos = [];
          var k = _colors.length;
          if ((domain.length === k) && (_min !== _max)) {
            // update positions
            for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
              var d = list[i];

              _pos.push((d - _min) / (_max - _min));
            }
          } else {
            for (var c = 0; c < k; c++) {
              _pos.push(c / (k - 1));
            }
            if (domain.length > 2) {
              // set domain map
              var tOut = domain.map(function(d, i) { return i / (domain.length - 1); });
              var tBreaks = domain.map(function(d) { return (d - _min) / (_max - _min); });
              if (!tBreaks.every(function(val, i) { return tOut[i] === val; })) {
                tMapDomain = function(t) {
                  if (t <= 0 || t >= 1) { return t; }
                  var i = 0;
                  while (t >= tBreaks[i + 1]) { i++; }
                  var f = (t - tBreaks[i]) / (tBreaks[i + 1] - tBreaks[i]);
                  var out = tOut[i] + f * (tOut[i + 1] - tOut[i]);
                  return out;
                };
              }

            }
          }
          _domain = [_min, _max];
          return f;
        };

        f.mode = function(_m) {
          if (!arguments.length) {
            return _mode;
          }
          _mode = _m;
          resetCache();
          return f;
        };

        f.range = function(colors, _pos) {
          setColors(colors);
          return f;
        };

        f.out = function(_o) {
          _out = _o;
          return f;
        };

        f.spread = function(val) {
          if (!arguments.length) {
            return _spread;
          }
          _spread = val;
          return f;
        };

        f.correctLightness = function(v) {
          if (v == null) { v = true; }
          _correctLightness = v;
          resetCache();
          if (_correctLightness) {
            tMapLightness = function(t) {
              var L0 = getColor(0, true).lab()[0];
              var L1 = getColor(1, true).lab()[0];
              var pol = L0 > L1;
              var L_actual = getColor(t, true).lab()[0];
              var L_ideal = L0 + ((L1 - L0) * t);
              var L_diff = L_actual - L_ideal;
              var t0 = 0;
              var t1 = 1;
              var max_iter = 20;
              while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
                (function() {
                  if (pol) { L_diff *= -1; }
                  if (L_diff < 0) {
                    t0 = t;
                    t += (t1 - t) * 0.5;
                  } else {
                    t1 = t;
                    t += (t0 - t) * 0.5;
                  }
                  L_actual = getColor(t, true).lab()[0];
                  return L_diff = L_actual - L_ideal;
                })();
              }
              return t;
            };
          } else {
            tMapLightness = function(t) { return t; };
          }
          return f;
        };

        f.padding = function(p) {
          if (p != null) {
            if (type$2(p) === 'number') {
              p = [p, p];
            }
            _padding = p;
            return f;
          } else {
            return _padding;
          }
        };

        f.colors = function(numColors, out) {
          // If no arguments are given, return the original colors that were provided
          if (arguments.length < 2) { out = 'hex'; }
          var result = [];

          if (arguments.length === 0) {
            result = _colors.slice(0);

          } else if (numColors === 1) {
            result = [f(0.5)];

          } else if (numColors > 1) {
            var dm = _domain[0];
            var dd = _domain[1] - dm;
            result = __range__(0, numColors, false).map(function(i) { return f(dm + ((i / (numColors - 1)) * dd)); });

          } else { // returns all colors based on the defined classes
            colors = [];
            var samples = [];
            if (_classes && (_classes.length > 2)) {
              for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                samples.push((_classes[i - 1] + _classes[i]) * 0.5);
              }
            } else {
              samples = _domain;
            }
            result = samples.map(function(v) { return f(v); });
          }

          if (chroma$4[out]) {
            result = result.map(function(c) { return c[out](); });
          }
          return result;
        };

        f.cache = function(c) {
          if (c != null) {
            _useCache = c;
            return f;
          } else {
            return _useCache;
          }
        };

        f.gamma = function(g) {
          if (g != null) {
            _gamma = g;
            return f;
          } else {
            return _gamma;
          }
        };

        f.nodata = function(d) {
          if (d != null) {
            _nacol = chroma$4(d);
            return f;
          } else {
            return _nacol;
          }
        };

        return f;
      };

      function __range__(left, right, inclusive) {
        var range = [];
        var ascending = left < right;
        var end = !inclusive ? right : ascending ? right + 1 : right - 1;
        for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
          range.push(i);
        }
        return range;
      }

      //
      // interpolates between a set of colors uzing a bezier spline
      //

      // @requires utils lab
      var Color$5 = Color_1;

      var scale$1 = scale$2;

      // nth row of the pascal triangle
      var binom_row = function(n) {
        var row = [1, 1];
        for (var i = 1; i < n; i++) {
          var newrow = [1];
          for (var j = 1; j <= row.length; j++) {
            newrow[j] = (row[j] || 0) + row[j - 1];
          }
          row = newrow;
        }
        return row;
      };

      var bezier = function(colors) {
        var assign, assign$1, assign$2;

        var I, lab0, lab1, lab2;
        colors = colors.map(function(c) { return new Color$5(c); });
        if (colors.length === 2) {
          // linear interpolation
          (assign = colors.map(function(c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
          I = function(t) {
            var lab = ([0, 1, 2].map(function(i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
            return new Color$5(lab, 'lab');
          };
        } else if (colors.length === 3) {
          // quadratic bezier interpolation
          (assign$1 = colors.map(function(c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
          I = function(t) {
            var lab = ([0, 1, 2].map(function(i) { return ((1 - t) * (1 - t) * lab0[i]) + (2 * (1 - t) * t * lab1[i]) + (t * t * lab2[i]); }));
            return new Color$5(lab, 'lab');
          };
        } else if (colors.length === 4) {
          // cubic bezier interpolation
          var lab3;
          (assign$2 = colors.map(function(c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
          I = function(t) {
            var lab = ([0, 1, 2].map(function(i) { return ((1 - t) * (1 - t) * (1 - t) * lab0[i]) + (3 * (1 - t) * (1 - t) * t * lab1[i]) + (3 * (1 - t) * t * t * lab2[i]) + (t * t * t * lab3[i]); }));
            return new Color$5(lab, 'lab');
          };
        } else if (colors.length >= 5) {
          // general case (degree n bezier)
          var labs, row, n;
          labs = colors.map(function(c) { return c.lab(); });
          n = colors.length - 1;
          row = binom_row(n);
          I = function(t) {
            var u = 1 - t;
            var lab = ([0, 1, 2].map(function(i) { return labs.reduce(function(sum, el, j) { return (sum + row[j] * Math.pow(u, (n - j)) * Math.pow(t, j) * el[i]); }, 0); }));
            return new Color$5(lab, 'lab');
          };
        } else {
          throw new RangeError("No point in running bezier with only one color.")
        }
        return I;
      };

      var bezier_1 = function(colors) {
        var f = bezier(colors);
        f.scale = function() { return scale$1(f); };
        return f;
      };

      /*
       * interpolates between a set of colors uzing a bezier spline
       * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
       */

      var chroma$3 = chroma_1;

      var blend = function(bottom, top, mode) {
        if (!blend[mode]) {
          throw new Error('unknown blend mode ' + mode);
        }
        return blend[mode](bottom, top);
      };

      var blend_f = function(f) {
        return function(bottom, top) {
          var c0 = chroma$3(top).rgb();
          var c1 = chroma$3(bottom).rgb();
          return chroma$3.rgb(f(c0, c1));
        };
      };

      var each = function(f) {
        return function(c0, c1) {
          var out = [];
          out[0] = f(c0[0], c1[0]);
          out[1] = f(c0[1], c1[1]);
          out[2] = f(c0[2], c1[2]);
          return out;
        };
      };

      var normal = function(a) { return a; };
      var multiply = function(a, b) { return a * b / 255; };
      var darken = function(a, b) { return a > b ? b : a; };
      var lighten = function(a, b) { return a > b ? a : b; };
      var screen = function(a, b) { return 255 * (1 - (1 - a / 255) * (1 - b / 255)); };
      var overlay = function(a, b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255)); };
      var burn = function(a, b) { return 255 * (1 - (1 - b / 255) / (a / 255)); };
      var dodge = function(a, b) {
        if (a === 255) { return 255; }
        a = 255 * (b / 255) / (1 - a / 255);
        return a > 255 ? 255 : a
      };

      // # add = (a,b) ->
      // #     if (a + b > 255) then 255 else a + b

      blend.normal = blend_f(each(normal));
      blend.multiply = blend_f(each(multiply));
      blend.screen = blend_f(each(screen));
      blend.overlay = blend_f(each(overlay));
      blend.darken = blend_f(each(darken));
      blend.lighten = blend_f(each(lighten));
      blend.dodge = blend_f(each(dodge));
      blend.burn = blend_f(each(burn));
      // blend.add = blend_f(each(add));

      var blend_1 = blend;

      // cubehelix interpolation
      // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
      // http://astron-soc.in/bulletin/11June/289392011.pdf

      var type$1 = utils.type;
      var clip_rgb = utils.clip_rgb;
      var TWOPI = utils.TWOPI;
      var pow$2 = Math.pow;
      var sin$1 = Math.sin;
      var cos$1 = Math.cos;
      var chroma$2 = chroma_1;

      var cubehelix = function(start, rotations, hue, gamma, lightness) {
        if (start === void 0) start = 300;
        if (rotations === void 0) rotations = -1.5;
        if (hue === void 0) hue = 1;
        if (gamma === void 0) gamma = 1;
        if (lightness === void 0) lightness = [0, 1];

        var dh = 0, dl;
        if (type$1(lightness) === 'array') {
          dl = lightness[1] - lightness[0];
        } else {
          dl = 0;
          lightness = [lightness, lightness];
        }

        var f = function(fract) {
          var a = TWOPI * (((start + 120) / 360) + (rotations * fract));
          var l = pow$2(lightness[0] + (dl * fract), gamma);
          var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
          var amp = (h * l * (1 - l)) / 2;
          var cos_a = cos$1(a);
          var sin_a = sin$1(a);
          var r = l + (amp * ((-0.14861 * cos_a) + (1.78277 * sin_a)));
          var g = l + (amp * ((-0.29227 * cos_a) - (0.90649 * sin_a)));
          var b = l + (amp * (+1.97294 * cos_a));
          return chroma$2(clip_rgb([r * 255, g * 255, b * 255, 1]));
        };

        f.start = function(s) {
          if ((s == null)) { return start; }
          start = s;
          return f;
        };

        f.rotations = function(r) {
          if ((r == null)) { return rotations; }
          rotations = r;
          return f;
        };

        f.gamma = function(g) {
          if ((g == null)) { return gamma; }
          gamma = g;
          return f;
        };

        f.hue = function(h) {
          if ((h == null)) { return hue; }
          hue = h;
          if (type$1(hue) === 'array') {
            dh = hue[1] - hue[0];
            if (dh === 0) { hue = hue[1]; }
          } else {
            dh = 0;
          }
          return f;
        };

        f.lightness = function(h) {
          if ((h == null)) { return lightness; }
          if (type$1(h) === 'array') {
            lightness = h;
            dl = h[1] - h[0];
          } else {
            lightness = [h, h];
            dl = 0;
          }
          return f;
        };

        f.scale = function() { return chroma$2.scale(f); };

        f.hue(hue);

        return f;
      };

      var Color$4 = Color_1;
      var digits = '0123456789abcdef';

      var floor$1 = Math.floor;
      var random = Math.random;

      var random_1 = function() {
        var code = '#';
        for (var i = 0; i < 6; i++) {
          code += digits.charAt(floor$1(random() * 16));
        }
        return new Color$4(code, 'hex');
      };

      var type = type$p;
      var log = Math.log;
      var pow$1 = Math.pow;
      var floor = Math.floor;
      var abs$1 = Math.abs;


      var analyze = function(data, key) {
        if (key === void 0) key = null;

        var r = {
          min: Number.MAX_VALUE,
          max: Number.MAX_VALUE * -1,
          sum: 0,
          values: [],
          count: 0
        };
        if (type(data) === 'object') {
          data = Object.values(data);
        }
        data.forEach(function(val) {
          if (key && type(val) === 'object') { val = val[key]; }
          if (val !== undefined && val !== null && !isNaN(val)) {
            r.values.push(val);
            r.sum += val;
            if (val < r.min) { r.min = val; }
            if (val > r.max) { r.max = val; }
            r.count += 1;
          }
        });

        r.domain = [r.min, r.max];

        r.limits = function(mode, num) { return limits(r, mode, num); };

        return r;
      };


      var limits = function(data, mode, num) {
        if (mode === void 0) mode = 'equal';
        if (num === void 0) num = 7;

        if (type(data) == 'array') {
          data = analyze(data);
        }
        var min = data.min;
        var max = data.max;
        var values = data.values.sort(function(a, b) { return a - b; });

        if (num === 1) { return [min, max]; }

        var limits = [];

        if (mode.substr(0, 1) === 'c') { // continuous
          limits.push(min);
          limits.push(max);
        }

        if (mode.substr(0, 1) === 'e') { // equal interval
          limits.push(min);
          for (var i = 1; i < num; i++) {
            limits.push(min + ((i / num) * (max - min)));
          }
          limits.push(max);
        }

        else if (mode.substr(0, 1) === 'l') { // log scale
          if (min <= 0) {
            throw new Error('Logarithmic scales are only possible for values > 0');
          }
          var min_log = Math.LOG10E * log(min);
          var max_log = Math.LOG10E * log(max);
          limits.push(min);
          for (var i$1 = 1; i$1 < num; i$1++) {
            limits.push(pow$1(10, min_log + ((i$1 / num) * (max_log - min_log))));
          }
          limits.push(max);
        }

        else if (mode.substr(0, 1) === 'q') { // quantile scale
          limits.push(min);
          for (var i$2 = 1; i$2 < num; i$2++) {
            var p = ((values.length - 1) * i$2) / num;
            var pb = floor(p);
            if (pb === p) {
              limits.push(values[pb]);
            } else { // p > pb
              var pr = p - pb;
              limits.push((values[pb] * (1 - pr)) + (values[pb + 1] * pr));
            }
          }
          limits.push(max);

        }

        else if (mode.substr(0, 1) === 'k') { // k-means clustering
          /*
          implementation based on
          http://code.google.com/p/figue/source/browse/trunk/figue.js#336
          simplified for 1-d input values
          */
          var cluster;
          var n = values.length;
          var assignments = new Array(n);
          var clusterSizes = new Array(num);
          var repeat = true;
          var nb_iters = 0;
          var centroids = null;

          // get seed values
          centroids = [];
          centroids.push(min);
          for (var i$3 = 1; i$3 < num; i$3++) {
            centroids.push(min + ((i$3 / num) * (max - min)));
          }
          centroids.push(max);

          while (repeat) {
            // assignment step
            for (var j = 0; j < num; j++) {
              clusterSizes[j] = 0;
            }
            for (var i$4 = 0; i$4 < n; i$4++) {
              var value = values[i$4];
              var mindist = Number.MAX_VALUE;
              var best = (void 0);
              for (var j$1 = 0; j$1 < num; j$1++) {
                var dist = abs$1(centroids[j$1] - value);
                if (dist < mindist) {
                  mindist = dist;
                  best = j$1;
                }
                clusterSizes[best]++;
                assignments[i$4] = best;
              }
            }

            // update centroids step
            var newCentroids = new Array(num);
            for (var j$2 = 0; j$2 < num; j$2++) {
              newCentroids[j$2] = null;
            }
            for (var i$5 = 0; i$5 < n; i$5++) {
              cluster = assignments[i$5];
              if (newCentroids[cluster] === null) {
                newCentroids[cluster] = values[i$5];
              } else {
                newCentroids[cluster] += values[i$5];
              }
            }
            for (var j$3 = 0; j$3 < num; j$3++) {
              newCentroids[j$3] *= 1 / clusterSizes[j$3];
            }

            // check convergence
            repeat = false;
            for (var j$4 = 0; j$4 < num; j$4++) {
              if (newCentroids[j$4] !== centroids[j$4]) {
                repeat = true;
                break;
              }
            }

            centroids = newCentroids;
            nb_iters++;

            if (nb_iters > 200) {
              repeat = false;
            }
          }

          // finished k-means clustering
          // the next part is borrowed from gabrielflor.it
          var kClusters = {};
          for (var j$5 = 0; j$5 < num; j$5++) {
            kClusters[j$5] = [];
          }
          for (var i$6 = 0; i$6 < n; i$6++) {
            cluster = assignments[i$6];
            kClusters[cluster].push(values[i$6]);
          }
          var tmpKMeansBreaks = [];
          for (var j$6 = 0; j$6 < num; j$6++) {
            tmpKMeansBreaks.push(kClusters[j$6][0]);
            tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length - 1]);
          }
          tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) { return a - b; });
          limits.push(tmpKMeansBreaks[0]);
          for (var i$7 = 1; i$7 < tmpKMeansBreaks.length; i$7 += 2) {
            var v = tmpKMeansBreaks[i$7];
            if (!isNaN(v) && (limits.indexOf(v) === -1)) {
              limits.push(v);
            }
          }
        }
        return limits;
      };

      var analyze_1 = { analyze: analyze, limits: limits };

      var Color$3 = Color_1;


      var contrast = function(a, b) {
        // WCAG contrast ratio
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
        a = new Color$3(a);
        b = new Color$3(b);
        var l1 = a.luminance();
        var l2 = b.luminance();
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
      };

      var Color$2 = Color_1;
      var sqrt = Math.sqrt;
      var pow = Math.pow;
      var min = Math.min;
      var max = Math.max;
      var atan2 = Math.atan2;
      var abs = Math.abs;
      var cos = Math.cos;
      var sin = Math.sin;
      var exp = Math.exp;
      var PI = Math.PI;

      var deltaE = function(a, b, Kl, Kc, Kh) {
        if (Kl === void 0) Kl = 1;
        if (Kc === void 0) Kc = 1;
        if (Kh === void 0) Kh = 1;

        // Delta E (CIE 2000)
        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
        var rad2deg = function(rad) {
          return 360 * rad / (2 * PI);
        };
        var deg2rad = function(deg) {
          return (2 * PI * deg) / 360;
        };
        a = new Color$2(a);
        b = new Color$2(b);
        var ref = Array.from(a.lab());
        var L1 = ref[0];
        var a1 = ref[1];
        var b1 = ref[2];
        var ref$1 = Array.from(b.lab());
        var L2 = ref$1[0];
        var a2 = ref$1[1];
        var b2 = ref$1[2];
        var avgL = (L1 + L2) / 2;
        var C1 = sqrt(pow(a1, 2) + pow(b1, 2));
        var C2 = sqrt(pow(a2, 2) + pow(b2, 2));
        var avgC = (C1 + C2) / 2;
        var G = 0.5 * (1 - sqrt(pow(avgC, 7) / (pow(avgC, 7) + pow(25, 7))));
        var a1p = a1 * (1 + G);
        var a2p = a2 * (1 + G);
        var C1p = sqrt(pow(a1p, 2) + pow(b1, 2));
        var C2p = sqrt(pow(a2p, 2) + pow(b2, 2));
        var avgCp = (C1p + C2p) / 2;
        var arctan1 = rad2deg(atan2(b1, a1p));
        var arctan2 = rad2deg(atan2(b2, a2p));
        var h1p = arctan1 >= 0 ? arctan1 : arctan1 + 360;
        var h2p = arctan2 >= 0 ? arctan2 : arctan2 + 360;
        var avgHp = abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
        var T = 1 - 0.17 * cos(deg2rad(avgHp - 30)) + 0.24 * cos(deg2rad(2 * avgHp)) + 0.32 * cos(deg2rad(3 * avgHp + 6)) - 0.2 * cos(deg2rad(4 * avgHp - 63));
        var deltaHp = h2p - h1p;
        deltaHp = abs(deltaHp) <= 180 ? deltaHp : h2p <= h1p ? deltaHp + 360 : deltaHp - 360;
        deltaHp = 2 * sqrt(C1p * C2p) * sin(deg2rad(deltaHp) / 2);
        var deltaL = L2 - L1;
        var deltaCp = C2p - C1p;
        var sl = 1 + (0.015 * pow(avgL - 50, 2)) / sqrt(20 + pow(avgL - 50, 2));
        var sc = 1 + 0.045 * avgCp;
        var sh = 1 + 0.015 * avgCp * T;
        var deltaTheta = 30 * exp(-pow((avgHp - 275) / 25, 2));
        var Rc = 2 * sqrt(pow(avgCp, 7) / (pow(avgCp, 7) + pow(25, 7)));
        var Rt = -Rc * sin(2 * deg2rad(deltaTheta));
        var result = sqrt(pow(deltaL / (Kl * sl), 2) + pow(deltaCp / (Kc * sc), 2) + pow(deltaHp / (Kh * sh), 2) + Rt * (deltaCp / (Kc * sc)) * (deltaHp / (Kh * sh)));
        return max(0, min(100, result));
      };

      var Color$1 = Color_1;

      // simple Euclidean distance
      var distance = function(a, b, mode) {
        if (mode === void 0) mode = 'lab';

        // Delta E (CIE 1976)
        // see http://www.brucelindbloom.com/index.html?Equations.html
        a = new Color$1(a);
        b = new Color$1(b);
        var l1 = a.get(mode);
        var l2 = b.get(mode);
        var sum_sq = 0;
        for (var i in l1) {
          var d = (l1[i] || 0) - (l2[i] || 0);
          sum_sq += d * d;
        }
        return Math.sqrt(sum_sq);
      };

      var Color = Color_1;

      var valid = function() {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        try {
          new (Function.prototype.bind.apply(Color, [null].concat(args)));
          return true;
        } catch (e) {
          return false;
        }
      };

      // some pre-defined color scales:
      var chroma$1 = chroma_1;

      var scale = scale$2;

      var scales = {
        cool: function cool() { return scale([chroma$1.hsl(180, 1, .9), chroma$1.hsl(250, .7, .4)]) },
        hot: function hot() { return scale(['#000', '#f00', '#ff0', '#fff']).mode('rgb') }
      };

      /**
          ColorBrewer colors for chroma.js
    
          Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
          Pennsylvania State University.
    
          Licensed under the Apache License, Version 2.0 (the "License");
          you may not use this file except in compliance with the License.
          You may obtain a copy of the License at
          http://www.apache.org/licenses/LICENSE-2.0
    
          Unless required by applicable law or agreed to in writing, software distributed
          under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
          CONDITIONS OF ANY KIND, either express or implied. See the License for the
          specific language governing permissions and limitations under the License.
      */

      var colorbrewer = {
        // sequential
        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

        // diverging

        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

        // qualitative

        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
      };

      // add lowercase aliases for case-insensitive matches
      for (var i = 0, list = Object.keys(colorbrewer); i < list.length; i += 1) {
        var key = list[i];

        colorbrewer[key.toLowerCase()] = colorbrewer[key];
      }

      var colorbrewer_1 = colorbrewer;

      var chroma = chroma_1;

      // feel free to comment out anything to rollup
      // a smaller chroma.js built

      // io --> convert colors

















      // operators --> modify existing Colors










      // interpolators












      // generators -- > create new colors
      chroma.average = average;
      chroma.bezier = bezier_1;
      chroma.blend = blend_1;
      chroma.cubehelix = cubehelix;
      chroma.mix = chroma.interpolate = mix$1;
      chroma.random = random_1;
      chroma.scale = scale$2;

      // other utility methods
      chroma.analyze = analyze_1.analyze;
      chroma.contrast = contrast;
      chroma.deltaE = deltaE;
      chroma.distance = distance;
      chroma.limits = analyze_1.limits;
      chroma.valid = valid;

      // scale
      chroma.scales = scales;

      // colors
      chroma.colors = w3cx11_1;
      chroma.brewer = colorbrewer_1;

      var chroma_js = chroma;

      return chroma_js;

    }));
    //end: chroma.js
    //}}}




    //begin: collide2D //{{{

    console.log("### p5.collide v0.7.3 ###")

    p5js.prototype._collideDebug = false;

    p5js.prototype.collideDebug = function(debugMode) {
      _collideDebug = debugMode;
    }

    /*~++~+~+~++~+~++~++~+~+~ 2D ~+~+~++~+~++~+~+~+~+~+~+~+~+~+~+*/

    p5js.prototype.collideRectRect = function(x, y, w, h, x2, y2, w2, h2) {
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
    p5js.prototype.collideRectRectVector = function(p1, sz, p2, sz2) {
      return p5js.prototype.collideRectRect(p1.x, p1.y, sz.x, sz.y, p2.x, p2.y, sz2.x, sz2.y)
    }


    p5js.prototype.collideRectCircle = function(rx, ry, rw, rh, cx, cy, diameter) {
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
    p5js.prototype.collideRectCircleVector = function(r, sz, c, diameter) {
      return p5js.prototype.collideRectCircle(r.x, r.y, sz.x, sz.y, c.x, c.y, diameter)
    }

    p5js.prototype.collideCircleCircle = function(x, y, d, x2, y2, d2) {
      //2d
      if (this.dist(x, y, x2, y2) <= (d / 2) + (d2 / 2)) {
        return true;
      }
      return false;
    };


    // p5.vector version of collideCircleCircle
    p5js.prototype.collideCircleCircleVector = function(p1, d, p2, d2) {
      return p5js.prototype.collideCircleCircle(p1.x, p1.y, d, p2.x, p2.y, d2)
    }


    p5js.prototype.collidePointCircle = function(x, y, cx, cy, d) {
      //2d
      if (this.dist(x, y, cx, cy) <= d / 2) {
        return true;
      }
      return false;
    };

    // p5.vector version of collidePointCircle
    p5js.prototype.collidePointCircleVector = function(p, c, d) {
      return p5js.prototype.collidePointCircle(p.x, p.y, c.x, c.y, d)
    }

    p5js.prototype.collidePointEllipse = function(x, y, cx, cy, dx, dy) {
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
    p5js.prototype.collidePointEllipseVector = function(p, c, d) {
      return p5js.prototype.collidePointEllipse(p.x, p.y, c.x, c.y, d.x, d.y);
    }

    p5js.prototype.collidePointRect = function(pointX, pointY, x, y, xW, yW) {
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
    p5js.prototype.collidePointRectVector = function(point, p1, sz) {
      return p5js.prototype.collidePointRect(point.x, point.y, p1.x, p1.y, sz.x, sz.y);
    }

    p5js.prototype.collidePointLine = function(px, py, x1, y1, x2, y2, buffer) {
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
    p5js.prototype.collidePointLineVector = function(point, p1, p2, buffer) {
      return p5js.prototype.collidePointLine(point.x, point.y, p1.x, p1.y, p2.x, p2.y, buffer);
    }

    p5js.prototype.collideLineCircle = function(x1, y1, x2, y2, cx, cy, diameter) {
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
    p5js.prototype.collideLineCircleVector = function(p1, p2, c, diameter) {
      return p5js.prototype.collideLineCircle(p1.x, p1.y, p2.x, p2.y, c.x, c.y, diameter);
    }
    p5js.prototype.collideLineLine = function(x1, y1, x2, y2, x3, y3, x4, y4, calcIntersection) {

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
    p5js.prototype.collideLineLineVector = function(p1, p2, p3, p4, calcIntersection) {
      return p5js.prototype.collideLineLine(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, calcIntersection);
    }

    p5js.prototype.collideLineRect = function(x1, y1, x2, y2, rx, ry, rw, rh, calcIntersection) {

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
    p5js.prototype.collideLineRectVector = function(p1, p2, r, rsz, calcIntersection) {
      return p5js.prototype.collideLineRect(p1.x, p1.y, p2.x, p2.y, r.x, r.y, rsz.x, rsz.y, calcIntersection);
    }

    p5js.prototype.collidePointPoly = function(px, py, vertices) {
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
    p5js.prototype.collidePointPolyVector = function(p1, vertices) {
      return p5js.prototype.collidePointPoly(p1.x, p1.y, vertices);
    }

    // POLYGON/CIRCLE
    p5js.prototype.collideCirclePoly = function(cx, cy, diameter, vertices, interior) {

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
    p5js.prototype.collideCirclePolyVector = function(c, diameter, vertices, interior) {
      return p5js.prototype.collideCirclePoly(c.x, c.y, diameter, vertices, interior);
    }

    p5js.prototype.collideRectPoly = function(rx, ry, rw, rh, vertices, interior) {
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
    p5js.prototype.collideRectPolyVector = function(r, rsz, vertices, interior) {
      return p5js.prototype.collideRectPoly(r.x, r.y, rsz.x, rsz.y, vertices, interior);
    }

    p5js.prototype.collideLinePoly = function(x1, y1, x2, y2, vertices) {

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
    p5js.prototype.collideLinePolyVector = function(p1, p2, vertice) {
      return p5js.prototype.collideLinePoly(p1.x, p1.y, p2.x, p2.y, vertice);
    }

    p5js.prototype.collidePolyPoly = function(p1, p2, interior) {
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

    p5js.prototype.collidePolyPolyVector = function(p1, p2, interior) {
      return p5js.prototype.collidePolyPoly(p1, p2, interior);
    }

    p5js.prototype.collidePointTriangle = function(px, py, x1, y1, x2, y2, x3, y3) {

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
    p5js.prototype.collidePointTriangleVector = function(p, p1, p2, p3) {
      return p5js.prototype.collidePointTriangle(p.x, p.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    }

    p5js.prototype.collidePointPoint = function(x, y, x2, y2, buffer) {
      if (buffer === undefined) {
        buffer = 0;
      }

      if (this.dist(x, y, x2, y2) <= buffer) {
        return true;
      }

      return false;
    };

    // p5.vector version of collidePointPoint
    p5js.prototype.collidePointPointVector = function(p1, p2, buffer) {
      return p5js.prototype.collidePointPoint(p1.x, p1.y, p2.x, p2.y, buffer);
    }

    p5js.prototype.collidePointArc = function(px, py, ax, ay, arcRadius, arcHeading, arcAngle, buffer) {

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
    p5js.prototype.collidePointArcVector = function(p1, a, arcRadius, arcHeading, arcAngle, buffer) {
      return p5js.prototype.collidePointArc(p1.x, p1.y, a.x, a.y, arcRadius, arcHeading, arcAngle, buffer);
    }

    //end: collide2D
    //}}}

    //begin: screen-position{{{
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
        p._renderer.matrixStack = [new p5js.Matrix()];
      }

      // replace all necessary functions to keep track of transformations

      if (p.draw instanceof Function) {
        let drawNative = p.draw;
        p.draw = function(...args) {
          if (context == R_2D) p._renderer.matrixStack = [new p5js.Matrix()];
          drawNative.apply(p, args);
        };
      }


      if (p.resetMatrix instanceof Function) {
        let resetMatrixNative = p.resetMatrix;
        p.resetMatrix = function(...args) {
          if (context == R_2D) p._renderer.matrixStack = [new p5js.Matrix()];
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
            let sm = new p5js.Matrix();
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
            let sm = new p5js.Matrix();
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
            let sm = new p5js.Matrix();
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
        if (x instanceof p5js.Vector) {
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
        if (!(m instanceof p5js.Matrix) || !(v instanceof p5js.Vector)) {
          p5.print('multMatrixVector : Invalid arguments');
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

    //end: screen-position}}}

    //begin: lib.js
    // ####################################
    //  Declaration of Variables {{{

    // debugging
    // let DEBUGMODE = true;
    let DEBUGMODE = false;
    p5js.disableFriendlyErrors = !DEBUGMODE;
    let DEBUGFUNCS;
    function debugprint(...args) {
      if (DEBUGMODE) {
        p5.print("### DEBUG (begin) ###");
        for (const arg of args) {
          p5.print(JSON.stringify(arg));
        }
        p5.print("### DEBUG (end) ###");
      }
    }


    let PIXELDENSITY = 2;
    let CANVASASPECT;

    // }}}

    // ####################################

    // ####################################
    // Utilities {{{

    function convertMap2Object(map) {
      const obj = {}
      for (let [k, v] of map)
        obj[k] = v
      return obj
    }

    function clampValue(value, min, max) {
      if (value < min) return min;
      if (value > max) return max;
      return value
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
    function strokePattern(pattern) {
      // pattern: alternating number of pixels with the "pen on" and "pen off" the canvas
      p5.drawingContext.setLineDash(pattern);
    }
    let DASHED = [5, 5];
    let DOTTED = [2];
    let SOLID = [];


    function pointOnCircle(m, r, phi) {
      return vadd(m, p5.createVector(r * cos(phi), r * sin(phi)))
    }

    p5js.prototype.mouseVec = function() {
      return this.createVector(this.mouseX, this.mouseY)
    }
    p5js.prototype.pmouseVec = function() {
      return this.createVector(this.pmouseX, this.pmouseY)
    }

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

      destruct() {
        return Clickable.allClickables.delete(this.label)
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

    class clickTriangle extends Clickable {// {{{
      constructor(x0, y0, x1, y1, x2, y2, buffer, label) {
        super(label);
        this.xy0 = [x0, y0];
        this.xy1 = [x1, y1];
        this.xy2 = [x2, y2];
        this.label = label;
        this.buffer = buffer;
      }

      area() {
        return [...this.xy0, ...this.xy1, ...this.xy2]
      }
      mouseInArea() {
        let mouseX = p5.mouseX;
        let mouseY = p5.mouseY;
        let buffer = p5;
        if (this.buffer != null) {
          buffer = this.buffer;
          let bufTrafo = canvasBuffer.rF.T(buffer);
          [mouseX, mouseY] = bufTrafo.PP(mouseX, mouseY).xy;
          // p5Inst.print("position-mouse:", this.label, mouseX,mouseY);
          // p5Inst.print("position-rect:", this.area());
          // p5Inst.print("position-rect:", this.rect);
          // p5Inst.print("position-result:",buffer.collidePointRect(mouseX,mouseY,...this.rect));
        }
        return buffer.collidePointTriangle(mouseX, mouseY, ...this.tri)
      }

      get tri() {
        return this.area()
      }

    }//}}}
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
        let mouseX = p5.mouseX;
        let mouseY = p5.mouseY;
        let buffer = p5;
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

    class clickCircle extends Clickable {// {{{
      constructor(x, y, diameter, buffer, label) {
        super(label);
        this.x = x;
        this.y = y;
        this.diameter = Math.abs(diameter);

        this.label = label;
        this.buffer = buffer;
      }

      area() {
        return [this.x, this.y, this.diameter]
      }

      mouseInArea() {
        let mouseX = p5.mouseX;
        let mouseY = p5.mouseY;
        let buffer = p5;
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
        return buffer.collidePointCircle(mouseX, mouseY, ...this.circle)
      }

      get circle() {
        return this.area()
      }

    }//}}}

    class Moveable {// {{{
      static allMoveables = [];
      static moveableCount = 0;
      static inFront(conditions) {
        let cond = conditions || ((it) => true)
        let moved = Moveable.allMoveables
          .filter(m => m.mouseInArea())
          .filter(cond)
          // .filter(m => !m.isFrozen)
          .sort((a, b) => b.zorder - a.zorder)[0]
        return moved
      }

      constructor(label) {
        Moveable.moveableCount += 1
        this.label = label;
        if (label == null) this.label = `${Moveable.moveableCount}. Tile`;
        this.isDragged = false;
        this.isFrozen = false;
        this.offset2ReferencePoint = p5.createVector(0, 0);
        if (this.constructor == Moveable) {
          throw new Error("Abstract class Moveable cannot be instantiated.");
        }
        this.zorder = Moveable.allMoveables.length;
        this.label
        Moveable.allMoveables.push(this);
      }

      pointInArea(point) {
        throw new Error("Abstract Method has to be implemented");
      }

      lineInArea(startPoint, endPoint) {
        throw new Error("Abstract Method has to be implemented");
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
          this.offset2ReferencePoint = p5.createVector(
            p5.mouseX - this.referencePoint.x,
            p5.mouseY - this.referencePoint.y);

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
          let dx = p5.mouseX - this.offset2ReferencePoint.x;
          let dy = p5.mouseY - this.offset2ReferencePoint.y;
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




    // example implementation of the Moveable 'Interface'
    // class movableRect extends Moveable {// {{{
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

    // functions for p5.Vectors
    function vdraw(vector, options) {//{{{
      let opts = { ...{ strokeWeight: 2, strokeColor: "#000", headWidth: 10 }, ...options }

      p5.push();

      let triangleSide = (opts.headWidth + 2 * opts.strokeWeight)
      let triangleHeight = triangleSide / 2 * p5.sqrt(3)

      let vectorAngle = p5.createVector(0, -1).angleBetween(vector);

      p5.translate(vector.x, vector.y)
      p5.rotate(vectorAngle);
      p5.translate(-vector.x, -vector.y)
      p5.noStroke();
      p5.fill(opts.strokeColor);
      p5.triangle(
        vector.x, vector.y,
        vector.x - triangleSide / 2, vector.y + triangleHeight,
        vector.x + triangleSide / 2, vector.y + triangleHeight);

      p5.stroke(opts.strokeColor);
      p5.strokeWeight(opts.strokeWeight);
      p5.strokeCap(p5.SQUARE);
      p5.line(vector.x, vector.y + vector.mag(), vector.x, vector.y + triangleHeight);
      p5.pop();
    }//}}}

    let vadd = p5js.Vector.add;
    let vsub = p5js.Vector.sub;
    let vmult = p5js.Vector.mult;
    let vnorm = p5js.Vector.mag;
    let vdist = p5js.Vector.dist;
    let vlerp = p5js.Vector.lerp;
    let vdot = p5js.Vector.dot;
    let vunit = p5js.Vector.normalize;
    p5js.Vector.prototype.__defineGetter__("xy", function() { return [this.x, this.y] });
    p5js.Vector.prototype.__defineGetter__("xz", function() { return [this.x, this.z] });
    p5js.Vector.prototype.__defineGetter__("yz", function() { return [this.y, this.z] });
    p5js.Vector.prototype.__defineGetter__("xyz", function() { return this.array() });

    // matrix classes to ease the tranformaiton between referenceFrames 
    //@improvment @refactor: the 3DMatrix multiplication is functional but unnecessarly complex
    class Matrix2D {//{{{
      constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.entries = [a, b, c, d];
        this.rows = [p5.createVector(a, b), p5.createVector(c, d)];
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
        return this.rows.map(row => p5js.Vector.dot(row, p5.createVector(...vector))).slice(0, 2)
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
          p5.createVector(this.M[0], this.M[1], this.b[0]),
          p5.createVector(this.M[2], this.M[3], this.b[1]),
          p5.createVector(0, 0, 1)];
      };

      get det() {
        return this.matrix2D.det
      }


      get inv() {
        return new Matrix(this.matrix2D.inv, this.matrix2D.inv.dot(this.translation).map(x => -x));
      }

      dot(vector) {
        return p5.createVector(...this.rows.map(row => p5js.Vector.dot(row, vector)))
      }

      //@improvment: Why am I splitting this up ... should be a 3d matrix multipliciton
      mult(matrix) {
        let productM = this.matrix2D.mult(matrix.matrix2D);
        let productb = vadd(p5.createVector(...this.translation), this.dot(p5.createVector(...matrix.translation))).xy;
        return new Matrix(productM, productb)
      }



      toString() {
        return this.rows.map(row => {
          return row.toString().split(":")[1].trim()
        }).join("\n")
      }


    }//}}}

    // plain-javascript-array functions
    function arrayUnique(arr) {
      let unique = [];
      arr.forEach((elem, i) => {
        if (!(unique.slice().map(it => it.toString()).includes(elem.toString()))) unique.push(elem);
      })
      return unique
    }
    function arrayToString(arr) { return `[${arr.toString()}]` }
    // Array.prototype.last = function() {
    //   return this[this.length - 1]
    // }
    function range(from, until) {
      let num = until - from;
      let arr = [...Array(num).keys()].map(it => it + from)
      return arr
    }

    function cartesianProduct(array1, array2) {
      let result = [];
      for (var it of array1) {
        for (var jt of array2) {
          result.push([it, jt])
        }
      }
      return result
    }

    function all(arr, value = true) {
      if (arr.length == 0) return false
      return arr.map((it) => (it == value)).reduce((prev, cur) => prev && cur)
    }
    function any(arr, value = true) {
      if (arr.length == 0) return false
      return arr.map((it) => (it == value)).reduce((prev, cur) => prev || cur)
    }
    function sum(arr) {
      if (arr.length == 0) return 0;
      return arr.reduce((prev, cur) => prev + cur)
    }
    function cumSum(arr) {
      let result = [];
      let val = 0;
      arr.forEach((elem, i) => {
        val = val + abs(elem);
        result.push(val);
      });
      return result
    }

    function mean(arr) {
      return sum(arr) / arr.length
    }
    function prod(arr) {
      if (arr.length == 0) return 0;
      return arr.reduce((prev, cur) => prev * cur)
    }
    const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]

    const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
    const argMin = argFact((max, el) => (el[0] < max[0] ? el : max))
    // property functions 
    function isString(arg) {
      return Object.prototype.toString.call(arg) === "[object String]"
    }

    // floats compare function 
    function isClose(value1, value2, abseps = 1e-6) {
      return abs(value1 - value2) < abseps
    }

    function rangeArray(start, stop, step) {
      return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
    }
    function arrayPartition(array, length) {
      var result = [];
      for (var i = 0; i < array.length; i++) {
        if (i % length === 0) result.push([]);
        result[result.length - 1].push(array[i]);
      }
      return result;
    };

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


    function pointOnCircle(m, r, phi) {
      return vadd(m, p5.createVector(r * cos(phi), r * sin(phi)))
    }

    function nPointsOnCircle(n, m, r, phi0 = 0) {
      return [...Array(n).keys()].map(it => {
        let phi = 2 * Math.PI * it / n + phi0;
        return vadd(m, p5.createVector(r * cos(phi), r * sin(phi)))
      })
    }

    // Debug stuff {{{
    function pushDEBUGFUNC(func) {
      if (p5.frameCount == 0 || p5.frameCount == 1) {

        DEBUGFUNCS.push(func)
      }
    }

    function drawDebugBuffer(drawFrames) {
      if (drawFrames) {
        for (let frame of Frame.allFrames) {
          frame.drawFrame();
        }
      }
      debugbuffer.push();
      debugbuffer.textSize(20);
      frameRateTime[p5.frameCount % 32] = p5.frameRate();

      debugbuffer.push();
      debugbuffer.translate(...debugbuffer.rF.P(0, -0.25).xy);
      debugbuffer.push();
      if (mean(frameRateTime).toFixed(3) > 45) { debugbuffer.fill(p5.color(0, 230, 20)) };
      if (mean(frameRateTime).toFixed(3) < 45) { debugbuffer.fill(p5.color(240, 120, 120)) };
      if (mean(frameRateTime).toFixed(3) < 30) { debugbuffer.fill(p5.color(240, 0, 20)) };
      debugbuffer.text(`FR:${mean(frameRateTime).toFixed(3)}\nFC:${p5.frameCount}`, ...debugbuffer.rF.P(0.825, 0.9).xy);
      debugbuffer.pop();

      debugbuffer.text(`Aspect:${p5.canvas.offsetWidth}:${p5.canvas.offsetHeight}=${(p5.canvas.offsetWidth / p5.canvas.offsetHeight).toFixed(3)}`, ...canvasBuffer.rF.P(0.825, 0.96).xy)

      debugbuffer.push();
      debugbuffer.textSize(16);

      debugbuffer.text(`CubeCount:${JSON.stringify(convertMap2Object(CUBECOUNT), null, ' ')}`, ...debugbuffer.rF.P(0.825, 0.98).xy);
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
      mask = p5.createGraphics(buffer.width, buffer.height);
      mask.pixelDensity(buffer.pixelDensity());
      mask.background(p5.color('#0000'));
      mask.fill(p5.color('#000F'));
      mask.noStroke();
      mask.beginShape();
      areaVertices.forEach((it) => mask.vertex(...it));
      mask.endShape(p5.CLOSE);
      buffer.mask(mask)

      return buffer


    }




    // }}}
    // ####################################

    // ####################################
    // Recources   {{{

    function DEBUGCOLOR(alpha = 100) {
      return p5.color(200, 0, 0, alpha);
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


    let colors_greens = new Map([
      ["base-25", "#638149"],
      ["base-20", "#6f9252"],
      ["base-15", "#7ca25c"],
      ["base-10", "#89ac6b"],
      ["base-5", "#96b57c"],
      ["base", "#a3be8c"],
      ["base+5", "#b0c79c"],
      ["base+10", "#bdd0ad"],
      ["base+15", "#cadabd"],
      ["base+20", "#d7e3cd"],
      ["base+25", "#e4ecdd"],
    ])

    let colors_blues = new Map([
      ["base-25", "#2f435b"],
      ["base-20", "#384f6c"],
      ["base-15", "#405c7d"],
      ["base-10", "#49688e"],
      ["base-5", "#52749f"],
      ["base", "#5e81ac"],
      ["base+5", "#6f8eb5"],
      ["base+10", "#809bbd"],
      ["base+15", "#90a9c6"],
      ["base+20", "#a1b6cf"],
      ["base+25", "#b2c3d7"],
    ])

    let drawingContexts = new Map([
      ["debug",
        (B) => { B.stroke(DEBUGCOLOR(150)); B.fill(DEBUGCOLOR(150)); }],
      ["seesaw",
        (B) => { B.fill(seesawSettings.board.color); B.strokeWeight(1); }],
      ["scaleDisplayText",
        (B) => {
          B.textAlign(p5.CENTER), B.textSize(25);
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




    // ####################################

    // ####################################
    // Canvas / Buffer / Frames {{{

    class Frame {// {{{
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


        //@refactor: remove canvasBuffer and replace it by Frame.allFrames[0] (the canvas)
        this.id = (Frame.allFrames.length == 0) ? 0 : Frame.allFrames[Frame.allFrames.length - 1].id + 1;
        this.label = label;

        //this.randomNumber = random(-10, 10);
        //frameColor = p5Inst.color(random(0, 255), 100, 100, 55);
        // this.frameColor.mode = "hsl";

        this.offset = (this.label != "Canvas") ? canvasBuffer.rF.P(frameRX, frameRY).xy : [0, 0];
        this.b = this.offset;

        this.size = (this.label != "Canvas") ? canvasBuffer.rF.P(frameRWidth, frameRHeight) : p5.createVector(p5.canvas.offsetWidth, p5.canvas.offsetHeight);
        this.width = this.size.x;
        this.height = this.size.y;


        this.oTrafoMatrix = new Matrix(new Matrix2D(this.width, 0, 0, this.height), this.offset)
        this.oM = new Matrix(new Matrix2D(this.width, 0, 0, this.height), this.offset)

        this.iTrafoMatrix = new Matrix(new Matrix2D(this.width, 0, 0, this.height), [0, 0])
        this.iM = new Matrix(new Matrix2D(this.width, 0, 0, this.height), [0, 0])

        Frame.allFrames[this.id] = this;
        Frame.allLabels.set(label, this.id);

      }//}}}

      delete() {
        //@improvement: handle return values?

        if (this.label == "Canvas") {
          console.error("The Frame for the Canvas must not be deleted");
        }
        Frame.allLabels.delete(this.label);
        delete Frame.allFrames[this.id]
      }


      P(RX, RY) {
        let position = this.iTrafoMatrix.dot(p5.createVector(RX, RY, 1)).xy;
        return p5.createVector(...position);
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
        return p5.createVector(this.Dx(RX1, RX2), this.Dy(RY1, RY2))
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
        let coords = this.iTrafoMatrix.inv.dot(p5.createVector(PX, PY, 1)).xy;
        return p5.createVector(...coords);
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

        buffer.fill(p5.color("#9995"));
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
        trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
          trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
          trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
          trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
          trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
        trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
        trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
        trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
        trafo = (RX, RY) => { return matrix.dot(p5.createVector(RX, RY, 1)) };
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
      //let htmlSketch = document.getElementById("defaultCanvas0").parentElement;//document.getElementById(parentId);
      //htmlSketch.id = parentId;
      // print(htmlSketch);
      // sketchDiv = createDiv();
      // sketchDiv.elt.id = "scaledsketch";
      // sketchDiv.parent(parentId)
      // sketchDiv.elt.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
      // sketchDiv.elt.offsetHeight = htmlSketch.offsetHeight;
      // sketchDiv.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
      // sketchDiv.offsetHeight = htmlSketch.offsetHeight;
      // let currentCanvas = p5.createCanvas(Math.ceil(htmlSketch.offsetHeight * CANVASASPECT), htmlSketch.offsetHeight);
      // currentCanvas.position((htmlSketch.offsetWidth - htmlSketch.offsetHeight * CANVASASPECT) / 2, 0);
      // print(htmlSketch.offsetWidth, htmlSketch.offsetHeight);
      //sketchDiv.position(currentCanvas.offsetWidth/2, 0);
      // currentCanvas.parent(parentId);
      // print(sketchDiv);
      let currentCanvas = p5.newCanvas();
      p5.print(currentCanvas);

      currentCanvas.trafoMatrix = new Matrix(new Matrix2D(currentCanvas.canvas.offsetWidth, 0, 0, currentCanvas.canvas.offsetHeight), [0, 0])

      currentCanvas.coords = function(coordX, coordY) {
        return this.trafoMatrix.dot(p5.createVector(coordX, coordY, 1)).xy
      };
      currentCanvas.coordsVec = function(coordX, coordY) {
        return p5.createVector(...this.trafoMatrix.dot(p5.createVector(coordX, coordY, 1)).xy, 0)
      };
      currentCanvas.coordsInv = function(pixelX, pixelY) {
        return this.trafoMatrix.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy
      };
      currentCanvas.coordsInvVec = function(pixelX, pixelY) {
        return p5.createVector(...this.trafoMatrix.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy, 0)
      };
      addScreenPositionFunction(p5);
      currentCanvas.refFrame = Frame.initCanvas();
      currentCanvas.__defineGetter__('rF', function() { return this.refFrame; })
      p5.pixelDensity(pixel_density);
      p5.background(p5.color(1));

      currentCanvas.Rsize = function(cube) { return cube.Rsize(this) }
      return currentCanvas
    }//}}}

    // function setupCanvas(parentId = 'sketch', bgcolor = "#FFFFFFFF", pixel_density = 2) {//{{{
    //   let htmlSketch = document.getElementById("defaultCanvas0").parentElement;//document.getElementById(parentId);
    //   htmlSketch.id = parentId;
    //   // print(htmlSketch);
    //   // sketchDiv = createDiv();
    //   // sketchDiv.elt.id = "scaledsketch";
    //   // sketchDiv.parent(parentId)
    //   // sketchDiv.elt.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
    //   // sketchDiv.elt.offsetHeight = htmlSketch.offsetHeight;
    //   // sketchDiv.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
    //   // sketchDiv.offsetHeight = htmlSketch.offsetHeight;
    //   let currentCanvas = p5.createCanvas(Math.ceil(htmlSketch.offsetHeight * CANVASASPECT), htmlSketch.offsetHeight);
    //   currentCanvas.position((htmlSketch.offsetWidth - htmlSketch.offsetHeight * CANVASASPECT) / 2, 0);
    //   // print(htmlSketch.offsetWidth, htmlSketch.offsetHeight);
    //   //sketchDiv.position(currentCanvas.offsetWidth/2, 0);
    //   currentCanvas.parent(parentId);
    //   // print(sketchDiv);

    //   currentCanvas.trafoMatrix = new Matrix(new Matrix2D(htmlSketch.offsetWidth, 0, 0, htmlSketch.offsetHeight), [0, 0])

    //   currentCanvas.coords = function(coordX, coordY) {
    //     return this.trafoMatrix.dot(p5.createVector(coordX, coordY, 1)).xy
    //   };
    //   currentCanvas.coordsVec = function(coordX, coordY) {
    //     return p5.createVector(...this.trafoMatrix.dot(p5.createVector(coordX, coordY, 1)).xy, 0)
    //   };
    //   currentCanvas.coordsInv = function(pixelX, pixelY) {
    //     return this.trafoMatrix.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy
    //   };
    //   currentCanvas.coordsInvVec = function(pixelX, pixelY) {
    //     return p5.createVector(...this.trafoMatrix.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy, 0)
    //   };
    //   addScreenPositionFunction(p5);
    //   currentCanvas.refFrame = Frame.initCanvas();
    //   currentCanvas.__defineGetter__('rF', function() { return this.refFrame; })
    //   p5.pixelDensity(pixel_density);
    //   p5.background(p5.color(1));

    //   currentCanvas.Rsize = function(cube) { return cube.Rsize(this) }
    //   return currentCanvas

    // }//}}}

    let allBuffers = {};
    function setupBuffer(label, bufferCoordX, bufferCoordY, bufferCoordWidth, bufferCoordHeight, bgcolor = "#FFFFFFFF", pixel_density = 2) {//{{{


      let frame = new Frame(label, bufferCoordX, bufferCoordY, bufferCoordWidth, bufferCoordHeight);

      let offset = canvasBuffer.rF.P(bufferCoordX, bufferCoordY).xy;
      let bufferSize = canvasBuffer.rF.P(bufferCoordWidth, bufferCoordHeight);
      // print(`${label}; bufferSize = ${ bufferSize } `);
      let buffer = p5.createGraphics(bufferSize.x, bufferSize.y);

      // print(buffer.width);
      buffer.trafoMatrix2Canvas = new Matrix(new Matrix2D(buffer.width, 0, 0, buffer.height), offset)
      buffer.trafoMatrix = new Matrix(new Matrix2D(buffer.width, 0, 0, buffer.height), [0, 0])

      buffer.coords = function(coordX, coordY) {
        return this.trafoMatrix.dot(p5.createVector(coordX, coordY, 1)).xy
      };
      buffer.coordsVec = function(coordX, coordY) {
        return p5.createVector(...this.trafoMatrix.dot(p5.createVector(coordX, coordY, 1)).xy, 0)
      };
      buffer.coordsInv = function(pixelX, pixelY) {
        return this.trafoMatrix.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy
      };
      buffer.coordsInvVec = function(pixelX, pixelY) {
        return p5.createVector(...this.trafoMatrix.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy, 0)
      };
      buffer.coordsCanvas = function(coordX, coordY) {
        return this.trafoMatrix2Canvas.dot(p5.createVector(coordX, coordY, 1)).xy
      };
      buffer.coordsCanvasVec = function(coordX, coordY) {
        return p5.createVector(...this.trafoMatrix2Canvas.dot(p5.createVector(coordX, coordY, 1)).xy, 0)
      };
      buffer.coordsCanvasInv = function(pixelX, pixelY) {
        return this.trafoMatrix2Canvas.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy
      };
      buffer.coordsCanvasInvVec = function(pixelX, pixelY) {
        return p5.createVector(...this.trafoMatrix2Canvas.inv.dot(p5.createVector(pixelX, pixelY, 1)).xy, 0)
      };
      buffer.drawImage = function(x, y) {
        let pos = (x == undefined && y == undefined) ? this.trafoMatrix2Canvas.b : [x, y];

        p5.image(this, ...pos); this.clear()
      }
      buffer.drawImageUnclear = function(x, y) {
        let pos = (x == undefined && y == undefined) ? this.trafoMatrix2Canvas.b : [x, y];

        p5.image(this, ...pos);
      }
      addScreenPositionFunction(buffer);

      buffer.refFrame = frame;
      buffer.__defineGetter__('rF', function() { return this.refFrame; })

      buffer.background(p5.color(bgcolor));
      buffer.pixelDensity(pixel_density);
      // the attributes with default values are set by a method
      buffer.setbackground = function(bg = bgcolor) { this.background(bg) }
      buffer.setpixelDensity = function(pd = pixel_density) { buffer.pixel_density(pd) }
      buffer.Rsize = function(cube) { return cube.Rsize(this) }
      allBuffers[label] = buffer;
      return buffer
    }
    //}}}

    function generateBackgroundImages(bgImgsBuffer, cube, cubeStackTranslation, cubeStackSplit) {// {{{
      let bgImgLabels = [
        "bgImg-Split-1", "bgImg-Split-10", "bgImg-Split-100", "bgImg-Split-1000",
        "bgImg-Compact-1", "bgImg-Compact-10", "bgImg-Compact-100", "bgImg-Compact-1000"];

      //never save
      let bgImgsBase64 = null;//p5Inst.getItem(bgImgsLocalStorageLabel);
      let i = p5.millis();
      // if ()
      if (bgImgsBase64 == null) {
        console.log("############### Generating #######################");
        let splitLabel, c, stack, pos;

        bgImgsBase64 = [];
        for (var label of bgImgLabels) {
          // bgImgsBuffer.setbackground("#1A51");
          splitLabel = label.split("-");
          stack = { type: splitLabel[1], size: parseInt(splitLabel[2]) };
          c = numcubeslike(stack.size, cube, "bgImages");

          pos = vsub(bgImgsBuffer.rF.size, vsub(cubeStackSplit.rF.size, cubeStackTranslation[stack.type]));

          bgImgsBuffer.push();
          bgImgsBuffer.translate(pos.x, pos.y);
          drawcubes(bgImgsBuffer, c, stack.size, stack.type == "Compact", true);

          bgImgsBuffer.pop();
          bgImgsBase64.push(bgImgsBuffer.canvas.toDataURL("png"));

          // console.log(bgImgsBuffer.canvas.toDataURL("png"))
          // bgImgsBuffer.save(`${stack.type}-${stack.size}.png`)
          bgImgsBuffer.clear();
        }
        // bgImgsBase64 = LZString.compress(bgImgsBase64.join('::'));
        // p5Inst.storeItem(bgImgsLocalStorageLabel, bgImgsBase64);

        let f = p5.millis();
        p5.print("timing bgImgs:", f - i);
      }

      // bgImgsBase64 = p5Inst.getItem(bgImgsLocalStorageLabel);
      bgImgs = bgImgsBase64.map(x => p5.loadImage(x));//LZString.decompress(bgImgsBase64).split("::").map(x => p5Inst.loadImage(x));

      return {
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
      }
    }// }}}




    //}}}
    // ####################################

    // ####################################
    // Sketch Components {{{


    //@refactor: add functions for the different App modes here, like the drawers in stack mode etc



    // ####################################

    // ####################################
    // ####################################

    // ####################################

    const DIRECTIONS = {
      SN: "South->North",
      NS: "North->South",
      WE: "West->East",
      EW: "East->West",
    }

    function lineLocationDirection(start, end) {
      let dir = undefined;
      let delta = vsub(end, start);
      let ex = p5.createVector(1, 0, 0);
      let angle = ex.angleBetween(delta);
      let abs_angle = abs(angle);
      let epsAngle = 0.05;
      // p5.print("dotprod:", ex.angleBetween(delta));
      // p5.print("1:v", abs(abs_angle - p5.PI/2));
      // p5.print("2:h", abs(abs_angle - p5.PI),abs_angle);
      if (abs(abs_angle - p5.PI / 2) < epsAngle) dir = "vertical";
      if ((abs(abs_angle - p5.PI) < epsAngle) || ((abs_angle) < epsAngle)) dir = "horizontal";

      let isStartEast = start.x < end.x;
      let isStartNorth = start.y < end.y;
      let res = undefined;
      if (dir == "horizontal") {
        res = {
          dir: (isStartEast) ? DIRECTIONS.EW : DIRECTIONS.WE,
          loc: (start.y + end.y) / 2
        }
      }
      if (dir == "vertical") {
        res = {
          dir: (isStartNorth) ? DIRECTIONS.NS : DIRECTIONS.SN,
          loc: (start.x + end.x) / 2
        }
      }

      return res
    }


    function flipDirection(direction) {
      return direction
        .split("->")
        .reverse()
        .join("->")
    }


    const ORIENTATIONS = {
      N: "North",
      E: "East",
      S: "South",
      W: "West",
    }



    function pointsNESW(point) {
      return [[0, 1], [1, 0], [0, -1], [-1, 0]].map((d) => [point[0] + d[0], point[1] + d[1]])
    }
    function pointsNESWRot45(point) {
      return [[0.5, 0.5], [0.5, -0.5], [-0.5, -0.5], [-0.5, 0.5]].map((d) => [point[0] + d[0], point[1] + d[1]])
    }

    function direction2UnitVector(direction) {
      let vec;
      switch (direction) {
        case DIRECTIONS.NS: vec = p5.createVector(0, -1);
          break;
        case DIRECTIONS.WE: vec = p5.createVector(1, 0);
          break;
        case DIRECTIONS.SN: vec = p5.createVector(0, 1);
          break;
        case DIRECTIONS.EW: vec = p5.createVector(-1, 0);
          break;
        default: throw new Error(`Got direction '${direction}', but has to be one of [NS, SN, EW, WE]`)
      }
      return vec

    }

    function directions2Steps(edgeDirections) {

      let cSteps = []
      edgeDirections.forEach((dir, i) => {
        let [dirSign, d] = dir;
        if (i == 0) { cSteps.push(dirSign * 1); return }

        if (d == edgeDirections[i - 1][1]) {
          cSteps[cSteps.length - 1] = cSteps[cSteps.length - 1] + dirSign * 1;
        } else { cSteps.push(dirSign * 1) }
      })

      // if (reversed) return cSteps.slice().reverse().map(it => Math.abs(it) * (-1) * Math.sign(it));
      cSteps.splice(cSteps.length - 1, 1);
      return cSteps
    }

    function edgePoints2Directions(edgePoints) {
      let cEdgesDir = [];
      let edgePoints_ = edgePoints.slice();
      edgePoints_.push(edgePoints[0]);
      edgePoints_.slice(1).forEach(
        (C, i) => {
          // since there are only 4 directions anyway, rounding is not a problem
          let angle = parseInt(vsub(p5.createVector(...C), p5.createVector(...edgePoints_[i])).heading() / p5.PI * 180);
          let dir;
          switch (angle) {
            case -90: dir = [+1, DIRECTIONS.NS];
              break;
            case 0: dir = [+1, DIRECTIONS.WE];
              break;
            case 90: dir = [-1, DIRECTIONS.SN];
              break;
            case 180: dir = [-1, DIRECTIONS.EW];
              break;
            default: print("ERROR IN ANGLES!,", angle);
              print("--------------------------------");
              print("edgePoints(_)\n", JSON.stringify(edgePoints), '\n', JSON.stringify(edgePoints_));
              print("→ edgePoint2Direction:", p5.createVector(...C).xyz);
              print("→ edgePoint2Direction:", p5.createVector(...edgePoints_[i]).xyz);
              print("→ edgePoint2Direction:", vsub(p5.createVector(...C), p5.createVector(...edgePoints_[i])).xyz);
              print("→ edgePoint2Direction:", vsub(p5.createVector(...C), p5.createVector(...edgePoints_[i])).heading());
              print("→ edgePoint2Direction:", vsub(p5.createVector(...C), p5.createVector(...edgePoints_[i])).heading() / p5.PI * 180);
          }
          cEdgesDir.push(dir)
        })
      return cEdgesDir

    }

    function edgePoints2Steps(edgePoints) {
      let cEdgesDir = edgePoints2Directions(edgePoints);
      return directions2Steps(cEdgesDir);
    }

    Object.filter = (obj, predicate) =>
      Object.assign(...Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .map(key => ({ [key]: obj[key] })));

    class Tiles extends Moveable {// {{{

      static allTiles = [];
      static fillColor = "#DDDDDD";
      static createTiles(location, steps, startDirection = "x", unit = [0.05, 1, "cm"], options, resumedState, firstinnercenters) {
        // print(`resumedState:`, resumedState);
        let defaultOptions = {
          empty: false,
          edgelabels: false,
          edgelabelfontsize: null,
          edgelabelpadding: null,
          frozen: false,
          zorder: null,
          resize: "NESW",
          resizecolor: "#CCC3",
          showresizeeq: false,
          showsizedesc: false,
          cuttable: true,
          drawable: false,
          showdrawableline: false,
          drawlinelocation: [0.2, 0.8],
          drawcolor: "#963BD8",
          fillcolor: null,
          starterfillcolor: null,
          fillstriped: null,
          edgecolor: null,
          label: null,
          synced: []
        }
        let definedOptions = {}
        if (options != undefined) {
          definedOptions = Object.filter(options, value => value != undefined)
        }

        // print("default:", defaultOptions);
        // print("input:", options);
        // print("input(cleaned):", definedOptions);
        // console.table(defaultOptions);
        let opt = { ...defaultOptions, ...definedOptions };
        // print("final:", opt);
        // console.table(opt);
        p5.print("create New Tiles:", [
          location,
          steps,
          startDirection,
          unit,
          opt.empty,
          opt.edgelabels,
          opt.edgelabelfontsize,
          opt.edgelabelpadding,
          opt.frozen,
          opt.zorder,
          opt.resize,
          opt.resizecolor,
          opt.showresizeeq,
          opt.showsizedesc,
          opt.cuttable,
          opt.drawable,
          opt.showdrawableline,
          opt.drawlinelocation,
          opt.drawcolor,
          opt.fillcolor,
          opt.starterfillcolor,
          opt.fillstriped,
          opt.edgecolor,
          opt.label,
          opt.synced,
          resumedState,
          firstinnercenters
        ]);
        return new Tiles(
          location,
          steps,
          startDirection,
          unit,
          opt.empty,
          opt.edgelabels,
          opt.edgelabelfontsize,
          opt.edgelabelpadding,
          opt.frozen,
          opt.zorder,
          opt.resize,
          opt.resizecolor,
          opt.showresizeeq,
          opt.showsizedesc,
          opt.cuttable,
          opt.drawable,
          opt.showdrawableline,
          opt.drawlinelocation,
          opt.drawcolor,
          opt.fillcolor,
          opt.starterfillcolor,
          opt.fillstriped,
          opt.edgecolor,
          opt.label,
          opt.synced,
          resumedState,
          firstinnercenters
        );
      }

      static serialize() {
        return Tiles.allTiles.map(it => it.serialize())
      }

      static updateTiles(newTiles) {

        let idx = Tiles.allTiles.findIndex(it => it.label == newTiles.label);
        let oldTiles = Tiles.allTiles[idx];
        oldTiles.destruct()
        Tiles.allTiles.push(newTiles);
      }


      constructor(
        location,
        steps,
        startDirection,
        unit,
        empty,
        edgelabels,
        edgelabelfontsize,
        edgelabelpadding,
        frozen,
        zorder,
        resize,
        resizecolor,
        showresizeeq,
        showsizedesc,
        cuttable,
        drawable,
        showdrawableline,
        drawlinelocation,
        drawcolor,
        fillcolor,
        starterfillcolor,
        fillstriped,
        edgecolor,
        label,
        synced,
        resumedState,
        starterindices) {//{{{

        super(label);
        resize = (resize == undefined) ? "NESW" : resize;
        p5.print("constructor:resize", resize);
        this.loc = location;
        this.startDirection = startDirection;// for use in the arguments of the childern after splitting
        this.unit = unit;// for use in the arguments of the childern after splitting
        this.pixelUnit = canvasBuffer.rF.P(unit[0], 0).x;
        this.displayUnit = { value: unit[1], name: unit[2] };
        if (!["x", "y"].includes(startDirection.toLowerCase())) {
          throw new Error(`Got '${startDirection}' as the startdirection, but start direction of a Tile has to be either 'x' or 'y'`)
        }
        this.startDirOffset = (startDirection.toLowerCase() == 'x') ? 0 : 1; // only x and y are possible
        if (any(steps.map(v => !Number.isInteger(v)))) {
          throw new TypeError(`Got ${JSON.stringify(steps)}, but steps have to be Array of Integers`);
        }

        if (DEBUGMODE) print("steps before:", steps, startDirection);
        this.__steps = steps;
        let steps_ = [];
        steps.forEach((s, i) => {
          steps_.push(s * (-1) ** (i + this.startDirOffset));
        })
        steps = steps_;
        if (DEBUGMODE) print("steps after:", steps);
        this.steps = steps;
        this.stepsSummed = cumSum(this.steps.map(it => abs(it)));

        this.stepVerts = [[0, 0]]

        this.steps.forEach((step, i) => {
          let vert = [...this.stepVerts[this.stepVerts.length - 1]];
          vert[(i + this.startDirOffset) % 2] = vert[(i + this.startDirOffset) % 2] + step;
          this.stepVerts.push(vert)
          if (DEBUGMODE) print((i + this.startDirOffset), ((i + this.startDirOffset) % 2 == 0) ? "left/right" : "up/down");
        })

        let lastvertex = this.stepVerts[this.stepVerts.length - 1];
        // infer an additional vertex so that all edges are horizontal or vertical
        if ((lastvertex[0] != 0) && (lastvertex[1] != 0)) {
          let vert = [...lastvertex];
          let idx = (this.stepVerts.length - 1 + this.startDirOffset) % 2;
          // (vertices.length - 1) cause the last push in the loop extends it one more
          this.steps.push(-lastvertex[idx])
          vert[idx] = vert[idx] - lastvertex[idx];
          this.stepVerts.push(vert)
        }
        //might have changed 
        lastvertex = this.stepVerts[this.stepVerts.length - 1];
        this.steps.push(-1 * ((lastvertex[0] != 0) ? lastvertex[0] : lastvertex[1]));


        this.verts = this.stepVerts2Verts()
        this.verts_ = this.stepVerts2Verts_()

        let Xs = this.stepVerts.map(vert => vert[0]);
        let Ys = this.stepVerts.map(vert => vert[1]);
        this.boundingBox = [[min(...Xs), min(...Ys)], [max(...Xs), max(...Ys)]]
        this.boundingBoxCenter = [(this.boundingBox[0][0] + this.boundingBox[1][0]) * 0.5,
        (this.boundingBox[0][1] + this.boundingBox[1][1]) * 0.5]


        this.edges = this.updateEdges()
        this.edgeDirections = []
        this.steps.forEach((step, i) => {
          let axis = (((this.startDirOffset + i) % 2) == 0) ? "WE" : "NS";
          let dir = (Math.sign(step) == 1) ? axis : axis[1] + axis[0];

          this.edgeDirections.push(DIRECTIONS[dir]);
        })

        let sortedVerts = this.stepVerts.slice().sort((v, w) => v[1] - w[1]);
        let minY = sortedVerts[0][1];
        let minYmaxX = sortedVerts.filter(v => v[1] == minY).sort((v, w) => w[0] - v[0])[0];
        let idx = (this.stepVerts.map(it => it.toString()).findIndex(v => v == minYmaxX.toString()));
        let prevIdx = (idx + this.stepVerts.length - 1) % this.stepVerts.length;;
        let nextIdx = (idx + 1) % this.stepVerts.length;
        let [toPrev, toNext] = [prevIdx, nextIdx].map(idx => vsub(p5.createVector(...this.stepVerts[idx]), p5.createVector(...minYmaxX)));
        let crossProdz = p5js.Vector.cross(toPrev, toNext).z;

        this.isClockwise = Math.sign(crossProdz) < 0;




        this.isRectangle = (this.steps.length == 4);


        this.isResizable = (this.isRectangle && resize) ? resize : false; //&& !empty;
        this.rectSideLengths = undefined;
        if (this.isRectangle) {
          let xlength = this.stepVerts[1][0] || this.stepVerts[3][0];
          let ylength = this.stepVerts[1][1] || this.stepVerts[3][1];
          this.rectSideLengths = { x: abs(xlength), y: abs(ylength) }
          let area = abs(xlength * ylength);

          this.starterIndices = (starterindices || arrayPartition([...Array(area).keys()], this.rectSideLengths.x));

        }
        if (this.isResizable) {
          let orientations = Object.values(ORIENTATIONS);
          this.edgeOrientations = [];

          // this.edges.forEach((edge, i) => {
          //   let midpoint = vmult(vadd(...edge), 0.5);
          //   let tri = nPointsOnCircle(3, midpoint, this.pixelUnit / 2, Math.PI);
          // }
          let stepVertsXs = this.stepVerts.map(it => it[0]);
          let stepVertsYs = this.stepVerts.map(it => it[1]);
          let stepVertsPairs = [];
          this.stepVerts.forEach((jt, j) => {
            stepVertsPairs.push([jt, this.stepVerts[(j + 1) % this.stepVerts.length]]);
          })
          let [minX, maxX] = [Math.min(...stepVertsXs), Math.max(...stepVertsXs)];
          // swapping the y range so that maxY->North, minY->South
          let [maxY, minY] = [Math.min(...stepVertsYs), Math.max(...stepVertsYs)];
          this.lowerLeftStepVert = [minX, minY];
          this.upperLeftStepVert = [minX, maxY];
          if (DEBUGMODE) p5.print("BREAKPOINT", stepVertsPairs);
          stepVertsPairs.forEach((jt, j) => {
            let idx = [prod(jt.map(it => it[1] == maxY)) == 1,
            prod(jt.map(it => it[0] == maxX)) == 1,
            prod(jt.map(it => it[1] == minY)) == 1,
            prod(jt.map(it => it[0] == minX)) == 1].indexOf(true);
            this.edgeOrientations.push(orientations[idx])

          })
          this.dragTriangleColor = new chroma.Color(resizecolor).alpha(0.4).hex();

          this.dragTriangles = {};
          if ((resumedState != undefined) && (resumedState.dragTriangles != undefined)) {
            this.dragTriangles = resumedState.dragTriangles;
          } else {
            this.updateDragTriangles();
          }
        }
        this.showResizeEq = showresizeeq;
        this.showSizeDesc = showsizedesc;
        this.sizeDesc = "";
        this.edgelabelPadding = edgelabelpadding;
        this.edgelabelFontsize = (edgelabelfontsize != null) ? edgelabelfontsize : floor(this.pixelUnit * 2 / 5);
        // @refactor: redo the labeling string parser :edgelabels:
        switch (edgelabels) {
          case true: this.edgelabels = "!".repeat(this.edges.length);
            break;
          case false: this.edgelabels = "_".repeat(this.edges.length);
            break;
          default:
            if (edgelabels.length != this.edges.length) throw new Error(`Got '${edgelabels}' with length ${edgelabels.length}, which does not match the number of edges ${this.edges.length}`)
            if (!all([...edgelabels].map(label => ["?", "!", "_"].includes(label)))) throw new Error(`Got '${edgelabels}' but edgelabels are only allowed to contain '!','_','?'`)
            this.edgelabels = edgelabels;

        }
        if (DEBUGMODE) print("edgelabels:", this.edgelabels);

        this.edgePoints = this.updateEdgePoints()
        this.innerCenters = this.getInnerCenters()
        // this.innerStepGrid = this.getInnerCenters();
        this.isFrozen = frozen;

        this.isEmpty = empty;

        this.syncedTilesLabels = synced;


        //all poinst on edge except the verticies (no cutting along the edges allowed)
        //@improvment: the allowed verticies have to be defined more strictly :AVAILABELCUTS:
        this.isCuttable = cuttable;

        //@refactor: The arrays current... and available... should just containt indicies to the 'sources'
        this.allowedCuts = arrayUnique(this.innerCenters.flatMap(pointsNESWRot45));
        // this.availableCuts = this.edgePoints;//.filter(point => !this.stepVerts.includes(point));
        this.availableCuts = this.edgePoints.filter(it => !any(this.stepVerts.map(v => ((v[0] - it[0]) == 0) && ((v[1] - it[1]) == 0))));//.filter(point => !this.stepVerts.includes(point));
        this.isCut = false;
        this.currentCut = [];

        this.isDrawable = drawable;

        this.isDrawn = false;
        this.currentDraw = [];
        this.drawColors = [drawcolor, (new chroma.Color(drawcolor)).brighten(1).hex()];

        this.drawBetween = undefined;
        this.drawDistances = undefined;
        this.markedLine = undefined;


        if (resumedState != undefined && resumedState != {}) {
          this.isDrawn = resumedState.isDrawn;
          if (resumedState.currentDraw) this.currentDraw = resumedState.currentDraw.map(it => p5.createVector(...it));
          // this.drawBetween = p5Inst.createVector(...resumedState.drawBetween);
          this.drawDistances = resumedState.drawDistances;
          if (resumedState.markedLine) this.markedLine = resumedState.markedLine.map(it => p5.createVector(...it));
        }

        this.showDrawLine = showdrawableline;
        // @improvement: relative position 
        // this.drawLine = [canvasBuffer.rF.P(0.2, 0.9)];
        this.drawLine = [canvasBuffer.rF.P(...drawlinelocation)];
        // this.drawLine = [this.step2Vert()(this.boundingBoxCenter)];
        this.verts.forEach((it, i) => {

          this.drawLine.push(vadd(this.drawLine[this.drawLine.length - 1],
            vmult(p5.createVector(1, 0), this.pixelUnit * Math.abs(this.steps[i]))));
        })


        this.isVisibel = true;
        this.isActive = false;
        if ((resumedState != undefined) && (resumedState.isActive != undefined)) {
          this.isActive = resumedState.isActive;
        }
        if (edgecolor == null) {
          edgecolor = "#EEEEEE";
          if (this.isEmpty) edgecolor = "#000000";
        }
        this.edgeColor = edgecolor;
        this.fillColor = (fillcolor == null) ? Tiles.fillColor + "FF" : fillcolor;
        this.starterFillColor = starterfillcolor;
        if (this.isEmpty && (fillcolor == null)) this.fillColor = Tiles.fillColor + "00";
        // If no alpha is given FF is assumed and appended
        if (this.fillColor.length == 7) this.fillColor = this.fillColor + "FF";
        this.fillStriped = fillstriped;

        if (zorder != null) this.zorder = zorder;

        if (!Tiles.allTiles.map(it => it.label).includes(this.label)) {
          Tiles.allTiles.push(this);
        } else {

          Tiles.updateTiles(this);
        }
        Tiles.allTiles.sort((a, b) => a.zorder - b.zorder)


      }//}}}

      serialize() {
        // let tilesState = {};
        let tilesState = this.state;
        return { ...this.args, resumedState: tilesState, starterIndices: this.starterIndices }
      }

      get args() {// {{{

        return {
          location: canvasBuffer.rF.R(...this.loc.xy).xy,
          steps: this.__steps.slice(0, this.steps.length - 1),
          startdirection: this.startDirection,
          unit: this.unit,
          empty: this.isEmpty,
          edgelabels: this.edgelabels,
          edgelabelfontsize: this.edgelabelFontsize,
          edgelabelpadding: this.edgelabelPadding,
          frozen: this.isFrozen,
          zorder: this.zorder,
          resizable: this.isResizable,
          resizecolor: this.dragTriangleColor,
          showresizeeq: this.showResizeEq,
          showsizedesc: this.showSizeDesc,
          cuttable: this.isCuttable,
          drawableperimeter: this.isDrawable,
          showperimeterline: this.showDrawLine,
          perimeterlinelocation: canvasBuffer.rF.R(...this.drawLine).xy,
          fillcolor: this.fillColor,
          starterfillcolor: this.starterFillColor,
          fillstriped: this.fillStriped,
          edgecolor: this.edgeColor,
          label: this.label
        }
      }// }}}
      get state() {// {{{
        let result = {};
        // if (this.isDrawable) {
        let isDrawn = false, currentDraw = [], drawDistances = undefined, markedLine = undefined, dragTriangles = undefined;
        if (this.isDrawn) isDrawn = this.isDrawn;
        if (this.currentDraw) currentDraw = this.currentDraw.map(it => it.xy);
        if (this.drawDistances) drawDistances = this.markedLine.map(it => it.xy);
        if (this.markedLine) markedLine = this.markedLine.map(it => it.xy);
        if (this.dragTriangles) dragTriangles = this.dragTriangles;
        result = {
          isActive: this.isActive,
          // dragTriangles: dragTriangles,
          isDrawn: isDrawn,
          currentDraw: currentDraw,
          // drawBetween: this.drawBetween.xy,
          drawDistances: drawDistances,
          markedLine: markedLine
        }
        // }
        return result
      }// }}}

      destruct() {
        if (this.dragTriangles != undefined) Object.values(this.dragTriangles).forEach(it => it.hitbox.destruct());

        let delIdxT = Tiles.allTiles.findIndex(it => it.label == this.label);
        Tiles.allTiles.splice(delIdxT, 1);
        let delIdxM = Moveable.allMoveables.findIndex(it => it.label == this.label);
        Moveable.allMoveables.splice(delIdxM, 1);
      }

      step2Vert_() {
        return step => vadd(this.loc, vmult(p5.createVector(...step), this.pixelUnit * 1.05))
      }

      stepVerts2Verts_() {
        return this.stepVerts.map(this.step2Vert_())
      }
      step2Vert() {
        return step => vadd(this.loc, vmult(p5.createVector(...step), this.pixelUnit))
      }

      stepVerts2Verts() {
        return this.stepVerts.map(this.step2Vert())
      }

      edgeIndexOfVert(vert) {
        return this.verts.map(it => vsub(it, vert).mag() < 1e-3).indexOf(true)
      }

      updateEdges() {//{{{
        let edges = [];
        for (var vert_idx in this.verts) {
          vert_idx = parseInt(vert_idx);
          edges.push([this.verts[vert_idx], this.verts[(vert_idx + 1) % this.verts.length]]);
        }
        return edges
      }//}}}

      updateEdgePoints() {//{{{
        let edgePoints = [];
        let lengths = this.steps;
        // print(lengths.map(it => it - 1));
        // print(this.stepVerts.length, lengths.map(it => it - 1).length);
        this.stepVerts.forEach((step, i) => {
          // print(i);
          edgePoints.push(step);
          if (DEBUGMODE) print("step", i, step, "range[", 0, abs(lengths[i]) - 1, "]");
          edgePoints.push(...(range(0, abs(lengths[i]) - 1).map((d) => {
            let idx = (i + this.startDirOffset) % 2;
            let curstep = [...step];
            // print(step[(i + this.startDirOffset) % 2], d);
            // let ysign = (-1) ** (((i + this.startDirOffset) % 2) == 1);
            curstep[idx] = step[idx] + Math.sign(lengths[i]) * (1 + d);
            return curstep
          })))
        })
        return edgePoints
      }//}}}
      updateDragTriangles() {

        this.edges.forEach((edge, i) => {
          if (!this.isResizable.includes(this.edgeOrientations[i][0])) return
          let phi0;
          let shiftFunc;
          let hitboxFunc;
          let triangleRadius = this.pixelUnit / 2;
          switch (this.edgeOrientations[i]) {
            case ORIENTATIONS.N:
              phi0 = -p5.TAU / 4;
              shiftFunc = (tri, mid) => [0, tri[1].y - mid.y];
              hitboxFunc = (tri) => [...tri[2], radius2Side * triangleRadius, -radius2Side * triangleRadius];
              break;
            case ORIENTATIONS.E:
              phi0 = 0;
              shiftFunc = (tri, mid) => [tri[1].x - mid.x, 0];
              hitboxFunc = (tri) => [...tri[2], radius2Side * triangleRadius, radius2Side * triangleRadius];
              break;
            case ORIENTATIONS.S:
              phi0 = p5.TAU / 4;
              shiftFunc = (tri, mid) => [0, tri[1].y - mid.y];
              hitboxFunc = (tri) => [...tri[1], radius2Side * triangleRadius, radius2Side * triangleRadius];
              break;
            case ORIENTATIONS.W:
              phi0 = p5.TAU / 2;
              shiftFunc = (tri, mid) => [tri[1].x - mid.x, 0];
              hitboxFunc = (tri) => [...tri[2], -radius2Side * triangleRadius, -radius2Side * triangleRadius];
              break;
            default: return
          }

          if (hitboxFunc == undefined) hitboxFunc = (tri) => [...tri[2], radius2Side * triangleRadius, radius2Side * triangleRadius];


          let midpoint = vmult(vadd(...edge), 0.5);
          let tri = nPointsOnCircle(3, midpoint, triangleRadius, phi0);
          // if (shiftDir == "x") {
          //   shift.push(tri[1].x - midpoint.x);
          //   shift.push(0)
          // } else if (shiftDir == "y") {
          //   shift.push(0)
          //   shift.push(tri[1].y - midpoint.y);
          // }
          let shift = shiftFunc(tri, midpoint);
          tri = tri.map(it => [it.x - shift[0], it.y - shift[1]]);
          let radius2Side = 2 * sin(p5.PI / 3);
          this.dragTriangles[this.edgeOrientations[i]] = {
            tri: tri.flat(),
            hitbox: new clickRect(...hitboxFunc(tri), null, `${this.label}:${this.edgeOrientations[i]}`)
          };
          this.dragTriangles[this.edgeOrientations[i]].isDragged = false;
        })

      }

      getInnerCenters() {//{{{
        let rangeX = range(this.boundingBox[0][0], this.boundingBox[1][0] + 1);
        let rangeY = range(this.boundingBox[0][1], this.boundingBox[1][1] + 1);

        let centers = cartesianProduct(rangeX, rangeY).map(
          dir => [dir[0] + 0.5, dir[1] + 0.5]).filter(
            point => p5.collidePointPoly(...this.step2Vert()(point).xy, this.verts))
        //@refactor: config option for the odering    
        centers = centers.sort((a, b) => a[1] - b[1])
        return centers
      }//}}}

      //@fix: there is some fundamental error in this
      // reference: https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
      getCentroid() {
        let cX = 0, cY = 0;

        // if (this.label == "3. Tile") print("verts", this.verts);
        this.verts.map(it => vsub(it, this.referencePoint)).forEach((it, i) => {
          // if (this.label == "3. Tile") print(it);
          if (i < this.verts.length - 1) {
            let next_i = (i + 1) % this.verts.length;
            let next_it = this.verts[next_i];
            cX += (it.x + next_it.x) * (it.x * next_it.y - next_it.x * it.y);
            cY += (it.y + next_it.y) * (it.x * (next_it.y) - next_it.x * it.y);
            // print("Cx, Cy", cX, cY);
          }

        })
        let area = (-1) ** (this.isClockwise) * this.getInnerCenters().length * this.pixelUnit ** 2;
        // print(this.label, this.pixelUnit)
        // if (this.label == "3. Tile") print("Area, Cx, Cy", area, cX / (6 * area), -cY / (6 * area));
        return p5.createVector(cX / (6 * area), cY / (6 * area))
      }


      get referencePoint() {
        if (this.isResizable) return this.step2Vert()(this.lowerLeftStepVert);
        //if (this.isResizable) return this.step2Vert()(this.upperLeftStepVert);

        return this.verts[0]
      }

      set referencePoint(vector) {//{{{

        let dvert = vsub(vector, this.referencePoint)
        let new_verts = this.verts.map(it => vadd(it, dvert));
        let new_verts_ = this.verts_.map(it => vadd(it, dvert));
        // todo: add half off bounding box width/height
        p5.print("setReferencePoint: new verts", JSON.stringify(new_verts.map(it => it.xy)));
        let inCanvas = new_verts.map(vert => p5.collidePointRect(...vert.xy, -200, -200, canvasBuffer.width + 500, canvasBuffer.height + 500))
        // having the undo button this condition causes more problems than it solves
        //if (all(inCanvas, true)) {
        this.loc = vadd(this.loc, dvert);
        //this.referencePoint = vector;
        // this.innerStepGrid = this.getInnerCenters();
        this.verts = new_verts;
        this.verts_ = new_verts_;
        this.edges = this.updateEdges();
        if (this.isResizable) this.updateDragTriangles();
        // this.drawLine = this.drawLine.map(it => vadd(it, vector));
        //}
        return vector
      }//}}}

      get availableDraws() {
        if (!this.isDrawn) return this.verts;
        if (this.currentDraw.length == 1) {
          let p = this.currentDraw[0];
          let dists = this.verts.map(it => vsub(it, p).mag());
          let [distMin, distMinIdx] = [min(...dists), argMin(dists)];
          let neighIdx = [(distMinIdx - 1 + this.verts.length) % this.verts.length, (distMinIdx + 1) % this.verts.length]
          return [this.verts[neighIdx[0]], this.verts[neighIdx[1]]]
        }
        if (this.currentDraw.length < this.steps.length + 1) {
          const isNextIndex = (idx, prevIdx) => {
            return ((idx - prevIdx) == 1) || ((idx - prevIdx) == -(this.verts.length - 1))
          }
          const isPrevIndex = (idx, nextIdx) => {
            return ((idx - nextIdx) == -1) || ((idx - nextIdx) == (this.verts.length - 1))
          }
          let lastIdx = this.currentDraw.length - 1;
          let p0 = this.currentDraw[lastIdx - 1];
          let dists0 = this.verts.map(it => vsub(it, p0).mag());
          let [distMin0, distMinIdx0] = [min(...dists0), argMin(dists0)];
          let p1 = this.currentDraw[lastIdx];
          let dists1 = this.verts.map(it => vsub(it, p1).mag());
          let [distMin1, distMinIdx1] = [min(...dists1), argMin(dists1)];
          // print([distMin0, distMinIdx0]);
          // print([distMin1, distMinIdx1]);
          // print(isNextIndex(distMinIdx1, distMinIdx0), [this.verts[(distMinIdx1 + 1) % this.verts.length]]);
          // print(isPrevIndex(distMinIdx1, distMinIdx0), [this.verts[(distMinIdx0 - 1 + this.verts.length) % this.verts.length]]);
          if (isNextIndex(distMinIdx1, distMinIdx0)) return [this.verts[(distMinIdx1 + 1) % this.verts.length]];
          if (isPrevIndex(distMinIdx1, distMinIdx0)) return [this.verts[(distMinIdx1 - 1 + this.verts.length) % this.verts.length]];
          // print("next Idx", (distMinIdx1 - 1 + this.verts.length) % this.verts.length);

          let avail = this.verts[(distMinIdx1 - 1 + this.verts.length) % this.verts.length];
          if (!this.currentDraw.includes(avail) || avail == this.currentDraw[0]) return [this.verts[(distMinIdx1 - 1 + this.verts.length) % this.verts.length]]
        }
        return []

      }

      mouseInArea(extended = false) {
        let onPolygon = p5.collidePointPoly(p5.mouseX, p5.mouseY, this.verts)
        let isInside = onPolygon;
        // print(`Label:${this.label}; onPolygon: ${onPolygon}`)
        // if (!isInside && this.isResizable) {
        //   let onControls = any(Object.values(this.dragTriangles).map(it => it.hitbox.mouseInArea()));
        //   print(`Label:${this.label};onControls: ${onControls}`);
        //   isInside = isInside || onControls;
        // }
        if (!isInside && extended) {
          isInside = p5.collidePointCircle(p5.mouseX, p5.mouseY,
            ...(this.step2Vert()(this.boundingBoxCenter)).xy,
            2.1 * Math.max(...this.verts.map(jt => vnorm(vsub(jt, this.step2Vert()(this.boundingBoxCenter))))))
        }
        return isInside
      }
      pointInArea(point, extended = false) {
        let onPolygon = p5.collidePointPoly(point.x, point.y, this.verts)
        let isInside = onPolygon;
        // print(`Label:${this.label}; onPolygon: ${onPolygon}`)
        // if (!isInside && this.isResizable) {
        //   let onControls = any(Object.values(this.dragTriangles).map(it => it.hitbox.mouseInArea()));
        //   print(`Label:${this.label};onControls: ${onControls}`);
        //   isInside = isInside || onControls;
        // }
        if (!isInside && extended) {
          isInside = p5.collidePointCircle(point.x, point.y,
            ...(this.step2Vert()(this.boundingBoxCenter)).xy,
            2.1 * Math.max(...this.verts.map(jt => vnorm(vsub(jt, this.step2Vert()(this.boundingBoxCenter))))))
        }
        return isInside
      }

      lineInArea(startPoint, endPoint, extended = false) {
        let onPolygon = p5.collideLinePoly(startPoint.x, startPoint.y, endPoint.x, endPoint.y, this.verts)
        let isInside = onPolygon;
        // print(`Label:${this.label}; onPolygon: ${onPolygon}`)
        // if (!isInside && this.isResizable) {
        //   let onControls = any(Object.values(this.dragTriangles).map(it => it.hitbox.mouseInArea()));
        //   print(`Label:${this.label};onControls: ${onControls}`);
        //   isInside = isInside || onControls;
        // }
        if (!isInside && extended) {
          isInside = p5.collideLineCircle(startPoint.x, startPoint.y, endPoint.x, endPoint.y,
            ...(this.step2Vert()(this.boundingBoxCenter)).xy,
            2.1 * Math.max(...this.verts.map(jt => vnorm(vsub(jt, this.step2Vert()(this.boundingBoxCenter))))))
        }
        return isInside
      }

      updateReferencePoint(dx, dy) {
        return p5.createVector(dx, dy)
      }

      snapToTiles() {//{{{
        if (this.isEmpty) return;
        let isInside = Tiles.allTiles.map((T) => {
          return all(this.innerCenters.map(center => p5.collidePointPoly(...this.step2Vert()(center).xy, T.verts)))
        })
        isInside[Tiles.allTiles.indexOf(this)] = false;

        if (any(isInside)) {
          // only match the Tiles with the heighest zorder (the last matching one)
          let enclosingTiles = Tiles.allTiles[isInside.findLastIndex(it => it)];

          //using slice for the mapping to verts
          let firstCenter = this.innerCenters.slice(0, 1).map(this.step2Vert())[0];
          let centerVectors = enclosingTiles.innerCenters.map(enclosingTiles.step2Vert()).map((center) => vsub(center, firstCenter));
          let minCenterDistanceIdx = argMin(centerVectors.map(it => it.mag()));

          this.referencePoint = vadd(this.referencePoint, centerVectors[minCenterDistanceIdx]);
        }
      }//}}}

      handleCutting(cutLineLocDir) {
        if (this.isEmpty || !this.isCuttable) return
        let mouse = p5.mouseVec();
        p5.print("HANDLE CUTTING");
        p5.print("handleCutting():", cutLineLocDir);
        this.isCut = true;

        let endPoint = p5.mouseVec();
        if (AppState["CUTEND"] != undefined) endPoint = AppState["CUTEND"];

        let cutLineVec = vunit(vsub(endPoint, AppState["CUTSTART"]));
        let edgePointProjections = [];
        let edgePointProjectionDistances = [];
        this.edgePoints
          .map(p => this.step2Vert()(p))
          .forEach((p) => {
            let vec2Edge = vsub(p, AppState["CUTSTART"]);
            let proj = vadd(AppState["CUTSTART"],
              vmult(cutLineVec, vdot(cutLineVec, vec2Edge)));
            edgePointProjections.push(proj);
            edgePointProjectionDistances.push(vdist(proj, p));
            //p5.circle(...p.xy,10);
          })//filter(it => !any(m.stepVerts.map(v => ((v[0] - it[0]) == 0) && ((v[1] - it[1]) == 0))));//.filter(point => !this.stepVerts.includes(point));

        //@refactor: argSort would be nice
        let cutEdgePoints = []
        let firstIdx = argMin(edgePointProjectionDistances);
        cutEdgePoints.push({
          idx: firstIdx,
          dist: edgePointProjectionDistances[firstIdx]
        })

        // @hack: this is a very bad hack
        edgePointProjectionDistances[firstIdx] += 1000;
        let secondIdx = argMin(edgePointProjectionDistances);
        let secondEdgePoint = {
          idx: secondIdx,
          dist: edgePointProjectionDistances[secondIdx]
        }
        if (cutEdgePoints[0].idx < secondEdgePoint.idx) {
          cutEdgePoints.push(secondEdgePoint);
        } else {
          cutEdgePoints.unshift(secondEdgePoint);
        }
        p5.print(edgePointProjections, edgePointProjectionDistances, cutEdgePoints);

        // the edge points should not be neighbors
        if (abs(cutEdgePoints[0].idx - cutEdgePoints[1].idx) == 1) return
        p5.print("not neighbors");



        //@todo: unnecessary
        // if (AppState["ISCUTTING"] && AppState["CUTEND"] != undefined) {
        //   let canclePos = this.step2Vert()(this.currentCut[0]);
        //   let lastPos = this.step2Vert()(this.currentCut[this.currentCut.length - 1]);
        //   // print("befor if:", vsub(mouse, canclePos).mag(), 0.25 * this.pixelUnit);
        //   if (vsub(mouse, canclePos).mag() < 0.5 * this.pixelUnit) {
        //
        //     this.currentCut = [];
        //     //@improvement:  :AVAILABELCUTS:
        //     this.availableCuts = this.edgePoints.filter(it => !any(this.stepVerts.map(v => ((v[0] - it[0]) == 0) && ((v[1] - it[1]) == 0))));//.filter(point => !this.stepVerts.includes(point));
        //     this.isCut = false;
        //     return
        //   }

        // find if cut is possible i.e. is the cutline between dots 
        // close enough to edgepoints  



        // perform the cut
        if ((cutEdgePoints[0].dist + cutEdgePoints[1].dist) / 2 < (this.pixelUnit * 0.95) / 2) {
          this.currentCut = [];

          let edgePoint0 = this.edgePoints[cutEdgePoints[0].idx];
          let edgePoint1 = this.edgePoints[cutEdgePoints[1].idx];
          let change = 0;
          let splitOffset = undefined;
          p5.print("edgePoint0/1:", edgePoint0, edgePoint1);
          if ((cutLineLocDir.dir == DIRECTIONS.EW) || (cutLineLocDir.dir == DIRECTIONS.WE)) { // horizontal cut
            if (edgePoint0[1] != edgePoint1[1]) throw new Error("Should have the same yvalue!")
            change = Math.sign(edgePoint1[0] - edgePoint0[0]);
            p5.print(rangeArray(edgePoint0[0], edgePoint1[0], change));
            rangeArray(edgePoint0[0], edgePoint1[0], change).forEach(x => {

              this.currentCut.push([x, edgePoint0[1]]);
            })
            splitOffset = (signs) => [signs[0] * 0, signs[1] * 5];

          } else if (cutLineLocDir.dir == DIRECTIONS.NS || cutLineLocDir == DIRECTIONS.SN) { // vertical cut
            if (edgePoint0[0] != edgePoint1[0]) throw new Error("Should have the same xvalue!")
            change = Math.sign(edgePoint1[1] - edgePoint0[1]);
            p5.print(rangeArray(edgePoint0[1], edgePoint1[1], change));
            rangeArray(edgePoint0[1], edgePoint1[1], change).forEach(y => {

              this.currentCut.push([edgePoint0[0], y]);
            })

            splitOffset = (signs) => [signs[0] * 5, signs[1] * 0];
          }

          p5.print("currentCut", this.currentCut);

          // @FIX: not all edgePoints are labeled with the (X) and some split parts are rotated (direction issue)
          //
          let [ci, cf] = [this.currentCut[0], this.currentCut[this.currentCut.length - 1]];
          let [ciStepIdx, cfStepIdx] = [ci, cf].map(c => this.edgePoints.findIndex(it => it.toString() == c.toString()));
          let [cMinStepIdx, cMaxStepIdx] = ([ciStepIdx, cfStepIdx]).sort((a, b) => a - b);
          let cutIsReversed = (ciStepIdx != cMinStepIdx);

          let initalEdgePart = this.edgePoints.slice(0, cMinStepIdx);
          let betweenEdgePart = this.edgePoints.slice(cMinStepIdx + 1, cMaxStepIdx);
          let finalEdgePart = this.edgePoints.slice(cMaxStepIdx + 1);
          if (DEBUGMODE) print("EdgeParts:");
          if (DEBUGMODE) print("→ (i): ", initalEdgePart.join("],["));
          if (DEBUGMODE) print("→ (b): ", betweenEdgePart.join("],["));
          if (DEBUGMODE) print("→ (f): ", finalEdgePart.join("],["));
          if (DEBUGMODE) print("→ (curCut): ", this.currentCut.join("],["));
          let firstPart = [...initalEdgePart, ...((cutIsReversed) ? this.currentCut.slice().reverse() : this.currentCut.slice()), ...finalEdgePart]
          let secondPart = [...((cutIsReversed) ? this.currentCut.slice() : this.currentCut.slice().reverse()), ...betweenEdgePart];
          if (DEBUGMODE) print("EdgeParts assambled:");
          if (DEBUGMODE) print("→ (first): ", firstPart.join("],["));
          if (DEBUGMODE) print("→ (second): ", secondPart.join("],["));

          saveUndoStep(this, "SPLIT");
          this.isVisibel = false;
          this.isFrozen = true;
          if (DEBUGMODE) print("cutDirs:", edgePoints2Directions(this.currentCut).join(';'));
          // the last index is unknown due to a slightly broken behavior
          if (DEBUGMODE) print("cutDirs:", edgePoints2Directions(this.currentCut)[(cutIsReversed) ? 0 : this.currentCut.length - 2]);

          if (DEBUGMODE) print("firstTile:");

          let loc2 = this.step2Vert()(this.currentCut[(!cutIsReversed) ? (this.currentCut.length - 1) : 0]);
          let splitOffsetSigns = [0, 0];

          splitOffsetSigns[0] = (this.loc.x < loc2.x) ? -1 : +1;
          splitOffsetSigns[1] = (this.loc.y < loc2.y) ? -1 : +1;


          Tiles.createTiles(vadd(this.loc, p5.createVector(...splitOffset(splitOffsetSigns))),
            edgePoints2Steps(firstPart),
            this.startDirection,
            this.unit,
            {
              empty: this.isEmpty,
              zorder: this.zorder,
              resize: this.resize,
              resizecolor: this.dragTriangleColor,
              showresizeeq: this.showResizeEq,
              showsizedesc: this.showSizeDesc,
              cuttable: this.isCuttable,
              fillcolor: this.fillColor,
              starterfillcolor: this.starterFillColor,
              fillstriped: this.fillStriped,
              edgecolor: this.edgeColor,
              label: `${this.label}|0`,
              synced: this.synced
            }
          );
          if (DEBUGMODE) print("secondTile:");
          let startDir = edgePoints2Directions(this.currentCut)[(cutIsReversed) ? 0 : this.currentCut.length - 2][1];
          let axis;
          if (startDir.includes("West")) {
            axis = 'x';
          } else if (startDir.includes("North")) {
            axis = 'y';
          } else {
            print("ERROR:", startDir);
          }
          if (DEBUGMODE) print("axis:", axis);
          p5.print("loc2", loc2);

          splitOffsetSigns = splitOffsetSigns.map(it => it * (-1));
          loc2.add(p5.createVector(...splitOffset(splitOffsetSigns)));
          // p5.print("this.center", this.step2Vert()(this.boundingBoxCenter));
          p5.print("this.loc", this.loc);
          p5.print("loc2", loc2);
          Tiles.createTiles(loc2,
            edgePoints2Steps(secondPart),
            axis,
            this.unit,
            {
              empty: this.isEmpty,
              zorder: this.zorder,
              resize: this.resize,
              resizecolor: this.dragTriangleColor,
              showresizeeq: this.showResizeEq,
              showsizedesc: this.showSizeDesc,
              cuttable: this.isCuttable,
              fillcolor: this.fillColor,
              starterfillcolor: this.starterFillColor,
              fillstriped: this.fillStriped,
              edgecolor: this.edgeColor,
              label: `${this.label}|1`,
              synced: this.synced
            });
          // print(`####################`);
          // print(`####### Sign #######`);
          // print(`####################`);
          // print(`isReversed ${cutIsReversed}`);
          this.destruct();
          // let delIdxT = Tiles.allTiles.findIndex(it => it.label == this.label);
          // let delIdxM = Moveable.allMoveables.findIndex(it => it.label == this.label);
          // Tiles.allTiles.splice(delIdxT, 1);
          // Moveable.allMoveables.splice(delIdxM, 1);
          return

        }
        if (this.currentCut.length >= 2) {
          let next2lastPos = this.step2Vert()(this.currentCut[this.currentCut.length - 2]);
          if (vsub(mouse, next2lastPos).mag() < 0.25 * this.pixelUnit) {

            if (DEBUGMODE) print("step back");
            this.currentCut.splice(this.currentCut.length - 1, 1);
            this.availableCuts = this.getAvailCuts();
            return
          }
        }

        //}
        if (this.availableCuts.length > 0) {

          let distances2AvailablePoints = this.availableCuts.map(this.step2Vert()).map((p) => vsub(p, mouse).mag());
          let [minDistance, minDistanceIdx] = [min(...distances2AvailablePoints), argMin(distances2AvailablePoints)];

          if (minDistance < 0.4 * this.pixelUnit) {
            let cutPoint = this.availableCuts[minDistanceIdx];
            if (!this.currentCut.includes(cutPoint)) {
              this.currentCut.push(cutPoint);
            }
            let availCuts = this.getAvailCuts();
            this.availableCuts = availCuts;
          }


        }



        // print("avail left:", this.availableCuts);
        // print("edge :", this.edgePoints);
        // print("currentCut:", this.currentCut);
        this.isCut = this.currentCut.length > 0;
        // return this.isCut
      }

      getAvailCuts() {// {{{
        //@improvement: some cuts ar not possible, selecting a vertex has to be allowed for some situations
        //
        // ---x  o---   When 'o' is the last cut, 'x' has to be available 
        //    |  |
        //    |  |
        //    +--+
        // When this happens the vertex will be the last cutPoint since they lie on the edge
        //
        let lastCutPoint = this.currentCut[this.currentCut.length - 1];
        let availCuts = pointsNESW(lastCutPoint);
        // print(`z:${this.zorder} l3502`, "AvailCuts:", JSON.stringify(availCuts));
        if (availCuts) {

          availCuts = availCuts.filter(point => this.allowedCuts.map(it => it.toString()).includes(point.toString()));
          // print(`z:${this.zorder} l3506`, "AvailCuts:", JSON.stringify(availCuts));
          availCuts = availCuts.filter(point => !this.currentCut.map(it => it.toString()).includes(point.toString()));
          // print(`z:${this.zorder} l3508`, "AvailCuts:", JSON.stringify(availCuts));

          let edgeIdx = this.edgePoints.findIndex(it => it.toString() == lastCutPoint.toString());
          if ((this.currentCut.length == 1) && (edgeIdx > 0)) {
            let forbiddenEdgeIdx = this.stepsSummed.findIndex(it => it > edgeIdx);
            let forbiddenEdgeIdxs = [(forbiddenEdgeIdx + this.stepsSummed.length - 1) % this.stepsSummed.length, forbiddenEdgeIdx, (forbiddenEdgeIdx + 1) % this.stepsSummed.length];
            // print("forbidden Idx(s):", forbiddenEdgeIdx, forbiddenEdgeIdxs);
            availCuts = availCuts.filter(point => {
              if (DEBUGMODE) print("point:", point);
              let edgeIdx = (this.edgePoints.findIndex(it => it.toString() == point.toString()));
              if (DEBUGMODE) print("edgeIndex of point:", edgeIdx);
              if (edgeIdx < 0) return true;//edgeIdx = (this.stepsSummed.length + edgeIdx) % this.stepsSummed.length;
              if (DEBUGMODE) print("edgeIndex of point:", edgeIdx);
              if (DEBUGMODE) print("=> filter:", forbiddenEdgeIdxs.includes(this.stepsSummed.findIndex(it => it > edgeIdx)));
              return !(forbiddenEdgeIdxs.includes(this.stepsSummed.findIndex(it => it > edgeIdx)));
              // print("forbidden:", forbiddenEdgeIdx, this.availCuts.map(this.stepsSummed.findIndex(it => it > this.edgePoints.findIndex(it => it.toString() == point.toString())));
            })

            if (DEBUGMODE) print(`z:${this.zorder} l3521`, "AvailCuts:", JSON.stringify(availCuts));

          } else if ((this.currentCut.length > 1) && (edgeIdx > 0)) {
            // the start is allways on an edge, the next point on the edge is the last 
            availCuts = [];
            if (DEBUGMODE) print(`z:${this.zorder} l3526`, "AvailCuts:", JSON.stringify(availCuts));
          }
          // availCuts = availCuts.filter(point => !this.stepVerts.map(it => it.toString()).includes(point.toString()));
          // print(availCuts.map(point => p5Inst.collidePointPoly(...(this.step2Vert()(point)).xy, this.verts_)));
          // availCuts = availCuts.filter(point => p5Inst.collidePointPoly(...(this.step2Vert()(point)).xy, this.verts_));
          // availCuts = availCuts.filter(filterEnclosed);
          if (DEBUGMODE) print(`z:${this.zorder}, l3532`, "AvailCuts:", JSON.stringify(availCuts));
          return availCuts
        }
      }// }}}
      //@todo: unnecessary
      handleDrawing() {// {{{
        if (this.isDrawable) {

          // print("drawline:", this.drawLine);
          saveUndoStep(this);
          let mouse = p5.mouseVec();
          if (this.availableDraws.length > 0) {
            // print("handleDrawing:", this, this.availableDraws, argMin(this.verts.map(it => vsub(it, this.availableDraws[0]).mag())));
            let distances2AvailablePoints = this.availableDraws.map((p) => vsub(p, mouse).mag());
            let [minDistance, minDistanceIdx] = [min(...distances2AvailablePoints), argMin(distances2AvailablePoints)];
            let drawPoint = this.availableDraws[minDistanceIdx];
            if ((this.drawBetween && vnorm(vsub(this.drawBetween, drawPoint)) < 0.01 * this.pixelUnit) || (minDistance < 0.4 * this.pixelUnit)) {
              if (!this.currentDraw.includes(drawPoint) || drawPoint === this.currentDraw[0]) {
                this.currentDraw.push(drawPoint);
                //@hack:
                undoTimestamp = Date.now();
              }
              // let availCuts = this.getAvailCuts();
            }
          }
        }

        // print("this.currentDraw", this.currentDraw);
        this.drawDistances = []
        this.currentDraw.forEach((it, i) => {
          if (i > 0) {
            this.drawDistances.push(vsub(it, this.currentDraw[i - 1]).mag());
          }
        })
        // print("drawDistances", this.drawDistances)

        this.markedLine = [this.drawLine[0]]
        this.drawDistances.forEach((it, i) => {
          let current = this.markedLine[this.markedLine.length - 1];
          let next = vadd(current, p5.createVector(it, 0));
          this.markedLine.push(next);
        })
        // print("this.markedLine", this.markedLine);
        this.isDrawn = this.currentDraw.length > 0;
      }// }}}


      index2center(index, starterSize) {
        starterSize = starterSize || false;
        let xl = this.rectSideLengths.x;
        let yl = this.rectSideLengths.y;
        if (starterSize) {
          xl = this.starterIndices[0].length;
          yl = this.starterIndices.length;
        }
        let origin = this.innerCenters[0];
        let x = (index) % yl;
        let y = floor((index) / xl);
        return [origin[0] + x, origin[1] + y];
      }

      drawDotsByIndex(index, opt) {
        let center = this.innerCenters[index];
        if (center == undefined) {
          return
          // if (index == 4) p5.print(this.index2center(index, true));
          // center = this.index2center(index, true);
        };
        p5.push();
        if (opt.fill) p5.fill(opt.fill);
        if (opt.stroke) p5.stroke(opt.stroke);
        p5.strokeWeight(0);
        p5.circle(...this.step2Vert()(center).xy, this.pixelUnit * 0.95);
        p5.pop();
      }
      draw() {//{{{
        p5.push();
        if (this.isVisibel) {

          if (!this.isEmpty) {
            p5.push();
            // background of tiles
            p5.fill("#FFF");
            p5.rectMode(p5.CORNERS);
            p5.rect(...this.stepVerts2Verts().map(it => it.xy).filter((it, i) => i % 2 == 0).flat());
            p5.rectMode(p5.CENTER);
            p5.strokeWeight(5);
            p5.stroke("#EEE");
            let fillColors = [this.fillColor, '#' + (parseInt(this.fillColor.slice(1), 16) - parseInt("22222200", 16)).toString(16)];
            let idx = 0
            let lastY = 0;
            this.innerCenters.map(this.step2Vert()).forEach(
              (center, i) => {
                if ((this.fillStriped) && (Math.abs(center.y - lastY) > 1e-3)) { idx = (idx + 1) % 2 }
                //p5.fill(fillColors[idx]);
                //p5.rect(...center.xy, this.pixelUnit, this.pixelUnit)
                p5.push();
                p5.fill(this.fillColor);
                p5.strokeWeight(0);
                p5.stroke(this.fillColor);
                p5.circle(...center.xy, this.pixelUnit * 0.95);
                p5.pop();
                lastY = center.y;
              })
            if (this.starterFillColor != undefined) {
              this.starterIndices.flat().forEach((it) => this.drawDotsByIndex(it, { fill: this.starterFillColor, stroke: this.starterFillColor }));
            }
            // this.firstInnerCenters.map(it => String(it)).map((jt) => this.innerCenters.map(kt => String(kt)).includes(jt)).forEach(
            //   (isIn, i) => {
            //     if (isIn) {
            //       let center = this.step2Vert()(this.firstInnerCenters[i])
            //       p5.print(center, i);
            //       if ((this.fillStriped) && (Math.abs(center.y - lastY) > 1e-3)) { idx = (idx + 1) % 2 }
            //       //p5.fill(fillColors[idx]);
            //       //p5.rect(...center.xy, this.pixelUnit, this.pixelUnit)
            //       p5.push();
            //       p5.fill("#009900");
            //       p5.strokeWeight(0);
            //       p5.stroke("#009900");
            //       p5.circle(...center.xy, this.pixelUnit * 0.95);
            //       p5.pop();
            //       lastY = center.y;
            //     }
            //   })
            p5.stroke(this.edgeColor);
            // this.edges.forEach((edge, _) => {
            //   p5.line(...edge.map(vert => vert.xy).flat());
            // })
            //draw thin border around dotarray
            p5.stroke(this.edgeColor);
            p5.strokeWeight(2);
            this.edges.forEach((edge, _) => {
              p5.line(...edge.map(vert => vert.xy).flat());
            })
            if (DEBUGMODE) p5.circle(...this.step2Vert()(this.boundingBoxCenter).xy, 10);
            p5.fill("#922");
            p5.stroke("#922");
            // this.innerCenters.map(this.step2Vert()).forEach((it, i) => {
            //
            //   p5.text(`${i}`, ...(it).xy, 10);
            // });
            p5.pop();

          } else {
            p5.push();
            p5.stroke(this.edgeColor);
            p5.strokeWeight((this.isFrozen) ? 7 : 4);
            this.edges.forEach((edge, _) => {
              p5.line(...edge.map(vert => vert.xy).flat());
            })
            p5.rectMode(p5.CENTER);
            p5.noStroke();
            let fillColors = [(new chroma.Color(this.fillColor)).brighten(0.4).hex(), this.fillColor];
            let idx = 0
            let lastY = 0;
            this.innerCenters.map(this.step2Vert()).forEach((center, i) => {
              if ((this.fillStriped) && (Math.abs(center.y - lastY) > 1e-3)) { idx = (idx + 1) % 2 }
              p5.fill(fillColors[idx]);
              p5.rect(...center.xy, this.pixelUnit * 1.01, this.pixelUnit * 1.0)
              lastY = center.y;
            })
            p5.pop();

          }
          let verbalNumbers = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun",
            "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn", "zwanzig"]
          // show the triangles for resizing
          //
          function drawSizeDescription(T, changeNumCols = 0, changeNumRows = 0, direction) {
            if (!AppState.SHOWDESC) return
            let numCols = abs(T.steps[T.startDirOffset]) + (changeNumCols);
            let numRows = abs(T.steps[T.startDirOffset + 1]) + (changeNumRows);
            let [edgeX, edgeY] = (T.step2Vert()([T.boundingBoxCenter[0], 1])).xy;//vmult(T.edges.reduce((c,it)=> vadd(c,it), p5.createVector(0, 0)), 0.25).xy;
            // p5.print("edgeX" + `${edgeX}`)
            if (direction == "West") edgeX = edgeX - changeNumCols / 2 * T.pixelUnit;
            if (direction == "East") edgeX = edgeX + changeNumCols / 2 * T.pixelUnit;

            if (direction == "South") {
              //       p5.print("edgeX" + `${edgeX}`)
              //     }else{
              edgeY = edgeY + changeNumRows * T.pixelUnit;
            }
            // p5.print(`boundingbox ${T.label} ${T.boundingBoxCenter}`)
            let edgeX_old = edgeX;
            p5.push();
            if (T.showSizeDesc) {
              p5.textAlign("center", "center");
              p5.textSize(20);
              p5.fill("#888F");
              // p5.print("show size" + ` ${numCols} x ${numRows} (${edgeX}, ${edgeY})`);
              let description;
              if ((numRows == 1) && (numCols == 1)) {
                description = "";
                T.sizeDesc = "";
              } else if (numRows == 1) {
                description = `${Math.abs(numCols)} Punkte in einer Reihe, also eine ${Math.abs(numCols)}er Reihe`;
                T.sizeDesc = `${Math.abs(numCols)} Punkte in einer Reihe, also eine ${Math.abs(numCols)}er Reihe`;
              } else {
                description = `${verbalNumbers[Math.abs(numRows)]} ${Math.abs(numCols)}er Reihen, das sind ${Math.abs(numRows)} · ${Math.abs(numCols)} Punkte`;
                T.sizeDesc = `${verbalNumbers[Math.abs(numRows)]} ${Math.abs(numCols)}er Reihen, das sind ${Math.abs(numRows)} · ${Math.abs(numCols)} Punkte`;
              }
              // let textwidth = p5.textWidth(description);
              // p5.push()
              // p5.rectMode(p5.CENTER);
              // p5.noStroke();
              // p5.fill("white");
              // p5.rect(edgeX, edgeY, (2+numCols)*T.pixelUnit, 20)
              // p5.pop();
              //p5.text(description, edgeX, edgeY);
            }

            p5.pop();
          }


          if ((this.isActive) && (this.isResizable)) {
            p5.push();
            p5.noStroke();
            Object.values(this.dragTriangles).forEach(it => {

              p5.fill(this.dragTriangleColor);

              if (it.hitbox.mouseInArea()) p5.fill(new chroma.Color(this.dragTriangleColor).alpha(1).hex());

              let numRows, numCols;
              let edgeX, edgeY;
              if (!it.hitbox.isDragged) {

                p5.triangle(...it.tri);
                // p5Inst.rect(...it.hitbox.rect); 
              } else {
                p5.textAlign("center", "center");
                p5.textSize(20);
                p5.fill(new chroma.Color(this.dragTriangleColor).darken(0.5).hex());
                let shiftTri = [...it.tri];
                let idx = this.edgeOrientations.indexOf(draggingDirection);
                let evenColumnsOffset;
                let evenRowsOffset;
                let dotPositions;
                let shrinkSign;
                if (draggingDirection == "North") {
                  shrinkSign = +1;
                  let draggingDist = clampValue(draggingVector.y, -Number.MAX_VALUE, (Math.abs(this.steps[(idx + 1) % 4]) - 1) * this.pixelUnit);
                  print(`${draggingDirection}: ${draggingVector}, ${draggingDist}`);
                  [1, 3, 5].forEach(it => shiftTri[it] += draggingDist)
                  p5.triangle(...shiftTri);
                  [edgeX, edgeY] = vmult(vadd(...this.edges[idx]), 0.5).xy;
                  // print("drawing:", this.stepVerts2Verts()[idx])

                  p5.rectMode(p5.CENTER);

                  p5.fill("#8884");
                  countUnits = -(floor(draggingDist / this.pixelUnit + 0.5));

                  numCols = abs(this.steps[idx]);
                  if (!this.isEmpty) {
                    // p5.rect(edgeX, edgeY + (draggingDist / 2), this.steps[idx] * this.pixelUnit, draggingDist);

                    p5.push();
                    p5.noFill();
                    p5.stroke("#EEE");
                    p5.strokeWeight(5);
                    [...Array(Math.abs(countUnits)).keys()].reverse().forEach(jt => {
                      p5.fill("#DDD");
                      if (jt % 2 == 1) p5.fill("#CCC");

                      // p5.rect(edgeX, edgeY - Math.sign(countUnits) * (jt + 1) * this.pixelUnit / 2, this.steps[idx] * this.pixelUnit, Math.sign(countUnits) * (jt + 1) * this.pixelUnit);
                      p5.push();
                      p5.fill(this.fillColor);
                      p5.strokeWeight(0);
                      p5.stroke(this.fillColor);

                      evenColumnsOffset = (numCols % 2 == 0) ? -this.pixelUnit / 2 : 0;
                      dotPositions = [...Array(numCols).keys()];

                      if (numCols % 2 == 1) {
                        dotPositions = dotPositions.map(it => it - floor(numCols / 2))
                      } else {
                        dotPositions = dotPositions.map(it => it - floor((numCols - 1) / 2))
                        dotPositions.push(numCols / 2)
                      }
                      dotPositions.forEach(it => {
                        p5.circle(edgeX + evenColumnsOffset + it * this.pixelUnit, edgeY - Math.sign(countUnits) * (jt + 1 / 2) * this.pixelUnit, this.pixelUnit * 0.95);

                        if ((Math.sign(draggingDist) == shrinkSign)) {
                          let numShrunkRows = Math.round(Math.draggingDist / this.pixelUnit);
                          p5.push()
                          p5.fill("#FFFFFF55");
                          // grayed out
                          p5.fill("#FFFFFFDD");
                          p5.circle(edgeX + evenColumnsOffset + it * this.pixelUnit, edgeY - Math.sign(countUnits) * (jt + 1 / 2) * this.pixelUnit, this.pixelUnit * 0.98);
                          p5.pop()


                        }
                      })
                      // p5.circle(edgeX, edgeY - Math.sign(countUnits) * (jt + 1) * this.pixelUnit / 2, this.steps[idx] * this.pixelUnit);// Math.sign(countUnits) * (jt + 1) * this.pixelUnit);
                      // [...Array(numCols).keys()].map(it => it - floor(numCols/2))
                      //   .filter(it => it != 0)
                      //   .forEach(i => {
                      // p5.circle(edgeX, edgeY - Math.sign(countUnits) * (jt + 1/2) * this.pixelUnit, this.pixelUnit*0.95);

                      // })
                      p5.pop();
                    })
                    // if (Math.sign(draggingDist) == shrinkSign){
                    // print("!!!!!", p5.mouseX-draggingVector.x,(p5.mouseY-draggingVector.y)/2);
                    // p5.push()
                    // p5.rectMode(p5.CENTER);
                    // 
                    // p5.fill("#0000FF");
                    // p5.circle(p5.mouseX-draggingVector.x,(p5.mouseY-draggingVector.y)/2,20)
                    // p5.fill("#FFFFFF");
                    //   
                    // p5.rect(p5.mouseX-draggingVector.x, (p5.mouseY-draggingVector.y)/2,  numCols*this.pixelUnit, (p5.mouseY-draggingVector.y)/2);
                    // p5.pop()
                    // }

                    let oddCorrection = numCols % 2;
                    // let lineStarts = [...Array(abs(this.steps[idx]) - 1).keys()];
                    // print("linestarts:", lineStarts);

                    // .map(it => it - ((numCols - 1) - oddCorrection) / 2)
                    // .map(it => [edgeX - (it + 0.5 * ((oddCorrection + 1) % 2)) * this.pixelUnit, edgeY])
                    // print("lineStarts:", lineStarts);
                    //lineStarts.forEach(xy => p5.line(...xy, xy[0], draggingDist + xy[1]));
                    // lineStarts.forEach(xy => {p5.point(...xy, xy[0]); p5.point(draggingDist + xy[1])});

                    p5.pop();
                  }
                  p5.push();
                  p5.stroke(this.edgeColor);
                  p5.strokeWeight(5);
                  p5.noFill();
                  // p5.rect(edgeX, edgeY + (draggingDist / 2), this.steps[idx] * this.pixelUnit, draggingDist);
                  p5.pop();
                  p5.fill("#888F");

                  numRows = countUnits; //+ ((countUnits < 0) ? -1 : 0);
                  if (this.showResizeEq && numRows != 0 && numCols != 0) {
                    p5.text(`${verbalNumbers[Math.abs(numRows)]} ${numCols}er ${(numRows > 0) ? "mehr" : "weniger"}`, edgeX, edgeY + (draggingDist / 2));


                  }
                  // p5Inst.text(`${countUnits + ((countUnits < 0) ? 1 : 0)}`, edgeX, edgeY + (draggingDist / 2));

                  drawSizeDescription(this, 0, numRows, draggingDirection)
                } else if (draggingDirection == "South") {
                  shrinkSign = -1;
                  numCols = abs(this.steps[idx]);
                  let draggingDist = clampValue(draggingVector.y, -(Math.abs(this.steps[(idx + 1) % 4]) - 1) * this.pixelUnit, Number.MAX_VALUE);
                  print(`${draggingDirection}: ${draggingDist}`);
                  [1, 3, 5].forEach(it => shiftTri[it] += draggingDist)
                  p5.triangle(...shiftTri);
                  [edgeX, edgeY] = vmult(vadd(...this.edges[idx]), 0.5).xy;
                  // print("drawing:", this.stepVerts2Verts()[idx])
                  p5.rectMode(p5.CENTER);

                  p5.fill("#8884");
                  countUnits = (floor(draggingDist / this.pixelUnit + 0.5));
                  // if (countUnits < 0) countUnits -= 1;
                  // draggingDist += (draggingDist < 0) ? this.pixelUnit : 0;
                  //
                  if (!this.isEmpty) {
                    // p5.rect(edgeX, edgeY + (draggingDist / 2), this.steps[idx] * this.pixelUnit, draggingDist);
                    p5.push();
                    p5.noFill();
                    p5.stroke("#EEE");
                    p5.strokeWeight(5);
                    [...Array(Math.abs(countUnits)).keys()].reverse().forEach(jt => {
                      p5.fill("#DDD");
                      if (jt % 2 == 1) p5.fill("#CCC");

                      // p5.rect(edgeX, edgeY + Math.sign(countUnits) * (jt + 1) * this.pixelUnit / 2, this.steps[idx] * this.pixelUnit, Math.sign(countUnits) * (jt + 1) * this.pixelUnit);
                      p5.push();
                      p5.fill(this.fillColor);
                      p5.strokeWeight(0);
                      p5.stroke(this.fillColor);
                      // p5.circle(edgeX, edgeY + Math.sign(countUnits) * (jt + 1/2) * this.pixelUnit, this.pixelUnit*0.95);
                      // p5.circle(edgeX, edgeY - Math.sign(countUnits) * (jt + 1) * this.pixelUnit / 2, this.steps[idx] * this.pixelUnit);// Math.sign(countUnits) * (jt + 1) * this.pixelUnit);
                      evenColumnsOffset = (numCols % 2 == 0) ? -this.pixelUnit / 2 : 0;
                      dotPositions = [...Array(numCols).keys()];

                      if (numCols % 2 == 1) {
                        dotPositions = dotPositions.map(it => it - floor(numCols / 2));
                      } else {
                        dotPositions = dotPositions.map(it => it - floor((numCols - 1) / 2));
                        dotPositions.push(numCols / 2)
                      }
                      dotPositions.forEach(it => {
                        p5.circle(edgeX + evenColumnsOffset + it * this.pixelUnit, edgeY + Math.sign(countUnits) * (jt + 1 / 2) * this.pixelUnit, this.pixelUnit * 0.95);

                        if ((Math.sign(draggingDist) == shrinkSign)) {
                          let numShrunkRows = Math.round(Math.draggingDist / this.pixelUnit);
                          p5.push()
                          p5.fill("#FFFFFF");
                          // grayed out
                          p5.fill("#FFFFFFDD");
                          p5.circle(edgeX + evenColumnsOffset + it * this.pixelUnit, edgeY + Math.sign(countUnits) * (jt + 1 / 2) * this.pixelUnit, this.pixelUnit * 0.98);
                          p5.pop()
                        }
                      })

                      p5.pop();
                    })
                    let oddCorrection = numCols % 2;
                    // let lineStarts = [...Array(abs(this.steps[idx]) - 1).keys()]
                    // .map(it => it - ((numCols - 1) - oddCorrection) / 2)
                    // .map(it => [edgeX - (it + 0.5 * ((oddCorrection + 1) % 2)) * this.pixelUnit, edgeY])
                    // print("lineStarts:", lineStarts);
                    // lineStarts.forEach(xy => p5.line(...xy, xy[0], draggingDist + xy[1]));

                    p5.pop();
                  }
                  p5.push();
                  p5.stroke(this.edgeColor);
                  p5.strokeWeight(5);
                  p5.noFill();
                  // p5.rect(edgeX, edgeY + (draggingDist / 2), this.steps[idx] * this.pixelUnit, draggingDist);
                  p5.pop();
                  p5.fill("#888F");

                  numRows = countUnits; //+ ((countUnits < 0) ? 1 : 0);
                  if (this.showResizeEq && numRows != 0 && numCols != 0) {
                    p5.text(`${verbalNumbers[Math.abs(numRows)]} ${numCols}er ${(numRows > 0) ? "mehr" : "weniger"}`, edgeX, edgeY + (draggingDist / 2));
                  }
                  // p5Inst.text(`${countUnits + ((countUnits < 0) ? 1 : 0)}`, edgeX, edgeY + (draggingDist / 2));
                  drawSizeDescription(this, 0, numRows, draggingDirection)
                } else if (draggingDirection == "East") {
                  shrinkSign = -1;
                  let draggingDist = clampValue(draggingVector.x, -(Math.abs(this.steps[(idx + 1) % 4]) - 1) * this.pixelUnit, Number.MAX_VALUE);
                  print(`${draggingDirection}: ${draggingDist}`);
                  [0, 2, 4].forEach(it => shiftTri[it] += draggingDist)
                  p5.triangle(...shiftTri);
                  p5.fill("#8884");
                  [edgeX, edgeY] = vmult(vadd(...this.edges[idx]), 0.5).xy;
                  // print("drawing:", edgeX, vmult(vadd(...this.edges[idx]), 0.5));
                  p5.rectMode(p5.CENTER);
                  countUnits = floor(draggingDist / this.pixelUnit + 0.5);

                  // if (countUnits < 0) countUnits -= 1;
                  numRows = abs(this.steps[idx]);
                  if (!this.isEmpty) {
                    // p5.rect(edgeX + (draggingDist / 2), edgeY, draggingDist, this.steps[idx] * this.pixelUnit);

                    p5.push();
                    p5.noFill();
                    p5.stroke("#EEE");
                    p5.strokeWeight(5);
                    [...Array(Math.abs(countUnits)).keys()].reverse().forEach(jt => {
                      p5.fill("#CCC");
                      if (jt % 2 == 1) {
                        p5.fill("#DDD");

                      }
                      // p5.rect(edgeX + (Math.sign(countUnits) * (jt + 1)) * this.pixelUnit / 2, edgeY, Math.sign(countUnits) * (jt + 1) * this.pixelUnit, this.steps[idx] * this.pixelUnit);
                      p5.push();
                      p5.fill(this.fillColor);
                      p5.strokeWeight(0);
                      p5.stroke(this.fillColor);

                      // p5.circle(edgeX + (Math.sign(countUnits) * (jt + 1/2)) * this.pixelUnit, edgeY, this.pixelUnit*0.95);
                      // p5.circle(edgeX, edgeY - Math.sign(countUnits) * (jt + 1) * this.pixelUnit / 2, this.steps[idx] * this.pixelUnit);// Math.sign(countUnits) * (jt + 1) * this.pixelUnit);

                      evenRowsOffset = (numRows % 2 == 0) ? -this.pixelUnit / 2 : 0;
                      dotPositions = [...Array(numRows).keys()];
                      // if ((this.starterFillColor != undefined) && (this.rectSideLengths.x < this.starterIndices[0].length)) {
                      //   p5.fill(this.starterFillColor);
                      //   p5.stroke(this.starterFillColor);
                      //
                      // }

                      if (numRows % 2 == 1) {
                        dotPositions = dotPositions.map(it => it - floor(numRows / 2));
                      } else {
                        dotPositions = dotPositions.map(it => it - floor((numRows - 1) / 2));
                        dotPositions.push(numRows / 2)
                      }
                      dotPositions.forEach(it => {
                        p5.circle(edgeX + (Math.sign(countUnits) * (jt + 1 / 2)) * this.pixelUnit, edgeY + evenRowsOffset + it * this.pixelUnit, this.pixelUnit * 0.95);

                        if ((Math.sign(draggingDist) == shrinkSign)) {
                          let numShrunkCols = Math.round(Math.draggingDist / this.pixelUnit);
                          p5.push()
                          p5.fill("#FFFFFF");
                          // grayed out
                          p5.fill("#FFFFFFDD");
                          p5.circle(edgeX + (Math.sign(countUnits) * (jt + 1 / 2)) * this.pixelUnit, edgeY + evenRowsOffset + it * this.pixelUnit, this.pixelUnit * 0.98);
                          p5.pop()
                        }
                      })

                      p5.pop();
                    })
                    let oddCorrection = numRows % 2;
                    // let lineStarts = [...Array(abs(this.steps[idx]) - 1).keys()]
                    //   .map(it => it - ((numRows - 1) - oddCorrection) / 2)
                    //   .map(it => [edgeX, edgeY - (it + 0.5 * ((oddCorrection + 1) % 2)) * this.pixelUnit])
                    // // print("lineStarts:", lineStarts);
                    // lineStarts.forEach(xy => p5.line(...xy, xy[0] + draggingDist, xy[1]));
                    p5.pop();
                  }

                  p5.push();
                  p5.strokeWeight(5);
                  p5.stroke(this.edgeColor);
                  p5.noFill();
                  // p5.rect(edgeX + (draggingDist / 2), edgeY, draggingDist, this.steps[idx] * this.pixelUnit);
                  p5.pop();
                  p5.fill("#888F");
                  numCols = countUnits;// + ((countUnits < 0) ? 1 : 0);
                  // if (this.showResizeEq) p5Inst.text(`${numRows} • ${numCols} = ${numRows * numCols}`, edgeX + (draggingDist / 2), edgeY);
                  if (this.showResizeEq && numRows != 0 && numCols != 0) {
                    p5.text(`${verbalNumbers[numRows]}  ${Math.abs(numCols)}er ${(numCols > 0) ? "mehr" : "weniger"}`, edgeX + (draggingDist / 2), edgeY);
                  }
                  // p5Inst.text(`${countUnits + ((countUnits < 0) ? 1 : 0)}`, edgeX + (draggingDist / 2), edgeY);

                  drawSizeDescription(this, numCols, 0, draggingDirection)
                } else if (draggingDirection == "West") {
                  shrinkSign = 1;
                  let draggingDist = clampValue(draggingVector.x, -Number.MAX_VALUE, (Math.abs(this.steps[(idx + 1) % 4]) - 1) * this.pixelUnit);
                  print(`${draggingDirection}: ${draggingDist}`);
                  [0, 2, 4].forEach(it => shiftTri[it] += (draggingDist))
                  p5.triangle(...shiftTri);
                  p5.fill("#8884");
                  [edgeX, edgeY] = vmult(vadd(...this.edges[idx]), 0.5).xy;
                  // print("drawing:", edgeX, vmult(vadd(...this.edges[idx]), 0.5));
                  p5.rectMode(p5.CENTER);
                  countUnits = -(floor(draggingDist / this.pixelUnit + 0.5));
                  // if (countUnits < 0) countUnits -= 2;
                  // draggingDist += (draggingDist > 0) ? this.pixelUnit : 0;
                  numRows = abs(this.steps[idx]);
                  if (!this.isEmpty) {
                    // p5.rect(edgeX + (draggingDist / 2), edgeY, draggingDist, this.steps[idx] * this.pixelUnit);
                    p5.push();
                    p5.noFill();
                    p5.stroke("#EEE");
                    p5.strokeWeight(5);
                    [...Array(Math.abs(countUnits)).keys()].reverse().forEach(jt => {
                      p5.fill("#CCC");
                      if (jt % 2 == 1) p5.fill("#DDD");
                      // p5.rect(edgeX - (Math.sign(countUnits) * (jt + 1)) * this.pixelUnit / 2, edgeY, Math.sign(countUnits) * (jt + 1) * this.pixelUnit, this.steps[idx] * this.pixelUnit);

                      p5.push();
                      p5.fill(this.fillColor);
                      p5.strokeWeight(0);
                      p5.stroke(this.fillColor);
                      // p5.circle(edgeX - (Math.sign(countUnits) * (jt + 1/2)) * this.pixelUnit, edgeY, this.pixelUnit*0.95);
                      // p5.circle(edgeX, edgeY - Math.sign(countUnits) * (jt + 1) * this.pixelUnit / 2, this.steps[idx] * this.pixelUnit);// Math.sign(countUnits) * (jt + 1) * this.pixelUnit);

                      evenRowsOffset = (numRows % 2 == 0) ? -this.pixelUnit / 2 : 0;
                      dotPositions = [...Array(numRows).keys()];

                      if (numRows % 2 == 1) {
                        dotPositions = dotPositions.map(it => it - floor(numRows / 2));
                      } else {
                        dotPositions = dotPositions.map(it => it - floor((numRows - 1) / 2));
                        dotPositions.push(numRows / 2)
                      }
                      dotPositions.forEach(it => {
                        p5.circle(edgeX - (Math.sign(countUnits) * (jt + 1 / 2)) * this.pixelUnit, edgeY + evenRowsOffset + it * this.pixelUnit, this.pixelUnit * 0.95);

                        if ((Math.sign(draggingDist) == shrinkSign)) {
                          let numShrunkCols = Math.round(Math.draggingDist / this.pixelUnit);
                          p5.push()
                          p5.fill("#FFFFFF");
                          // grayed out
                          p5.fill("#FFFFFFDD");
                          p5.circle(edgeX - (Math.sign(countUnits) * (jt + 1 / 2)) * this.pixelUnit, edgeY + evenRowsOffset + it * this.pixelUnit, this.pixelUnit * 0.98);
                          p5.pop()
                        }
                      })

                      p5.pop();
                    })
                    // let oddCorrection = numRows % 2;
                    // let lineStarts = [...Array(abs(this.steps[idx]) - 1).keys()]
                    //   .map(it => it - ((numRows - 1) - oddCorrection) / 2)
                    //   .map(it => [edgeX, edgeY - (it + 0.5 * ((oddCorrection + 1) % 2)) * this.pixelUnit])
                    // // print("lineStarts:", lineStarts);
                    // lineStarts.forEach(xy => p5.line(...xy, xy[0] + draggingDist, xy[1]));

                    p5.pop();
                  }
                  p5.push();
                  p5.stroke(this.edgeColor);
                  p5.strokeWeight(5);
                  p5.noFill();
                  // p5.rect(edgeX + (draggingDist / 2), edgeY, draggingDist, this.steps[idx] * this.pixelUnit);
                  p5.pop();
                  p5.fill("#888F");
                  numCols = -(countUnits);// + ((countUnits < 0) ? 1 : 0));
                  // if (this.showResizeEq) p5Inst.text(`${numRows} • ${numCols} = ${numRows * numCols}`, edgeX + (draggingDist / 2), edgeY);
                  if (this.showResizeEq && numRows != 0 && numCols != 0) {

                    p5.text(`${verbalNumbers[numRows]}  ${Math.abs(numCols)}er ${(numCols > 0) ? "mehr" : "weniger"}`, edgeX + (draggingDist / 2), edgeY);
                  }
                  drawSizeDescription(this, -numCols, 0, draggingDirection)
                  // p5Inst.text(`${countUnits + ((countUnits < 0) ? 1 : 0)}`, edgeX + (draggingDist / 2), edgeY);
                }

                // if (countUnits < 0) countUnits += 1;
              }

            })
            p5.pop();

          }

          if (draggingVector.x == 0 && draggingVector.y == 0) { drawSizeDescription(this, 0, 0, undefined); }

          // highlight edgepoints in active cut selection
          if (DEBUGMODE) {// {{{
            p5.push();
            this.edgePoints.filter(point => !this.stepVerts.includes(point)).map(this.step2Vert()).forEach(
              (vert, i) => {

                p5.fill("#A001");
                p5.stroke("#A001");
                p5.circle(...vert.xy, 5);
              })

            p5.stroke("#00A5");
            p5.circle(...this.referencePoint.xy, 30);
            p5.pop();
          }// }}}


          //@todo: not necessary any more
          // @refactor: add parameter/config for (un)cutabel?
          // draw the available cut Points
          // if ((this.isActive) && (!this.isEmpty) && this.isCuttable) {
          //   this.availableCuts.map(this.step2Vert()).forEach(
          //     (vert, i) => {
          //       p5.push();
          //
          //       p5.fill("#A009");
          //       p5.stroke("#A009");
          //       p5.circle(...vert.xy, 5);
          //       p5.pop();
          //     })
          // }
          // display abort 'button'

          //@todo: not necessary any more
          //Draw the current cut
          //let lastvert;
          // this.currentCut.map(this.step2Vert()).forEach(
          //   (vert, i) => {
          //     p5.push();
          //
          //     p5.fill("#0A09");
          //     p5.stroke("#0A09");
          //     p5.circle(...vert.xy, 5);
          //
          //     if ((i > 0)) {
          //       p5.line(...lastvert.xy, ...vert.xy);
          //     }
          //     lastvert = vert;
          //     p5.pop();
          //
          //   })

          if (DEBUGMODE) {
            // Numbering of innerTiles
            p5.push();
            this.innerCenters.map(this.step2Vert()).forEach(
              (vert, i) => {
                p5.fill("#0A0");
                p5.stroke("#0A0");
                // p5Inst.circle(...vert.xy, 10);
                p5.textAlign(p5.CENTER, p5.CENTER);
                p5.textSize(16);
                p5.text(`${i}`, ...vert.xy);
              })

            p5.pop();
          }


          // Labeling of the edges with lengths, a space or a ?
          // @refactor: redo the labeling string parser :edgelabels:
          // One Symbol stands for the entire edge, symbols in perens are refering to each step
          // eg  4x4:  "!!!!" -> label all 4 edges (is expanded to => (!!!!)(!!!!)(!!!!)(!!!!))
          // in the parenthesised parts a string of the same symbol marks a continued section of the edge
          //
          p5.push();
          p5.strokeWeight(2);
          let label;
          let alignment = [];//[p5Inst.CENTER, p5Inst.CENTER];
          let translation = [];//[p5Inst.CENTER, p5Inst.CENTER];
          let textTranslation = [];//[p5Inst.CENTER, p5Inst.CENTER];
          // let alignmentArrows = []
          // let arrowLabel = [];
          // let thisEdges = this.edges;
          // const Idx = (index) => {
          //   let idx = (index + this.edges.length - 1) % this.edges.length;
          //   if (this.isClockwise) {
          //     idx = this.edges.length - idx;
          //   }
          //   return idx
          // }
          // if (this.isClockwise) {
          //   thisEdges.reverse();
          // }
          let thisEdges = this.edges;
          let doSkip = false;
          let labelColor = [];
          let arrowColor = "#000";
          thisEdges.forEach((edge, i_) => {
            let i = i_;
            let prevIndex = (i + this.edges.length - 1) % this.edges.length;
            let nextIndex = (i + 1) % this.edges.length;
            let nextnextIndex = (i + 2) % this.edges.length;
            let nextCorner = this.verts[nextIndex];
            // p5.push();
            // p5.fill("#A00");
            // p5.textSize(12);
            // p5.text(`${i}`, ...nextCorner.xy);
            // p5.translate(...edge[0].xy)
            // vdraw(vmult(vsub(...edge), -0.8), { strokeColor: "#A00" });
            // p5.pop();
            switch (this.edgelabels[i]) {
              case "!": label = `${abs(this.steps[i]) * this.displayUnit.value + " " + this.displayUnit.name}`;
                break;
              case "?": label = "?";
                break;
              case "_": label = "";
                break;
            }

            // @refactor: config for fontsize
            let labelTextsize = this.edgelabelFontsize;
            p5.textSize(labelTextsize);
            let labelWidth = p5.textWidth(label);
            if (label == "?") labelWidth = p5.textWidth("??");
            // print("labelWidth:", labelWidth);

            //@refactor: config for the labelpadding, default 0.25
            // let basePad = [0.25 * this.pixelUnit, 0.25 * this.pixelUnit];
            let basePad = [12, 12];

            let edgeDirection = this.edgeDirections[i];
            if (this.isClockwise) edgeDirection = flipDirection(edgeDirection);
            // determine alignment depending on the direction the edge is going
            switch (edgeDirection) {// {{{
              case DIRECTIONS.SN: alignment = [p5.LEFT, p5.CENTER];
                // alignmentArrows = [[p5Inst.RIGHT, p5Inst.TOP], [p5Inst.RIGHT, p5Inst.BOTTOM]];
                // arrowLabel = ['↓', '↑'];
                translation = [basePad[0], 0];
                textTranslation = [translation[0] + labelWidth * 3 / 5, 0];
                break;
              case DIRECTIONS.NS: alignment = [p5.RIGHT, p5.CENTER];
                // alignmentArrows = [[p5Inst.LEFT, p5Inst.BOTTOM], [p5Inst.LEFT, p5Inst.TOP]];
                // arrowLabel = ['↑','↓'];
                translation = [-basePad[0], 0];
                textTranslation = [translation[0] - labelWidth * 3 / 5, 0];
                break;
              case DIRECTIONS.WE: alignment = [p5.CENTER, p5.TOP];
                // alignmentArrows = [[p5Inst.RIGHT, p5Inst.BOTTOM], [p5Inst.LEFT, p5Inst.BOTTOM]];
                // arrowLabel = ["←","→"];
                translation = [0, basePad[1]];
                textTranslation = [0, labelTextsize + translation[1]];

                break;
              case DIRECTIONS.EW: alignment = [p5.CENTER, p5.BOTTOM];
                // alignmentArrows = [[p5Inst.LEFT, p5Inst.TOP], [p5Inst.RIGHT, p5Inst.TOP]];
                // arrowLabel = ["→","←"];
                translation = [0, -basePad[1]];
                textTranslation = [0, -labelTextsize + translation[1]];
                break;
            }// }}}
            if (this.isClockwise) edgeDirection = flipDirection(edgeDirection);

            // print("edge:", edge);
            alignment = [p5.CENTER, p5.CENTER];
            let midpoint = vmult(vadd(...edge), 0.5);
            // p5Inst.circle(...midpoint.xy, 20);
            p5.textStyle(p5.BOLD);
            // p5Inst.fill("#A0A");
            p5.push();
            p5.push();
            p5.translate(...translation);

            // add padding to prevent overlap of arrowheads at 'concave' corners
            // let nextCorner = this.verts[nextIndex];
            // let nextIndex = (i + 1) % this.edges.length;
            let nextEdge = this.edges[nextIndex];
            let prevMidpoint = vmult(vadd(...this.edges[prevIndex]), 0.5);
            let nextMidpoint = vmult(vadd(...nextEdge), 0.5);
            let prevEdgeDirection = this.edgeDirections[prevIndex];
            let prevEdgeLabeled = this.edgelabels[prevIndex] != "_";
            let nextEdgeDirection = this.edgeDirections[nextIndex];
            let nextEdgeLabeled = this.edgelabels[nextIndex] != "_";

            // print("nED:", nextEdgeDirection)
            // let isConcaveCornerPrev = ((edgeDirection == DIRECTIONS.NS) && (prevEdgeDirection == DIRECTIONS.WE) ||
            //   (edgeDirection == DIRECTIONS.WE) && (prevEdgeDirection == DIRECTIONS.SN) ||
            //   (edgeDirection == DIRECTIONS.SN) && (prevEdgeDirection == DIRECTIONS.EW) ||
            //   (edgeDirection == DIRECTIONS.EW) && (prevEdgeDirection == DIRECTIONS.NS))

            // if (this.isClockwise) {
            //   ((edgeDirection == DIRECTIONS.NS) && (prevEdgeDirection == DIRECTIONS.EW) ||
            //     (edgeDirection == DIRECTIONS.WE) && (prevEdgeDirection == DIRECTIONS.NS) ||
            //     (edgeDirection == DIRECTIONS.SN) && (prevEdgeDirection == DIRECTIONS.WE) ||
            //     (edgeDirection == DIRECTIONS.EW) && (prevEdgeDirection == DIRECTIONS.SN))

            // }

            let isConcaveCornerNext = (
              (edgeDirection == DIRECTIONS.NS) && (nextEdgeDirection == DIRECTIONS.EW) ||
              (edgeDirection == DIRECTIONS.WE) && (nextEdgeDirection == DIRECTIONS.NS) ||
              (edgeDirection == DIRECTIONS.SN) && (nextEdgeDirection == DIRECTIONS.WE) ||
              (edgeDirection == DIRECTIONS.EW) && (nextEdgeDirection == DIRECTIONS.SN))

            if (this.isClockwise) {
              isConcaveCornerNext = (
                (edgeDirection == DIRECTIONS.NS) && (nextEdgeDirection == DIRECTIONS.WE) ||
                (edgeDirection == DIRECTIONS.WE) && (nextEdgeDirection == DIRECTIONS.SN) ||
                (edgeDirection == DIRECTIONS.SN) && (nextEdgeDirection == DIRECTIONS.EW) ||
                (edgeDirection == DIRECTIONS.EW) && (nextEdgeDirection == DIRECTIONS.NS))

            }


            let edgeLength = vnorm(vsub(...edge));
            let concaveTextTranslation = [0, 0];
            let labelPosition = midpoint;
            let nextEdgeLength = vnorm(vsub(...nextEdge));
            let isSquareCorner = (abs(edgeLength - nextEdgeLength) < 0.001);
            let isNotUnitLength = (edgeLength - this.pixelUnit) > 0.001;
            let clockSign = ((!this.isClockwise) ? -1 : 1)
            let edgeVec = vmult(vsub(...edge), 1);
            let nextEdgeVec = vmult(vsub(...nextEdge), -1);
            let cornerRay = vunit(vadd(edgeVec, nextEdgeVec));
            if (label != "") {
              // if (isConcaveCorner) { print("cc", this.label); midpoint.add(p5Inst.createVector(5, 5)) };
              // if (isConcaveCornerNext) {// || isConcaveCornerPrev) {
              //   let concaveTranslation = [0, 0];
              //   let nonZeroIdx = (abs(translation[0]) > 0.001) ? 0 : 1;
              //   concaveTranslation[nonZeroIdx] = Math.sign(translation[nonZeroIdx]) * edgeLength;
              //   p5Inst.translate(...concaveTranslation);

              // }
              // if(this.label == "1. Tile") print(i, "nextEdgeLabeled",nextEdgeLabeled, this.edgelabels[nextIndex]);
              p5.translate(...midpoint.xy);
              arrowColor = "#000";
              if ((labelColor.length > 0)) {
                arrowColor = labelColor.pop();
              } else if (label != "" && isConcaveCornerNext && nextEdgeLabeled && isSquareCorner) {
                arrowColor = "#555";
                labelColor.push(arrowColor);
              }
              vdraw(vsub(edge[0], midpoint), { headWidth: basePad[0] * 0.30, strokeColor: arrowColor });
              vdraw(vsub(edge[1], midpoint), { headWidth: basePad[0] * 0.30, strokeColor: arrowColor });
            }
            p5.pop();
            p5.translate(...textTranslation);
            // p5Inst.push();
            // p5Inst.noStroke();
            // p5Inst.fill("#FFF");
            // p5Inst.rectMode(p5Inst.CENTER);
            // p5Inst.rect(...midpoint.xy, p5Inst.textWidth(label), labelTextsize);
            // p5Inst.pop();
            if (doSkip) {
              p5.pop();
              doSkip = false;
              return
            }
            p5.push();
            if (label != "" && isConcaveCornerNext && nextEdgeLabeled && isSquareCorner) {

              let nonZeroIdx = (abs(textTranslation[0]) > 0.001) ? 0 : 1;

              concaveTextTranslation[nonZeroIdx] = Math.sign(textTranslation[nonZeroIdx]) * 0.22 * nextEdgeLength;

              concaveTextTranslation = vadd(vsub(vsub(nextCorner, labelPosition), textTranslation), vmult(cornerRay, 1.2 * this.pixelUnit)).xy;

              // concaveTextTranslation[nonZeroIdx] -= p5.textWidth(label);
              alignment = [p5.CENTER, p5.CENTER];


              if (!isNotUnitLength) {
                // concaveTextTranslation[nonZeroIdx] = Math.sign(textTranslation[nonZeroIdx]) * 0.05 * this.pixelUnit;
                let sign = (this.isClockwise) ? -1 : 1;
                switch (edgeDirection) {
                  case DIRECTIONS.NS: sign *= -1;
                    break;
                  case DIRECTIONS.SN: sign *= 1;
                    break;
                  case DIRECTIONS.WE: sign *= -1.4;
                    break;
                  case DIRECTIONS.EW: sign *= 1.4;
                    break;
                }
                concaveTextTranslation = vadd(vsub(vsub(nextCorner, labelPosition), textTranslation), vmult(cornerRay, 1.1 * this.pixelUnit)).xy;

                // concaveTextTranslation[(nonZeroIdx+1)%2] -= p5.textWidth(label);

                alignment = [p5.CENTER, p5.CENTER];


                // concaveTextTranslation[(nonZeroIdx + 1) % 2] = sign * 0.25 * this.pixelUnit;
              }
              let padding = p5.createVector(0, 0);
              let xfrac = 2;
              let yfrac = 2;

              doSkip = true;
            }
            p5.pop();
            if (doSkip && (nextIndex == 0)) return
            // if (label != "" && isConcaveCornerPrev && prevEdgeLabeled) {
            //   let padding;
            //   if ((edgeDirection == DIRECTIONS.NS)) { padding = p5Inst.createVector(0, 0.25 * vnorm(vsub(...edge))); skipNextLabel = true; };
            //   if ((edgeDirection == DIRECTIONS.SN)) { padding = p5Inst.createVector(0, -0.25 * vnorm(vsub(...edge))); skipNextLabel = true; };

            //   labelPosition = vadd(midpoint, padding);
            // }

            p5.translate(...concaveTextTranslation);
            // p5.push();
            // p5.fill("#0BA");
            // p5.circle(0, 0, 8);
            // p5.pop();
            p5.textAlign(...alignment);
            p5.push();
            p5.stroke(arrowColor);
            p5.fill(arrowColor);
            p5.strokeWeight(0.25);
            p5.text(label, ...labelPosition.xy);
            p5.pop();
            arrowColor = "#000";
            // print("directions:", i, this.edgeDirections[i]);
            // draw the distance 'arrows' <------>
            // p5Inst.strokeWeight(2);
            // p5Inst.line(...edge.map(vert => vert.xy).flat());

            //@refactor: draw custom 'extent arrows' 
            // p5Inst.textAlign(...alignmentArrows);
            // [0, 1].forEach((_, i) => p5Inst.text(arrowLabel[i], ...edge[i].xy));


            p5.pop();

          })
          p5.pop();

          if (DEBUGMODE) {
            p5.push();
            //enumeration of the vertices
            this.verts.forEach(
              (vert, i) => {
                p5.fill("#FFFF");
                p5.stroke("#0005");
                p5.circle(...vert.xy, 15);
                p5.fill(0);
                p5.textAlign(p5.CENTER, p5.CENTER);
                p5.textSize(16);
                p5.text(`${i}`, ...vert.xy);
              });

            p5.fill("#00AD");
            p5.textAlign("center", "top");
            p5.rectMode(p5.CENTER);
            p5.noStroke();
            let ident = `${this.label}: ${this.zorder} ${(this.isClockwise) ? 'cw' : 'ccw'}`;
            // p5Inst.rect(...this.step2Vert()(this.boundingBoxCenter).xy, p5Inst.textWidth(ident) * 1.5, 20);
            p5.rectMode(p5.CORNERS);
            p5.rect(...this.step2Vert()(this.boundingBox[0]).xy, ...this.step2Vert()(this.boundingBox[1]).xy);
            p5.print(this.step2Vert()(this.boundingBoxCenter));
            p5.fill("#00A");
            p5.stroke("#00A");
            p5.text(ident, ...(this.step2Vert()(this.boundingBoxCenter)).xy);
            p5.pop();
          }
          // p5Inst.push();
          // p5Inst.translate(...[200, 200]);
          // vdraw(p5Inst.createVector(100, 200, 0), 1, "#A1D5");
          // p5Inst.translate(...[200, 300]);
          // vdraw(p5Inst.createVector(100, 200, 0), 5, "#A1D5");
          // p5Inst.pop();


          //@todo: not necessary any more
          // Drawing the features of the cut line
          // if (this.isCut) {
          //   let pos = this.step2Vert()(this.currentCut[0]);
          //   p5.push();
          //
          //   p5.fill("#C00");
          //   p5.stroke("#C00");
          //   p5.circle(...pos.xy, 20);
          //   p5.stroke("#000");
          //   p5.fill("#000");
          //   p5.strokeWeight(2);
          //   p5.textAlign(p5.CENTER, p5.CENTER);
          //
          //   p5.text("✗", ...pos.xy);
          //   if (this.availableCuts.length == 0) {
          //     let pos = this.step2Vert()(this.currentCut[this.currentCut.length - 1]);
          //     p5.fill("#0C0");
          //     p5.stroke("#0C0");
          //     p5.circle(...pos.xy, 20);
          //     p5.stroke("#000");
          //     p5.fill("#000");
          //     p5.strokeWeight(2);
          //     p5.textAlign(p5.CENTER, p5.CENTER);
          //     p5.text("✓", ...pos.xy);
          //   }
          //   p5.pop();
          // }
          if (this.isDrawable) {
            let currentColor = this.drawColors[0];
            //let colors = [];
            if (this.isActive && !this.isDrawn) {
              this.verts.forEach(
                (vert, i) => {
                  //@refactor: perimete color
                  p5.fill(currentColor);
                  p5.noStroke();
                  p5.circle(...vert.xy, this.pixelUnit / 4);
                });
            }

            if (this.isActive && this.isDrawn) {
              [...this.availableDraws, ...this.currentDraw.slice(-1)].forEach(
                (vert, i) => {
                  //@refactor: perimete color
                  p5.fill(currentColor);
                  p5.noStroke();
                  p5.circle(...vert.xy, this.pixelUnit / 4);
                });

            }
            p5.strokeWeight(5);

            if (this.showDrawLine) {
              p5.push();

              p5.stroke("black");
              p5.strokeCap(p5.SQUARE)
              this.drawLine.forEach((it, i) => {
                if (i >= 1) {
                  p5.line(...this.drawLine[i - 1].xy, ...it.xy);
                }
              })
              let endPoints = [this.drawLine[0], this.drawLine[this.drawLine.length - 1]];
              endPoints.forEach((it, i) => {
                p5.push();
                p5.stroke("black");
                p5.strokeWeight(2);
                p5.line(it.x, it.y + 0.2 * this.pixelUnit, it.x, it.y - 0.2 * this.pixelUnit);
                p5.pop();
              })
              p5.pop();
            }
            let strokeColors = [...Array(this.steps.length + 2).keys()].map(it => (it % 2) ? currentColor : this.drawColors[1]);
            this.currentDraw.forEach(
              (vert, i) => {
                currentColor = (i % 2) ? this.drawColors[0] : this.drawColors[1];

                if (i < (this.currentDraw.length - 1)) {
                  p5.stroke(currentColor);
                  p5.line(...vert.xy, ...this.currentDraw[i + 1].xy);
                }


              })
            if (this.showDrawLine && (this.drawDistances != undefined)) {
              this.markedLine.forEach((it, i) => {
                if (i >= 1) {
                  let color = ((i - 1) % 2) ? this.drawColors[0] : this.drawColors[1];
                  p5.stroke(color);
                  p5.strokeCap(p5.SQUARE);
                  p5.line(...this.markedLine[i - 1].xy, ...it.xy);
                }
              })
              this.markedLine.forEach((it, i) => {
                p5.push();
                p5.fill("black")
                p5.stroke("black");
                p5.strokeWeight(2);
                p5.line(it.x, it.y + 0.2 * this.pixelUnit, it.x, it.y - 0.2 * this.pixelUnit);
                p5.pop();
              })
            }
            // colors.push((colors[colors.length - 1] == currentColor) ? "#CA8FFC" : currentColor);
            let diff;
            let lastMarked;
            let last = this.currentDraw[this.currentDraw.length - 1];
            if (last != undefined) {

              if (DYNAMICDRAW) {

                this.availableDraws.forEach((it, i) => {
                  // print("last", last, "next", it)
                  let maxDist = vsub(it, last).mag();
                  if ((vsub(p5.mouseVec(), it).mag() < maxDist)) {

                    let mouseVec = p5.mouseVec();
                    if (vsub(mouseVec, last).mag() > maxDist) { mouseVec = it };
                    // print("dists:", vdist(it, last), vsub(mouseVec, it).mag());
                    let nextEdge = vunit(vsub(it, last));
                    let dotProd = vdot(nextEdge, vsub(mouseVec, last));

                    let projectedMouse = vadd(last,
                      vmult(nextEdge, dotProd));

                    // if ((this.drawBetween == undefined) || (this.drawBetween.mag() < projectedMouse.mag())) {
                    this.drawBetween = projectedMouse;
                    // }
                    // colors.push(strokeColors[this.edgeIndexOfVert(it)])
                    p5.stroke(currentColor);
                    p5.line(...last.xy, ...this.drawBetween.xy);


                    if (this.showDrawLine && (this.drawDistances != undefined)) {

                      p5.stroke(currentColor);
                      p5.strokeCap(p5.SQUARE);
                      // if (this.currentDraw.length != this.verts.length) {
                      // print(this.currentDraw.length, this.verts.length);
                      diff = vsub(this.drawBetween, last).mag();

                      lastMarked = this.markedLine[this.markedLine.length - 1].xy;
                      p5.line(...lastMarked, ...vadd(p5.createVector(diff, 0), lastMarked).xy);
                      // } else {
                      //   diff = vsub(this.drawBetween, last).mag();
                      //   lastMarked = this.markedLine[this.markedLine.length - 1].xy;
                      //   print(vsub(lastMarked, vadd(p5Inst.createVector(diff, 0), lastMarked).xy));
                      // }

                    }
                  }
                })
              } else if (this.drawBetween != undefined) {
                // print("else-if:", ...last.xy, ...this.drawBetween.xy)
                // p5Inst.stroke(otherColor(currentColor));
                if (this.currentDraw.length != (this.verts.length + 1)) {
                  p5.stroke(currentColor);
                  p5.line(...last.xy, ...this.drawBetween.xy);

                  diff = vsub(this.drawBetween, last).mag();
                  if (this.showDrawLine && (this.drawDistances != undefined)) {

                    // print("diff", diff)
                    // p5Inst.stroke(strokeColors[i - 1]);
                    p5.stroke(currentColor);
                    p5.strokeCap(p5.SQUARE);
                    lastMarked = this.markedLine[this.markedLine.length - 1].xy;
                    p5.line(...lastMarked, ...vadd(p5.createVector(diff, 0), lastMarked).xy);
                  }
                }

              }

            }



            // this.currentDraw.forEach(
            //   (vert, i) => {
            //     //@refactor: perimete color
            //     p5Inst.fill("#003BD8");
            //     p5Inst.noStroke();
            //     p5Inst.circle(...vert.xy, 10);
            //   });
            // this.availableDraws.forEach(
            //   (vert, i) => {
            //     //@refactor: perimete color
            //     p5Inst.fill("#960000");
            //     p5Inst.noStroke();
            //     p5Inst.circle(...vert.xy, 10);
            //   });

            // this.verts.forEach(
            //   (vert, i) => {
            //     p5Inst.fill("#FFFF");
            //     p5Inst.stroke("#FFF5");
            //     // p5Inst.circle(...vert.xy, 15);
            //     p5Inst.fill("#FFF");
            //     p5Inst.textAlign(p5Inst.CENTER, p5Inst.CENTER);
            //     p5Inst.textSize(16);
            //     p5Inst.text(`${i}`, ...vert.xy);
            //   });



          }

          // p5Inst.push();
          // p5Inst.fill("#A89A89");
          // p5Inst.circle(...this.referencePoint.xy, 10);
          // p5Inst.fill("#789789");
          // // p5Inst.circle(...this.getCentroid().xy, 10);
          // p5Inst.fill("#789789");
          // p5Inst.circle(...(this.step2Vert()(this.boundingBoxCenter)).xy, 10);
          // // let rad =
          // // this.verts.forEach(jt => {
          // //   vnorm(vsub(jt, this.step2Vert()(this.boundingBoxCenter)))
          // // })

          // // print(rad)

          // p5Inst.fill("#78978911");
          // p5Inst.circle();

          // p5Inst.pop();
        }
        if (DEBUGMODE) {
          p5.fill("#167959");
          p5.circle(...this.loc.xy, 10);
          p5.fill("#165979");
          p5.circle(...this.referencePoint.xy, 10);
          p5.pop();
        }
      }//}}}


    }// }}}

    //end: lib.js}}}

    p5.preload = function() {// {{{
      console.log("config", initialConfig);
      //Examples {{{
      // if (!initialConfig.digitalscale) initialConfig.digitalscale = {};
      // if (!initialConfig.lockseesaw) initialConfig.lockseesaw = false;
      // switch (initialConfig.mode) {
      //   case "stacking":
      //     AppMode = AppModes.STACKINGNOSCALE;
      //     if (initialConfig.centerscale) {
      //       AppMode = AppModes.STACKINGNOBARS;
      //       if (initialConfig.barsonscale) AppMode = AppModes.STACKINGBARS;
      //     }
      //     if (initialConfig.onlystacking) {
      //       switch (initialConfig.onlystacking) {

      //         case 'KG': AppMode = AppModes.STACKINGONLYCOMPACT;
      //           initialConfig.digitalscale.G = "off";
      //           break;
      //         case 'G': AppMode = AppModes.STACKINGONLYSPLIT;
      //           initialConfig.digitalscale.KG = "off";
      //           break;
      //         case 'both':
      //         default: AppMode = AppModes.STACKINGONLYBOTH;
      //       }
      //     }
      //     break;
      //   case "slider":
      //   default:
      //     AppMode = AppModes.SLIDERSINGLE;
      //     if (initialConfig.splitslider) AppMode = AppModes.SLIDERSPLIT;
      // }

      function config2SettingIfPresent(config, setting, totype) {
        if (totype == undefined) { totype = (arg) => arg }
        if (initialConfig[config] != undefined) { AppSettings[setting] = totype(initialConfig[config]) }
      }
      //config2SettingIfPresent("edgewidth1000cubeG", "EDGEWIDTH1000CUBEG", (arg) => parseFloat(arg))
      // numcubesCompact = (initialConfig.numofcubesKG) ? initialConfig.numofcubesKG : 0;

      // if (initialConfig.digitalscale) {
      //   switch (initialConfig.digitalscale.KG) {
      //     case "off": displayCompactScale = false;
      //       break;
      //     case "decimal": displayCompactDecimal = true;
      //       break;
      //     case "integer": displayCompactDecimal = false;
      //       break;
      //     case "on":
      //     default: displayCompactScale = true;
      //   }
      //   switch (initialConfig.digitalscale.G) {
      //     case "off": displaySplitScale = false;
      //       break;
      //     case "on":
      //     default: displaySplitScale = true;
      //   }
      // }
      //}}}

    };// }}}

    function validOption(configObj, configkey, validOptions) {
      let isValid = validOptions.includes(configObj[configkey])
      if (!isValid) console.warn(`Thie configkey '${configkey}' in '${configObj}' is set to '${configObj[configkey]}' but only[${validOptions}] are valid.`);
      return isValid
    }



    function saveUndoStep(tiles, type) {
      // print("mouseTime:", undoTimestamp);
      // print("not last index:", (AppState.UNDOTREE.INDEX) < AppState.UNDOTREE.STEPS.length - 1);
      if (!["MOVE", "SPLIT", "RESIZE"].includes(type)) throw new Error(`Only 'MOVE' and 'SPLIT' are allowed, given '${type}'`)
      if ((AppState.UNDOTREE.INDEX) < AppState.UNDOTREE.STEPS.length - 1) {
        if (AppState.UNDOTREE.INDEX == -1) {
          AppState.UNDOTREE.STEPS = [];
        } else {
          AppState.UNDOTREE.STEPS.splice(AppState.UNDOTREE.INDEX + 1, AppState.UNDOTREE.STEPS.length - 1);
        }
      }

      // print("UNDOTree", (AppState.UNDOTREE));
      if (AppState.UNDOTREE.STEPS.length == 0) {
        AppState.UNDOTREE.STEPS.push([tiles.serialize(), undoTimestamp, type]);
        AppState.UNDOTREE.INDEX += 1;
      } else {
        // print(AppState.UNDOTREE.STEPS[AppState.UNDOTREE.INDEX][1]);
        // print(undoTimestamp - AppState.UNDOTREE.STEPS[AppState.UNDOTREE.INDEX][1]);
        let lastLabel = AppState.UNDOTREE.STEPS[AppState.UNDOTREE.INDEX][0].label;
        let isOtherTiles = lastLabel != tiles.label;
        if (isOtherTiles || (undoTimestamp - AppState.UNDOTREE.STEPS[AppState.UNDOTREE.INDEX][1]) > 100) {
          AppState.UNDOTREE.STEPS.push([tiles.serialize(), undoTimestamp, type]);
          AppState.UNDOTREE.INDEX += 1;

        }
      }


      if (AppState.UNDOTREE.STEPS.length > 100) {
        AppState.UNDOTREE.STEPS.splice(0, 100);

        AppState.UNDOTREE.INDEX -= 100;
      }
      // print("UNDOTree:", AppState.UNDOTREE)
    }


    function loadUndoStep() {
      print("mouseTime:", undoTimestamp);
      if (AppState.UNDOTREE.INDEX >= 0) {

        let serialized = AppState.UNDOTREE.STEPS[AppState.UNDOTREE.INDEX][0];
        let isSplit = AppState.UNDOTREE.STEPS[AppState.UNDOTREE.INDEX][2] == "SPLIT";
        AppState.UNDOTREE.INDEX -= 1;

        //@refactor: copy-paste ::createFromOptions
        // if (!validOption(initialConfig.tiles, "fillstriped", [true, false])) initialConfig.tiles.fillstriped = false;
        let options = {
          empty: serialized.empty,
          edgelabels: serialized.edgelabels,
          edgelabelfontsize: serialized.edgelabelfontsize,
          edgelabelpadding: serialized.edgelabelpadding,
          frozen: serialized.frozen || serialized.drawableperimeter,
          zorder: serialized.zorder,
          resize: serialized.resizable,
          resizecolor: serialized.resizecolor,
          showresizeeq: serialized.showresizeeq,
          showsizedesc: serialized.showsizedesc,
          cuttable: serialized.cuttable,
          drawable: serialized.drawableperimeter,
          showdrawableline: serialized.showperimeterline,
          drawlinelocation: serialized.perimeterlinelocation,
          drawcolor: serialized.drawcolor,
          fillcolor: serialized.fillcolor,
          starterfillcolor: serialized.starterfillcolor,
          edgecolor: serialized.edgecolor,
          fillstriped: serialized.fillstriped,
          label: serialized.label,
          synced: serialized.synced
        }


        // print("UNDOTree:", AppState.UNDOTREE);
        let splitResults = Tiles.allTiles.filter(it => it.label.includes("|") && it.label.startsWith(options.label));
        splitResults.forEach(it => it.destruct());
        let T = Tiles.createTiles(canvasBuffer.rF.P(...serialized.location), serialized.steps, serialized.startdirection, serialized.unit, options, serialized.resumedState, serialized.starterIndices);
        if (T.dragTriangles != undefined) T.updateDragTriangles();

        if (isSplit && (AppState.CUTLIMIT >= 0)) AppState.CUTLIMIT += 1;
        return T;
      }
    }

    function clearUndoSteps(numSteps) {
      let numUndoSteps = AppState.UNDOTREE.STEPS.length;
      if (numSteps > numUndoSteps) numSteps = numSteps = numUndoSteps;
      AppState.UNDOTREE.STEPS.splice(numUndoSteps - numSteps, numUndoSteps);
      AppState.UNDOTREE.INDEX = AppState.UNDOTREE.INDEX - numSteps;
    }

    function myfunction() {
      if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)) {
        a = true;
      } else {
        a = false;
      }
      return a
    }



    p5.setup = function() {// {{{
      p5.randomSeed(123456789);
      // Set global variables
      CANVASASPECT = outerWidth / outerHeight;
      isTouchDevice = navigator.maxTouchPoints > 0;
      print(`###:${outerWidth} x ${outerHeight}`)
      print(`###:${innerWidth} x ${innerHeight}`)
      print(`On Mobile? ${isTouchDevice} ... ${navigator.maxTouchPoints}`)
      DEBUGFUNCS = [];
      //canvas and debug buffer
      canvasBuffer = setupCanvas();
      debugbuffer = setupBuffer("debug", 0, 0, 1, 1, "#FFF0");

      DEBUGMODE = initialConfig.debuginfos;
      // this.showResizeEq = initialConfig.showresizeeq;
      let tilesList = initialConfig.tiles;
      if (!validOption(initialConfig, "RESULT", ["height*length"])) initialConfig.RESULT = "";
      if (!validOption(initialConfig, "alwaysreload", [true, false])) initialConfig.alwaysreload = false;
      if (!validOption(initialConfig, "undobutton", [true, false])) initialConfig.undobutton = true;
      if (!validOption(initialConfig, "interactive", [true, false])) initialConfig.interactive = true;
      if (initialConfig.undobuttonlocation == undefined) {
        initialConfig.undobuttonlocation = canvasBuffer.rF.P(0.02, 0.13).xy
      } else {
        let [x, y] = initialConfig.undobuttonlocation;
        initialConfig.undobuttonlocation = canvasBuffer.rF.P(x, y).xy;
      }
      if (initialConfig.redobuttonlocation == undefined) {
        initialConfig.redobuttonlocation = canvasBuffer.rF.P(0.05, 0.13).xy
      } else {
        let [x, y] = initialConfig.redobuttonlocation;
        initialConfig.redobuttonlocation = canvasBuffer.rF.P(x, y).xy;
      }
      if (initialConfig.ref != undefined) {
        let stored = p5.getItem(`TILES:${initialConfig.ref}`)
        print("stored:", stored)
        if (stored) {
          AppState = JSON.parse(stored.json);
          AppState["INTERACTIVE"] = false;
          AppState["UNDOBUTTON"] = false;
          isResumed = true;
        }
      }
      if (initialConfig.cutlimit == undefined) {
        initialConfig.cutlimit = -1;
      }
      if (!isResumed) {
        AppState["RESULT"] = initialConfig.RESULT;
        AppState["ALWAYSRELOAD"] = initialConfig.alwaysreload;
        AppState["UNDOBUTTON"] = initialConfig.undobutton;
        AppState["UNDOBUTTONLOCATION"] = initialConfig.undobuttonlocation;
        AppState["REDOBUTTON"] = initialConfig.redobutton;
        AppState["REDOBUTTON"] = false;
        AppState["REDOBUTTONLOCATION"] = initialConfig.redobuttonlocation;
        AppState["DESCBUTTON"] = true;
        AppState["DESCBUTTONLOCATION"] = canvasBuffer.rF.P(0.02, 0.03).xy;
        AppState["CUTBUTTON"] = true;
        AppState["CUTBUTTONLOCATION"] = canvasBuffer.rF.P(0.02, 0.08).xy;
        AppState["CUTLIMIT"] = initialConfig.cutlimit;
        AppState["UNDOTREE"] = { STEPS: [], INDEX: -1 };
        AppState["INTERACTIVE"] = initialConfig.interactive;
        AppState["ID"] = initialConfig.id;
      }
      if (isResumed) {
        tilesList = AppState["TILES"];
      }

      //@refactor: ::createFromOptions
      tilesList.forEach((T, i) => {
        // if (!validOption(initialConfig.tiles, "showresizeeq", [true, false])) initialConfig.tiles.showresizeeq = false;
        // if (!validOption(initialConfig.tiles, "cuttable", [true, false])) initialConfig.tiles.cuttable = true;
        // if (!validOption(initialConfig.tiles, "fillstriped", [true, false])) initialConfig.tiles.fillstriped = false;
        if (Tiles.allTiles.map(it => it.label).includes(T.label)) {
          throw new Error(`The label '${T.label}' is not unique!`)
        }
        let options = {
          empty: T.empty,
          edgelabels: T.edgelabels,
          edgelabelfontsize: T.edgelabelfontsize,
          edgelabelpadding: T.edgelabelpadding,
          frozen: T.frozen || T.drawableperimeter,
          zorder: T.zorder,
          resize: T.resizable,
          resizecolor: T.resizecolor,
          showresizeeq: T.showresizeeq,
          showsizedesc: T.showsizedesc,
          cuttable: T.cuttable,
          drawable: T.drawableperimeter,
          showdrawableline: T.showperimeterline,
          drawlinelocation: T.perimeterlinelocation,
          drawcolor: T.perimetercolor,
          fillcolor: T.fillcolor,
          starterfillcolor: T.starterfillcolor,
          edgecolor: T.edgecolor,
          fillstriped: T.fillstriped,
          label: T.label,
          synced: T.synced
        }
        // on smartphons (small screens the default size is to small => 2x)
        let unit = T.unit;
        if ((screen.width < 1000) && (screen.height < 1000)) unit = [T.unit[0] * 2.25, T.unit[1], T.unit[2]]
        Tiles.createTiles(canvasBuffer.rF.P(...T.location), T.steps, T.startdirection, unit, options, T.resumedState);


      })
      // add syncronization of movement  


      print("AppState:", AppState);
      countUnits = 0;
      draggingVector = p5.createVector(0, 0);

      undoButton = new clickCircle(...AppState["UNDOBUTTONLOCATION"], 35, null, "undoButton");
      redoButton = new clickCircle(...AppState["REDOBUTTONLOCATION"], 35, null, "redoButton");
      descButton = new clickCircle(...AppState["DESCBUTTONLOCATION"], 35, null, "descButton");
      cutButton = new clickCircle(...AppState["CUTBUTTONLOCATION"], 35, null, "cutButton");

      // Tiles.createTiles(canvasBuffer.rF.P(0.5, 0.5), [-1, -3, 4, -2, 1, 4, 4, -1, 1, 3], "x", [0.025, 1, "cm"], false, true);
      // Tiles.createTiles(canvasBuffer.rF.P(0.5, 0.5), [-1, -3, 4, -2, 1, 4, 4, -1, 1, 3], "x", [0.025, 1, "cm"], false, true);
      // Tiles.createTiles(canvasBuffer.rF.P(0.2, 0.5), [-4, 2, -2, 2, 2, 2, 2, 3, +2], "x", [0.025, 1, "cm"], true, false);
      // Tiles.createTiles(canvasBuffer.rF.P(0.7, 0.5), [-4, 2, -2, 2, 2, 2, 2, 3, +2], "y", [0.025, 1, "cm"], true, "!??!!__!!?");
      // Tiles.createTiles(canvasBuffer.rF.P(0.7, 0.2), [2, 2, -2], "x", [0.025, 1, "cm"], false, false);
      // Tiles.createTiles(canvasBuffer.rF.P(0.1, 0.2), [-2, 2, 2], "x", [0.025, 1, "cm"], false, false);
      // Tiles.createTiles(canvasBuffer.rF.P(0.2, 0.7), [-3, 1, -1, 6, 1, 2, 2, -1, 1, -2, 1, -4, -1], "x", [0.025, 1, "cm"], false, false);



      // tiles.push(new Tiles(...canvasBuffer.rF.P(0.3, 0.3).xy, ...canvasBuffer.rF.P(0.1, 0.1).xy, true));
      if (DEBUGMODE) print(Tiles.allTiles[0].pixelUnit);
      if (DEBUGMODE) print(Tiles.allTiles[0].verts);
      Moveable.allMoveables.forEach((M, i) => print(i, M));

      if (DEBUGMODE) {
        // btn.position(...canvasBuffer.rF.P(0.02, 0.02).xy);
      }
      print(Tiles.serialize())
      p5.frameRate(30);
    }// }}}

    p5.getDivomathVarState = () => {
      if (!AppState["ALWAYSRELOAD"]) {
        AppState["TILES"] = Tiles.serialize();
        AppState["ISRESUMED"] = true;
        // Tiles.allTiles.map(it => {
        //   let tilesState = {}
        //   if (it.isDrawable) tilesState = it.state;
        //   return { ...it.args, resumedState: tilesState }
        // });
        let tempAppState = { json: JSON.stringify(AppState) };
        return tempAppState
      }
    };




    let drawGrid = true;
    let noInteractionSince = 0;
    let frameRate = 30;
    p5.draw = function() {// {{{
      // p5.scale(2,2);
      // if ((p5Inst.frameCount > 100) && vdist(p5Inst.mouseVec(), p5Inst.pmouseVec()) < 0.05) return
      if ((p5.frameCount > 30) && (!AppState.INTERACTIVE)) return

      if ((p5.movedX != 0) || (p5.movedY != 0) || p5.mouseIsPressed) {
        p5.frameRate(30);
        noInteractionSince = 0;
        // return
      } else {
        noInteractionSince += 1;
        let loweredFrameRate = 30 - Math.min(29, Math.floor(noInteractionSince / 10));
        p5.frameRate(loweredFrameRate);
      }
      p5.background(255);

      debugbuffer.setbackground();

      //     p5.push();
      //  p5.textSize(50);
      //  p5.fill("#0F0");
      //  p5.stroke("#0F0");
      // p5.text(`${innerWidth}x${innerHeight}: ${screen.width}x${screen.height}`, 100,100);

      //  p5.pop();
      // if (p5.frameCount % 120 == 0 ) frameRate = Math.floor(p5.frameRate())
      // p5.push();
      // p5.textSize(6);
      // p5.fill("#888");
      // p5.text(`${frameRate}`, 10, 10);
      // [p5.movedX, p5.movedY, p5.mouseIsPressed].forEach((it,i) => p5.text(`${it}`, 10, i*10 + 20));
      // p5.pop();


      if (DEBUGMODE) {
        if (drawGrid) {
          p5.push();
          p5.noStroke();
          p5.fill("#8885");
          cartesianProduct([...Array(100).keys()], [...Array(100).keys()]).forEach(([x, y], i) => {
            let xpos = canvasBuffer.rF.Px(x / 100);
            let ypos = canvasBuffer.rF.Py(y / 100);
            let xshift = canvasBuffer.rF.Px(1 / 100);
            let yshift = canvasBuffer.rF.Py(1 / 100);
            p5.fill("#8885");
            p5.circle(xpos, ypos, 2);
            if ((x % 10 == 0) && (y % 10 == 0)) {
              p5.fill("#8888");
              if (x == 0) {
                p5.textAlign("left", "center");
                p5.text(`${y}% `, xpos, ypos);
              } else if (y == 0) {
                p5.textAlign("center", "top");
                p5.text(`${x}% `, xpos, ypos);

              } else {
                p5.circle(xpos, ypos, 5);
              }
            }
          })
          p5.pop();
        }
        p5.push();
        p5.fill("#A11");
        p5.stroke("#A11");
        p5.strokeWeight(0.5);
        p5.textSize(14);
        p5.text(`${'DebugInfo:'} \n`
          + `${'------------------'} \n`
          + `Num of Tiles: ${Tiles.allTiles.length} \n`
          + `Current zorder range: [${Tiles.allTiles[0].zorder}, ${Tiles.allTiles[Tiles.allTiles.length - 1].zorder}] \n`
          + `Active Tile: ${Tiles.allTiles.filter(t => t.isActive).map(t => t.label)} \n`
          + `allTiles: [${Tiles.allTiles.map(t => t.label)}] \n`
          , ...canvasBuffer.rF.P(0.02, 0.05).xy);


        p5.textSize(14);
        let gridBtn = new clickRect(...canvasBuffer.rF.P(0.02, 0.02).xy, 40, -15, null, "gridButton");
        p5.noFill("#FFF0");
        p5.rect(...gridBtn.rect);
        p5.fill("#A11");
        p5.textAlign("left", "bottom")
        p5.text("Grid", ...canvasBuffer.rF.P(0.02, 0.02).xy);

        let tileInfoBtn = new clickRect(...canvasBuffer.rF.P(0.05, 0.02).xy, 40, -15, null, "tileInfoButton");
        p5.rect(...tileInfoBtn.rect);
        p5.text("tileInfo", ...canvasBuffer.rF.P(0.05, 0.02).xy);
        p5.pop();

      }

      if (AppState.SHOWDESC) {
        p5.push();
        p5.print("WHAT!")
        p5.stroke("#CCC");
        p5.fill("#FFF");
        let tiles = Tiles.allTiles.filter(it => it.isActive)[0];
        if (tiles == undefined) tiles = { sizeDesc: "" };

        //p5.rect(...canvasBuffer.rF.P(0.1, 0.1).xy, p5.textWidth(tiles.sizeDesc), canvasBuffer.rF.Py(0.15));
        p5.stroke("#000");
        p5.fill("#000");
        p5.textSize(20);
        p5.strokeWeight(0.25);
        p5.text(`Beschreibung: „${tiles.sizeDesc}“`, ...canvasBuffer.rF.P(0.05, 0.035).xy);
        p5.pop();

      }

      Tiles.allTiles.filter(T => T.isVisible);
      p5.push();

      Tiles.allTiles.forEach(tile => tile.draw());
      // Tiles.allTiles.filter(T => T.isEmpty).forEach(tile => tile.draw());
      // Tiles.allTiles.filter(T => !T.isEmpty).forEach(tile => tile.draw());
      // tiles[1].draw();

      // tiles[1].draw();
      // if (DYNAMICCUT) {
      // p5Inst.fill("#A115");
      // p5Inst.circle(p5Inst.mouseX, p5Inst.mouseY, 20)
      // }
      p5.pop();
      if (AppState["UNDOBUTTON"]) {
        p5.push();
        p5.fill("#AAA6");
        p5.circle(...undoButton.circle);
        p5.fill("#333");
        // p5Inst.textSize(40);
        // p5Inst.text("⮨", ...canvasBuffer.rF.P(0.98, 0.055).xy);
        let undoTriangle = nPointsOnCircle(3, p5.createVector(...AppState["UNDOBUTTONLOCATION"]), 0.8 * undoButton.diameter / 2, Math.PI);

        p5.triangle(...(undoTriangle.map(it => it.xy)).flat());
        p5.textAlign("center", "center")
        p5.textSize(8);
        p5.fill("#AAA");
        p5.text(`${AppState.UNDOTREE.INDEX + 1}`, AppState["UNDOBUTTONLOCATION"][0] + 2, AppState["UNDOBUTTONLOCATION"][1] + 1);
        if (AppState.UNDOTREE.INDEX < 0) {
          p5.noStroke();
          p5.fill("#AAA5");
          p5.circle(...undoButton.circle)
        };
        p5.pop();
      }

      if (AppState["REDOBUTTON"]) {
        p5.push();
        p5.fill("#AAA6");
        p5.circle(...redoButton.circle);
        p5.fill("#333");
        p5.textAlign("center", "center")
        // p5Inst.textSize(40);
        // p5Inst.text("⮨", ...canvasBuffer.rF.P(0.98, 0.055).xy);
        let redoTriangle = nPointsOnCircle(3, p5.createVector(...AppState["REDOBUTTONLOCATION"]), 0.8 * redoButton.diameter / 2, Math.PI);

        p5.triangle(...(redoTriangle.map(it => it.xy)).flat());
        p5.textSize(8);
        p5.fill("#AAA");

        p5.text(`${AppState.UNDOTREE.INDEX + 1}`, AppState["REDOBUTTONLOCATION"][0] + 2, AppState["REDOBUTTONLOCATION"][1] + 1);
        if (AppState.UNDOTREE.INDEX < 0) {
          p5.noStroke();
          p5.fill("#AAA5");
          p5.circle(...redoButton.circle)
        };
        p5.pop();
      }
      if (AppState["DESCBUTTON"]) {
        p5.push();
        p5.fill("#AAA6");
        p5.circle(...descButton.circle);
        p5.fill("#333");
        p5.textAlign("center", "center")
        p5.textSize(14);
        p5.textStyle("bold");
        p5.text("„...“", ...canvasBuffer.rF.P(0.02, 0.032).xy);

        p5.textSize(8);
        p5.fill("#AAA");
        if (!AppState.SHOWDESC) {
          p5.stroke("#AAAD");
          p5.fill("#AAAD");

          p5.circle(...descButton.circle)
        };
        p5.pop();
      }
      if (AppState["CUTBUTTON"]) {
        p5.push();
        p5.fill("#AAA6");
        p5.circle(...cutButton.circle);
        p5.fill("#333");
        p5.textAlign("center", "center")
        p5.textSize(36);
        p5.textStyle("bold");
        //p5.text("✄", cutButton.x, cutButton.y);
        p5.text("✂", cutButton.x, cutButton.y + 3);
        p5.textSize(12);
        p5.textAlign("center", "top")
        if (AppState["CUTLIMIT"] >= 0) {
          if (AppState["CUTLIMIT"] == 0) p5.fill("#AA1122");
          p5.text(`${AppState["CUTLIMIT"]}`, cutButton.x, cutButton.y + 6);
        }

        p5.textSize(8);
        p5.fill("#AAA");
        if (!AppState.ISCUTTING) {
          p5.stroke("#AAAD");
          p5.fill("#AAAD");
          p5.circle(...cutButton.circle)
        };
        p5.pop();
      }

      if ((AppState["ISCUTTING"] && AppState["CUTSTART"] != undefined)) {

        let endPoint = p5.mouseVec();
        if (AppState["CUTEND"] != undefined) endPoint = AppState["CUTEND"];

        p5.push();
        p5.push();
        p5.stroke("#555");
        p5.strokeWeight(2);
        strokePattern(DASHED)
        p5.line(...AppState["CUTSTART"].xy, ...endPoint.xy);
        //p5.print(lineLocationDirection(AppState["CUTSTART"],endPoint))
        p5.fill("#595");
        p5.circle(...vmult(vadd(AppState["CUTSTART"], endPoint), 0.5).xy, 10);
        p5.pop();
        let cutTile = Moveable.allMoveables.filter(m => m.isCut);

        let cutLineVec = vunit(vsub(endPoint, AppState["CUTSTART"]));
        let vec2Edge = undefined;
        let vec2EdgeNorm = undefined;
        let proj = undefined;
        if ((cutTile != undefined) && (cutTile.length > 0)) {
          cutTile[0].edgePoints.map(p => cutTile[0].step2Vert()(p))
            .forEach((p) => {
              p5.circle(...p.xy, 4);
              vec2Edge = vsub(p, AppState["CUTSTART"]);
              proj = vadd(AppState["CUTSTART"], vmult(cutLineVec, vdot(cutLineVec, vec2Edge)))
              p5.circle(...proj.xy, 5);
              //p5.circle(...p.xy,10);
            })//filter(it => !any(m.stepVerts.map(v => ((v[0] - it[0]) == 0) && ((v[1] - it[1]) == 0))));//.filter(point => !this.stepVerts.includes(point));
        }
        p5.pop();
      }
      // print(p5Inst.mouseVec())
      // let T = Tiles.allTiles[Tiles.allTiles.length - 1];
      // if (T.currentCut.length > 0) {
      //   let [ci, cf] = [T.currentCut[0], T.currentCut[T.currentCut.length - 1]];
      //   let [ciStepIdx, cfStepIdx] = [ci, cf].map(c => T.edgePoints.findIndex(it => it.toString() == c.toString()));
      //   let [cMinStepIdx, cMaxStepIdx] = ([ciStepIdx, cfStepIdx]).sort((a, b) => a - b);
      //   let cutIsReversed = (ciStepIdx != cMinStepIdx);

      //   let initalEdgePart = T.edgePoints.slice(0, cMinStepIdx);
      //   let betweenEdgePart = T.edgePoints.slice(cMinStepIdx + 1, cMaxStepIdx);
      //   let finalEdgePart = T.edgePoints.slice(cMaxStepIdx + 1);

      //   let firstPart = [...initalEdgePart, ...((cutIsReversed) ? T.currentCut.slice().reverse() : T.currentCut.slice()), ...finalEdgePart]
      //   // firstPart.splice(firstPart.length - 1, 1);
      //   let secondPart = [...T.currentCut.slice(), ...betweenEdgePart];
      //   // let stepsSum = [0, ...cumSum(T.steps.map(it => abs(it)))];
      //   // let [cMinEdgeIdx, cMaxEdgeIdx] = [cMinStepIdx, cMaxStepIdx].map(c => stepsSum.findIndex(it => it > c));
      //   // print("ifStep:", ciStepIdx, cfStepIdx);
      //   // print("mMStep:", cMinStepIdx, cMaxStepIdx);
      //   // print("mMEdge:", cMinEdgeIdx, cMaxEdgeIdx);
      //   //@todo: the signs of the y-steps have to be fliped again

      // }
      // print(T.availableCuts.lenght);
      // if (T.availableCuts.length == 0) {
      //   // let [ci]
      //   p5Inst.text(
      //     `${ 'Debug:' } \n`

      //     + `${ '------------------' } \n`
      //     + `steps: ${ T.steps } \n`
      //     + `steps: ${ T.stepsSummed } \n`
      //     + `${ '------------------' } \n`
      //     + `${ 'c_' } -> ${ 'c_StepIdx' } -> ${ 'c_EdgeIdx' } -> ${ 'c_Steps' } \n`
      //     + `${ (cutIsReversed) ? arrayToString(cf) : arrayToString(ci) } -> ${ cMinStepIdx } \n`
      //     + `${ (cutIsReversed) ? arrayToString(ci) : arrayToString(cf) } -> ${ cMaxStepIdx } \n`
      //     + `${ '------------------' } \n`
      //     // + `${ (cEdgesDir).map(arrayToString) } \n\n`
      //     + `${ T.edgePoints.map(arrayToString) } \n`
      //     + `${ initalEdgePart.map(arrayToString) } \n`
      //     + `${ betweenEdgePart.map(arrayToString) } \n`
      //     + `${ finalEdgePart.map(arrayToString) } \n`
      //     + `${ '------------------' } \n`
      //     + `${ firstPart.map(arrayToString) } \n`
      //     + `${ secondPart.map(arrayToString) } \n`
      //     + `${ T.currentCut.map(arrayToString).join("; ") } \n`
      //     + `${ '------------------' } \n`
      //     + `cSteps: ${ arrayToString(edgePoints2Steps(firstPart)) } \n`
      //     + `cSteps: ${ arrayToString(edgePoints2Steps(secondPart)) } \n`
      //     // + `cStepsRev: ${ arrayToString(cStepsReversed) } \n`
      //     + `${ '------------------' } \n`
      //     // + `${ Tiles.allTiles.map(it => it.currentCut) } \n`
      //     , ...canvasBuffer.rF.P(0.3, 0.1).xy);

      //   p5Inst.push();
      //   p5Inst.fill("#1BB5");
      //   T.allowedCuts.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 20));
      //   p5Inst.fill("#1558");
      //   T.availableCuts.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 10));
      //   // p5Inst.fill("#1BB");
      //   firstPart.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 20));
      //   // p5Inst.fill("#1BB");
      //   // secondPart.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 10));
      //   p5Inst.pop();
      // }
      // if ((!T.isVisibel) && (!done)) {
      //   done = true;
      //   print(`Tiles.createTiles(${ T.loc }, ${ edgePoints2Steps(firstPart) }, ${ T.startDirection }, ${ T.unit })`);
      //   Tiles.createTiles(T.loc, edgePoints2Steps(firstPart), T.startDirection, T.unit);
      //   print(`Tiles.createTiles(${ T.loc }, ${ edgePoints2Steps(secondPart) }, ${ T.startDirection }, ${ T.unit })`);
      //   Tiles.createTiles(T.step2Vert()(T.currentCut[0]), edgePoints2Steps(secondPart), T.startDirection, T.unit);
      // }
      // }
      // p5Inst.push();
      // let Ps = Tiles.allTiles[0].verts;
      // let scaledPs = Tiles.allTiles[0].verts_;
      // let C = Tiles.allTiles[0].step2Vert()(Tiles.allTiles[0].boundingBoxCenter);
      // let C_ = Tiles.allTiles[0].step2Vert_()(Tiles.allTiles[0].boundingBoxCenter);

      // let disp = Ps.map((p, i) => vsub(p, C));
      // // let scaledPs = Ps.map((p, i) => vadd(p, vmult(disp[i], 0.1)));


      // scaledPs.forEach((p, i) => p5Inst.circle(...p.xy, 20));
      // p5Inst.fill("#C0C");
      // p5Inst.circle(...C.xy, 20)
      // p5Inst.circle(...C_.xy, 20)
      // p5Inst.pop();
    }
    // };// }}}

    // p5Inst.touchStarted = function() {
    // }
    function mouseOnCanvas() {
      return p5.collidePointRect(p5.mouseX, p5.mouseY, ...canvasBuffer.rF.P(0, 0).xy, ...canvasBuffer.rF.P(1, 1).xy)
    }

    let undoTimestapOutdated;
    p5.mousePressed = function() {//{{{
      if (!AppState.INTERACTIVE) return
      undoTimestapOutdated = true;

      let draggingDinstance = p5.createVector();
      if (mouseOnCanvas()) {
        Array.from(Clickable.allClickables.values()).forEach(m => m.mousePressed());


        let clickTargets = [...Moveable.allMoveables.map(m => !m.mouseInArea()), ...[...Clickable.allClickables.values()].map(m => !m.isClicked)];
        if (prod(clickTargets) == 1) Moveable.allMoveables.forEach(m => {
          // @todo: unnecessar
          // if (m.isCuttable && m.isCut && m.currentCut.length < 2) {
          //   // copy-paste from handleCutting()
          //   m.currentCut = [];
          //   m.availableCuts = m.edgePoints.filter(it => !any(m.stepVerts.map(v => ((v[0] - it[0]) == 0) && ((v[1] - it[1]) == 0))));//.filter(point => !this.stepVerts.includes(point));
          //   m.isCut = false;
          // }
          m.isActive = false;
        });

        [clickMouseX, clickMouseY] = [p5.mouseX, p5.mouseY];

        let gridBtn = Clickable.allClickables.get("gridButton");
        if ((gridBtn != undefined) && gridBtn.mouseInArea()) {
          drawGrid = !drawGrid;
        }

        let tileInfoBtn = Clickable.allClickables.get("tileInfoButton");
        if ((tileInfoBtn != undefined) && tileInfoBtn.mouseInArea()) {
          print("###Tiles:")
          Tiles.allTiles.forEach(it => console.log(it));
          print("###Clickables:")
          _ = [...Clickable.allClickables.values()].forEach(it => console.log(it));
          print("###AppState:")
          print(AppState)
        }

        if (AppState["UNDOBUTTON"] && undoButton.isClicked) {

          loadUndoStep()
        }
        if (AppState["DESCBUTTON"] && descButton.isClicked) {
          AppState["SHOWDESC"] = !AppState["SHOWDESC"];
        }
        let activatedCutting = false;
        if (AppState["CUTBUTTON"] && cutButton.isClicked) {
          AppState["ISCUTTING"] = !AppState["ISCUTTING"];
          AppState["CUTSTART"] = undefined;
          AppState["CUTEND"] = undefined;
          activatedCutting = true;


        }
        if (AppState["CUTLIMIT"] != 0) {
          // Clicks inside of dotarrays or bottons do not count
          let numCutClicks = -1;
          if (prod(clickTargets) == 1) {

            if (!activatedCutting) {
              if (AppState["ISCUTTING"]) {
                numCutClicks = 0;
                if (AppState["CUTSTART"] != undefined) numCutClicks += 1;
                if (AppState["CUTEND"] != undefined) numCutClicks += 1;
              }
            }
            p5.print("numCutClicks", numCutClicks);


            if ((numCutClicks == 0)) {
              AppState["CUTSTART"] = p5.mouseVec();
            } else if (numCutClicks == 1) {
              AppState["CUTEND"] = p5.mouseVec();
            } else if (numCutClicks == 2) {
              AppState["CUTSTART"] = undefined;
              AppState["CUTEND"] = undefined;
              numCutClicks = -1;
            }
          }
          // handle the cutting of tiles
          if (numCutClicks > 0) {
            let cutStart = AppState["CUTSTART"];
            let cutEnd = p5.mouseVec();
            if (AppState["CUTEND"] != undefined) cutEnd = AppState["CUTEND"];
            let centerCutline = vmult(vadd(cutStart, cutEnd), 0.5);
            // @refactor: maybe the is not good enough
            let cutTiles = Moveable.allMoveables.filter(m =>
              (m instanceof Tiles) && (m.lineInArea(cutStart, cutEnd)));

            let cutLineLocDir = lineLocationDirection(cutStart, cutEnd);

            p5.print("handleCutting", cutTiles);
            let startCount = Tiles.allTiles.length;
            function sortByDist2CutStart(it, jt) {
              let dist0 = vnorm(cutStart, it.boundingBoxCenter);
              let dist1 = vnorm(cutStart, jt.boundingBoxCenter);
              return dist1 - dist0
            }
            //if (AppState["CUTLIMIT"] >= 0) cutTiles = cutTiles.sort(sortByDist2CutStart).slice(0, AppState["CUTLIMIT"]);
            if ((AppState["CUTLIMIT"] < 0) || (AppState["CUTLIMIT"] >= cutTiles.length)) {
              cutTiles.forEach(it => {
                if (cutLineLocDir != undefined) {
                  it.handleCutting(cutLineLocDir);
                }

              })
              AppState["CUTSTART"] = undefined;
              AppState["CUTEND"] = undefined;
              // if (inFrontMoveable.isCuttable) inFrontMoveable.handleCutting();
              let endCount = Tiles.allTiles.length;
              AppState["CUTLIMIT"] -= (endCount - startCount);
            }
          }
        }


        //let inFrontMoveable = Moveable.inFront();
        let inFrontMoveable = Moveable.inFront();

        let allDragTriangles = Tiles.allTiles
          .filter(it => it.isResizable)
          .map(it => Object.values(it.dragTriangles))
          .flat()

        let hitDragTriangles = false;
        if (allDragTriangles) hitDragTriangles = any(allDragTriangles.map(it => it.hitbox.mouseInArea()));

        if (!hitDragTriangles && inFrontMoveable) {
          print(`InFrontMoveable: Label:${inFrontMoveable.label} `);
          if (inFrontMoveable instanceof Tiles) {
            //@temporary
            // print("### Clicked on ###");
            // console.log(JSON.stringify(inFrontMoveable.args, null, 2));
            // console.log(inFrontMoveable);
            // print("##################");
            Moveable.allMoveables.forEach(m => m.isActive = false)
            inFrontMoveable.isActive = true;
            // @todo: not necessary anymore
            //if (inFrontMoveable.isCuttable) inFrontMoveable.handleCutting();
            //if (inFrontMoveable.isDrawable) inFrontMoveable.handleDrawing();
          }
          // if (!startedCut) {

          inFrontMoveable.mousePressed();
          // }
        }


      }
      p5.print("AppState:", AppState)
      return undefined
    }//}}}
    p5.mouseDragged = function() {// {{{
      if (!AppState.INTERACTIVE) return
      // the undoTime should only be updated if the mouse is dragged, but only once;
      if (undoTimestapOutdated) {
        undoTimestamp = Date.now();
        undoTimestapOutdated = false;
      }

      let draggingRect = [...Clickable.allClickables.values()].filter(it => (it instanceof clickRect) && (it.isClicked));
      if (draggingRect.length == 1) {
        draggingRect = draggingRect[0];
        draggingRect.isDragged = true;
        draggingDirection = draggingRect.label.split(":")[1];

        // let allDragTriangles = Tiles.allTiles
        //   .filter(it => it.isResizable)
        //   .map(it => { return { label: it.label, dT: Object.values(it.dragTriangles) } })
        //   .flat()

        // print("allDragTriangles:", allDragTriangles);
        let tiles = Moveable.allMoveables.filter(it => it.label == draggingRect.label.split(":")[0])[0];

        saveUndoStep(tiles, "RESIZE");
        // print("dragTriangles", draggingTriangle, tiles);
        draggingVector = (vsub(p5.mouseVec(), p5.createVector(clickMouseX, clickMouseY)));
        // print("draggingVector", draggingVector)

        p5.print("mouseDragged: tiles.referencePoint", tiles.referencePoint.xy)

      }


      // let draggedMoveable = Moveable.allMoveables[Moveable.allMoveables.map(m => m.isDragged).findIndex(it => it)];
      let draggedTiles = Tiles.allTiles[Tiles.allTiles.map(m => m.isDragged).findIndex(it => it)];
      // print("draggedTiles:", draggedTiles);
      if (draggedTiles && draggedTiles.isCut) {
        DYNAMICCUT = true;
        let tiles = draggedTiles;
        let pxU = tiles.pixelUnit;
        tiles.availableCuts.map(tiles.step2Vert()).forEach(it => {
          if (vnorm(vsub(p5.mouseVec(), it)) < 0.25 * pxU) {
            tiles.handleCutting()
          }
        });

      } else if (draggedTiles && draggedTiles.isDrawn) {
        DYNAMICDRAW = true;
        let tiles = draggedTiles;
        let pxU = tiles.pixelUnit;
        tiles.availableDraws.forEach(it => {
          // if (vnorm(vsub(p5Inst.mouseVec(), it)) < 0.9 * pxU) {
          tiles.handleDrawing()
          // }
        });


      } else {
        if (draggedTiles && !draggedTiles.isFrozen) {
          saveUndoStep(draggedTiles, "MOVE")
          draggedTiles.mouseDragged();
          draggedTiles.syncedTilesLabels.forEach(it => {
            let sync = Tiles.allTiles.find(jt => jt.label == it);
            p5.print("synced Tiles", sync);
            sync.mouseDragged();
          });
          // if (draggedMoveable instanceof Tiles) print(draggedMoveable.isEnclosedByTiles());
          // if (draggedMoveable instanceof Tiles) print(JSON.stringify(draggedMoveable.isEnclosedByTiles()));
        }
      }
      // else {
      //   print("infront movable")
      //   let inFrontMoveable = Moveable.inFront();
      //   if (inFrontMoveable instanceof Tiles) {
      //     if (inFrontMoveable.isCut) {
      //       print(mouseVec.xy)
      //       DRAWMOUSEPOS = true;
      //       return false
      //     }
      //     if (inFrontMoveable && !inFrontMoveable.isFrozen) {
      //       inFrontMoveable.mouseDragged();
      //     }
      //   } else { // all other movables if any
      //     if (inFrontMoveable && !inFrontMoveable.isFrozen) {
      //       inFrontMoveable.mouseDragged();

      //     }

      //   }
      return false
    }// }}}


    p5.mouseReleased = function() {//{{{
      if (!AppState.INTERACTIVE) return

      // print("verts:", Tiles.allTiles.map(it => [it.label, it.referencePoint, it.verts.map(jt => vsub(jt, it.referencePoint))]));
      // p5Inst.sendDivomathResult(Tiles.allTiles.length)
      if (DYNAMICCUT) DYNAMICCUT = false;
      if (DYNAMICDRAW) DYNAMICDRAW = false;
      Array.from(Clickable.allClickables.values()).forEach(m => m.mouseReleased());
      let draggingRect = [...Clickable.allClickables.values()].filter(it => (it instanceof clickRect) && (it.isDragged));
      if ((draggingRect.length == 1)) {
        draggingRect = draggingRect[0];
        draggingRect.isDragged = false;
        // print(draggingRect)
        let tiles = Tiles.allTiles.filter(it => it.label == draggingRect.label.split(":")[0])[0];
        // print(Moveable.allMoveables)
        // let newSteps = [];
        newSteps = [];
        let newStartDirection;
        let idx = tiles.edgeOrientations.indexOf(draggingDirection);
        let clampedCountUnits;
        // print("countUnits:", countUnits);
        let fixStarterIndices = [...Array(tiles.starterIndices.length).keys()].map(it => 0);
        if (draggingDirection == "North") {
          clampedCountUnits = clampValue(countUnits, -Math.abs(tiles.steps[(idx + 1) % 4]) + 1, 21);
          newSteps.push(Math.abs(tiles.steps[idx]));
          newSteps.push(Math.abs(tiles.steps[(idx + 1) % 4]) + clampedCountUnits);
          newSteps.push(-Math.abs(tiles.steps[idx]));
          newStartDirection = "x";

        } else if (draggingDirection == "South") {
          clampedCountUnits = clampValue(countUnits, -Math.abs(tiles.steps[(idx + 1) % 4]) + 1, 21)
          newSteps.push(Math.abs(tiles.steps[idx]));
          newSteps.push(Math.abs(tiles.steps[(idx + 1) % 4]) + clampedCountUnits);
          newSteps.push(-Math.abs(tiles.steps[idx]));
          newStartDirection = "x";
          //if (tiles.innerCenters.length > tiles.firstInnerCenters.length) fixFirstInnerCenters[1] = clampedCountUnits;
          //clampedCountUnits;
          let change = p5.createVector(0, tiles.pixelUnit * clampedCountUnits);
          p5.print("mouseReleased: tiles.referencePoint", tiles.referencePoint.xy);
          p5.print("mouseReleased: change", change.xy);
          p5.print("vadd", vadd(change, tiles.referencePoint).xy);
          tiles.referencePoint = vadd(change, tiles.referencePoint);
          p5.print("mouseReleased: tiles.referencePoint", tiles.referencePoint.xy);

        } else if (draggingDirection == "East") {
          clampedCountUnits = clampValue(countUnits, -Math.abs(tiles.steps[(idx + 1) % 4]) + 1, Number.POSITIVE_INFINITY);
          newSteps.push(Math.abs(tiles.steps[(idx + 1) % 4]) + clampedCountUnits);
          newSteps.push(Math.abs(tiles.steps[idx]));
          newSteps.push(-(Math.abs(tiles.steps[(idx + 1) % 4]) + clampedCountUnits));
          newStartDirection = "x";
          [...(Array(tiles.starterIndices.length).keys())].forEach(i => fixStarterIndices[i] = i * (clampedCountUnits));


        } else if (draggingDirection == "West") {
          clampedCountUnits = clampValue(countUnits, -Math.abs(tiles.steps[(idx + 1) % 4]) + 1, 21);
          newSteps.push(Math.abs(tiles.steps[(idx + 1) % 4]) + clampedCountUnits);
          newSteps.push(Math.abs(tiles.steps[idx]));
          newSteps.push(-(Math.abs(tiles.steps[(idx + 1) % 4]) + clampedCountUnits));
          newStartDirection = "x";
          let change = p5.createVector(-tiles.pixelUnit * clampedCountUnits, 0);

          p5.print("mouseReleased: change: tiles.referencePoint", change.xy);
          tiles.referencePoint = vadd(change, tiles.referencePoint);

          // if (tiles.innerCenters.length > tiles.firstInnerCenters.length) fixFirstInnerCenters[0] = clampedCountUnits;
        }
        print("appstate", (AppState["RESULT"] != ""), (AppState["RESULT"] == "height*length"));
        if ((AppState["RESULT"] != "") && AppState["RESULT"] == "height*length") {
          print("results:", p5.sendDivomathResult(`${newSteps[1]}*${newSteps[0]}`.replace(/\s/g, "")));
        }
        countUnits = 0;

        if (DEBUGMODE) print("new Steps:", newSteps)
        p5.print("fixStarterIndcies", fixStarterIndices);
        //let args = [tiles.referencePoint, newSteps, newStartDirection, tiles.unit,
        // p5.print("mouseReleased: tiles.loc", tiles.referencePoint)
        p5.print("mouseReleased: tiles.referencePoint", tiles.referencePoint.xy)
        let args = [tiles.referencePoint, newSteps, newStartDirection, tiles.unit,
        {
          empty: tiles.isEmpty,
          edgelabels: tiles.edgelabels,
          frozen: tiles.isFrozen,
          zorder: tiles.zorder,
          resize: tiles.isResizable, // @fix: should be always true?
          resizecolor: tiles.dragTriangleColor,
          showresizeeq: tiles.showResizeEq,
          showsizedesc: tiles.showSizeDesc,
          cuttable: tiles.isCuttable,
          fillcolor: tiles.fillColor,
          starterfillcolor: tiles.starterFillColor,
          fillstriped: tiles.fillStriped,
          edgecolor: tiles.edgeColor,
          label: tiles.label,
          synced: tiles.synced
        }, undefined, tiles.starterIndices.map((it, i) => it.map(jt => jt + fixStarterIndices[i]))];
        // tiles.firstInnerCenters.map(it => [it[0] + fixFirstInnerCenters[0], it[1] - fixFirstInnerCenters[1]])]
        tiles.destruct();
        // let delIdxT = Tiles.allTiles.findIndex(it => it.label == tiles.label);
        // let delIdxM = Moveable.allMoveables.findIndex(it => it.label == tiles.label);

        // Tiles.allTiles.splice(delIdxT, 1);
        // Moveable.allMoveables.splice(delIdxM, 1);
        p5.print("mouseReleased:args", args[0]);
        let T = Tiles.createTiles(...args);
        T.isActive = true;
        T.referencePoint = vadd(T.referencePoint, p5.createVector(0.1, 0.1));
        if (DEBUGMODE) print(Moveable.allMoveables)
        if (DEBUGMODE) print(Tiles.allTiles)

      }
      let draggedMoveable = Moveable.allMoveables[Moveable.allMoveables.map(m => m.isDragged).findIndex(it => it)];
      if (draggedMoveable) {
        draggedMoveable.mouseReleased();
        if (draggedMoveable instanceof Tiles) draggedMoveable.snapToTiles();
      } else {
        let inFrontMoveable = Moveable.inFront();
        if (inFrontMoveable) inFrontMoveable.mouseReleased();
      }
      if (AppState["ID"] != undefined) {
        p5.storeItem(`TILES:${AppState["ID"]}`, p5.getDivomathVarState());
      }
      draggingVector = p5.createVector(0, 0);
      p5.print(Tiles.allTiles);
    }//}}}
    return true
  };


let myp5 = new p5(sketch, "sketch")

