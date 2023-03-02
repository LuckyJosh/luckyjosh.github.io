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
        -4,
        -5,
        4
      ],
      "startdirection": "x",
      "unit": [
        0.05,
        1,
        "cm"
      ],
      "empty": true,
      "edgelabels": "____",
      "frozen": true
    },
    {
      "location": [
        0.65,
        0.1
      ],
      "steps": [
        -4,
        -4,
        1,
        -1,
        3
      ],
      "startdirection": "x",
      "unit": [
        0.05,
        1,
        "cm"
      ],
      "empty": true,
      "edgelabels": "______",
      "frozen": true
    },
    {
      "location": [
        0.8,
        0.3
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.05,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": "____",
      "frozen": false
    },
    {
      "location": [
        0.8,
        0.3
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.05,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": "____",
      "frozen": false
    },
    {
      "location": [
        0.8,
        0.3
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.05,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": "____",
      "frozen": false
    },
    {
      "location": [
        0.8,
        0.3
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.05,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": "____",
      "frozen": false
    },
    {
      "location": [
        0.8,
        0.3
      ],
      "steps": [
        -1,
        -1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.05,
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
