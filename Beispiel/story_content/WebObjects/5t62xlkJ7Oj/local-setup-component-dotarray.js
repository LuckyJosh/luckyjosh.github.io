require = function(arg) { return p5 }
let ISLOCAL = true
let PARAMS = new URLSearchParams(window.location.toString().split('?')[1])
let NUMROWS = parseInt(PARAMS.get("rows"));
let NUMCOLS = parseInt(PARAMS.get("cols"));
let NUMCUTS = parseInt(PARAMS.get("cuts"));


let aspect = sketch.offsetWidth / sketch.offsetHeight;
console.log("aspect", aspect);

let UNDOBUTTONLOCATION = [0.03, 0.03 * aspect];
let CUTBUTTONLOCATION = [0.06, 0.03 * aspect];

let UNITSIZE = 0.06;
let XBASEOFFSET = 0.005;
let YBASEOFFSET = 0.075;

let DIVOMATHRED = "#FF4545";
let DIVOMATHBLUE = "#4545FF";

function yoffset(tileheight) {
  return UNITSIZE * tileheight + YBASEOFFSET
}

let CONFIGURATIONS = {
  resizing: {//{{{
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,

    "tiles": [
      // {
      //   "location": [0.5, 0.5],
      //   "steps": [1, -1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "resizable":true,
      //   "edgelabels": false,
      //   "frozen": false,
      // },
      // {
      //   "location": [0.2, 0.5],
      //   "steps": [7, 3, -7],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "showresizeeq": false,
      //   "showsizedesc": true,
      //   "cuttable": true,
      //   "fillcolor": "#999",
      //   "resizable": true
      // },
      {
        "location": [0.04, 0.375 + ((NUMROWS > 5) ? 0.05 * (NUMROWS - 5) : 0)],
        "steps": [NUMCOLS, NUMROWS, -NUMCOLS],
        "startdirection": "x",
        "unit": [0.025, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "edgecolor": "#FFF",
        "frozen": true,
        "showresizeeq": false,
        "showsizedesc": true,
        "cuttable": false,
        "starterfillcolor": "#99112211",
        "fillcolor": "#99112211",
        "resizable": false,
      },
      {
        "location": [0.04, 0.375 + ((NUMROWS > 5) ? 0.05 * (NUMROWS - 5) : 0)],

        "steps": [NUMCOLS, NUMROWS, -NUMCOLS],
        "startdirection": "x",
        "unit": [0.025, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "edgecolor": "#FFF",
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": true,
        "cuttable": true,
        "starterfillcolor": "#991122",
        "fillcolor": "#221199",
      },
      // {
      //   "location": [0.2, 0.5],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "showresizeeq":false,
      //   "showsizedesc":true,
      //   "cuttable":true
      //
      // },
      // {
      //   "location": [0.7, 0.5],
      //   "steps": [9, -2, -3, -2, -2, -2, -2, +2, -2],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": "!??!!_!_!?",
      //   "frozen": true,
      //   "drawableperimeter": true,
      //   "showperimeterline": true,
      //   "perimeterlinelocation": [0.1, 0.9],
      //   "edgecolor": "#468464",
      //   "perimetercolor": "#AA5511"


      // },
      // {
      //   "location": [0.9, 0.8],
      //   "steps": [2, 5, -2],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "zorder": 5,
      //   "edgecolor": "#753356",
      //   "label": "hinterste Fliese",
      // },

      // {
      //   "location": [0.15, 0.5],
      //   "steps": [1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "fillcolor": "#AB2522",
      //   "fillstriped": true,
      //   "label": "very bad example"

      // },
      // {
      //   "location": [
      //     0.8,
      //     0.2
      //   ],
      //   "steps": [
      //     -3,
      //     4,
      //     -2,
      //     1,
      //     4,
      //     4,
      //     -1,
      //     1,
      //     3,
      //     -9
      //   ],
      //   "startdirection": "y",
      //   "unit": [
      //     0.025,
      //     1,
      //     "cm"
      //   ],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "label": "WHAAAT!"
      // },
      // {
      //   "location": [0.3, 0.6],
      //   "steps": [1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   // "fillcolor": "#AA55",
      //   "fillstriped": true,
      //   "label": "overlapping labels s"

      // },
      // {
      //   "location": [0.3, 0.5],
      //   "steps": [-1, -1, -1, -1, +1, -1, +1, +1, +1, +1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "fillcolor": "#5555EE",
      //   "fillstriped": true,
      //   "label": "overlapping labels 2s"

      // },
      // {
      //   "location": [0.5, 0.5],
      //   "steps": [2, -2, 2, 2, 2, 2, -2, 2, -2, -2, -2],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   // "fillcolor": "#AA55",
      //   "fillstriped": true,
      //   "label": "overlapping labels"

      // },
      // {
      //   "location": [0.5, 0.5],
      //   "steps": [-2, -2, -2, -2, +2, -2, +2, +2, +2, +2, -2],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "fillcolor": "#5555EE",
      //   "fillstriped": true,
      //   "label": "overlapping labels 2"

      // },
      // {
      //   "location": [0.2, 0.7],
      //   "steps": [-2, 2, -2, -2, -2, -2, -3, -2, 9],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": "!??!!_!_!?",
      //   "frozen": false,
      //   "fillcolor": "#AB1133",
      //   "fillstriped": true,



      // },
      // {
      //   "location": [0.25, 0.5],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "resizecolor": "#A005",
      //   "cuttable": false,
      //   "resizable": true,
      //   "showresizeeq": true,
      //   "fillstriped": true,
      //   // "fillcolor": "#44DDAAFF"
      // },
      // {
      //   "location": [0.7, 0.2],
      //   "steps": [2, 2, -2],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "cuttable": false,
      //   "resizable": false,
      //   "showresizeeq": false,
      //   "fillstriped": true,
      //   // "fillcolor": "#44DDAAFF"

      //   "drawableperimeter": true,
      //   "showperimeterline": false
      // },
      // {
      //   "location": [0.2, 0.7],
      //   "steps": [-3, 1, -1, 6, 1, 2, 2, -1, 1, -2, 1, -4, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": false,
      //   "frozen": true
      // },
      // {
      //   "location": [0.1, 0.15],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.05, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "zorder": 5,
      //   "label": "1x1"
      // },
      // {
      //   "location": [0.1, 0.25],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.02, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "zorder": 5,
      //   "label": "small 1x1"
      // },
      // {
      //   "location": [0.2, 0.9],
      //   "steps": [-6, 2, 6],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   // "zorder": ,
      //   "label": "ccw"
      // },
    ],//}}}
  },
  cutting: {//{{{
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": NUMCUTS,

    "tiles": [
      // {
      //   "location": [0.5, 0.5],
      //   "steps": [1, -1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "resizable":true,
      //   "edgelabels": false,
      //   "frozen": false,
      // },
      // {
      //   "location": [0.2, 0.5],
      //   "steps": [7, 3, -7],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "showresizeeq": false,
      //   "showsizedesc": true,
      //   "cuttable": true,
      //   "fillcolor": "#999",
      //   "resizable": true
      // },
      {
        "location": [0.04, 0.375 + ((NUMROWS > 5) ? 0.05 * (NUMROWS - 5) : 0)],
        "steps": [NUMCOLS, NUMROWS, -NUMCOLS],
        "startdirection": "x",
        "unit": [0.025, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": "NESW",
        "showresizeeq": false,
        "showsizedesc": true,
        "cuttable": true,
        "starterfillcolor": "#991122",
        "fillcolor": "#991122",
      },
      // {
      //   "location": [0.2, 0.5],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "showresizeeq":false,
      //   "showsizedesc":true,
      //   "cuttable":true
      //
      // },
      // {
      //   "location": [0.7, 0.5],
      //   "steps": [9, -2, -3, -2, -2, -2, -2, +2, -2],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": "!??!!_!_!?",
      //   "frozen": true,
      //   "drawableperimeter": true,
      //   "showperimeterline": true,
      //   "perimeterlinelocation": [0.1, 0.9],
      //   "edgecolor": "#468464",
      //   "perimetercolor": "#AA5511"


      // },
      // {
      //   "location": [0.9, 0.8],
      //   "steps": [2, 5, -2],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "zorder": 5,
      //   "edgecolor": "#753356",
      //   "label": "hinterste Fliese",
      // },

      // {
      //   "location": [0.15, 0.5],
      //   "steps": [1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "fillcolor": "#AB2522",
      //   "fillstriped": true,
      //   "label": "very bad example"

      // },
      // {
      //   "location": [
      //     0.8,
      //     0.2
      //   ],
      //   "steps": [
      //     -3,
      //     4,
      //     -2,
      //     1,
      //     4,
      //     4,
      //     -1,
      //     1,
      //     3,
      //     -9
      //   ],
      //   "startdirection": "y",
      //   "unit": [
      //     0.025,
      //     1,
      //     "cm"
      //   ],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "label": "WHAAAT!"
      // },
      // {
      //   "location": [0.3, 0.6],
      //   "steps": [1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   // "fillcolor": "#AA55",
      //   "fillstriped": true,
      //   "label": "overlapping labels s"

      // },
      // {
      //   "location": [0.3, 0.5],
      //   "steps": [-1, -1, -1, -1, +1, -1, +1, +1, +1, +1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "fillcolor": "#5555EE",
      //   "fillstriped": true,
      //   "label": "overlapping labels 2s"

      // },
      // {
      //   "location": [0.5, 0.5],
      //   "steps": [2, -2, 2, 2, 2, 2, -2, 2, -2, -2, -2],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   // "fillcolor": "#AA55",
      //   "fillstriped": true,
      //   "label": "overlapping labels"

      // },
      // {
      //   "location": [0.5, 0.5],
      //   "steps": [-2, -2, -2, -2, +2, -2, +2, +2, +2, +2, -2],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "fillcolor": "#5555EE",
      //   "fillstriped": true,
      //   "label": "overlapping labels 2"

      // },
      // {
      //   "location": [0.2, 0.7],
      //   "steps": [-2, 2, -2, -2, -2, -2, -3, -2, 9],
      //   "startdirection": "y",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": "!??!!_!_!?",
      //   "frozen": false,
      //   "fillcolor": "#AB1133",
      //   "fillstriped": true,



      // },
      // {
      //   "location": [0.25, 0.5],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "resizecolor": "#A005",
      //   "cuttable": false,
      //   "resizable": true,
      //   "showresizeeq": true,
      //   "fillstriped": true,
      //   // "fillcolor": "#44DDAAFF"
      // },
      // {
      //   "location": [0.7, 0.2],
      //   "steps": [2, 2, -2],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   "cuttable": false,
      //   "resizable": false,
      //   "showresizeeq": false,
      //   "fillstriped": true,
      //   // "fillcolor": "#44DDAAFF"

      //   "drawableperimeter": true,
      //   "showperimeterline": false
      // },
      // {
      //   "location": [0.2, 0.7],
      //   "steps": [-3, 1, -1, 6, 1, 2, 2, -1, 1, -2, 1, -4, -1],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": false,
      //   "frozen": true
      // },
      // {
      //   "location": [0.1, 0.15],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.05, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "zorder": 5,
      //   "label": "1x1"
      // },
      // {
      //   "location": [0.1, 0.25],
      //   "steps": [1, 1, -1],
      //   "startdirection": "x",
      //   "unit": [0.02, 1, "cm"],
      //   "empty": true,
      //   "edgelabels": true,
      //   "frozen": false,
      //   "zorder": 5,
      //   "label": "small 1x1"
      // },
      // {
      //   "location": [0.2, 0.9],
      //   "steps": [-6, 2, 6],
      //   "startdirection": "x",
      //   "unit": [0.025, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": false,
      //   // "zorder": ,
      //   "label": "ccw"
      // },
    ],//}}}
  },

  static10x8: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.675 - (7.9) * 2 * UNITSIZE],
        "steps": [8, 3, -8],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675 - (2.4) * 2 * UNITSIZE],
        "steps": [8, 5, -8],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675],
        "steps": [8, 2, -8],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  cut6x7a: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.675],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static6x7: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [0.25, 0.675 - (2.4) * 2 * UNITSIZE],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675],
        "steps": [7, 2, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ]


    ,
  },
  cut8x9: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [9, 8, -9],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static8x9: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.675 - (6.5) * 2 * UNITSIZE],
        "steps": [9, 2, -9],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675],
        "steps": [9, 6, -9],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  sizeES3x5: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      // {
      //   "location": [XBASEOFFSET, yoffset(3)],
      //   "steps": [5, 3, -5],
      //   "startdirection": "x",
      //   "unit": [UNITSIZE, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": true,
      //   "resizable": false,
      //   "showresizeeq": false,
      //   "showsizedesc": false,
      //   "cuttable": false,
      //   "starterfillcolor": "#FF454522",
      //   "fillcolor": "#4545FF22",
      //   "edgecolor": "#FFFFFF"
      // },
      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [5, 3, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  sizeES3x5ref: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 1,
    "cutlimit": 2,

    "tiles": [
      // {
      //   "location": [XBASEOFFSET, yoffset(3)],
      //   "steps": [5, 3, -5],
      //   "startdirection": "x",
      //   "unit": [UNITSIZE, 1, "cm"],
      //   "empty": false,
      //   "edgelabels": false,
      //   "frozen": true,
      //   "resizable": false,
      //   "showresizeeq": false,
      //   "showsizedesc": false,
      //   "cuttable": false,
      //   "starterfillcolor": "#FF454522",
      //   "fillcolor": "#4545FF22",
      //   "edgecolor": "#FFFFFF"
      // },
      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [1, -1, 1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  sizeESa: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, yoffset(6)],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, yoffset(6)],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  sizeESa: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, yoffset(6)],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, yoffset(6)],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  cutsizeESa: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.04, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  cut8x7: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 8, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  cut9x6: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [6, 9, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  sizeESb:
  {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  cut9x5: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [5, 9, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static9x5: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.675 - (8) * 2 * UNITSIZE],
        "steps": [5, 2, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675 - (3.5) * 2 * UNITSIZE],
        "steps": [5, 4, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675],
        "steps": [5, 3, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  sizeESc: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  cut11x6: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [6, 11, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static11x6: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.675 - (7.9) * 2 * UNITSIZE],
        "steps": [6, 4, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675 - (2.4) * 2 * UNITSIZE],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675],
        "steps": [6, 2, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  sizeESd: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },

  cutsizeESd: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.04, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  sizeESd: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  cutsizeESe: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.04, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  sizeSa: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "S",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  sizeEa: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "E",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#4545FF",
        "edgecolor": "#FFFFFF"
      },
    ],
  },
  cut10x7a: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 10, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  cut10x7b: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 10, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static12x7: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.8 - (9.1) * 2 * UNITSIZE],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.8 - (6.6) * 2 * UNITSIZE],
        "steps": [7, 2, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.8],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static11x9: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.8 - (8.1) * 2 * UNITSIZE],
        "steps": [9, 4, -9],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.8 - (5.6) * 2 * UNITSIZE],
        "steps": [9, 2, -9],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.8],
        "steps": [9, 5, -9],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static9x6: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.675 - (6.9) * 2 * UNITSIZE],
        "steps": [6, 3, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675 - (2.4) * 2 * UNITSIZE],
        "steps": [6, 4, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675],
        "steps": [6, 2, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  static9x8: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.25, 0.675 - (6.9) * 2 * UNITSIZE],
        "steps": [8, 3, -8],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675 - (2.4) * 2 * UNITSIZE],
        "steps": [8, 4, -8],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
      {
        "location": [0.25, 0.675],
        "steps": [8, 2, -8],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  cut6x10: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [10, 6, -10],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  cut6x7b: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [7, 6, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },

  cut8x12: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [0.04, 0.375],
        "steps": [12, 8, -12],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },
  cut7x9: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    "cutbuttonlocation": CUTBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [
      {
        "location": [XBASEOFFSET, 0.375],
        "steps": [9, 7, -9],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": false,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": true,
        "starterfillcolor": "#FF4545",
        "fillcolor": "#FF4545",
        "edgecolor": "#1F1F1F"
      },
    ],
  },

  "1_ES3x5False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 1,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [5, 3, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "2_ES6x4False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 2,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(6)],
        "steps": [4, 6, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "3_ES1x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 3,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "4_ES1x1False_ref_3": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 3,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "5_ES1x1False_ref_3": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 3,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "6_ES1x1False_ref_3": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 3,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "7_ES1x1False_ref_3": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 3,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "8_ES1x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 8,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "9_ES1x1False_ref_8": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 8,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "10_ES1x1False_ref_8": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 8,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "11_ES1x1False_ref_8": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 8,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "12_ES1x1False_ref_8": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 8,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "13_ES1x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 13,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "14_ES1x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 14,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "15_ES1x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 15,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "16_ES1x1False_ref_13": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 13,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "17_ES1x1False_ref_14": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 14,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "18_ES1x1False_ref_15": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 15,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "19_ES1x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 19,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "20_ES1x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 20,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "21_ES1x1False_ref_20": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 20,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "22_ES1x1False_ref_20": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 20,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "23_ES1x1False_ref_20": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 20,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "24_ES1x1False_ref_20": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "ref": 20,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [1, 1, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "25_false5x6False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 25,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "26_ES4x5True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 26,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [5, 4, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [5, 4, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "27_ES5x4False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 27,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [4, 5, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "28_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 28,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "29_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 29,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "30_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 30,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "31_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 31,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "32_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 32,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "33_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 33,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "34_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 34,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "35_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 35,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "36_ES3x4True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 36,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "37_ES5x6True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 37,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "38_ES5x6True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 38,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "39_ES5x3False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 39,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [3, 5, -3],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "40_ES1x6False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 40,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(1)],
        "steps": [6, 1, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "41_ES6x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 41,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(6)],
        "steps": [1, 6, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "42_ES6x1False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 42,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(6)],
        "steps": [1, 6, -1],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "43_ES3x4False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 43,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "44_ES3x4False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 44,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [4, 3, -4],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "45_ES5x6True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 45,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "46_ES5x6True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 46,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "47_ES5x6True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 47,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [6, 5, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "48_false4x5False": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": false,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 48,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [5, 4, -5],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHRED,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "49_ES5x3True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 49,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [3, 5, -3],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [3, 5, -3],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "50_ES5x3True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 50,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [3, 5, -3],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [3, 5, -3],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "51_ES5x7True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 51,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [7, 5, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(5)],
        "steps": [7, 5, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "52_ES3x6True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 52,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [6, 3, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(3)],
        "steps": [6, 3, -6],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "53_ES4x7True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 53,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "53_ES4x7True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 53,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "53_ES4x7True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 53,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },


  "53_ES4x7True": {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    "descbutton": false,
    "undobuttonlocation": UNDOBUTTONLOCATION,
    // "undobuttonlocation": UNDOBUTTONLOCATION,
    // "interactive": false,
    "id": 53,
    "cutlimit": 2,

    "tiles": [

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": false,
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": "#FF454522",
        "fillcolor": "#4545FF22",
        "edgecolor": "#FFFFFF"
      },

      {
        "location": [XBASEOFFSET, yoffset(4)],
        "steps": [7, 4, -7],
        "startdirection": "x",
        "unit": [UNITSIZE, 1, "cm"],
        "empty": false,
        "edgelabels": false,
        "frozen": true,
        "resizable": "ES",
        "showresizeeq": false,
        "showsizedesc": false,
        "cuttable": false,
        "starterfillcolor": DIVOMATHRED,
        "fillcolor": DIVOMATHBLUE,
        "edgecolor": "#FFFFFF"
      },
    ],
  },

}

allRefIds = Object.values(CONFIGURATIONS).filter(it => it.ref).map(it => it.ref);
allRefIds.forEach(it => window.top.postMessage({ method: 'get', key: `TILES:${it}` }, "*"));


DivomathConfig = function() {
  console.log("Current APPMODE (from URL):", APPMODE);
  return {
    divomathVarState: {},//localStorage.getItem("TILES:1"),
    configuration: CONFIGURATIONS[APPMODE]
  }
}

DivomathPreviousSubmission = function() {
  return {}
}

sendDivomathResult = function(args) {
  return args
}

