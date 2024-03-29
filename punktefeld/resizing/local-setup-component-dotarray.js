require = function(arg) { return p5 }
let ISLOCAL = true
let PARAMS = new URLSearchParams(window.location.toString().split('?')[1])
let NUMROWS = parseInt(PARAMS.get("rows"));
let NUMCOLS = parseInt(PARAMS.get("cols"));
let NUMCUTS = parseInt(PARAMS.get("cuts"));

let CONFIGURATIONS = {
  RESIZING: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    // "undobuttonlocation": [0.25, 0.05],
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
    ],
  },
  CUTTING: {
    "debuginfos": false,
    // "debuginfos": true,
    // "RESULT": "height*length",
    "undobutton": true,
    // "undobuttonlocation": [0.25, 0.05],
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
    ],
  }
}



DivomathConfig = function() {
  return {
    divomathVarState: {},
    configuration: CONFIGURATIONS[APPMODE]
  }
}

DivomathPreviousSubmission = function() {
  return {}
}

sendDivomathResult = function(args) {
  return args
}

