const sketch =  /*[[[DELETELINE]]]*/
  (p5) => {
    // function debugtext(frameRate, timestamp) {// {{{
    //   p5.strokeWeight(1);
    //   p5.fill("#000");
    //   p5.textAlign(p5.LEFT, p5.TOP);
    //   p5.textSize(12);
    //   let mouse = Point2D.create({ x: p5.mouseX, y: p5.mouseY, coordinateSystem: CoordinateSystem.base })
    //   // if ((p5.frameCount % (app.state.frameRate / 2)) == 0) frameRate = Math.floor(p5.frameRate());
    //   // let other = Object.values(app.CSs).map(it => `${mouse.intoCS(it)}`).join("\n")
    //
    //   p5.scoped(() => {
    //     p5.textStyle("bold");
    //     p5.text(`Debug Information:`, ...Point2D.create({ x: 1400, y: 5, coordinateSystem: app.CSs.base }).uv);
    //   })
    //   p5.text(`${timestamp}`, ...Point2D.create({ x: 1510, y: 5, coordinateSystem: app.CSs.base }).uv);
    //
    //   p5.text(`FR:${frameRate}\n${other}`, ...Point2D.create({ x: 1400, y: 20, coordinateSystem: app.CSs.base }).uv);
    //   let POIs = Object.entries(app.POIs).join("\n ")
    //   let text = ` ${POIs}\n`// ${polygons[0]}`
    //   // p5.print(text.replace(/^\s*/g, ""));
    //
    //   p5.text(`${text}`, ...Point2D.create({ x: 1600, y: 20, coordinateSystem: app.CSs.base }).uv);
    // }// }}}

    let COLORS = {
      nord: {

        gray3: "#2e3440",
        gray2: "#3b4252",
        gray1: "#434c5e",
        gray0: "#4c566a",

        white2: "#d8dee9",
        white1: "#e5e9f0",
        white0: "#eceff4",


        blue2: "#5e81ac",
        blue1: "#81a1c1",
        blue0: "#88c0d0",

        red: "#bf616a",
        purple: "#b48ead",
        orange: "#d08770",
        green: "#a3be8c",
        yellow: "#ebcb8b",
        cyan: "#8fbcbb",

      }
    }

    p5.drawingScope = function(settings) {
      return function(drawingFunc) {

        p5.push();
        if (settings) {
          Object.entries(settings).forEach((it, i) => {
            if (!Number.isNaN(parseInt(it[0].at(-1)))) {
              it[0] = it[0].slice(0, it[0].length - 1);
            }
            if (Array.isArray(it[1])) {
              p5[it[0]](...it[1])
            } else {
              p5[it[0]](it[1])
            }
            //p5.print(`applying: ${it[0]}(${it[1]})`);
          })
        }



        drawingFunc()
        p5.pop();
      }
    }



    let STATE = {}
    let canvas;
    let input;
    p5.preload = function() {
    };

    p5.setup = function() {
      p5.pixelDensity(4);
      canvas = p5.createCanvas(1960, 950);
      canvas.aspect = canvas.width / canvas.height;
      canvas.relativeCoordinate = function(x, y) {
        return [canvas.width * x, canvas.height * y]
      }
      canvas.relativeToWidth = function(x) {
        return canvas.width * x
      }

      canvas.relativeToHeight = function(y) {
        return canvas.height * y
      }

      canvas.shift = function(p, xy) {
        return [p[0] + xy[0], p[1] + xy[1]]
      }
      canvas.relativeShift = function(p, xy) {
        // if (xy[1] < 0) p5.print(this.relativeToWidth(xy[0]), this.relativeToHeight(xy[1]));
        return this.shift(p, [this.relativeToWidth(xy[0]), this.relativeToHeight(xy[1])])
      }

      p5.print(canvas);
      STATE.lastAngle = 0;
      STATE.currentAngle = 0;
      STATE.startDragAt = undefined;

      input = p5.createElement("input");
      input.attribute("defaultValue", "");
      input.position(55, 0);
      input.parseValue = function() {
        let regex_degmin = /(\d*)°(\d*)'/;
        if (!this.value() || !regex_degmin.test(this.value())) { return undefined }
        let [match, deg, min] = regex_degmin.exec(this.value());
        let degrees = parseInt(deg) + parseInt(min) / 60;
        if (Number.isNaN(degrees)) return undefined;
        return degrees
      }
      input.elt.onchange = function(r) {
        STATE.currentAngle = input.parseValue();
      }
    }

    let frameRate = 0;
    let timestamp = (new Date());


    p5.draw = function() {
      p5.background("#FFF");


      p5.drawingScope({ strokeWeight: 1, fill: COLORS.nord.white2, stroke: "" })(() => {
        p5.rect(0, 0, 50, 50);
        p5.drawingScope({ strokeWeight: 0.5, textAlign: [p5.CENTER, p5.CENTER], fill: COLORS.nord.gray0, stroke: COLORS.nord.gray0 })(() => {

          p5.text("Reset", 25, 25)
        })
      })

      p5.drawingScope({ strokeWeight: 2.0, strokeCap: p5.SQUARE })(() => {

        p5.drawingScope({ stroke: COLORS.nord.purple, strokeWeight: 5 })(() => {
          p5.arc(...canvas.relativeCoordinate(0.25, 0.5), canvas.relativeToWidth(0.402), canvas.relativeToWidth(0.402), 180, 210.5, true);
        })
        p5.circle(...canvas.relativeCoordinate(0.25, 0.5), canvas.relativeToWidth(0.40))

        let mouseVec = p5.createVector(...canvas.relativeShift([p5.mouseX, p5.mouseY], [-0.25, -0.5]));
        // p5.print(mouseVec.x, mouseVec.y);
        // p5.print(mouseVec.mag());
        // p5.line(...canvas.relativeCoordinate(0.25, 0.5), p5.mouseX, p5.mouseY);
        // p5.print(canvas.relativeCoordinate(0.25, 0.5), [p5.mouseX, p5.mouseY]);
      });

      Array(720).keys().forEach(it => {
        //   translate2: canvas.relativeShift([0, 0], [((it / 2 > 270 || it / 2 < 90) ? +1 : -1) * 0.24, 0]),
        p5.drawingScope({
          strokeWeight: 0.60,
          angleMode: p5.DEGREES,
          translate0: canvas.relativeCoordinate(0.25, 0.5),
          rotate: -it / 2 + STATE.currentAngle,
          translate1: canvas.relativeCoordinate(-0.25, -0.5),
          strokeCap: p5.SQUARE
        })(() => {
          let lineStart = 0.195;
          if (it % 2 == 0) {
            lineStart = 0.193;
          }
          if (it % 10 == 0) {
            lineStart = 0.191;
          }
          if (it % 20 == 0) {
            lineStart = 0.189;
            p5.drawingScope({
              stroke: COLORS.nord.gray0,
              fill: COLORS.nord.gray0,
              textAlign: [p5.CENTER, p5.CENTER],
              translate0: canvas.relativeCoordinate(0.42, 0.5),
              translate1: canvas.relativeShift([0, 0], [-0.24, 0]),
              rotate1: (it / 2 > 270 || it / 2 < 90) ? 0 : 180,
              translate2: canvas.relativeShift([0, 0], [((it / 2 > 270 || it / 2 < 90) ? +1 : -1) * 0.24, 0]),
            })(() => {
              p5.text(`${it / 2}°`, 0, 0)
            })
          }
          p5.drawingScope({
            strokeWeight: 2.25,
            stroke: COLORS.nord.orange,
          })(() => {
            p5.line(...canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [lineStart, 0]), ...canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [0.1995, 0]))

          })
          p5.line(...canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [lineStart, 0]), ...canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [0.20, 0]))
        });
      })

      Array(31).keys().forEach(it => {
        p5.drawingScope({
          strokeWeight: .5,
          stroke: COLORS.nord.blue0,
          angleMode: p5.DEGREES,
          translate0: canvas.relativeCoordinate(0.25, 0.5),
          rotate: (-180 + it + it / 60),
          translate1: canvas.relativeCoordinate(-0.25, -0.5)
        })(() => {
          let lineStart = 0.21;
          if (it % 5 == 0) {
            lineStart = 0.2125;
          }
          if (it % 10 == 0) {
            lineStart = 0.215;
            p5.drawingScope({
              //   stroke: COLORS.nord.gray0,
              //   fill: COLORS.nord.gray0,
              textAlign: [p5.CENTER, p5.CENTER],
              translate0: canvas.relativeCoordinate(0.265, 0.5),
              translate1: canvas.relativeShift([0, 0], [0.205, 0]),
              rotate: 180,
              translate1: canvas.relativeShift([0, 0], [0.205, 0]),
            })(() => {
              p5.text(`${it}'`, 0, 0);
            })
          }

          p5.line(...canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [0.1975, 0]), ...canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [lineStart, 0]))
        });
      })

      p5.drawingScope({ fill: "#AA0000" })(() => {
        p5.circle(...canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [0.0, 0]), 10);

      })

      p5.text(`${Math.floor(STATE.currentAngle)}°${Math.round((STATE.currentAngle - Math.floor(STATE.currentAngle)) * 60, 3)}'`, p5.mouseX, p5.mouseY);
      // p5.print(test);
    };

    p5.mousePressed = function() {
      // p5.print("mousePressed: Angle=", STATE.currentAngle);
      STATE.startDragAt = [p5.mouseX, p5.mouseY];
    }

    // p5.mouseMoved = function() {
    //   p5.print("mouseMoved!")
    // }

    p5.mouseDragged = function() {
      let pmouseVec = p5.createVector(...canvas.relativeShift(STATE.startDragAt, [-0.25, -0.5]));
      let mouseVec = p5.createVector(...canvas.relativeShift([p5.mouseX, p5.mouseY], [-0.25, -0.5]));
      let horizontalVec = p5.createVector(...canvas.relativeShift(canvas.relativeShift(canvas.relativeCoordinate(0.25, 0.5), [0.20, 0]), [-0.25, -0.5]));
      // p5.print(JSON.stringify({ mouseVec, horizontalVec, STATE }));
      // p5.print(mouseVec.angleBetween(pmouseVec));

      STATE.currentAngle = pmouseVec.angleBetween(mouseVec) + STATE.lastAngle; //mouseVec.angleBetween(pmouseVec) - STATE.lastAngle;
    }

    p5.mouseReleased = function() {
      STATE.startDragAt = undefined;
      STATE.lastAngle = STATE.currentAngle;
      // STATE.lastAngle = 0;
      // p5.print("mouseReleased: Angle=", STATE.currentAngle);
    }

    p5.mouseClicked = function() {
      if ((0 < p5.mouseX) && (p5.mouseX < 50) && (0 < p5.mouseY) && (p5.mouseY < 50)) {
        STATE.currentAngle = 0;
        STATE.lastAngle = 0;
      }

    }

    // p5.mouseWheel = function() {
    //   p5.print("mouseWheel!")
    // }

    // // touch event Methods
    // p5.touchStarted = function() {
    //   p5.print("touchStarted!")
    // }
    // p5.touchMoved = function() {
    //   p5.print("touchMoved!")
    // }
    // p5.touchEnded = function() {
    //   p5.print("touchEnded!")
    // }


  };

let myp5 = new p5(sketch, "sketch") /*[[[DELETELINE]]]*/
