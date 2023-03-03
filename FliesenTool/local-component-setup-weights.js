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
  "nocache": true,
  "mode": "slider",
  // "mode": "stacking",
  "splitslider": true,
  // "splitslider": false,
  // "onlystacking": "G",
  // "onlystacking": "KG",
  // "onlystacking": "both",
  "numofcubes": 1254,
  "numofcubesKG": 1234,
  "numofcubesG": 2378,
  // "centerscale": false,
  "centerscale": true,
  // "barsonscale": false,
  "barsonscale": true,
  "scaleKGLabels": true,
  "scaleGLabels": true,
  // "scaleKG100Ticks": true,
  "scaleKG100Ticks": "auto",
  "digitalscaleKG": true,
  "digitalscaleG": true,
  // "edgewidth1000cubeG": 1,
  // "edgewidth1000cubeKG": 1

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


