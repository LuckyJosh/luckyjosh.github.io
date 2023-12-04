const sketch =
  (p5js) => {

    let nord_colors = {
      red: "#bf616a",
      green: "#a3be8c",
      blue2: "#5e81ac",
      purple: "#b48ead",
      orange: "#d08770",
      cyan: "#8fbcbb",
      yellow: "#ebcb8b",
      black: "#2e3440"
    }
    const CENTER = p5js.CENTER;

    function betadistribution(x, a, b) {
      return x ** (a - 1) * (1 - x) ** (b - 1)
    }

    function nCr(n, r) {
      var coeff = 1;
      for (var x = n - r + 1; x <= n; x++) coeff *= x;
      for (x = 1; x <= r; x++) coeff /= x;
      return coeff;
    }
    function binomialdistribution(x, n, p) {
      return nCr(n, x) * (p ** x) * ((1 - p) ** (n - x))
    }

    let origin = {
      x: 50, y: 450
    }

    let Axes = {
      xlength: 500,
      ylength: -400,
      xMax: 1,
      yMax: 1,

    }

    function data2Pixel(x, y) {
      let [xD, yD] = [x, y];
      xD = x * Axes.xlength + origin.x;
      yD = y / Axes.yMax * Axes.ylength + origin.y;
      return [xD, yD]

    }

    function canvas2Website(x, y) {
      xC = x + p5js.canvas.offsetLeft;
      yC = y + p5js.canvas.offsetTop;

      return [xC, yC]

    }

    let xAxis = [...Array(1000).keys()].map(x => 500 / 1000 * x + 50);
    let yAxis = [];
    let X = [...Array(2001).keys()].map(x => x / 2000);

    let Y;
    let aSlider;
    let bSlider;
    let nSlider;
    let xSlider;
    let xCheckBox;

    let params;
    p5js.setup = function() {
      p5js.pixelDensity(2);
      canvas = p5js.createCanvas(650, 600);
      canvas.parent("sketch0")
      //console.log(canvas);
      // console.log(p5js);

      params = p5js.getURLParams();

      //if (params.mode == "beta-distribution") {
      aSlider = p5js.createSlider(0, 1000, 100);
      aSlider.position(...canvas2Website(50, 475));
      aSlider.size(450);
      bSlider = p5js.createSlider(0, 1000, 100);
      bSlider.position(...canvas2Website(50, 500));
      bSlider.size(450);
      if (params.mode == "exam-problem"){
      nSlider = p5js.createSlider(1, 300, 0);
      nSlider.position(...canvas2Website(50, 525));
      nSlider.size(450);
      xSlider = p5js.createSlider(0, nSlider.elt.max, 0);
      xSlider.position(...canvas2Website(50, 550));
      xSlider.size(450);
      // xCheckBox = p5js.createCheckbox("Fixieren");
      // xCheckBox.position(...canvas2Website(600, 550));

      //}
      //console.log(aSlider)
      }
    }

    function argMatch(x0, X) {
      let dY = X.map(y => Math.abs(y - x0))
      let minDist = Math.min(...dY);
      // console.log(minDist);
      return dY.findIndex(x => Math.abs(x - minDist) < 0.005);
    }

    p5js.draw = function() {
      //console.log(p5js.textSize());
      p5js.background("white");
      p5js.rectMode(p5js.CENTER);
      //p5js.textAlign(CENTER, CENTER);
      //

      if (params.mode == "beta-distribution") {
        let a = aSlider.value() / 100;
        let b = bSlider.value() / 100;

        let Exp = a / (a + b);
        let Var = (a * b) / ((a + b + 1) * (a + b) ** 2);
        let Mod = (a - 1) / (a + b - 2);
        let Med;
        if ((a > 1) && (b > 1)) {
          Med = (a - (1 / 3)) / (a + b - (2 / 3));
        }

        Y = X.map(it => betadistribution(it, aSlider.value() / 100, bSlider.value() / 100));

        if ((aSlider.value() >= 100) && (bSlider.value() >= 100)) {

          Y = Y.map(y => y / (1e-3 * Y.reduce((acc, cur) => acc += cur, 0)));
          Axes.yMax = Math.max(...Y) * 1.2;

        } else {
          Axes.yMax = 3;
        }
        //console.log(Y.reduce((acc, cur) => acc += cur, 0));
        p5js.push();

        p5js.stroke(nord_colors.blue2);
        p5js.strokeWeight(2);
        // console.log("argmatch", argMatch(Exp, X), Y[argMatch(Exp, X)]);

        p5js.point(...data2Pixel(Exp, 0));
        p5js.line(...data2Pixel(Exp, 0), ...data2Pixel(Exp, Y[argMatch(Exp, X)]))

        p5js.stroke(nord_colors.yellow);
        p5js.point(...data2Pixel(Var, 0));
        p5js.line(...data2Pixel(Exp - Math.sqrt(Var), 0), ...data2Pixel(Exp - Math.sqrt(Var), Y[argMatch(Exp - Math.sqrt(Var), X)]))
        p5js.line(...data2Pixel(Exp + Math.sqrt(Var), 0), ...data2Pixel(Exp + Math.sqrt(Var), Y[argMatch(Exp + Math.sqrt(Var), X)]))
        p5js.stroke(nord_colors.purple);
        p5js.point(...data2Pixel(Mod, 0));
        p5js.line(...data2Pixel(Mod, 0), ...data2Pixel(Mod, Y[argMatch(Mod, X)]))
        if ((a > 1) && (b > 1)) {
          p5js.stroke(nord_colors.orange);
          p5js.point(...data2Pixel(Med, 0));
          p5js.line(...data2Pixel(Med, 0), ...data2Pixel(Med, Y[argMatch(Med, X)]))
        }
        p5js.stroke(nord_colors.green);
        p5js.strokeWeight(5);
        data = [...Array(X.length).keys()].map(idx => {
          p5js.point(...data2Pixel(X[idx], Y[idx]));
        });

        p5js.pop();

        p5js.push();
        p5js.textAlign(CENTER, CENTER);
        p5js.fill(nord_colors.blue2);
        p5js.stroke(nord_colors.blue2);
        p5js.text(`Erwartungswert`, 125, 75)
        p5js.stroke(nord_colors.yellow);
        p5js.fill(nord_colors.yellow);
        p5js.text(`1-Std.Abw.-Umgebung`, 275, 75)
        p5js.stroke(nord_colors.purple);
        p5js.fill(nord_colors.purple);
        p5js.text(`Modalwert`, 425, 75)
        p5js.stroke(nord_colors.orange);
        p5js.fill(nord_colors.orange);
        p5js.text(`≈Median (a,b > 1)`, 575, 75)
        p5js.pop();

        p5js.push();
        p5js.textAlign(CENTER, CENTER);
        p5js.textSize(20);
        p5js.text(`Beta(${aSlider.value() / 100},${bSlider.value() / 100})-Dichte`, 325, 50)
        p5js.pop();


        p5js.line(origin.x, origin.y, origin.x, origin.y + Axes.ylength);
        p5js.line(origin.x, origin.y, origin.x + Axes.xlength, origin.y);
        p5js.fill("black");
        p5js.triangle(origin.x + Axes.xlength + 12, origin.y, origin.x + Axes.xlength, origin.y - 5, origin.x + Axes.xlength, origin.y + 5);
        p5js.triangle(origin.x, origin.y + Axes.ylength - 12, origin.x - 5, origin.y + Axes.ylength, origin.x + 5, origin.y + Axes.ylength);
        p5js.push();

        p5js.textAlign(p5js.CENTER, p5js.BASELINE);

        [...Array(11).keys()].forEach(idx => {
          p5js.text((idx / 10).toFixed(2), data2Pixel(idx / 10, 0)[0], origin.y + 15);
        });
        p5js.text("θ", data2Pixel(0.5, 0)[0], origin.y + 30);

        [...Array(5).keys()].forEach(idx => {
          p5js.text((idx * Axes.yMax).toFixed(3), origin.x - 25, data2Pixel(0, idx * Axes.yMax / 5)[1]);
        });
        p5js.pop();


        p5js.push();
        
        p5js.text(`a = ${aSlider.value() / 100}`, 510, 490);
        p5js.text(`b = ${bSlider.value() / 100}`, 510, 515);
        p5js.pop();
      } else if (params.mode == "exam-problem") {
        xSlider.elt.max = nSlider.value();
        let a = aSlider.value() / 100;
        let b = bSlider.value() / 100;
        let n = nSlider.value();
        let x = xSlider.value();

        Y = X.map(it => betadistribution(it, aSlider.value() / 100, bSlider.value() / 100));
        Ypost = X.map(it => betadistribution(it, xSlider.value() + aSlider.value() / 100, nSlider.value() - xSlider.value() + parseInt(bSlider.value() / 100)));
        YBin = X.map(it => binomialdistribution(x, n, it));

        if ((aSlider.value() >= 100) && (bSlider.value() >= 100)) {

          Y = Y.map(y => y / (5e-4 * Y.reduce((acc, cur) => acc += cur, 0)));
          Ypost = Ypost.map(y => y / (5e-4 * Ypost.reduce((acc, cur) => acc += cur, 0)));
          YBin = Ypost.map(y => y / (5e-4 * YBin.reduce((acc, cur) => acc += cur, 0)));
          let maxY = Math.max(Math.max(...Y), Math.max(...Ypost));
          Axes.yMax = maxY * 1.2;

        } else {
          Axes.yMax = 3;
        }
        //console.log(Y.reduce((acc, cur) => acc += cur, 0));
        p5js.push();

        // data = [...Array(X.length).keys()].map(idx => {
        //   p5js.point(...data2Pixel(X[idx], YBin[idx]));
        // });
        //
        p5js.stroke(nord_colors.green);
        p5js.strokeWeight(5);
        data = [...Array(X.length).keys()].map(idx => {
          p5js.point(...data2Pixel(X[idx], Y[idx]));
        });

        p5js.stroke(nord_colors.purple);
        p5js.strokeWeight(5);
        data = [...Array(X.length).keys()].map(idx => {
          p5js.point(...data2Pixel(X[idx], Ypost[idx]));
        });

        p5js.pop();

        p5js.push();
        p5js.textAlign(CENTER, CENTER);
        p5js.textSize(16);
        p5js.text(`Likelihood: Bin(${nSlider.value()},θ)-Dichte`, 480, 30)
        p5js.fill(nord_colors.green);
        p5js.stroke(nord_colors.green);
        p5js.text(`Prior: Beta(${aSlider.value() / 100},${bSlider.value() / 100})-Dichte`, 180, 30)
        p5js.fill(nord_colors.purple);
        p5js.stroke(nord_colors.purple);
        p5js.text(`Posterior: Beta(${xSlider.value() + aSlider.value() / 100},${nSlider.value() - xSlider.value() + bSlider.value() / 100})-Dichte`, 330, 60)
        //        p5js.text(`Likelihood: Bin(${nSlider.value() / 100},${bSlider.value() / 100})-Dichte`, 175, 50)
        p5js.pop();


        p5js.line(origin.x, origin.y, origin.x, origin.y + Axes.ylength);
        p5js.line(origin.x, origin.y, origin.x + Axes.xlength, origin.y);
        p5js.fill("black");
        p5js.triangle(origin.x + Axes.xlength + 12, origin.y, origin.x + Axes.xlength, origin.y - 5, origin.x + Axes.xlength, origin.y + 5);
        p5js.triangle(origin.x, origin.y + Axes.ylength - 12, origin.x - 5, origin.y + Axes.ylength, origin.x + 5, origin.y + Axes.ylength);
        p5js.push();

        p5js.textAlign(p5js.CENTER, p5js.BASELINE);

        [...Array(11).keys()].forEach(idx => {
          p5js.strokeWeight(2);
          p5js.point(data2Pixel(idx / 10, 0)[0], origin.y + 1);
          p5js.text((idx / 10).toFixed(2), data2Pixel(idx / 10, 0)[0], origin.y + 15);
        });
        p5js.text("θ", data2Pixel(0.5, 0)[0], origin.y + 30);

        p5js.textAlign(p5js.CENTER, p5js.CENTER);
        // [...Array(5).keys()].forEach(idx => {
        //   p5js.point(origin.x - 1, data2Pixel(0, idx * Axes.yMax / 5)[1]);
        //   p5js.text((idx * Axes.yMax).toFixed(3), origin.x - 25, data2Pixel(0, idx * Axes.yMax / 5)[1]);
        p5js.translate(origin.x - 15, origin.y / 2);
        p5js.rotate(-p5js.PI / 2);
        p5js.translate(-origin.x + 15, -origin.y / 2);
        p5js.text("Nicht normierte 'Dichten'", origin.x - 15, origin.y / 2);
        // });
        p5js.pop();


        p5js.push();
        p5js.text(`a = ${aSlider.value() / 100}`, 510, 490);
        p5js.text(`b = ${bSlider.value() / 100}`, 510, 515);
        p5js.text(`n = ${nSlider.value()}`, 510, 540);
        p5js.text(`x = ${xSlider.value()}`, 510, 565);
        p5js.pop();
      }

    }
  };

let myp5 = new p5(sketch, "sketch")

