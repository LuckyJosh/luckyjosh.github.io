// handle config input and button
//https://stackoverflow.com/questions/428364/pure-javascript-yaml-library-that-supports-both-dump-and-load

let config;
let configButton = document.getElementById("configButton");

function configButtonClick(event) {
  let configTextarea = document.getElementById("configYaml");
  config = YAML.parse(configTextarea.value)["configuration"];
  return myp5 = new p5(sketch, "sketch")
}

require = function(arg) { return p5 }
let ISLOCAL = true


let CONFIGURATION = {
  // "debuginfos": false,
  "debuginfos": true,
  "showresizeeq": true,
  "tiles": [
    // {
    //   "location": [0.5, 0.5],
    //   "steps": [-1, -3, 4, -2, 1, 4, 4, -1, 1, 3],
    //   "startdirection": "x",
    //   "unit": [0.025, 1, "cm"],
    //   "empty": false,
    //   "edgelabels": true,
    //   "frozen": false
    // },
    // {
    //   "location": [0.2, 0.5],
    //   "steps": [-4, 2, -2, 2, 2, 2, 2, 3, +2],
    //   "startdirection": "x",
    //   "unit": [0.025, 1, "cm"],
    //   "empty": true,
    //   "edgelabels": false,
    //   "frozen": false
    // },
    {
      "location": [0.7, 0.5],
      "steps": [9, -2, -3, -2, -2, -2, -2, +2, -2],
      "startdirection": "y",
      "unit": [0.025, 1, "cm"],
      "empty": true,
      "edgelabels": "!??!!_!_!?",
      "frozen": false,

    },
    {
      "location": [0.7, 0.2],
      "steps": [2, 2, -2],
      "startdirection": "x",
      "unit": [0.025, 1, "cm"],
      "empty": false,
      "edgelabels": false,
      "frozen": false,
      "cuttable": false,
      // "resizable": false
    },
    // {
    //   "location": [0.2, 0.7],
    //   "steps": [-3, 1, -1, 6, 1, 2, 2, -1, 1, -2, 1, -4, -1],
    //   "startdirection": "x",
    //   "unit": [0.025, 1, "cm"],
    //   "empty": true,
    //   "edgelabels": false,
    //   "frozen": true
    // },
    {
      "location": [0.9, 0.8],
      "steps": [2, 5, -2],
      "startdirection": "x",
      "unit": [0.025, 1, "cm"],
      "empty": false,
      "edgelabels": false,
      "frozen": false,
      "zorder": 5,
      "label": "hinterste Fliese"
    },
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



DivomathConfig = function() {
  return {
    divomathVarState: {},
    configuration: config
  }
}

DivomathPreviousSubmission = function() {
  return {}
}


