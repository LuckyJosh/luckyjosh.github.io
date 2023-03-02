require = function(arg) { return p5 }
let ISLOCAL = true
let CONFIGURATION = {
  "debuginfos": false,
  "tiles": [
    {
      "location": [
        0.2,
        0.15
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
        0.05,
        1,
        "cm"
      ],
      "empty": true,
      "edgelabels": "______",
      "frozen": true
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
