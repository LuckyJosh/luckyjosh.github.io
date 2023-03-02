require = function(arg) { return p5 }
let ISLOCAL = true
let CONFIGURATION = {
  "debuginfos": false,
  "tiles": [
    {
      "location": [
        0.4,
        0.5
      ],
      "steps": [
        -1,
        1,
        1
      ],
      "startdirection": "x",
      "unit": [
        0.05,
        1,
        "cm"
      ],
      "empty": false,
      "edgelabels": false,
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
