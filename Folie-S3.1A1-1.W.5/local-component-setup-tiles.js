require = function(arg) { return p5 }
let ISLOCAL = true
let CONFIGURATION = {
  "debuginfos": false,
  "tiles": [
    {
      "location": [
        0.4,
        0.1
      ],
      "steps": [
        -5,
        6,
        2,
        -2,
        3
      ],
      "startdirection": "y",
      "unit": [
        0.035,
        1,
        "cm"
      ],
      "empty": true,
      "edgelabels": "______",
      "frozen": true
    },
    {
      "location": [
        0.7,
        0.15
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.035,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": "____",
      "frozen": false
    },
    {
      "location": [
        0.7,
        0.15
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.035,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": "____",
      "frozen": false
    },
    {
      "location": [
        0.7,
        0.15
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.035,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": "____",
      "frozen": false
    }
  ]
}

DivomathConfig = function() {
  return {
    divomathVarState: {},
    configuration: CONFIGURATION
  }
}

DivomathPreviousSubmission = function() {
  return {}
}
