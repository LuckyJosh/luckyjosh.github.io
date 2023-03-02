const sketch = (p5Inst) => {  // remove const sketch 
  if (ISLOCAL != undefined) { // remove line
    p5Inst.getDivomathConfig = function() { return DivomathConfig() }  //remove line
    p5Inst.getDivomathPreviousSubmission = function() { return DivomathPreviousSubmission } // remove line
  }//
  p5Inst.getDivomathVarState = () => state;
  //begin:globals {{{
  let allTiles = [];
  let draggingVector;
  let draggingDirection;
  let countUnits;
  let clickMouseX, clickMouseY;
  let p5 = require("p5");
  let initialData = p5Inst.getDivomathConfig();
  let initialConfig = { "tiles": [] };
  if (initialData.configuration) {
    for (var [k, v] of Object.entries(initialData.configuration)) {
      initialConfig[k] = v;
    }
  }

  console.log("InitialConfig:", initialConfig, "Config:", initialData.configuration);
  let lastState = initialData.divomathVarState;
  let lastSubmission = p5Inst.getDivomathPreviousSubmission();
  let state = {}; lastState ? lastState : {};
  // from gobal to instace mode
  let sin = Math.sin;
  let cos = Math.cos;
  let tan = Math.tan;
  let abs = Math.abs;
  let ceil = Math.ceil;
  let floor = Math.floor;
  let pow = Math.pow;
  let max = Math.max;
  let min = Math.min;

  let print = p5Inst.print;
  let canvasBuffer;
  let debugbuffer;
  //end:globals}}}

  //begin: collide2D //{{{

  console.log("### p5.collide v0.7.3 ###")

  p5.prototype._collideDebug = false;

  p5.prototype.collideDebug = function(debugMode) {
    _collideDebug = debugMode;
  }

  /*~++~+~+~++~+~++~++~+~+~ 2D ~+~+~++~+~++~+~+~+~+~+~+~+~+~+~+*/

  p5.prototype.collideRectRect = function(x, y, w, h, x2, y2, w2, h2) {
    //2d
    //add in a thing to detect rectMode p5Inst.CENTER
    if (x + w >= x2 &&    // r1 right edge past r2 left
      x <= x2 + w2 &&    // r1 left edge past r2 right
      y + h >= y2 &&    // r1 top edge past r2 bottom
      y <= y2 + h2) {    // r1 bottom edge past r2 top
      return true;
    }
    return false;
  };

  // p5.vector version of collideRectRect
  p5.prototype.collideRectRectVector = function(p1, sz, p2, sz2) {
    return p5.prototype.collideRectRect(p1.x, p1.y, sz.x, sz.y, p2.x, p2.y, sz2.x, sz2.y)
  }


  p5.prototype.collideRectCircle = function(rx, ry, rw, rh, cx, cy, diameter) {
    //2d
    // temporary variables to set edges for testing
    var testX = cx;
    var testY = cy;

    // which edge is closest?
    if (cx < rx) {
      testX = rx       // left edge
    } else if (cx > rx + rw) { testX = rx + rw }   // right edge

    if (cy < ry) {
      testY = ry       // top edge
    } else if (cy > ry + rh) { testY = ry + rh }   // bottom edge

    // // get distance from closest edges
    var distance = this.dist(cx, cy, testX, testY)

    // if the distance is less than the radius, collision!
    if (distance <= diameter / 2) {
      return true;
    }
    return false;
  };

  // p5.vector version of collideRectCircle
  p5.prototype.collideRectCircleVector = function(r, sz, c, diameter) {
    return p5.prototype.collideRectCircle(r.x, r.y, sz.x, sz.y, c.x, c.y, diameter)
  }

  p5.prototype.collideCircleCircle = function(x, y, d, x2, y2, d2) {
    //2d
    if (this.dist(x, y, x2, y2) <= (d / 2) + (d2 / 2)) {
      return true;
    }
    return false;
  };


  // p5.vector version of collideCircleCircle
  p5.prototype.collideCircleCircleVector = function(p1, d, p2, d2) {
    return p5.prototype.collideCircleCircle(p1.x, p1.y, d, p2.x, p2.y, d2)
  }


  p5.prototype.collidePointCircle = function(x, y, cx, cy, d) {
    //2d
    if (this.dist(x, y, cx, cy) <= d / 2) {
      return true;
    }
    return false;
  };

  // p5.vector version of collidePointCircle
  p5.prototype.collidePointCircleVector = function(p, c, d) {
    return p5.prototype.collidePointCircle(p.x, p.y, c.x, c.y, d)
  }

  p5.prototype.collidePointEllipse = function(x, y, cx, cy, dx, dy) {
    //2d
    var rx = dx / 2, ry = dy / 2;
    // Discarding the points outside the bounding box
    if (x > cx + rx || x < cx - rx || y > cy + ry || y < cy - ry) {
      return false;
    }
    // Compare the point to its equivalent on the ellipse
    var xx = x - cx, yy = y - cy;
    var eyy = ry * this.sqrt(this.abs(rx * rx - xx * xx)) / rx;
    return yy <= eyy && yy >= -eyy;
  };

  // p5.vector version of collidePointEllipse
  p5.prototype.collidePointEllipseVector = function(p, c, d) {
    return p5.prototype.collidePointEllipse(p.x, p.y, c.x, c.y, d.x, d.y);
  }

  p5.prototype.collidePointRect = function(pointX, pointY, x, y, xW, yW) {
    //2d
    if (pointX >= x &&         // right of the left edge AND
      pointX <= x + xW &&    // left of the right edge AND
      pointY >= y &&         // below the top AND
      pointY <= y + yW) {    // above the bottom
      return true;
    }
    return false;
  };

  // p5.vector version of collidePointRect
  p5.prototype.collidePointRectVector = function(point, p1, sz) {
    return p5.prototype.collidePointRect(point.x, point.y, p1.x, p1.y, sz.x, sz.y);
  }

  p5.prototype.collidePointLine = function(px, py, x1, y1, x2, y2, buffer) {
    // get distance from the point to the two ends of the line
    var d1 = this.dist(px, py, x1, y1);
    var d2 = this.dist(px, py, x2, y2);

    // get the length of the line
    var lineLen = this.dist(x1, y1, x2, y2);

    // since floats are so minutely accurate, add a little buffer zone that will give collision
    if (buffer === undefined) { buffer = 0.1; }   // higher # = less accurate

    // if the two distances are equal to the line's length, the point is on the line!
    // note we use the buffer here to give a range, rather than one #
    if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
      return true;
    }
    return false;
  }

  // p5.vector version of collidePointLine
  p5.prototype.collidePointLineVector = function(point, p1, p2, buffer) {
    return p5.prototype.collidePointLine(point.x, point.y, p1.x, p1.y, p2.x, p2.y, buffer);
  }

  p5.prototype.collideLineCircle = function(x1, y1, x2, y2, cx, cy, diameter) {
    // is either end INSIDE the circle?
    // if so, return true immediately
    var inside1 = this.collidePointCircle(x1, y1, cx, cy, diameter);
    var inside2 = this.collidePointCircle(x2, y2, cx, cy, diameter);
    if (inside1 || inside2) return true;

    // get length of the line
    var distX = x1 - x2;
    var distY = y1 - y2;
    var len = this.sqrt((distX * distX) + (distY * distY));

    // get dot product of the line and circle
    var dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / this.pow(len, 2);

    // find the closest point on the line
    var closestX = x1 + (dot * (x2 - x1));
    var closestY = y1 + (dot * (y2 - y1));

    // is this point actually on the line segment?
    // if so keep going, but if not, return false
    var onSegment = this.collidePointLine(closestX, closestY, x1, y1, x2, y2);
    if (!onSegment) return false;

    // draw a debug circle at the closest point on the line
    if (this._collideDebug) {
      this.ellipse(closestX, closestY, 10, 10);
    }

    // get distance to closest point
    distX = closestX - cx;
    distY = closestY - cy;
    var distance = this.sqrt((distX * distX) + (distY * distY));

    if (distance <= diameter / 2) {
      return true;
    }
    return false;
  }

  // p5.vector version of collideLineCircle
  p5.prototype.collideLineCircleVector = function(p1, p2, c, diameter) {
    return p5.prototype.collideLineCircle(p1.x, p1.y, p2.x, p2.y, c.x, c.y, diameter);
  }
  p5.prototype.collideLineLine = function(x1, y1, x2, y2, x3, y3, x4, y4, calcIntersection) {

    var intersection;

    // calculate the distance to intersection point
    var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {

      if (this._collideDebug || calcIntersection) {
        // calc the point where the lines meet
        var intersectionX = x1 + (uA * (x2 - x1));
        var intersectionY = y1 + (uA * (y2 - y1));
      }

      if (this._collideDebug) {
        this.ellipse(intersectionX, intersectionY, 10, 10);
      }

      if (calcIntersection) {
        intersection = {
          "x": intersectionX,
          "y": intersectionY
        }
        return intersection;
      } else {
        return true;
      }
    }
    if (calcIntersection) {
      intersection = {
        "x": false,
        "y": false
      }
      return intersection;
    }
    return false;
  }


  // p5.vector version of collideLineLine
  p5.prototype.collideLineLineVector = function(p1, p2, p3, p4, calcIntersection) {
    return p5.prototype.collideLineLine(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, calcIntersection);
  }

  p5.prototype.collideLineRect = function(x1, y1, x2, y2, rx, ry, rw, rh, calcIntersection) {

    // check if the line has hit any of the rectangle's sides. uses the collideLineLine function above
    var left, right, top, bottom, intersection;

    if (calcIntersection) {
      left = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh, true);
      right = this.collideLineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh, true);
      top = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry, true);
      bottom = this.collideLineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh, true);
      intersection = {
        "left": left,
        "right": right,
        "top": top,
        "bottom": bottom
      }
    } else {
      //return booleans
      left = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
      right = this.collideLineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
      top = this.collideLineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
      bottom = this.collideLineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
    }

    // if ANY of the above are true, the line has hit the rectangle
    if (left || right || top || bottom) {
      if (calcIntersection) {
        return intersection;
      }
      return true;
    }
    return false;
  }

  // p5.vector version of collideLineRect
  p5.prototype.collideLineRectVector = function(p1, p2, r, rsz, calcIntersection) {
    return p5.prototype.collideLineRect(p1.x, p1.y, p2.x, p2.y, r.x, r.y, rsz.x, rsz.y, calcIntersection);
  }

  p5.prototype.collidePointPoly = function(px, py, vertices) {
    var collision = false;

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"

      // compare position, flip 'collision' variable back and forth
      if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
        (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
        collision = !collision;
      }
    }
    return collision;
  }

  // p5.vector version of collidePointPoly
  p5.prototype.collidePointPolyVector = function(p1, vertices) {
    return p5.prototype.collidePointPoly(p1.x, p1.y, vertices);
  }

  // POLYGON/CIRCLE
  p5.prototype.collideCirclePoly = function(cx, cy, diameter, vertices, interior) {

    if (interior === undefined) {
      interior = false;
    }

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"

      // check for collision between the circle and a line formed between the two vertices
      var collision = this.collideLineCircle(vc.x, vc.y, vn.x, vn.y, cx, cy, diameter);
      if (collision) return true;
    }

    // test if the center of the circle is inside the polygon
    if (interior === true) {
      var centerInside = this.collidePointPoly(cx, cy, vertices);
      if (centerInside) return true;
    }

    // otherwise, after all that, return false
    return false;
  }

  // p5.vector version of collideCirclePoly
  p5.prototype.collideCirclePolyVector = function(c, diameter, vertices, interior) {
    return p5.prototype.collideCirclePoly(c.x, c.y, diameter, vertices, interior);
  }

  p5.prototype.collideRectPoly = function(rx, ry, rw, rh, vertices, interior) {
    if (interior == undefined) {
      interior = false;
    }

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"

      // check against all four sides of the rectangle
      var collision = this.collideLineRect(vc.x, vc.y, vn.x, vn.y, rx, ry, rw, rh);
      if (collision) return true;

      // optional: test if the rectangle is INSIDE the polygon note that this iterates all sides of the polygon again, so only use this if you need to
      if (interior === true) {
        var inside = this.collidePointPoly(rx, ry, vertices);
        if (inside) return true;
      }
    }

    return false;
  }

  // p5.vector version of collideRectPoly
  p5.prototype.collideRectPolyVector = function(r, rsz, vertices, interior) {
    return p5.prototype.collideRectPoly(r.x, r.y, rsz.x, rsz.y, vertices, interior);
  }

  p5.prototype.collideLinePoly = function(x1, y1, x2, y2, vertices) {

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < vertices.length; current++) {

      // get next vertex in list if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === vertices.length) next = 0;

      // get the PVectors at our current position extract X/Y coordinates from each
      var x3 = vertices[current].x;
      var y3 = vertices[current].y;
      var x4 = vertices[next].x;
      var y4 = vertices[next].y;

      // do a Line/Line comparison if true, return 'true' immediately and stop testing (faster)
      var hit = this.collideLineLine(x1, y1, x2, y2, x3, y3, x4, y4);
      if (hit) {
        return true;
      }
    }
    // never got a hit
    return false;
  }


  // p5.vector version of collideLinePoly
  p5.prototype.collideLinePolyVector = function(p1, p2, vertice) {
    return p5.prototype.collideLinePoly(p1.x, p1.y, p2.x, p2.y, vertice);
  }

  p5.prototype.collidePolyPoly = function(p1, p2, interior) {
    if (interior === undefined) {
      interior = false;
    }

    // go through each of the vertices, plus the next vertex in the list
    var next = 0;
    for (var current = 0; current < p1.length; current++) {

      // get next vertex in list, if we've hit the end, wrap around to 0
      next = current + 1;
      if (next === p1.length) next = 0;

      // get the PVectors at our current position this makes our if statement a little cleaner
      var vc = p1[current];    // c for "current"
      var vn = p1[next];       // n for "next"

      //use these two points (a line) to compare to the other polygon's vertices using polyLine()
      var collision = this.collideLinePoly(vc.x, vc.y, vn.x, vn.y, p2);
      if (collision) return true;

      //check if the either polygon is INSIDE the other
      if (interior === true) {
        collision = this.collidePointPoly(p2[0].x, p2[0].y, p1);
        if (collision) return true;
        collision = this.collidePointPoly(p1[0].x, p1[0].y, p2);
        if (collision) return true;
      }
    }

    return false;
  }

  p5.prototype.collidePolyPolyVector = function(p1, p2, interior) {
    return p5.prototype.collidePolyPoly(p1, p2, interior);
  }

  p5.prototype.collidePointTriangle = function(px, py, x1, y1, x2, y2, x3, y3) {

    // get the area of the triangle
    var areaOrig = this.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));

    // get the area of 3 triangles made between the point and the corners of the triangle
    var area1 = this.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
    var area2 = this.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
    var area3 = this.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));

    // if the sum of the three areas equals the original, we're inside the triangle!
    if (area1 + area2 + area3 === areaOrig) {
      return true;
    }
    return false;
  }

  // p5.vector version of collidePointTriangle
  p5.prototype.collidePointTriangleVector = function(p, p1, p2, p3) {
    return p5.prototype.collidePointTriangle(p.x, p.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  }

  p5.prototype.collidePointPoint = function(x, y, x2, y2, buffer) {
    if (buffer === undefined) {
      buffer = 0;
    }

    if (this.dist(x, y, x2, y2) <= buffer) {
      return true;
    }

    return false;
  };

  // p5.vector version of collidePointPoint
  p5.prototype.collidePointPointVector = function(p1, p2, buffer) {
    return p5.prototype.collidePointPoint(p1.x, p1.y, p2.x, p2.y, buffer);
  }

  p5.prototype.collidePointArc = function(px, py, ax, ay, arcRadius, arcHeading, arcAngle, buffer) {

    if (buffer === undefined) {
      buffer = 0;
    }
    // point
    var point = this.createVector(px, py);
    // arc center point
    var arcPos = this.createVector(ax, ay);
    // arc radius vector
    var radius = this.createVector(arcRadius, 0).rotate(arcHeading);

    var pointToArc = point.copy().sub(arcPos);

    if (point.dist(arcPos) <= (arcRadius + buffer)) {
      var dot = radius.dot(pointToArc);
      var angle = radius.angleBetween(pointToArc);
      if (dot > 0 && angle <= arcAngle / 2 && angle >= -arcAngle / 2) {
        return true;
      }
    }
    return false;
  }

  // p5.vector version of collidePointArc
  p5.prototype.collidePointArcVector = function(p1, a, arcRadius, arcHeading, arcAngle, buffer) {
    return p5.prototype.collidePointArc(p1.x, p1.y, a.x, a.y, arcRadius, arcHeading, arcAngle, buffer);
  }

  //end: collide2D
  //}}}

  //begin: screen-position{{{
  // Acknowledgement to Thibault Coppex (@tcoppex) for the 3d-modelview-projection-math.
  // Had to adjust it a bit maybe because p5js changed the way webgl is handled since 2016.

  // See: https://editor.p5js.org/bohnacker/sketches/nUk3bVW7b on how to use it


  function addScreenPositionFunction(p5Instance) {
    let p = p5Instance || this;

    // find out which context we're in (2D or WEBGL)
    const R_2D = 0;
    const R_WEBGL = 1;
    let context = getObjectName(p._renderer.drawingContext).search("2D") >= 0 ? R_2D : R_WEBGL;

    // the stack to keep track of matrices when using push and pop
    if (context == R_2D) {
      p._renderer.matrixStack = [new p5.Matrix()];
    }

    // replace all necessary functions to keep track of transformations

    if (p.draw instanceof Function) {
      let drawNative = p.draw;
      p.draw = function(...args) {
        if (context == R_2D) p._renderer.matrixStack = [new p5.Matrix()];
        drawNative.apply(p, args);
      };
    }


    if (p.resetMatrix instanceof Function) {
      let resetMatrixNative = p.resetMatrix;
      p.resetMatrix = function(...args) {
        if (context == R_2D) p._renderer.matrixStack = [new p5.Matrix()];
        resetMatrixNative.apply(p, args);
      };
    }

    if (p.translate instanceof Function) {
      let translateNative = p.translate;
      p.translate = function(...args) {
        if (context == R_2D) last(p._renderer.matrixStack).translate(args);
        translateNative.apply(p, args);
      };
    }

    if (p.rotate instanceof Function) {
      let rotateNative = p.rotate;
      p.rotate = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateZ(rad);
        }
        rotateNative.apply(p, args);
      };
    }

    if (p.rotateX instanceof Function) {
      let rotateXNative = p.rotateX;
      p.rotateX = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateX(rad);
        }
        rotateXNative.apply(p, args);
      };
    }
    if (p.rotateY instanceof Function) {
      let rotateYNative = p.rotateY;
      p.rotateY = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateY(rad);
        }
        rotateYNative.apply(p, args);
      };
    }
    if (p.rotateZ instanceof Function) {
      let rotateZNative = p.rotateZ;
      p.rotateZ = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          last(p._renderer.matrixStack).rotateZ(rad);
        }
        rotateZNative.apply(p, args);
      };
    }

    if (p.scale instanceof Function) {
      let scaleNative = p.scale;
      p.scale = function(...args) {
        if (context == R_2D) {
          let m = last(p._renderer.matrixStack);
          let sx = args[0];
          let sy = args[1] || sx;
          let sz = context == R_2D ? 1 : args[2];
          m.scale([sx, sy, sz]);
        }
        scaleNative.apply(p, args);
      };
    }

    // Help needed: don't know what transformation matrix to use 
    // Solved: Matrix multiplication had to be in reversed order. 
    // Still, this looks like it could be simplified.

    if (p.shearX instanceof Function) {
      let shearXNative = p.shearX;
      p.shearX = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          let stack = p._renderer.matrixStack;
          let m = last(stack);
          let sm = new p5.Matrix();
          sm.mat4[4] = Math.tan(rad);
          sm.mult(m);
          stack[stack.length - 1] = sm;
        }
        shearXNative.apply(p, args);
      };
    }

    if (p.shearY instanceof Function) {
      let shearYNative = p.shearY;
      p.shearY = function(...args) {
        if (context == R_2D) {
          let rad = p._toRadians(args[0]);
          let stack = p._renderer.matrixStack;
          let m = last(stack);
          let sm = new p5.Matrix();
          sm.mat4[1] = Math.tan(rad);
          sm.mult(m);
          stack[stack.length - 1] = sm;
        }
        shearYNative.apply(p, args);
      };
    }


    if (p.applyMatrix instanceof Function) {
      let applyMatrixNative = p.applyMatrix;
      p.applyMatrix = function(...args) {
        if (context == R_2D) {
          let stack = p._renderer.matrixStack;
          let m = last(stack);
          let sm = new p5.Matrix();
          sm.mat4[0] = args[0];
          sm.mat4[1] = args[1];
          sm.mat4[4] = args[2];
          sm.mat4[5] = args[3];
          sm.mat4[12] = args[4];
          sm.mat4[13] = args[5];
          sm.mult(m);
          stack[stack.length - 1] = sm;
        }
        applyMatrixNative.apply(p, args);
      };
    }


    if (p.push instanceof Function) {
      let pushNative = p.push;
      p.push = function(...args) {
        if (context == R_2D) {
          let m = last(p._renderer.matrixStack);
          p._renderer.matrixStack.push(m.copy());
        }
        pushNative.apply(p, args);
      };
    }
    if (p.pop instanceof Function) {
      let popNative = p.pop;
      p.pop = function(...args) {
        if (context == R_2D) p._renderer.matrixStack.pop();
        popNative.apply(p, args);
      };
    }



    p.screenPosition = function(x, y, z) {
      if (x instanceof p5.Vector) {
        let v = x;
        x = v.x;
        y = v.y;
        z = v.z;
      } else if (x instanceof Array) {
        let rg = x;
        x = rg[0];
        y = rg[1];
        z = rg[2] || 0;
      }
      z = z || 0;

      if (context == R_2D) {
        let m = last(p._renderer.matrixStack);
        // probably not needed:
        // let mInv = (new p5.Matrix()).invert(m);

        let v = p.createVector(x, y, z);
        let vCanvas = multMatrixVector(m, v);
        // console.log(vCanvas);
        return vCanvas;

      } else {
        let v = p.createVector(x, y, z);

        // Calculate the ModelViewProjection Matrix.
        let mvp = (p._renderer.uMVMatrix.copy()).mult(p._renderer.uPMatrix);

        // Transform the vector to Normalized Device Coordinate.
        let vNDC = multMatrixVector(mvp, v);

        // Transform vector from NDC to Canvas coordinates.
        let vCanvas = p.createVector();
        vCanvas.x = 0.5 * vNDC.x * p.width;
        vCanvas.y = 0.5 * -vNDC.y * p.height;
        vCanvas.z = 0;

        return vCanvas;
      }

    }


    // helper functions ---------------------------

    function last(arr) {
      return arr[arr.length - 1];
    }

    function getObjectName(obj) {
      var funcNameRegex = /function (.{1,})\(/;
      var results = (funcNameRegex).exec((obj).constructor.toString());
      return (results && results.length > 1) ? results[1] : "";
    };


    /* Multiply a 4x4 homogeneous matrix by a Vector4 considered as point
     * (ie, subject to translation). */
    function multMatrixVector(m, v) {
      if (!(m instanceof p5.Matrix) || !(v instanceof p5.Vector)) {
        p5Inst.print('multMatrixVector : Invalid arguments');
        return;
      }

      var _dest = p.createVector();
      var mat = m.mat4;

      // Multiply in column major order.
      _dest.x = mat[0] * v.x + mat[4] * v.y + mat[8] * v.z + mat[12];
      _dest.y = mat[1] * v.x + mat[5] * v.y + mat[9] * v.z + mat[13];
      _dest.z = mat[2] * v.x + mat[6] * v.y + mat[10] * v.z + mat[14];
      var w = mat[3] * v.x + mat[7] * v.y + mat[11] * v.z + mat[15];

      if (Math.abs(w) > Number.EPSILON) {
        _dest.mult(1.0 / w);
      }

      return _dest;
    }

  }

  //end: screen-position}}}

  //begin: lib.js
  // ####################################
  //  Declaration of Variables {{{

  // debugging
  // let DEBUGMODE = true;
  let DEBUGMODE = false;
  p5.disableFriendlyErrors = !DEBUGMODE;
  let DEBUGFUNCS;
  function debugprint(...args) {
    if (DEBUGMODE) {
      p5Inst.print("### DEBUG (begin) ###");
      for (const arg of args) {
        p5Inst.print(JSON.stringify(arg));
      }
      p5Inst.print("### DEBUG (end) ###");
    }
  }


  let PIXELDENSITY = 2;
  let CANVASASPECT;

  // }}}

  // ####################################

  // ####################################
  // Utilities {{{

  function convertMap2Object(map) {
    const obj = {}
    for (let [k, v] of map)
      obj[k] = v
    return obj
  }




  const getSizeInBytes = obj => {// {{{
    let str = null;
    if (typeof obj === 'string') {
      // If obj is a string, then use it
      str = obj;
    } else {
      // Else, make obj into a string
      str = JSON.stringify(obj);
    }
    // Get the length of the Uint8Array
    const bytes = new TextEncoder().encode(str).length;
    return bytes;
  };// }}}


  // Definiton of 3 linesyles/ strokePatterns avialable via html5Canvas but not from p5.js 
  function strokePattern(pattern) {
    // pattern: alternating number of pixels with the "pen on" and "pen off" the canvas
    drawingContext.setLineDash(pattern);
  }
  let DASHED = [5, 5];
  let DOTTED = [2];
  let SOLID = [];


  function pointOnCircle(m, r, phi) {
    return vadd(m, p5Inst.createVector(r * cos(phi), r * sin(phi)))
  }

  p5.prototype.mouseVec = function() {
    return this.createVector(this.mouseX, this.mouseY)
  }

  class Clickable {// {{{
    static allClickables = new Map();

    constructor(label) {
      this.isClicked = false;
      if (this.constructor == Clickable) {
        throw new Error("Abstract class Movable cannot be instantiated.");
      }


      if (Clickable.allClickables.has(label)) {
        let old = Clickable.allClickables.get(label);
        this.isClicked = old.isClicked;
      }

      Clickable.allClickables.set(label, this);
    }

    area() {
      throw new Error("Abstract Method has to be implemented");
    }

    mouseInArea() {
      throw new Error("Abstract Method has to be implemented");
    }

    mousePressed() {
      if (this.mouseInArea()) this.isClicked = true;
      return this.isClicked
    }

    mouseReleased() { this.isClicked = false; }

  }// }}}

  class clickTriangle extends Clickable {// {{{
    constructor(x0, y0, x1, y1, x2, y2, buffer, label) {
      super(label);
      this.xy0 = [x0, y0];
      this.xy1 = [x1, y1];
      this.xy2 = [x2, y2];
      this.label = label;
      this.buffer = buffer;
    }

    area() {
      return [...this.xy0, ...this.xy1, ...this.xy2]
    }
    mouseInArea() {
      let mouseX = p5Inst.mouseX;
      let mouseY = p5Inst.mouseY;
      let buffer = p5Inst;
      if (this.buffer != null) {
        buffer = this.buffer;
        let bufTrafo = canvasBuffer.rF.T(buffer);
        [mouseX, mouseY] = bufTrafo.PP(mouseX, mouseY).xy;
        // p5Inst.print("position-mouse:", this.label, mouseX,mouseY);
        // p5Inst.print("position-rect:", this.area());
        // p5Inst.print("position-rect:", this.rect);
        // p5Inst.print("position-result:",buffer.collidePointRect(mouseX,mouseY,...this.rect));
      }
      return buffer.collidePointTriangle(mouseX, mouseY, ...this.tri)
    }

    get tri() {
      return this.area()
    }

  }//}}}
  class clickRect extends Clickable {// {{{
    constructor(x, y, width, height, buffer, label) {
      super(label);
      if (width < 0) x = x + height;
      if (height < 0) y = y + height;
      this.x = x;
      this.y = y;
      this.width = Math.abs(width);
      this.height = Math.abs(height);

      this.label = label;
      this.buffer = buffer;
    }

    area() {
      return [this.x, this.y, this.width, this.height]
    }
    mouseInArea() {
      let mouseX = p5Inst.mouseX;
      let mouseY = p5Inst.mouseY;
      let buffer = p5Inst;
      let pos = this.area().slice(0, 2);
      if (this.buffer != null) {
        buffer = this.buffer;
        let bufTrafo = canvasBuffer.rF.T(buffer);
        [mouseX, mouseY] = bufTrafo.PP(mouseX, mouseY).xy;
        // p5Inst.print("position-mouse:", this.label, mouseX,mouseY);
        // p5Inst.print("position-rect:", this.area());
        // p5Inst.print("position-rect:", this.rect);
        // p5Inst.print("position-result:",buffer.collidePointRect(mouseX,mouseY,...this.rect));
      }
      return buffer.collidePointRect(mouseX, mouseY, ...this.rect)
    }

    get rect() {
      return this.area()
    }

  }//}}}

  class Moveable {// {{{
    static allMoveables = [];
    static moveableCount = 0;
    static inFront() {
      let moved = Moveable.allMoveables
        .filter(m => m.mouseInArea())
        .filter(m => !m.isFrozen)
        .sort((a, b) => b.zorder - a.zorder)[0]
      return moved
    }

    constructor(label) {
      Moveable.moveableCount += 1
      this.label = label;
      if (label == null) this.label = `${Moveable.moveableCount}. Tile`;
      this.isDragged = false;
      this.isFrozen = false;
      this.offset2ReferencePoint = p5Inst.createVector(0, 0);
      if (this.constructor == Moveable) {
        throw new Error("Abstract class Moveable cannot be instantiated.");
      }
      this.zorder = Moveable.allMoveables.length;
      this.label
      Moveable.allMoveables.push(this);
    }

    mouseInArea() {
      throw new Error("Abstract Method has to be implemented");
    }

    updateReferencePoint(dx, dy) {
      throw new Error("Abstract Method has to be implemented");
    }

    get referencePoint() {
      throw new Error("Abstract Method has to be implemented");
    }

    set referencePoint(vector) {
      throw new Error("Abstract Method has to be implemented");
    }


    mousePressed() {

      if (this.mouseInArea()) {
        this.isDragged = true;
        this.offset2ReferencePoint = p5Inst.createVector(
          p5Inst.mouseX - this.referencePoint.x,
          p5Inst.mouseY - this.referencePoint.y);

        // print(`mouseX = ${p5Inst.mouseX}, mouseY = ${p5Inst.mouseY}`);
        // print(this);
        return true

      }

      return false

    }

    mouseDragged() {
      if (this.isDragged) {
        // print(`mouseX = ${p5Inst.mouseX}, mouseY = ${p5Inst.mouseY}`);
        // print(`refX = ${this.offset2ReferencePoint.x}, refY = ${this.offset2ReferencePoint.y}`);
        let dx = p5Inst.mouseX - this.offset2ReferencePoint.x;
        let dy = p5Inst.mouseY - this.offset2ReferencePoint.y;
        // print(`dx = ${dx}, dy = ${dy}`)
        this.referencePoint = this.updateReferencePoint(dx, dy);
        // print("updated", this);
        return false
      }

    }

    mouseReleased() {
      this.isDragged = false;
    }

  }// }}}




  // example implementation of the Moveable 'Interface'
  // class movableRect extends Moveable {// {{{
  //   constructor(x0, y0, w, h) {
  //     super();
  //     this.x0 = x0;
  //     this.y0 = y0;
  //     this.w = w;
  //     this.h = h;
  //   }

  //   get referencePoint() {
  //     return p5Inst.createVector(this.x0, this.y0)
  //   }

  //   set referencePoint(vector) {
  //     this.x0 = vector.x;
  //     this.y0 = vector.y
  //   }

  //   mouseInArea() {
  //     return p5Inst.collidePointRect(p5Inst.mouseX, p5Inst.mouseY,
  //       this.x0, this.y0, this.w, this.h)
  //   }

  //   updateReferencePoint(dx, dy) {
  //     // print(this.referencePoint.x, this.referencePoint.y );
  //     // print(this.referencePoint.x + dx, this.referencePoint.y + dy);
  //     return p5Inst.createVector(dx, dy)
  //   }

  //   draw() {rect(this.x0, this.y0, this.w, this.h);

  //   }

  // }// }}}

  // functions for p5.Vectors
  function vdraw(vector, strokeWeight = 2, strokeColor = "#000") {//{{{
    p5Inst.push();

    let triangleSide = (10 + 2 * strokeWeight)
    let triangleHeight = triangleSide / 2 * p5Inst.sqrt(3)

    let vectorAngle = p5Inst.createVector(0, -1).angleBetween(vector);

    p5Inst.translate(vector.x, vector.y)
    p5Inst.rotate(vectorAngle);
    p5Inst.translate(-vector.x, -vector.y)
    p5Inst.noStroke();
    p5Inst.fill(strokeColor);
    p5Inst.triangle(
      vector.x, vector.y,
      vector.x - triangleSide / 2, vector.y + triangleHeight,
      vector.x + triangleSide / 2, vector.y + triangleHeight);

    p5Inst.stroke(strokeColor);
    p5Inst.strokeWeight(strokeWeight);
    p5Inst.strokeCap(p5Inst.SQUARE);
    p5Inst.line(vector.x, vector.y + vector.mag(), vector.x, vector.y + triangleHeight);
    p5Inst.pop();
  }//}}}

  let vadd = p5.Vector.add;
  let vsub = p5.Vector.sub;
  let vmult = p5.Vector.mult;
  let vnorm = p5.Vector.mag;
  let vdist = p5.Vector.dist;
  let vlerp = p5.Vector.lerp;
  p5.Vector.prototype.__defineGetter__("xy", function() { return [this.x, this.y] });
  p5.Vector.prototype.__defineGetter__("xz", function() { return [this.x, this.z] });
  p5.Vector.prototype.__defineGetter__("yz", function() { return [this.y, this.z] });
  p5.Vector.prototype.__defineGetter__("xyz", function() { return this.array() });

  // matrix classes to ease the tranformaiton between referenceFrames 
  //@improvment @refactor: the 3DMatrix multiplication is functional but unnecessarly complex
  class Matrix2D {//{{{
    constructor(a, b, c, d) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.entries = [a, b, c, d];
      this.rows = [p5Inst.createVector(a, b), p5Inst.createVector(c, d)];
    }
    get det() {
      return this.a * this.d - this.c * this.b
    }
    get inv() {
      return new Matrix2D(...([this.d, -this.b, -this.c, this.a].map(x => x / this.det)))
    }

    get transpose() {
      return new Matrix2D(this.a, this.c, this.b, this.d)
    }

    get T() {
      return this.transpose
    }

    toString() {
      return `[${this.a}, ${this.b}]\n[${this.c}, ${this.d}]`
    }
    dot(vector) {
      return this.rows.map(row => p5.Vector.dot(row, p5Inst.createVector(...vector))).slice(0, 2)
    }



    mult(matrix2d) {
      let product = [];
      let transposed = matrix2d.transpose;
      product.push(...this.dot(transposed.rows[0].array()));
      product.push(...this.dot(transposed.rows[1].array()));
      return new Matrix2D(...product).T
    }

  }//}}}

  class Matrix {//{{{
    constructor(matrix2D, translation) {

      this.matrix2D = matrix2D;
      this.M = matrix2D.entries;
      this.translation = translation;
      this.b = translation;

      this.rows = [
        p5Inst.createVector(this.M[0], this.M[1], this.b[0]),
        p5Inst.createVector(this.M[2], this.M[3], this.b[1]),
        p5Inst.createVector(0, 0, 1)];
    };

    get det() {
      return this.matrix2D.det
    }


    get inv() {
      return new Matrix(this.matrix2D.inv, this.matrix2D.inv.dot(this.translation).map(x => -x));
    }

    dot(vector) {
      return p5Inst.createVector(...this.rows.map(row => p5.Vector.dot(row, vector)))
    }

    //@improvment: Why am I splitting this up ... should be a 3d matrix multipliciton
    mult(matrix) {
      let productM = this.matrix2D.mult(matrix.matrix2D);
      let productb = vadd(p5Inst.createVector(...this.translation), this.dot(p5Inst.createVector(...matrix.translation))).xy;
      return new Matrix(productM, productb)
    }



    toString() {
      return this.rows.map(row => {
        return row.toString().split(":")[1].trim()
      }).join("\n")
    }


  }//}}}

  // plain-javascript-array functions
  function arrayUnique(arr) {
    let unique = [];
    arr.forEach((elem, i) => {
      if (!(unique.slice().map(it => it.toString()).includes(elem.toString()))) unique.push(elem);
    })
    return unique
  }
  function arrayToString(arr) { return `[${arr.toString()}]` }
  // Array.prototype.last = function() {
  //   return this[this.length - 1]
  // }
  function range(from, until) {
    let num = until - from;
    let arr = [...Array(num).keys()].map(it => it + from)
    return arr
  }

  function cartesianProduct(array1, array2) {
    let result = [];
    for (var it of array1) {
      for (var jt of array2) {
        result.push([it, jt])
      }
    }
    return result
  }

  function all(arr, value = true) {
    return arr.map((it) => (it == value)).reduce((prev, cur) => prev && cur)
  }
  function any(arr, value = true) {
    return arr.map((it) => (it == value)).reduce((prev, cur) => prev || cur)
  }
  function sum(arr) {
    if (arr.length == 0) return 0;
    return arr.reduce((prev, cur) => prev + cur)
  }
  function cumSum(arr) {
    let result = [];
    let val = 0;
    arr.forEach((elem, i) => {
      val = val + abs(elem);
      result.push(val);
    });
    return result
  }

  function mean(arr) {
    return sum(arr) / arr.length
  }
  function prod(arr) {
    if (arr.length == 0) return 0;
    return arr.reduce((prev, cur) => prev * cur)
  }
  const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]

  const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
  const argMin = argFact((max, el) => (el[0] < max[0] ? el : max))
  // property functions 
  function isString(arg) {
    return Object.prototype.toString.call(arg) === "[object String]"
  }

  // floats compare function 
  function isClose(value1, value2, abseps = 1e-6) {
    return abs(value1 - value2) < abseps
  }


  function withContexts(contexts, buffer = undefined) {// {{{
    if (isString(contexts)) { contexts = [contexts]; }

    if (buffer == undefined) { buffer = window; }

    return (actions) => {
      buffer.push();
      for (var ctx of contexts) {
        drawingContexts.get(ctx)(buffer);
      }
      actions(buffer);
      buffer.pop();
    }
  }// }}}


  function pointOnCircle(m, r, phi) {
    return vadd(m, p5Inst.createVector(r * cos(phi), r * sin(phi)))
  }

  function nPointsOnCircle(n, m, r, phi0 = 0) {
    return [...Array(n).keys()].map(it => {
      let phi = 2 * Math.PI * it / n + phi0;
      return vadd(m, p5Inst.createVector(r * cos(phi), r * sin(phi)))
    })
  }

  // Debug stuff {{{
  function pushDEBUGFUNC(func) {
    if (p5Inst.frameCount == 0 || p5Inst.frameCount == 1) {

      DEBUGFUNCS.push(func)
    }
  }

  function drawDebugBuffer(drawFrames) {
    if (drawFrames) {
      for (let frame of Frame.allFrames) {
        frame.drawFrame();
      }
    }
    debugbuffer.push();
    debugbuffer.textSize(20);
    frameRateTime[p5Inst.frameCount % 32] = p5Inst.frameRate();

    debugbuffer.push();
    debugbuffer.translate(...debugbuffer.rF.P(0, -0.25).xy);
    debugbuffer.push();
    if (mean(frameRateTime).toFixed(3) > 45) { debugbuffer.fill(p5Inst.color(0, 230, 20)) };
    if (mean(frameRateTime).toFixed(3) < 45) { debugbuffer.fill(p5Inst.color(240, 120, 120)) };
    if (mean(frameRateTime).toFixed(3) < 30) { debugbuffer.fill(p5Inst.color(240, 0, 20)) };
    debugbuffer.text(`FR:${mean(frameRateTime).toFixed(3)}\nFC:${p5Inst.frameCount}`, ...debugbuffer.rF.P(0.825, 0.9).xy);
    debugbuffer.pop();

    debugbuffer.text(`Aspect:${p5Inst.canvas.offsetWidth}:${p5Inst.canvas.offsetHeight}=${(p5Inst.canvas.offsetWidth / p5Inst.canvas.offsetHeight).toFixed(3)}`, ...canvasBuffer.rF.P(0.825, 0.96).xy)

    debugbuffer.push();
    debugbuffer.textSize(16);

    debugbuffer.text(`CubeCount:${JSON.stringify(convertMap2Object(CUBECOUNT), null, ' ')}`, ...debugbuffer.rF.P(0.825, 0.98).xy);
    debugbuffer.pop();

    debugbuffer.pop();
    // debugbuffer.noFill();
    // debugbuffer.rect(...canvasBuffer.rF.P(0.025, 0.025).xy, ...canvasBuffer.rF.P(0.075, 0.1).xy);
    // if (DEBUGMODE && (p5Inst.frameCount > 5000)) { location.reload() };

    debugbuffer.pop();
    for (var funcs of DEBUGFUNCS) {
      debugbuffer.push();
      funcs(debugbuffer);
      debugbuffer.pop();
    }




  }// }}}


  function maskBuffer(buffer, areaVertices) {
    mask = p5Inst.createGraphics(buffer.width, buffer.height);
    mask.pixelDensity(buffer.pixelDensity());
    mask.background(p5Inst.color('#0000'));
    mask.fill(p5Inst.color('#000F'));
    mask.noStroke();
    mask.beginShape();
    areaVertices.forEach((it) => mask.vertex(...it));
    mask.endShape(p5Inst.CLOSE);
    buffer.mask(mask)

    return buffer


  }




  // }}}
  // ####################################

  // ####################################
  // Recources   {{{

  function DEBUGCOLOR(alpha = 100) {
    return p5Inst.color(200, 0, 0, alpha);
  }

  // definitions of resources
  let colors_birch = new Map([
    ["light", "#ddd1b1"],
    ["lighter", "#dbd2ad"],
    ["normal", "#ccc19f"],
    ["darker", "#bbb08e"],
    ["dark", "#a19477"],
    ["darkest", "#584937"],
    ["reddark", "#543737"]
  ])


  let colors_greens = new Map([
    ["base-25", "#638149"],
    ["base-20", "#6f9252"],
    ["base-15", "#7ca25c"],
    ["base-10", "#89ac6b"],
    ["base-5", "#96b57c"],
    ["base", "#a3be8c"],
    ["base+5", "#b0c79c"],
    ["base+10", "#bdd0ad"],
    ["base+15", "#cadabd"],
    ["base+20", "#d7e3cd"],
    ["base+25", "#e4ecdd"],
  ])

  let colors_blues = new Map([
    ["base-25", "#2f435b"],
    ["base-20", "#384f6c"],
    ["base-15", "#405c7d"],
    ["base-10", "#49688e"],
    ["base-5", "#52749f"],
    ["base", "#5e81ac"],
    ["base+5", "#6f8eb5"],
    ["base+10", "#809bbd"],
    ["base+15", "#90a9c6"],
    ["base+20", "#a1b6cf"],
    ["base+25", "#b2c3d7"],
  ])

  let drawingContexts = new Map([
    ["debug",
      (B) => { B.stroke(DEBUGCOLOR(150)); B.fill(DEBUGCOLOR(150)); }],
    ["seesaw",
      (B) => { B.fill(seesawSettings.board.color); B.strokeWeight(1); }],
    ["scaleDisplayText",
      (B) => {
        B.textAlign(p5Inst.CENTER), B.textSize(25);
        // B.fill(p5Inst.color(colors_birch.get("reddark")));
        // B.stroke(p5Inst.color(colors_birch.get("reddark")));

        // B.fill(p5Inst.color(colors_birch.get("reddark")));
        // B.stroke(p5Inst.color(colors_birch.get("reddark")));
        B.fill(0);
        B.stroke(0);
        // B.fill(p5Inst.color(colors_birch.get("darkest"))); 
        // B.stroke(p5Inst.color(colors_birch.get("darkest")));
        B.strokeWeight(1.25);
      }]
  ])

  // }}}
  // ####################################

  // ####################################
  // Cubes / CubeStack {{{




  // ####################################

  // ####################################
  // Canvas / Buffer / Frames {{{

  class Frame {// {{{
    static allLabels = new Map([]);
    static allFrames = [];
    static deferredDraws = [];
    static transformMatricies = new Map([]);

    static initCanvas() {
      return new Frame("Canvas", 0, 0, 1.0, 1.0);
    }

    constructor(label, frameRX, frameRY, frameRWidth, frameRHeight) {//{{{
      if (Frame.allFrames.length == 0 && label != "Canvas") {
        console.error("The canvas must be the first Frame created, with the label 'Canvas'! Call Frame.initCanvas() before creating other instances of this class.");
      }


      //@refactor: remove canvasBuffer and replace it by Frame.allFrames[0] (the canvas)
      this.id = (Frame.allFrames.length == 0) ? 0 : Frame.allFrames[Frame.allFrames.length - 1].id + 1;
      this.label = label;

      //this.randomNumber = random(-10, 10);
      //frameColor = p5Inst.color(random(0, 255), 100, 100, 55);
      // this.frameColor.mode = "hsl";

      this.offset = (this.label != "Canvas") ? canvasBuffer.rF.P(frameRX, frameRY).xy : [0, 0];
      this.b = this.offset;

      this.size = (this.label != "Canvas") ? canvasBuffer.rF.P(frameRWidth, frameRHeight) : p5Inst.createVector(p5Inst.canvas.offsetWidth, p5Inst.canvas.offsetHeight);
      this.width = this.size.x;
      this.height = this.size.y;


      this.oTrafoMatrix = new Matrix(new Matrix2D(this.width, 0, 0, this.height), this.offset)
      this.oM = new Matrix(new Matrix2D(this.width, 0, 0, this.height), this.offset)

      this.iTrafoMatrix = new Matrix(new Matrix2D(this.width, 0, 0, this.height), [0, 0])
      this.iM = new Matrix(new Matrix2D(this.width, 0, 0, this.height), [0, 0])

      Frame.allFrames[this.id] = this;
      Frame.allLabels.set(label, this.id);

    }//}}}

    delete() {
      //@improvement: handle return values?

      if (this.label == "Canvas") {
        console.error("The Frame for the Canvas must not be deleted");
      }
      Frame.allLabels.delete(this.label);
      delete Frame.allFrames[this.id]
    }


    P(RX, RY) {
      let position = this.iTrafoMatrix.dot(p5Inst.createVector(RX, RY, 1)).xy;
      return p5Inst.createVector(...position);
    }

    Px(RX) {
      return this.P(RX, 0).x
    }

    Py(RY) {
      return this.P(0, RY).y
    }


    Dx(RX1, RX2) {
      return this.P(RX2, 0).x - this.P(RX1, 0).x
    }

    Dy(RY1, RY2) {
      return this.P(0, RY2).y - this.P(0, RY1).y
    }


    D(RX1, RY1, RX2, RY2) {
      return p5Inst.createVector(this.Dx(RX1, RX2), this.Dy(RY1, RY2))
    }

    // this is way to complicated to remember => use trafos
    // // returns the abolute 'outer' coordinate 
    // //shorthand for: cubeStackSplit.rF.tR2P(canvasBuffer)(0.5, 0.5).xy)
    // oP(RX, RY, asVector = false) {
    //   let position = this.oTrafoMatrix.dot(p5Inst.createVector(RX, RY, 1)).xy;
    //   if (asVector) return p5Inst.createVector(...position);
    //   return position
    // }

    // returns the relative 'inner' Coordinate for a given relative 'inner' coordinate
    R(PX, PY) {
      let coords = this.iTrafoMatrix.inv.dot(p5Inst.createVector(PX, PY, 1)).xy;
      return p5Inst.createVector(...coords);
    }

    Rx(PX) {
      return this.R(PX, 0).x
    }

    Ry(PY) {
      return this.R(0, PY).y
    }

    // this is way to complicated to rememeber => use trafos
    // // returns the relative 'inner' Coordinate for a given absolute 'outer' coordinate
    // // shorthand for:   canvasBuffer.rF.tP2R(cubeStackSplit)(PX,PY);
    // oR(PX, PY, asVector = false) {
    //   let coords = this.oTrafoMatrix.inv.dot(p5Inst.createVector(PX, PY, 1)).xy;
    //   if (asVector) return p5Inst.createVector(...coords);
    //   return coords
    // }



    drawFrame(buffer) {// {{{
      if (buffer == undefined) { buffer = debugbuffer };
      buffer.push();
      buffer.stroke(0);
      // strokePattern(DASHED);

      buffer.strokeWeight(2);

      buffer.fill(p5Inst.color("#9995"));
      buffer.rect(...this.offset, this.width, this.height);

      // textBuffer.strokeWeight(1.2);
      buffer.strokeWeight(1.0);
      // strokePattern(SOLID);
      // textBuffer.fill(0);
      // textBuffer.textSize(18);
      // textBuffer.textAlign(p5Inst.CENTER);
      buffer.stroke(0);
      buffer.fill(0);

      buffer.textSize(20);
      // textAlign(p5Inst.CENTER);
      // let framelabel = `Frame#${this.id}: "${this.label}"`;
      // rectMode(p5Inst.CENTER);
      // let labelHeight = textAscent(framelabel) + textDescent(framelabel);
      // let labelWidth = p5Inst.textWidth(framelabel);
      // fill(255);
      // rect(...this.P(0.50, 0.05), labelWidth, labelHeight);
      // buffer.fill(0);
      let textpos = this.transformP2P(buffer)(25, 25 + 20 * this.id);
      buffer.line(...this.offset, textpos.x, textpos.y);
      buffer.text(`#${this.id}:${this.label}`, ...textpos.xy);

      buffer.pop();

    }// }}}

    static getFrameObject(obj) {// {{{
      if (obj instanceof Frame) {
        return obj
      }
      if (obj.hasOwnProperty("refFrame") || obj.hasOwnProperty("rF")) {
        return obj.refFrame
      }
      throw new Error("The given Object is neither an instanceof `Frame` nor has a property called `refFrame`/`rF`!");

    }// }}}


    static transformationLabel(src, srcType, dest, destType) {
      return `${src.label}${srcType}:${dest.label}${destType}`;
    }

    static transformationLabelInv(transformationlabel) {
      return transformationlabel.split(":").reverse().join(":")
    }

    static inv(transformation) {
      let tl = transformation.transformationlabel;

      let matrix, trafo;
      let tlinv = Frame.transformationLabelInv(tl);
      if (!Frame.transformMatricies.has(tlinv)) {
        throw new Error(`This should not happen: No inverse trafo for ${tl}=${tlinv} found!`)
      }

      matrix = Frame.transformMatricies.get(tlinv);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = tlinv;
      return trafo
    }

    transformation(dest) {
      dest = Frame.getFrameObject(dest);

      let rr = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "R", dest, "R");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {

          // print(transformationlabel);
          // print(this.oM.toString());
          // print(dest.oM.inv.mult(this.oM).toString());
          matrix = dest.oM.inv.mult(this.oM);
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      let rp = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "R", dest, "P");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {

          // print(transformationlabel);
          // print(this.oM.toString());
          // print(dest.oM.inv.mult(this.oM).toString());
          // print(dest.iM.mult(dest.oM.inv.mult(this.oM)).toString());
          matrix = dest.iM.mult(dest.oM.inv.mult(this.oM));
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      let pp = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "P", dest, "P");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {
          // print(transformationlabel);
          // print(this.iM.inv.toString());
          // print(this.oM.mult(this.iM.inv).toString());
          // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
          // print(dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv))).toString());

          matrix = dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv)));
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      let pr = (dest) => {// {{{
        let transformationlabel = Frame.transformationLabel(this, "P", dest, "R");
        let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
        let matrix, trafo;
        if (!Frame.transformMatricies.has(transformationlabel)) {

          // print(transformationlabel);
          // print(this.iM.inv.toString());
          // print(this.oM.mult(this.iM.inv).toString());
          // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
          matrix = dest.oM.inv.mult(this.oM.mult(this.iM.inv));
          Frame.transformMatricies.set(transformationlabel, matrix)
          Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
        }

        matrix = Frame.transformMatricies.get(transformationlabel);
        trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
        trafo.transformationlabel = transformationlabel;
        trafo.inv = Frame.inv(trafo);
        return trafo
      }// }}}

      return {
        RR: rr(dest), RP: rp(dest), PP: pp(dest), PR: pr(dest),
      }
    }

    T = this.transformation;


    transformR2R(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "R", dest, "R");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {

        // print(transformationlabel);
        // print(this.oM.toString());
        // print(dest.oM.inv.mult(this.oM).toString());
        matrix = dest.oM.inv.mult(this.oM);
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    //shorthand function name for transformR2R
    tR2R(dest) {
      return this.transformR2R(dest);
    }

    transformR2P(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "R", dest, "P");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {

        // print(transformationlabel);
        // print(this.oM.toString());
        // print(dest.oM.inv.mult(this.oM).toString());
        // print(dest.iM.mult(dest.oM.inv.mult(this.oM)).toString());
        matrix = dest.iM.mult(dest.oM.inv.mult(this.oM));
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    tR2P(dest) {
      return this.transformR2P(dest);
    }


    transformP2P(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "P", dest, "P");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {
        // print(transformationlabel);
        // print(this.iM.inv.toString());
        // print(this.oM.mult(this.iM.inv).toString());
        // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
        // print(dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv))).toString());

        matrix = dest.iM.mult(dest.oM.inv.mult(this.oM.mult(this.iM.inv)));
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    tP2P(dest) {
      return this.transformP2P(dest);
    }

    transformP2R(dest) {
      dest = Frame.getFrameObject(dest);
      let transformationlabel = Frame.transformationLabel(this, "P", dest, "R");
      let transformationlabelinv = Frame.transformationLabelInv(transformationlabel);
      let matrix, trafo;
      if (!Frame.transformMatricies.has(transformationlabel)) {

        // print(transformationlabel);
        // print(this.iM.inv.toString());
        // print(this.oM.mult(this.iM.inv).toString());
        // print(dest.oM.inv.mult(this.oM.mult(this.iM.inv)).toString());
        matrix = dest.oM.inv.mult(this.oM.mult(this.iM.inv));
        Frame.transformMatricies.set(transformationlabel, matrix)
        Frame.transformMatricies.set(transformationlabelinv, matrix.inv);
      }

      matrix = Frame.transformMatricies.get(transformationlabel);
      trafo = (RX, RY) => { return matrix.dot(p5Inst.createVector(RX, RY, 1)) };
      trafo.transformationlabel = transformationlabel;
      trafo.inv = Frame.inv(trafo);
      return trafo
    }

    tP2R(dest) {
      return this.transformP2R(dest);
    }
  }
  // }}}

  function setupCanvas(parentId = 'sketch', bgcolor = "#FFFFFFFF", pixel_density = 2) {//{{{
    let htmlSketch = document.getElementById("defaultCanvas0").parentElement;//document.getElementById(parentId);
    htmlSketch.id = parentId;
    // print(htmlSketch);
    // sketchDiv = createDiv();
    // sketchDiv.elt.id = "scaledsketch";
    // sketchDiv.parent(parentId)
    // sketchDiv.elt.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
    // sketchDiv.elt.offsetHeight = htmlSketch.offsetHeight;
    // sketchDiv.offsetWidth = htmlSketch.offsetHeight*CANVASASPECT;
    // sketchDiv.offsetHeight = htmlSketch.offsetHeight;

    let currentCanvas = p5Inst.createCanvas(Math.ceil(htmlSketch.offsetHeight * CANVASASPECT), htmlSketch.offsetHeight);
    currentCanvas.position((htmlSketch.offsetWidth - htmlSketch.offsetHeight * CANVASASPECT) / 2, 0);
    // print(htmlSketch.offsetWidth, htmlSketch.offsetHeight);
    //sketchDiv.position(currentCanvas.offsetWidth/2, 0);
    currentCanvas.parent(parentId);
    // print(sketchDiv);

    currentCanvas.trafoMatrix = new Matrix(new Matrix2D(htmlSketch.offsetWidth, 0, 0, htmlSketch.offsetHeight), [0, 0])

    currentCanvas.coords = function(coordX, coordY) {
      return this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy
    };
    currentCanvas.coordsVec = function(coordX, coordY) {
      return p5Inst.createVector(...this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy, 0)
    };
    currentCanvas.coordsInv = function(pixelX, pixelY) {
      return this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy
    };
    currentCanvas.coordsInvVec = function(pixelX, pixelY) {
      return p5Inst.createVector(...this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy, 0)
    };
    addScreenPositionFunction(p5Inst);
    currentCanvas.refFrame = Frame.initCanvas();
    currentCanvas.__defineGetter__('rF', function() { return this.refFrame; })
    p5Inst.pixelDensity(pixel_density);
    p5Inst.background(p5Inst.color(1));

    currentCanvas.Rsize = function(cube) { return cube.Rsize(this) }
    return currentCanvas
  }//}}}
  let allBuffers = {};
  function setupBuffer(label, bufferCoordX, bufferCoordY, bufferCoordWidth, bufferCoordHeight, bgcolor = "#FFFFFFFF", pixel_density = 2) {//{{{


    let frame = new Frame(label, bufferCoordX, bufferCoordY, bufferCoordWidth, bufferCoordHeight);

    let offset = canvasBuffer.rF.P(bufferCoordX, bufferCoordY).xy;
    let bufferSize = canvasBuffer.rF.P(bufferCoordWidth, bufferCoordHeight);
    // print(`${label}; bufferSize = ${ bufferSize } `);
    let buffer = p5Inst.createGraphics(bufferSize.x, bufferSize.y);

    // print(buffer.width);
    buffer.trafoMatrix2Canvas = new Matrix(new Matrix2D(buffer.width, 0, 0, buffer.height), offset)
    buffer.trafoMatrix = new Matrix(new Matrix2D(buffer.width, 0, 0, buffer.height), [0, 0])

    buffer.coords = function(coordX, coordY) {
      return this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy
    };
    buffer.coordsVec = function(coordX, coordY) {
      return p5Inst.createVector(...this.trafoMatrix.dot(p5Inst.createVector(coordX, coordY, 1)).xy, 0)
    };
    buffer.coordsInv = function(pixelX, pixelY) {
      return this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy
    };
    buffer.coordsInvVec = function(pixelX, pixelY) {
      return p5Inst.createVector(...this.trafoMatrix.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy, 0)
    };
    buffer.coordsCanvas = function(coordX, coordY) {
      return this.trafoMatrix2Canvas.dot(p5Inst.createVector(coordX, coordY, 1)).xy
    };
    buffer.coordsCanvasVec = function(coordX, coordY) {
      return p5Inst.createVector(...this.trafoMatrix2Canvas.dot(p5Inst.createVector(coordX, coordY, 1)).xy, 0)
    };
    buffer.coordsCanvasInv = function(pixelX, pixelY) {
      return this.trafoMatrix2Canvas.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy
    };
    buffer.coordsCanvasInvVec = function(pixelX, pixelY) {
      return p5Inst.createVector(...this.trafoMatrix2Canvas.inv.dot(p5Inst.createVector(pixelX, pixelY, 1)).xy, 0)
    };
    buffer.drawImage = function(x, y) {
      let pos = (x == undefined && y == undefined) ? this.trafoMatrix2Canvas.b : [x, y];

      p5Inst.image(this, ...pos); this.clear()
    }
    buffer.drawImageUnclear = function(x, y) {
      let pos = (x == undefined && y == undefined) ? this.trafoMatrix2Canvas.b : [x, y];

      p5Inst.image(this, ...pos);
    }
    addScreenPositionFunction(buffer);

    buffer.refFrame = frame;
    buffer.__defineGetter__('rF', function() { return this.refFrame; })

    buffer.background(p5Inst.color(bgcolor));
    buffer.pixelDensity(pixel_density);
    // the attributes with default values are set by a method
    buffer.setbackground = function(bg = bgcolor) { this.background(bg) }
    buffer.setpixelDensity = function(pd = pixel_density) { buffer.pixel_density(pd) }
    buffer.Rsize = function(cube) { return cube.Rsize(this) }
    allBuffers[label] = buffer;
    return buffer
  }
  //}}}

  function generateBackgroundImages(bgImgsBuffer, cube, cubeStackTranslation, cubeStackSplit) {// {{{
    let bgImgLabels = [
      "bgImg-Split-1", "bgImg-Split-10", "bgImg-Split-100", "bgImg-Split-1000",
      "bgImg-Compact-1", "bgImg-Compact-10", "bgImg-Compact-100", "bgImg-Compact-1000"];

    //never save
    let bgImgsBase64 = null;//p5Inst.getItem(bgImgsLocalStorageLabel);
    let i = p5Inst.millis();
    // if ()
    if (bgImgsBase64 == null) {
      console.log("############### Generating #######################");
      let splitLabel, c, stack, pos;

      bgImgsBase64 = [];
      for (var label of bgImgLabels) {
        // bgImgsBuffer.setbackground("#1A51");
        splitLabel = label.split("-");
        stack = { type: splitLabel[1], size: parseInt(splitLabel[2]) };
        c = numcubeslike(stack.size, cube, "bgImages");

        pos = vsub(bgImgsBuffer.rF.size, vsub(cubeStackSplit.rF.size, cubeStackTranslation[stack.type]));

        bgImgsBuffer.push();
        bgImgsBuffer.translate(pos.x, pos.y);
        drawcubes(bgImgsBuffer, c, stack.size, stack.type == "Compact", true);

        bgImgsBuffer.pop();
        bgImgsBase64.push(bgImgsBuffer.canvas.toDataURL("png"));

        // console.log(bgImgsBuffer.canvas.toDataURL("png"))
        // bgImgsBuffer.save(`${stack.type}-${stack.size}.png`)
        bgImgsBuffer.clear();
      }
      // bgImgsBase64 = LZString.compress(bgImgsBase64.join('::'));
      // p5Inst.storeItem(bgImgsLocalStorageLabel, bgImgsBase64);

      let f = p5Inst.millis();
      p5Inst.print("timing bgImgs:", f - i);
    }

    // bgImgsBase64 = p5Inst.getItem(bgImgsLocalStorageLabel);
    bgImgs = bgImgsBase64.map(x => p5Inst.loadImage(x));//LZString.decompress(bgImgsBase64).split("::").map(x => p5Inst.loadImage(x));

    return {
      split: {
        I: bgImgs[0],
        X: bgImgs[1],
        C: bgImgs[2],
        M: bgImgs[3]
      },
      compact: {
        I: bgImgs[4],
        X: bgImgs[5],
        C: bgImgs[6],
        M: bgImgs[7]
      },
    }
  }// }}}




  //}}}
  // ####################################

  // ####################################
  // Sketch Components {{{


  //@refactor: add functions for the different App modes here, like the drawers in stack mode etc



  // ####################################

  // ####################################
  // ####################################

  // ####################################

  const DIRECTIONS = {
    SN: "South->North",
    NS: "North->South",
    WE: "West->East",
    EW: "East->West"
  }

  const ORIENTATIONS = {
    N: "North",
    E: "East",
    S: "South",
    W: "West",
  }

  function pointsNESW(point) {
    return [[0, 1], [1, 0], [0, -1], [-1, 0]].map((d) => [point[0] + d[0], point[1] + d[1]])
  }
  function pointsNESWRot45(point) {
    return [[0.5, 0.5], [0.5, -0.5], [-0.5, -0.5], [-0.5, 0.5]].map((d) => [point[0] + d[0], point[1] + d[1]])
  }



  function directions2Steps(edgeDirections) {

    let cSteps = []
    edgeDirections.forEach((dir, i) => {
      let [dirSign, d] = dir;
      if (i == 0) { cSteps.push(dirSign * 1); return }

      if (d == edgeDirections[i - 1][1]) {
        cSteps[cSteps.length - 1] = cSteps[cSteps.length - 1] + dirSign * 1;
      } else { cSteps.push(dirSign * 1) }
    })

    // if (reversed) return cSteps.slice().reverse().map(it => Math.abs(it) * (-1) * Math.sign(it));
    cSteps.splice(cSteps.length - 1, 1);
    return cSteps
  }

  function edgePoints2Directions(edgePoints) {
    let cEdgesDir = [];
    let edgePoints_ = edgePoints.slice();
    edgePoints_.push(edgePoints[0]);
    edgePoints_.slice(1).forEach(
      (C, i) => {
        // since there are only 4 directions anyway, rounding is not a problem
        let angle = parseInt(vsub(p5Inst.createVector(...C), p5Inst.createVector(...edgePoints_[i])).heading() / p5Inst.PI * 180);
        let dir;
        switch (angle) {
          case -90: dir = [+1, DIRECTIONS.NS];
            break;
          case 0: dir = [+1, DIRECTIONS.WE];
            break;
          case 90: dir = [-1, DIRECTIONS.SN];
            break;
          case 180: dir = [-1, DIRECTIONS.EW];
            break;
          default: print("ERROR IN ANGLES!,", angle);
            print("--------------------------------");
            print("edgePoints(_)\n", JSON.stringify(edgePoints), '\n', JSON.stringify(edgePoints_));
            print("→ edgePoint2Direction:", p5Inst.createVector(...C).xyz);
            print("→ edgePoint2Direction:", p5Inst.createVector(...edgePoints_[i]).xyz);
            print("→ edgePoint2Direction:", vsub(p5Inst.createVector(...C), p5Inst.createVector(...edgePoints_[i])).xyz);
            print("→ edgePoint2Direction:", vsub(p5Inst.createVector(...C), p5Inst.createVector(...edgePoints_[i])).heading());
            print("→ edgePoint2Direction:", vsub(p5Inst.createVector(...C), p5Inst.createVector(...edgePoints_[i])).heading() / p5Inst.PI * 180);
        }
        cEdgesDir.push(dir)
      })
    return cEdgesDir

  }

  function edgePoints2Steps(edgePoints) {
    let cEdgesDir = edgePoints2Directions(edgePoints);
    return directions2Steps(cEdgesDir);
  }

  class Tiles extends Moveable {// {{{

    static allTiles = [];

    static createTiles(location, steps, startDirection = "x", unit = [0.05, 1, "cm"], empty = false, edgelabels = false, frozen = false, zorder = null, resize = true, label = null) {
      return new Tiles(location, steps, startDirection, unit, empty, edgelabels, frozen, zorder, resize, label);
    }

    constructor(location, steps, startDirection = "x", unit = [0.05, 1, "cm"], empty = false, edgelabels = false, frozen = false, zorder = null, resize = true, label = null) {//{{{

      super(label);
      resize = (resize == undefined) ? true : resize;
      this.loc = location;
      this.startDirection = startDirection;// for use in the arguments of the childern after splitting
      this.unit = unit;// for use in the arguments of the childern after splitting
      this.pixelUnit = canvasBuffer.rF.P(unit[0], 0).x;
      this.displayUnit = { value: unit[1], name: unit[2] };
      if (!["x", "y"].includes(startDirection.toLowerCase())) {
        throw new Error(`Got '${startDirection}' as the startdirection, but start direction of a Tile has to be either 'x' or 'y'`)
      }
      this.startDirOffset = (startDirection.toLowerCase() == 'x') ? 0 : 1; // only x and y are possible
      if (any(steps.map(v => !Number.isInteger(v)))) {
        throw new TypeError(`Got ${JSON.stringify(steps)}, but steps have to be Array of Integers`);
      }

      if (DEBUGMODE) print("steps before:", steps, startDirection);
      let steps_ = [];
      steps.forEach((s, i) => {
        steps_.push(s * (-1) ** (i + this.startDirOffset));
      })
      steps = steps_;
      if (DEBUGMODE) print("steps after:", steps);
      this.steps = steps;
      this.stepsSummed = cumSum(this.steps.map(it => abs(it)));

      this.stepVerts = [[0, 0]]

      this.steps.forEach((step, i) => {
        let vert = [...this.stepVerts[this.stepVerts.length - 1]];
        vert[(i + this.startDirOffset) % 2] = vert[(i + this.startDirOffset) % 2] + step;
        this.stepVerts.push(vert)
        if (DEBUGMODE) print((i + this.startDirOffset), ((i + this.startDirOffset) % 2 == 0) ? "left/right" : "up/down");
      })

      let lastvertex = this.stepVerts[this.stepVerts.length - 1];
      // infer an additional vertex so that all edges are horizontal or vertical
      if ((lastvertex[0] != 0) && (lastvertex[1] != 0)) {
        let vert = [...lastvertex];
        let idx = (this.stepVerts.length - 1 + this.startDirOffset) % 2;
        // (vertices.length - 1) cause the last push in the loop extends it one more
        this.steps.push(-lastvertex[idx])
        vert[idx] = vert[idx] - lastvertex[idx];
        this.stepVerts.push(vert)
      }
      //might have changed 
      lastvertex = this.stepVerts[this.stepVerts.length - 1];
      this.steps.push(-1 * ((lastvertex[0] != 0) ? lastvertex[0] : lastvertex[1]));


      this.verts = this.stepVerts2Verts()
      this.verts_ = this.stepVerts2Verts_()

      let Xs = this.stepVerts.map(vert => vert[0]);
      let Ys = this.stepVerts.map(vert => vert[1]);
      this.boundingBox = [[min(...Xs), min(...Ys)], [max(...Xs), max(...Ys)]]
      this.boundingBoxCenter = [(min(...Xs) + max(...Xs)) * 0.5, (min(...Ys), max(...Ys)) * 0.5]


      this.edges = this.updateEdges()
      this.edgeDirections = []
      this.steps.forEach((step, i) => {
        let axis = (((this.startDirOffset + i) % 2) == 0) ? "WE" : "NS";
        let dir = (Math.sign(step) == 1) ? axis : axis[1] + axis[0];
        this.edgeDirections.push(DIRECTIONS[dir]);
      })

      let sortedVerts = this.stepVerts.slice().sort((v, w) => v[1] - w[1]);
      let minY = sortedVerts[0][1];
      let minYmaxX = sortedVerts.filter(v => v[1] == minY).sort((v, w) => w[0] - v[0])[0];
      let idx = (this.stepVerts.map(it => it.toString()).findIndex(v => v == minYmaxX.toString()));
      let prevIdx = (idx + this.stepVerts.length - 1) % this.stepVerts.length;;
      let nextIdx = (idx + 1) % this.stepVerts.length;
      let [toPrev, toNext] = [prevIdx, nextIdx].map(idx => vsub(p5Inst.createVector(...this.stepVerts[idx]), p5Inst.createVector(...minYmaxX)));
      let crossProdz = p5.Vector.cross(toPrev, toNext).z;

      this.isClockwise = Math.sign(crossProdz) < 0;



      this.isRectangle = (this.steps.length == 4);
      this.isResizable = this.isRectangle && resize;
      if (this.isResizable) {
        let orientations = Object.values(ORIENTATIONS);
        this.edgeOrientations = [];

        // this.edges.forEach((edge, i) => {
        //   let midpoint = vmult(vadd(...edge), 0.5);
        //   let tri = nPointsOnCircle(3, midpoint, this.pixelUnit / 2, Math.PI);
        // }
        let stepVertsXs = this.stepVerts.map(it => it[0]);
        let stepVertsYs = this.stepVerts.map(it => it[1]);
        let stepVertsPairs = [];
        this.stepVerts.forEach((jt, j) => {
          stepVertsPairs.push([jt, this.stepVerts[(j + 1) % this.stepVerts.length]]);
        })
        let [minX, maxX] = [Math.min(...stepVertsXs), Math.max(...stepVertsXs)];
        // swapping the y range so that maxY->North, minY->South
        let [maxY, minY] = [Math.min(...stepVertsYs), Math.max(...stepVertsYs)];
        this.lowerLeftStepVert = [minX, minY];
        if (DEBUGMODE) p5Inst.print("BREAKPOINT", stepVertsPairs);
        stepVertsPairs.forEach((jt, j) => {
          let idx = [prod(jt.map(it => it[1] == maxY)) == 1,
          prod(jt.map(it => it[0] == maxX)) == 1,
          prod(jt.map(it => it[1] == minY)) == 1,
          prod(jt.map(it => it[0] == minX)) == 1].indexOf(true);
          this.edgeOrientations.push(orientations[idx])

        })
        this.dragTriangles = {}
        this.updateDragTriangles();
      }

      // @refactor: redo the labeling string parser :edgelabels:
      switch (edgelabels) {
        case true: this.edgelabels = "!".repeat(this.edges.length);
          break;
        case false: this.edgelabels = "_".repeat(this.edges.length);
          break;
        default:
          if (edgelabels.length != this.edges.length) throw new Error(`Got '${edgelabels}' with length ${edgelabels.length}, which does not match the number of edges ${this.edges.length}`)
          if (!all([...edgelabels].map(label => ["?", "!", "_"].includes(label)))) throw new Error(`Got '${edgelabels}' but edgelabels are only allowed to contain '!','_','?'`)
          this.edgelabels = edgelabels;

      }
      if (DEBUGMODE) print("edgelabels:", this.edgelabels);

      this.edgePoints = this.updateEdgePoints()
      this.innerCenters = this.getInnerCenters()
      // this.innerStepGrid = this.getInnerCenters();
      this.isFrozen = frozen;

      this.isEmpty = empty;
      if (this.isEmpty) {
        this.tileColors = ["#1ED6EF", "#CFE6E9"]
        this.colorIndex = 0
      }

      //all poinst on edge except the verticies (no cutting along the edges allowed)
      //@improvment: the allowed verticies have to be defined more strictly :AVAILABELCUTS:

      this.allowedCuts = arrayUnique(this.innerCenters.flatMap(pointsNESWRot45));
      this.availableCuts = this.edgePoints;//.filter(point => !this.stepVerts.includes(point));
      this.isCut = false;
      this.currentCut = [];

      this.isVisibel = true;
      this.isActive = false;


      if (zorder != null) this.zorder = zorder;
      Tiles.allTiles.push(this);
      Tiles.allTiles.sort((a, b) => a.zorder - b.zorder)
    }//}}}


    step2Vert_() {
      return step => vadd(this.loc, vmult(p5Inst.createVector(...step), this.pixelUnit * 1.05))
    }

    stepVerts2Verts_() {
      return this.stepVerts.map(this.step2Vert_())
    }
    step2Vert() {
      return step => vadd(this.loc, vmult(p5Inst.createVector(...step), this.pixelUnit))
    }

    stepVerts2Verts() {
      return this.stepVerts.map(this.step2Vert())
    }

    updateEdges() {//{{{
      let edges = [];
      for (var vert_idx in this.verts) {
        vert_idx = parseInt(vert_idx);
        edges.push([this.verts[vert_idx], this.verts[(vert_idx + 1) % this.verts.length]]);
      }
      return edges
    }//}}}

    updateEdgePoints() {//{{{
      let edgePoints = [];
      let lengths = this.steps;
      // print(lengths.map(it => it - 1));
      // print(this.stepVerts.length, lengths.map(it => it - 1).length);
      this.stepVerts.forEach((step, i) => {
        // print(i);
        edgePoints.push(step);
        if (DEBUGMODE) print("step", i, step, "range[", 0, abs(lengths[i]) - 1, "]");
        edgePoints.push(...(range(0, abs(lengths[i]) - 1).map((d) => {
          let idx = (i + this.startDirOffset) % 2;
          let curstep = [...step];
          // print(step[(i + this.startDirOffset) % 2], d);
          // let ysign = (-1) ** (((i + this.startDirOffset) % 2) == 1);
          curstep[idx] = step[idx] + Math.sign(lengths[i]) * (1 + d);
          return curstep
        })))
      })
      return edgePoints
    }//}}}
    updateDragTriangles() {

      this.edges.forEach((edge, i) => {
        let phi0;
        let shiftDir;
        switch (this.edgeOrientations[i]) {
          case ORIENTATIONS.N:
            phi0 = -p5Inst.TAU / 4;
            shiftDir = "y";
            break;
          case ORIENTATIONS.E:
            phi0 = 0;
            shiftDir = "x";
            break;
          default: return
        }

        let midpoint = vmult(vadd(...edge), 0.5);
        let tri = nPointsOnCircle(3, midpoint, this.pixelUnit, phi0);
        let shift = [];
        if (shiftDir == "x") {
          shift.push(tri[1].x - midpoint.x);
          shift.push(0)
        } else if (shiftDir == "y") {
          shift.push(0)
          shift.push(tri[1].y - midpoint.y);
        }

        tri = tri.map(it => [it.x - shift[0], it.y - shift[1]]);
        this.dragTriangles[this.edgeOrientations[i]] = new clickTriangle(...tri.flat(), null, `${this.label}:${this.edgeOrientations[i]}`);
        this.dragTriangles[this.edgeOrientations[i]].isDragged = false;
      })

    }

    getInnerCenters() {//{{{
      let rangeX = range(this.boundingBox[0][0], this.boundingBox[1][0] + 1);
      let rangeY = range(this.boundingBox[0][1], this.boundingBox[1][1] + 1);

      let centers = cartesianProduct(rangeX, rangeY).map(
        dir => [dir[0] + 0.5, dir[1] + 0.5]).filter(
          point => p5Inst.collidePointPoly(...this.step2Vert()(point).xy, this.verts))
      //@refactor: config option for the odering    
      centers = centers.sort((a, b) => a[1] - b[1])
      return centers
    }//}}}

    get referencePoint() {
      if (this.isResizable) return this.step2Vert()(this.lowerLeftStepVert);

      return this.verts[0]
    }

    set referencePoint(vector) {//{{{
      let dvert = vsub(vector, this.referencePoint)
      let new_verts = this.verts.map(it => vadd(it, dvert));
      let new_verts_ = this.verts_.map(it => vadd(it, dvert));
      // todo: add half off bounding box width/height
      let inCanvas = new_verts.map(vert => p5Inst.collidePointRect(...vert.xy, -200, -200, canvasBuffer.width + 500, canvasBuffer.height + 500))
      if (all(inCanvas, true)) {
        this.loc = vadd(this.loc, dvert);
        // this.innerStepGrid = this.getInnerCenters();
        this.verts = new_verts;
        this.verts_ = new_verts_;
        this.edges = this.updateEdges();
        if (this.isResizable) this.updateDragTriangles();
      }
    }//}}}

    mouseInArea() {
      return p5Inst.collidePointPoly(p5Inst.mouseX, p5Inst.mouseY,
        this.verts)
    }

    updateReferencePoint(dx, dy) {
      return p5Inst.createVector(dx, dy)
    }

    snapToTiles() {//{{{
      if (this.isEmpty) return;
      let isInside = Tiles.allTiles.map((T) => {
        return all(this.innerCenters.map(center => p5Inst.collidePointPoly(...this.step2Vert()(center).xy, T.verts)))
      })
      isInside[this.zorder] = false;

      if (any(isInside)) {
        // only match the Tiles with the heighest zorder (the last matching one)
        let enclosingTiles = Tiles.allTiles[isInside.findLastIndex(it => it)];

        //using slice for the mapping to verts
        let firstCenter = this.innerCenters.slice(0, 1).map(this.step2Vert())[0];
        let centerVectors = enclosingTiles.innerCenters.map(enclosingTiles.step2Vert()).map((center) => vsub(center, firstCenter));
        let minCenterDistanceIdx = argMin(centerVectors.map(it => it.mag()));

        this.referencePoint = vadd(this.referencePoint, centerVectors[minCenterDistanceIdx]);
      }
    }//}}}

    handleCutting() {
      if (this.isEmpty) return
      let mouse = p5Inst.mouseVec();
      if (this.isCut) {
        let canclePos = this.step2Vert()(this.currentCut[0]);
        let lastPos = this.step2Vert()(this.currentCut[this.currentCut.length - 1]);
        print("befor if:", vsub(mouse, canclePos).mag(), 0.25 * this.pixelUnit);
        if (vsub(mouse, canclePos).mag() < 0.25 * this.pixelUnit) {

          this.currentCut = [];
          //@improvement:  :AVAILABELCUTS:
          this.availableCuts = this.edgePoints;//.filter(point => !this.stepVerts.includes(point));
          this.isCut = false;
          return
        }
        if ((this.availableCuts.length == 0) && (vsub(mouse, lastPos).mag() < 0.25 * this.pixelUnit)) {
          // @FIX: not all edgePoints are labeled with the (X) and some split parts are rotated (direction issue)
          let [ci, cf] = [this.currentCut[0], this.currentCut[this.currentCut.length - 1]];
          let [ciStepIdx, cfStepIdx] = [ci, cf].map(c => this.edgePoints.findIndex(it => it.toString() == c.toString()));
          let [cMinStepIdx, cMaxStepIdx] = ([ciStepIdx, cfStepIdx]).sort((a, b) => a - b);
          let cutIsReversed = (ciStepIdx != cMinStepIdx);

          let initalEdgePart = this.edgePoints.slice(0, cMinStepIdx);
          let betweenEdgePart = this.edgePoints.slice(cMinStepIdx + 1, cMaxStepIdx);
          let finalEdgePart = this.edgePoints.slice(cMaxStepIdx + 1);
          if (DEBUGMODE) print("EdgeParts:");
          if (DEBUGMODE) print("→ (i): ", initalEdgePart.join("],["));
          if (DEBUGMODE) print("→ (b): ", betweenEdgePart.join("],["));
          if (DEBUGMODE) print("→ (f): ", finalEdgePart.join("],["));
          if (DEBUGMODE) print("→ (curCut): ", this.currentCut.join("],["));
          let firstPart = [...initalEdgePart, ...((cutIsReversed) ? this.currentCut.slice().reverse() : this.currentCut.slice()), ...finalEdgePart]
          let secondPart = [...((cutIsReversed) ? this.currentCut.slice() : this.currentCut.slice().reverse()), ...betweenEdgePart];
          if (DEBUGMODE) print("EdgeParts assambled:");
          if (DEBUGMODE) print("→ (first): ", firstPart.join("],["));
          if (DEBUGMODE) print("→ (second): ", secondPart.join("],["));


          this.isVisibel = false;
          this.isFrozen = true;
          if (DEBUGMODE) print("cutDirs:", edgePoints2Directions(this.currentCut).join(';'));
          // the last index is unknown due to a slightly broken behavior
          if (DEBUGMODE) print("cutDirs:", edgePoints2Directions(this.currentCut)[(cutIsReversed) ? 0 : this.currentCut.length - 2]);

          if (DEBUGMODE) print("firstTile:");
          Tiles.createTiles(this.loc,
            edgePoints2Steps(firstPart),
            this.startDirection,
            this.unit);
          if (DEBUGMODE) print("secondTile:");
          let startDir = edgePoints2Directions(this.currentCut)[(cutIsReversed) ? 0 : this.currentCut.length - 2][1];
          let axis;
          if (startDir.includes("West")) {
            axis = 'x';
          } else if (startDir.includes("North")) {
            axis = 'y';
          } else {
            print("ERROR:", startDir);
          }
          if (DEBUGMODE) print("axis:", axis);
          Tiles.createTiles(this.step2Vert()(this.currentCut[(!cutIsReversed) ? (this.currentCut.length - 1) : 0]),
            edgePoints2Steps(secondPart),
            axis,
            this.unit);
          // print(`####################`);
          // print(`####### Sign #######`);
          // print(`####################`);
          // print(`isReversed ${cutIsReversed}`);
          return

        }
        if (this.currentCut.length >= 2) {
          let next2lastPos = this.step2Vert()(this.currentCut[this.currentCut.length - 2]);
          if (vsub(mouse, next2lastPos).mag() < 0.25 * this.pixelUnit) {

            if (DEBUGMODE) print("step back");
            this.currentCut.splice(this.currentCut.length - 1, 1);
            this.availableCuts = this.getAvailCuts();
            return
          }
        }

      }
      if (this.availableCuts.length > 0) {

        let distances2AvailablePoints = this.availableCuts.map(this.step2Vert()).map((p) => vsub(p, mouse).mag());
        let [minDistance, minDistanceIdx] = [min(...distances2AvailablePoints), argMin(distances2AvailablePoints)];

        if (minDistance < 0.4 * this.pixelUnit) {
          let cutPoint = this.availableCuts[minDistanceIdx];
          if (!this.currentCut.includes(cutPoint)) {
            this.currentCut.push(cutPoint);
          }
          let availCuts = this.getAvailCuts();
          this.availableCuts = availCuts;
        }


      }



      // print("avail left:", this.availableCuts);
      // print("edge :", this.edgePoints);
      // print("currentCut:", this.currentCut);
      this.isCut = this.currentCut.length > 0;
      // return this.isCut
    }
    getAvailCuts() {
      //@improvement: some cuts ar not possible, selecting a vertex has to be allowed for some situations
      //
      // ---x  o---   When 'o' is the last cut, 'x' has to be available 
      //    |  |
      //    |  |
      //    +--+
      // When this happens the vertex will be the last cutPoint since they lie on the edge
      //
      let lastCutPoint = this.currentCut[this.currentCut.length - 1];
      let availCuts = pointsNESW(lastCutPoint);
      print(`z:${this.zorder} l3502`, "AvailCuts:", JSON.stringify(availCuts));
      if (availCuts) {

        availCuts = availCuts.filter(point => this.allowedCuts.map(it => it.toString()).includes(point.toString()));
        print(`z:${this.zorder} l3506`, "AvailCuts:", JSON.stringify(availCuts));
        availCuts = availCuts.filter(point => !this.currentCut.map(it => it.toString()).includes(point.toString()));
        print(`z:${this.zorder} l3508`, "AvailCuts:", JSON.stringify(availCuts));

        let edgeIdx = this.edgePoints.findIndex(it => it.toString() == lastCutPoint.toString());
        if ((this.currentCut.length == 1) && (edgeIdx > 0)) {
          let forbiddenEdgeIdx = this.stepsSummed.findIndex(it => it > edgeIdx);
          let forbiddenEdgeIdxs = [(forbiddenEdgeIdx + this.stepsSummed.length - 1) % this.stepsSummed.length, forbiddenEdgeIdx, (forbiddenEdgeIdx + 1) % this.stepsSummed.length];
          print("forbidden Idx(s):", forbiddenEdgeIdx, forbiddenEdgeIdxs);
          availCuts = availCuts.filter(point => {
            if (DEBUGMODE) print("point:", point);
            let edgeIdx = (this.edgePoints.findIndex(it => it.toString() == point.toString()));
            if (DEBUGMODE) print("edgeIndex of point:", edgeIdx);
            if (edgeIdx < 0) return true;//edgeIdx = (this.stepsSummed.length + edgeIdx) % this.stepsSummed.length;
            if (DEBUGMODE) print("edgeIndex of point:", edgeIdx);
            if (DEBUGMODE) print("=> filter:", forbiddenEdgeIdxs.includes(this.stepsSummed.findIndex(it => it > edgeIdx)));
            return !(forbiddenEdgeIdxs.includes(this.stepsSummed.findIndex(it => it > edgeIdx)));
            // print("forbidden:", forbiddenEdgeIdx, this.availCuts.map(this.stepsSummed.findIndex(it => it > this.edgePoints.findIndex(it => it.toString() == point.toString())));
          })

          if (DEBUGMODE) print(`z:${this.zorder} l3521`, "AvailCuts:", JSON.stringify(availCuts));

        } else if ((this.currentCut.length > 1) && (edgeIdx > 0)) {
          // the start is allways on an edge, the next point on the edge is the last 
          availCuts = [];
          if (DEBUGMODE) print(`z:${this.zorder} l3526`, "AvailCuts:", JSON.stringify(availCuts));
        }
        // availCuts = availCuts.filter(point => !this.stepVerts.map(it => it.toString()).includes(point.toString()));
        // print(availCuts.map(point => p5Inst.collidePointPoly(...(this.step2Vert()(point)).xy, this.verts_)));
        // availCuts = availCuts.filter(point => p5Inst.collidePointPoly(...(this.step2Vert()(point)).xy, this.verts_));
        // availCuts = availCuts.filter(filterEnclosed);
        if (DEBUGMODE) print(`z:${this.zorder}, l3532`, "AvailCuts:", JSON.stringify(availCuts));
        return availCuts
      }
    }

    draw() {//{{{
      p5Inst.push();
      if (this.isVisibel) {
        if (!this.isEmpty) {
          p5Inst.push();
          p5Inst.rectMode(p5Inst.CENTER);
          p5Inst.fill("#DDD");
          p5Inst.strokeWeight(5);
          p5Inst.stroke("#EEE");
          this.innerCenters.map(this.step2Vert()).forEach(
            (center, i) => p5Inst.rect(...center.xy, this.pixelUnit, this.pixelUnit))
          p5Inst.pop();


        } else {
          p5Inst.push();
          p5Inst.strokeWeight((this.isFrozen) ? 7 : 4);
          this.edges.forEach((edge, _) => {
            p5Inst.line(...edge.map(vert => vert.xy).flat());
          })
          p5Inst.pop();

        }
        // show the triangles for resizing
        if ((this.isActive) && (this.isResizable)) {
          p5Inst.push();
          p5Inst.noStroke();
          Object.values(this.dragTriangles).forEach(it => {
            p5Inst.fill("#8884");
            if (!it.isDragged) {

              p5Inst.triangle(...it.tri);
            } else {
              p5Inst.textAlign("center", "center");
              p5Inst.textSize(20);
              p5Inst.fill("#888F");
              let shiftTri = [...it.tri];
              if (draggingDirection == "North") {
                [1, 3, 5].forEach(it => shiftTri[it] += draggingVector.y)
                p5Inst.triangle(...shiftTri);
                let idx = this.edgeOrientations.indexOf("North");
                let [edgeX, edgeY] = vmult(vadd(...this.edges[idx]), 0.5).xy;
                // print("drawing:", this.stepVerts2Verts()[idx])
                p5Inst.rectMode(p5Inst.CENTER);

                p5Inst.fill("#8884");
                countUnits = -(floor(draggingVector.y / this.pixelUnit) + 1);
                p5Inst.rect(edgeX, edgeY + (draggingVector.y / 2), this.steps[idx] * this.pixelUnit, draggingVector.y);
                p5Inst.push();
                p5Inst.noFill();
                p5Inst.stroke("#EEE");
                p5Inst.strokeWeight(5);
                [...Array(Math.abs(countUnits)).keys()].reverse().forEach(jt => {
                  p5Inst.fill("#DDD");
                  if (jt % 2 == 1) p5Inst.fill("#CCC");

                  p5Inst.rect(edgeX, edgeY - Math.sign(countUnits) * (jt + 1) * this.pixelUnit / 2, this.steps[idx] * this.pixelUnit, Math.sign(countUnits) * (jt + 1) * this.pixelUnit);
                })
                p5Inst.pop();
                p5Inst.fill("#888F");

                // let numRows = countUnits + ((countUnits < 0) ? 1 : 0);
                // if (SHOWRESIZEEQ) p5Inst.text(`${numRows} • ${this.steps[idx]} = ${numRows * this.steps[idx]}`, edgeX, edgeY + (draggingVector.y / 2));
                p5Inst.text(`${countUnits + ((countUnits < 0) ? 1 : 0)}`, edgeX, edgeY + (draggingVector.y / 2));

              } else if (draggingDirection == "East") {
                [0, 2, 4].forEach(it => shiftTri[it] += draggingVector.x)
                p5Inst.triangle(...shiftTri);
                p5Inst.fill("#8884");
                let idx = this.edgeOrientations.indexOf("East");
                let [edgeX, edgeY] = vmult(vadd(...this.edges[idx]), 0.5).xy;
                // print("drawing:", edgeX, vmult(vadd(...this.edges[idx]), 0.5));
                p5Inst.rectMode(p5Inst.CENTER);
                countUnits = floor(draggingVector.x / this.pixelUnit);
                p5Inst.rect(edgeX + (draggingVector.x / 2), edgeY, draggingVector.x, this.steps[idx] * this.pixelUnit);
                p5Inst.push();
                p5Inst.noFill();
                p5Inst.stroke("#EEE");
                p5Inst.strokeWeight(5);
                [...Array(Math.abs(countUnits)).keys()].reverse().forEach(jt => {
                  p5Inst.fill("#DDD");
                  if (jt % 2 == 1) p5Inst.fill("#CCC");

                  p5Inst.rect(edgeX + (Math.sign(countUnits) * (jt + 1)) * this.pixelUnit / 2, edgeY, Math.sign(countUnits) * (jt + 1) * this.pixelUnit, this.steps[idx] * this.pixelUnit);
                })
                p5Inst.pop();
                p5Inst.fill("#888F");
                p5Inst.text(`${countUnits + ((countUnits < 0) ? 1 : 0)}`, edgeX + (draggingVector.x / 2), edgeY);

              } else {
                throw new Error(`Got direction ${draggingDirection} should be 'North' or 'East'`)
              }
            }

          })
          p5Inst.pop();
        }

        // highlight edgepoints in active cut selection
        if (DEBUGMODE) {// {{{
          p5Inst.push();
          this.edgePoints.filter(point => !this.stepVerts.includes(point)).map(this.step2Vert()).forEach(
            (vert, i) => {

              p5Inst.fill("#A001");
              p5Inst.stroke("#A001");
              p5Inst.circle(...vert.xy, 5);
            })

          p5Inst.stroke("#00A5");
          p5Inst.circle(...this.referencePoint.xy, 30);
          p5Inst.pop();
        }// }}}

        // @refactor: add parameter/config for (un)cutabel?
        // show the available cut Points
        if ((this.isActive) && (!this.isEmpty)) {
          this.availableCuts.map(this.step2Vert()).forEach(
            (vert, i) => {
              p5Inst.push();

              p5Inst.fill("#A009");
              p5Inst.stroke("#A009");
              p5Inst.circle(...vert.xy, 5);
              p5Inst.pop();
            })
        }
        // display abort 'button'

        let lastvert;
        this.currentCut.map(this.step2Vert()).forEach(
          (vert, i) => {
            p5Inst.push();

            p5Inst.fill("#A009");
            p5Inst.stroke("#A009");
            p5Inst.circle(...vert.xy, 5);

            if ((i > 0)) {
              p5Inst.line(...lastvert.xy, ...vert.xy);
            }
            lastvert = vert;
            p5Inst.pop();

          })

        if (DEBUGMODE) {
          // Numbering of innerTiles
          p5Inst.push();
          this.innerCenters.map(this.step2Vert()).forEach(
            (vert, i) => {
              p5Inst.fill("#0A0");
              p5Inst.stroke("#0A0");
              // p5Inst.circle(...vert.xy, 10);
              p5Inst.textAlign(p5Inst.CENTER, p5Inst.CENTER);
              p5Inst.textSize(16);
              p5Inst.text(`${i}`, ...vert.xy);
            })

          p5Inst.pop();
        }


        // Labeling of the edges with lengths, a space or a ?
        // @refactor: redo the labeling string parser :edgelabels:
        // One Symbol stands for the entire edge, symbols in perens are refering to each step
        // eg  4x4:  "!!!!" -> label all 4 edges (is expanded to => (!!!!)(!!!!)(!!!!)(!!!!))
        // in the parenthesised parts a string of the same symbol marks a continued section of the edge
        //
        p5Inst.push();
        p5Inst.strokeWeight(2);
        let label;
        let alignment = [];//[p5Inst.CENTER, p5Inst.CENTER];
        let translation = [];//[p5Inst.CENTER, p5Inst.CENTER];
        // let alignmentArrows = []
        // let arrowLabel = [];
        this.edges.forEach((edge, i) => {
          switch (this.edgelabels[i]) {
            case "!": label = `${abs(this.steps[i]) * this.displayUnit.value + " " + this.displayUnit.name}`;
              break;
            case "?": label = "?";
              break;
            case "_": label = "";
              break;
          }

          // @refactor: config for fontsize
          let TEXTSIZEEDGELABEL = 16;
          //@refactor: config for the labelpadding, default 0.25
          let basePad = [0.7 * this.pixelUnit, 0.5 * this.pixelUnit];
          switch (this.edgeDirections[i]) {
            case DIRECTIONS.SN: alignment = [p5Inst.LEFT, p5Inst.CENTER];
              // alignmentArrows = [[p5Inst.RIGHT, p5Inst.TOP], [p5Inst.RIGHT, p5Inst.BOTTOM]];
              // arrowLabel = ['↓', '↑'];
              translation = [basePad[0], 0];
              break;
            case DIRECTIONS.NS: alignment = [p5Inst.RIGHT, p5Inst.CENTER];
              // alignmentArrows = [[p5Inst.LEFT, p5Inst.BOTTOM], [p5Inst.LEFT, p5Inst.TOP]];
              // arrowLabel = ['↑','↓'];
              translation = [-basePad[0], 0];
              break;
            case DIRECTIONS.WE: alignment = [p5Inst.CENTER, p5Inst.TOP];
              // alignmentArrows = [[p5Inst.RIGHT, p5Inst.BOTTOM], [p5Inst.LEFT, p5Inst.BOTTOM]];
              // arrowLabel = ["←","→"];
              translation = [0, basePad[1]];

              break;
            case DIRECTIONS.EW: alignment = [p5Inst.CENTER, p5Inst.BOTTOM];
              // alignmentArrows = [[p5Inst.LEFT, p5Inst.TOP], [p5Inst.RIGHT, p5Inst.TOP]];
              // arrowLabel = ["→","←"];
              translation = [0, -basePad[1]];
              break;
          }
          if (label == "?") {
            translation = [translation[0] * 0.5, translation[1] * 0.5];
          }

          // print("edge:", edge);
          alignment = [p5Inst.CENTER, p5Inst.CENTER];
          let midpoint = vmult(vadd(...edge), 0.5);
          // p5Inst.circle(...midpoint.xy, 20);
          p5Inst.textStyle(p5Inst.BOLD);
          // p5Inst.fill("#A0A");
          p5Inst.push();
          p5Inst.textSize(TEXTSIZEEDGELABEL);
          p5Inst.translate(...translation);
          p5Inst.push();
          if (label != "") {
            p5Inst.translate(...midpoint.xy);
            vdraw(vsub(edge[0], midpoint));
            vdraw(vsub(edge[1], midpoint));
          }
          p5Inst.pop();
          p5Inst.push();
          p5Inst.noStroke();
          p5Inst.fill("#FFF");
          p5Inst.rectMode(p5Inst.CENTER);
          p5Inst.rect(...midpoint.xy, p5Inst.textWidth(label), TEXTSIZEEDGELABEL);
          p5Inst.pop();
          p5Inst.textAlign(...alignment);
          p5Inst.text(label, midpoint.x, midpoint.y);
          // print("directions:", i, this.edgeDirections[i]);
          // draw the distance 'arrows' <------>
          // p5Inst.strokeWeight(2);
          // p5Inst.line(...edge.map(vert => vert.xy).flat());

          //@refactor: draw custom 'extent arrows' 
          // p5Inst.textAlign(...alignmentArrows);
          // [0, 1].forEach((_, i) => p5Inst.text(arrowLabel[i], ...edge[i].xy));


          p5Inst.pop();

        })
        p5Inst.pop();

        if (DEBUGMODE) {
          p5Inst.push();
          //enumeration of the vertices
          this.verts.forEach(
            (vert, i) => {
              p5Inst.fill("#FFFF");
              p5Inst.stroke("#0005");
              p5Inst.circle(...vert.xy, 15);
              p5Inst.fill(0);
              p5Inst.textAlign(p5Inst.CENTER, p5Inst.CENTER);
              p5Inst.textSize(16);
              p5Inst.text(`${i}`, ...vert.xy);
            });

          p5Inst.fill("#00AD");
          p5Inst.textAlign("center", "top");
          p5Inst.rectMode(p5Inst.CENTER);
          p5Inst.noStroke();
          let ident = `${this.label}: ${this.zorder}`;
          // p5Inst.rect(...this.step2Vert()(this.boundingBoxCenter).xy, p5Inst.textWidth(ident) * 1.5, 20);
          // p5Inst.print(this.step2Vert()(this.boundingBoxCenter));
          p5Inst.fill("#00A");
          p5Inst.stroke("#00A");
          p5Inst.text(ident, ...(this.step2Vert()(this.boundingBoxCenter)).xy);
          p5Inst.pop();
        }
        // p5Inst.push();
        // p5Inst.translate(...[200, 200]);
        // vdraw(p5Inst.createVector(100, 200, 0), 1, "#A1D5");
        // p5Inst.translate(...[200, 300]);
        // vdraw(p5Inst.createVector(100, 200, 0), 5, "#A1D5");
        // p5Inst.pop();

        // Drawing the features of the cut line
        if (this.isCut) {
          let pos = this.step2Vert()(this.currentCut[0]);
          p5Inst.push();

          p5Inst.fill("#C00");
          p5Inst.stroke("#C00");
          p5Inst.circle(...pos.xy, 20);
          p5Inst.stroke("#000");
          p5Inst.fill("#000");
          p5Inst.strokeWeight(2);
          p5Inst.textAlign(p5Inst.CENTER, p5Inst.CENTER);

          p5Inst.text("✗", ...pos.xy);
          if (this.availableCuts.length == 0) {
            let pos = this.step2Vert()(this.currentCut[this.currentCut.length - 1]);
            p5Inst.fill("#0C0");
            p5Inst.stroke("#0C0");
            p5Inst.circle(...pos.xy, 20);
            p5Inst.stroke("#000");
            p5Inst.fill("#000");
            p5Inst.strokeWeight(2);
            p5Inst.textAlign(p5Inst.CENTER, p5Inst.CENTER);
            p5Inst.text("✓", ...pos.xy);
          }
          p5Inst.pop();
        }
      }

      p5Inst.pop();
    }//}}}


  }// }}}

  //end: lib.js}}}

  p5Inst.preload = function() {// {{{
    console.log("config", initialConfig);
    //Examples {{{
    // if (!initialConfig.digitalscale) initialConfig.digitalscale = {};
    // if (!initialConfig.lockseesaw) initialConfig.lockseesaw = false;
    // switch (initialConfig.mode) {
    //   case "stacking":
    //     AppMode = AppModes.STACKINGNOSCALE;
    //     if (initialConfig.centerscale) {
    //       AppMode = AppModes.STACKINGNOBARS;
    //       if (initialConfig.barsonscale) AppMode = AppModes.STACKINGBARS;
    //     }
    //     if (initialConfig.onlystacking) {
    //       switch (initialConfig.onlystacking) {

    //         case 'KG': AppMode = AppModes.STACKINGONLYCOMPACT;
    //           initialConfig.digitalscale.G = "off";
    //           break;
    //         case 'G': AppMode = AppModes.STACKINGONLYSPLIT;
    //           initialConfig.digitalscale.KG = "off";
    //           break;
    //         case 'both':
    //         default: AppMode = AppModes.STACKINGONLYBOTH;
    //       }
    //     }
    //     break;
    //   case "slider":
    //   default:
    //     AppMode = AppModes.SLIDERSINGLE;
    //     if (initialConfig.splitslider) AppMode = AppModes.SLIDERSPLIT;
    // }

    function config2SettingIfPresent(config, setting, totype) {
      if (totype == undefined) { totype = (arg) => arg }
      if (initialConfig[config] != undefined) { AppSettings[setting] = totype(initialConfig[config]) }
    }
    //config2SettingIfPresent("edgewidth1000cubeG", "EDGEWIDTH1000CUBEG", (arg) => parseFloat(arg))
    // numcubesCompact = (initialConfig.numofcubesKG) ? initialConfig.numofcubesKG : 0;

    // if (initialConfig.digitalscale) {
    //   switch (initialConfig.digitalscale.KG) {
    //     case "off": displayCompactScale = false;
    //       break;
    //     case "decimal": displayCompactDecimal = true;
    //       break;
    //     case "integer": displayCompactDecimal = false;
    //       break;
    //     case "on":
    //     default: displayCompactScale = true;
    //   }
    //   switch (initialConfig.digitalscale.G) {
    //     case "off": displaySplitScale = false;
    //       break;
    //     case "on":
    //     default: displaySplitScale = true;
    //   }
    // }
    //}}}

  };// }}}

  p5Inst.setup = function() {// {{{
    p5Inst.randomSeed(123456789);
    // Set global variables
    CANVASASPECT = outerWidth / outerHeight;
    DEBUGFUNCS = [];
    //canvas and debug buffer
    canvasBuffer = setupCanvas();
    debugbuffer = setupBuffer("debug", 0, 0, 1, 1, "#FFF0");

    DEBUGMODE = initialConfig.debuginfos;
    initialConfig.tiles.forEach((T, i) => {
      Tiles.createTiles(canvasBuffer.rF.P(...T.location), T.steps, T.startdirection, T.unit, T.empty, T.edgelabels, T.frozen, T.zorder, T.resizable, T.label);
    })



    // Tiles.createTiles(canvasBuffer.rF.P(0.5, 0.5), [-1, -3, 4, -2, 1, 4, 4, -1, 1, 3], "x", [0.025, 1, "cm"], false, true);
    // Tiles.createTiles(canvasBuffer.rF.P(0.5, 0.5), [-1, -3, 4, -2, 1, 4, 4, -1, 1, 3], "x", [0.025, 1, "cm"], false, true);
    // Tiles.createTiles(canvasBuffer.rF.P(0.2, 0.5), [-4, 2, -2, 2, 2, 2, 2, 3, +2], "x", [0.025, 1, "cm"], true, false);
    // Tiles.createTiles(canvasBuffer.rF.P(0.7, 0.5), [-4, 2, -2, 2, 2, 2, 2, 3, +2], "y", [0.025, 1, "cm"], true, "!??!!__!!?");
    // Tiles.createTiles(canvasBuffer.rF.P(0.7, 0.2), [2, 2, -2], "x", [0.025, 1, "cm"], false, false);
    // Tiles.createTiles(canvasBuffer.rF.P(0.1, 0.2), [-2, 2, 2], "x", [0.025, 1, "cm"], false, false);
    // Tiles.createTiles(canvasBuffer.rF.P(0.2, 0.7), [-3, 1, -1, 6, 1, 2, 2, -1, 1, -2, 1, -4, -1], "x", [0.025, 1, "cm"], false, false);



    // tiles.push(new Tiles(...canvasBuffer.rF.P(0.3, 0.3).xy, ...canvasBuffer.rF.P(0.1, 0.1).xy, true));
    if (DEBUGMODE) print(Tiles.allTiles[0].pixelUnit);
    if (DEBUGMODE) print(Tiles.allTiles[0].verts);
    Moveable.allMoveables.forEach((M, i) => print(i, M));
    print(pointsNESW([5, 5]));

    if (DEBUGMODE) {
      // btn.position(...canvasBuffer.rF.P(0.02, 0.02).xy);
    }

  }// }}}

  let drawGrid = false;
  p5Inst.draw = function() {// {{{
    p5Inst.background(250);
    debugbuffer.setbackground();

    if (DEBUGMODE) {
      if (drawGrid) {
        p5Inst.push();
        p5Inst.noStroke();
        p5Inst.fill("#8885");
        cartesianProduct([...Array(100).keys()], [...Array(100).keys()]).forEach(([x, y], i) => {
          let xpos = canvasBuffer.rF.Px(x / 100);
          let ypos = canvasBuffer.rF.Py(y / 100);
          let xshift = canvasBuffer.rF.Px(1 / 100);
          let yshift = canvasBuffer.rF.Py(1 / 100);
          p5Inst.fill("#8885");
          p5Inst.circle(xpos, ypos, 2);
          if ((x % 10 == 0) && (y % 10 == 0)) {
            p5Inst.fill("#8888");
            if (x == 0) {
              p5Inst.textAlign("left", "center");
              p5Inst.text(`${y}%`, xpos, ypos);
            } else if (y == 0) {
              p5Inst.textAlign("center", "top");
              p5Inst.text(`${x}%`, xpos, ypos);

            } else {
              p5Inst.circle(xpos, ypos, 5);
            }
          }
        })
        p5Inst.pop();
      }
      p5Inst.push();
      p5Inst.fill("#A11");
      p5Inst.stroke("#A11");
      p5Inst.strokeWeight(0.5);
      p5Inst.textSize(14);
      p5Inst.text(`${'DebugInfo:'} \n`
        + `${'------------------'} \n`
        + `Num of Tiles: ${Tiles.allTiles.length} \n`
        + `Current zorder range: [${Tiles.allTiles[0].zorder},${Tiles.allTiles[Tiles.allTiles.length - 1].zorder}] \n`
        + `Active Tile: ${Tiles.allTiles.filter(t => t.isActive).map(t => t.label)} \n`
        + `allTiles: [${Tiles.allTiles.map(t => t.label)}] \n`
        , ...canvasBuffer.rF.P(0.02, 0.05).xy);


      p5Inst.textSize(14);
      let gridBtn = new clickRect(...canvasBuffer.rF.P(0.02, 0.02).xy, 40, -15, null, "gridButton");
      p5Inst.noFill("#FFF0");
      p5Inst.rect(...gridBtn.rect);
      p5Inst.fill("#A11");
      p5Inst.textAlign("left", "bottom")
      p5Inst.text("Grid", ...canvasBuffer.rF.P(0.02, 0.02).xy);
      p5Inst.pop();

    }

    Tiles.allTiles.filter(T => T.isVisible);
    p5Inst.push();

    Tiles.allTiles.forEach(tile => tile.draw());
    // Tiles.allTiles.filter(T => T.isEmpty).forEach(tile => tile.draw());
    // Tiles.allTiles.filter(T => !T.isEmpty).forEach(tile => tile.draw());
    // tiles[1].draw();

    // tiles[1].draw();
    p5Inst.pop();
    // print(p5Inst.mouseVec())
    // let T = Tiles.allTiles[Tiles.allTiles.length - 1];
    // if (T.currentCut.length > 0) {
    //   let [ci, cf] = [T.currentCut[0], T.currentCut[T.currentCut.length - 1]];
    //   let [ciStepIdx, cfStepIdx] = [ci, cf].map(c => T.edgePoints.findIndex(it => it.toString() == c.toString()));
    //   let [cMinStepIdx, cMaxStepIdx] = ([ciStepIdx, cfStepIdx]).sort((a, b) => a - b);
    //   let cutIsReversed = (ciStepIdx != cMinStepIdx);

    //   let initalEdgePart = T.edgePoints.slice(0, cMinStepIdx);
    //   let betweenEdgePart = T.edgePoints.slice(cMinStepIdx + 1, cMaxStepIdx);
    //   let finalEdgePart = T.edgePoints.slice(cMaxStepIdx + 1);

    //   let firstPart = [...initalEdgePart, ...((cutIsReversed) ? T.currentCut.slice().reverse() : T.currentCut.slice()), ...finalEdgePart]
    //   // firstPart.splice(firstPart.length - 1, 1);
    //   let secondPart = [...T.currentCut.slice(), ...betweenEdgePart];
    //   // let stepsSum = [0, ...cumSum(T.steps.map(it => abs(it)))];
    //   // let [cMinEdgeIdx, cMaxEdgeIdx] = [cMinStepIdx, cMaxStepIdx].map(c => stepsSum.findIndex(it => it > c));
    //   // print("ifStep:", ciStepIdx, cfStepIdx);
    //   // print("mMStep:", cMinStepIdx, cMaxStepIdx);
    //   // print("mMEdge:", cMinEdgeIdx, cMaxEdgeIdx);
    //   //@todo: the signs of the y-steps have to be fliped again

    // }
    // print(T.availableCuts.lenght);
    // if (T.availableCuts.length == 0) {
    //   // let [ci]
    //   p5Inst.text(
    //     `${ 'Debug:' } \n`

    //     + `${ '------------------' } \n`
    //     + `steps: ${ T.steps } \n`
    //     + `steps: ${ T.stepsSummed } \n`
    //     + `${ '------------------' } \n`
    //     + `${ 'c_' } -> ${ 'c_StepIdx' } -> ${ 'c_EdgeIdx' } -> ${ 'c_Steps' } \n`
    //     + `${ (cutIsReversed) ? arrayToString(cf) : arrayToString(ci) } -> ${ cMinStepIdx } \n`
    //     + `${ (cutIsReversed) ? arrayToString(ci) : arrayToString(cf) } -> ${ cMaxStepIdx } \n`
    //     + `${ '------------------' } \n`
    //     // + `${ (cEdgesDir).map(arrayToString) } \n\n`
    //     + `${ T.edgePoints.map(arrayToString) } \n`
    //     + `${ initalEdgePart.map(arrayToString) } \n`
    //     + `${ betweenEdgePart.map(arrayToString) } \n`
    //     + `${ finalEdgePart.map(arrayToString) } \n`
    //     + `${ '------------------' } \n`
    //     + `${ firstPart.map(arrayToString) } \n`
    //     + `${ secondPart.map(arrayToString) } \n`
    //     + `${ T.currentCut.map(arrayToString).join("; ") } \n`
    //     + `${ '------------------' } \n`
    //     + `cSteps: ${ arrayToString(edgePoints2Steps(firstPart)) } \n`
    //     + `cSteps: ${ arrayToString(edgePoints2Steps(secondPart)) } \n`
    //     // + `cStepsRev: ${ arrayToString(cStepsReversed) } \n`
    //     + `${ '------------------' } \n`
    //     // + `${ Tiles.allTiles.map(it => it.currentCut) } \n`
    //     , ...canvasBuffer.rF.P(0.3, 0.1).xy);

    //   p5Inst.push();
    //   p5Inst.fill("#1BB5");
    //   T.allowedCuts.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 20));
    //   p5Inst.fill("#1558");
    //   T.availableCuts.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 10));
    //   // p5Inst.fill("#1BB");
    //   firstPart.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 20));
    //   // p5Inst.fill("#1BB");
    //   // secondPart.map(T.step2Vert()).forEach((p, i) => p5Inst.circle(...p.xy, 10));
    //   p5Inst.pop();
    // }
    // if ((!T.isVisibel) && (!done)) {
    //   done = true;
    //   print(`Tiles.createTiles(${ T.loc }, ${ edgePoints2Steps(firstPart) }, ${ T.startDirection }, ${ T.unit })`);
    //   Tiles.createTiles(T.loc, edgePoints2Steps(firstPart), T.startDirection, T.unit);
    //   print(`Tiles.createTiles(${ T.loc }, ${ edgePoints2Steps(secondPart) }, ${ T.startDirection }, ${ T.unit })`);
    //   Tiles.createTiles(T.step2Vert()(T.currentCut[0]), edgePoints2Steps(secondPart), T.startDirection, T.unit);
    // }
    // }
    // p5Inst.push();
    // let Ps = Tiles.allTiles[0].verts;
    // let scaledPs = Tiles.allTiles[0].verts_;
    // let C = Tiles.allTiles[0].step2Vert()(Tiles.allTiles[0].boundingBoxCenter);
    // let C_ = Tiles.allTiles[0].step2Vert_()(Tiles.allTiles[0].boundingBoxCenter);

    // let disp = Ps.map((p, i) => vsub(p, C));
    // // let scaledPs = Ps.map((p, i) => vadd(p, vmult(disp[i], 0.1)));


    // scaledPs.forEach((p, i) => p5Inst.circle(...p.xy, 20));
    // p5Inst.fill("#C0C");
    // p5Inst.circle(...C.xy, 20)
    // p5Inst.circle(...C_.xy, 20)
    // p5Inst.pop();
  }
  // };// }}}

  // p5Inst.touchStarted = function() {
  // }
  function mouseOnCanvas() {
    return p5Inst.collidePointRect(p5Inst.mouseX, p5Inst.mouseY, ...canvasBuffer.rF.P(0, 0).xy, ...canvasBuffer.rF.P(1, 1).xy)
  }

  p5Inst.mousePressed = function() {//{{{
    let draggingDinstance = p5Inst.createVector();
    if (mouseOnCanvas()) {
      Array.from(Clickable.allClickables.values()).forEach(m => m.mousePressed());

      let clickTargets = [...Moveable.allMoveables.map(m => !m.isClicked), ...[...Clickable.allClickables.values()].map(m => !m.isClicked)];
      if (prod(clickTargets) == 1) Moveable.allMoveables.forEach(m => m.isActive = false);

      [clickMouseX, clickMouseY] = [p5Inst.mouseX, p5Inst.mouseY];

      let gridBtn = Clickable.allClickables.get("gridButton");
      if ((gridBtn != undefined) && gridBtn.mouseInArea()) {
        drawGrid = !drawGrid;
      }

      let inFrontMoveable = Moveable.inFront();
      if (inFrontMoveable) {
        if (inFrontMoveable instanceof Tiles) {
          Moveable.allMoveables.forEach(m => m.isActive = false)
          inFrontMoveable.isActive = true;
          //@refactor: only if cuttable
          inFrontMoveable.handleCutting();
        }
        // if (!startedCut) {

        inFrontMoveable.mousePressed();
        // }
      }


      return false
    }
  }//}}}
  p5Inst.mouseDragged = function() {// {{{

    let draggingTriangle = [...Clickable.allClickables.values()].filter(it => (it instanceof clickTriangle) && (it.isClicked));
    if (draggingTriangle.length == 1) {
      draggingTriangle = draggingTriangle[0];
      draggingTriangle.isDragged = true;
      draggingDirection = draggingTriangle.label.split(":")[1];
      let tiles = Moveable.allMoveables.filter(it => it.label == draggingTriangle.label.split(":")[0])[0];
      // print("dragTriangles", draggingTriangle, tiles);
      draggingVector = (vsub(p5Inst.mouseVec(), p5Inst.createVector(clickMouseX, clickMouseY)));
      // print("draggingVector", draggingVector)


    }


    let draggedMoveable = Moveable.allMoveables[Moveable.allMoveables.map(m => m.isDragged).findIndex(it => it)];
    if (draggedMoveable && !draggedMoveable.isFrozen) {
      draggedMoveable.mouseDragged();
      // if (draggedMoveable instanceof Tiles) print(draggedMoveable.isEnclosedByTiles());
      // if (draggedMoveable instanceof Tiles) print(JSON.stringify(draggedMoveable.isEnclosedByTiles()));

    } else {
      let inFrontMoveable = Moveable.inFront();
      if (inFrontMoveable && !inFrontMoveable.isFrozen) {
        inFrontMoveable.mouseDragged();
      }
    }
    return false
  }// }}}

  function clampValue(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value
  }

  p5Inst.mouseReleased = function() {//{{{
    Array.from(Clickable.allClickables.values()).forEach(m => m.mouseReleased());
    let draggingTriangle = [...Clickable.allClickables.values()].filter(it => (it instanceof clickTriangle) && (it.isDragged));
    if ((draggingTriangle.length == 1)) {
      draggingTriangle = draggingTriangle[0];
      draggingTriangle.isDragged != false;
      if (DEBUGMODE) print(draggingTriangle)
      let tiles = Moveable.allMoveables.filter(it => it.label == draggingTriangle.label.split(":")[0])[0];

      let newSteps = [];
      let newStartDirection;
      if (draggingDirection == "North") {
        let idx = tiles.edgeOrientations.indexOf("North");
        newSteps.push(Math.abs(tiles.steps[idx]));
        newSteps.push(Math.abs(tiles.steps[(idx + 1) % 4]) + clampValue(countUnits, -Math.abs(tiles.steps[(idx + 1) % 4]) + 1, Number.POSITIVE_INFINITY));
        newSteps.push(-Math.abs(tiles.steps[idx]));
        newStartDirection = "x";

      } else if (draggingDirection == "East") {
        let idx = tiles.edgeOrientations.indexOf("East");
        newSteps.push(Math.abs(tiles.steps[(idx + 1) % 4]) + clampValue(countUnits, -Math.abs(tiles.steps[(idx + 1) % 4]) + 1, Number.POSITIVE_INFINITY));
        newSteps.push(Math.abs(tiles.steps[idx]));
        newSteps.push(-(Math.abs(tiles.steps[(idx + 1) % 4]) + clampValue(countUnits, -Math.abs(tiles.steps[(idx + 1) % 4]) + 1, Number.POSITIVE_INFINITY)));
        newStartDirection = "x";

      } else {
        throw new Error(`Got direction ${draggingDirection} should be 'North' or 'East'`)
      }
      countUnits = 0;

      if (DEBUGMODE) print("new Steps:", newSteps)
      let args = [tiles.referencePoint, newSteps, newStartDirection, tiles.unit, tiles.isEmpty, tiles.edgelabels, tiles.isFrozen, tiles.zorder, true, tiles.label]
      let delIdxT = Tiles.allTiles.findIndex(it => it.label == tiles.label);
      let delIdxM = Moveable.allMoveables.findIndex(it => it.label == tiles.label);

      Tiles.allTiles.splice(delIdxT, 1);
      Moveable.allMoveables.splice(delIdxM, 1);
      let T = Tiles.createTiles(...args);
      T.isActive = true;
      T.referencePoint = vadd(T.referencePoint, p5Inst.createVector(0.1, 0.1));
      if (DEBUGMODE) print(Moveable.allMoveables)
      if (DEBUGMODE) print(Tiles.allTiles)

    }
    let draggedMoveable = Moveable.allMoveables[Moveable.allMoveables.map(m => m.isDragged).findIndex(it => it)];
    if (draggedMoveable) {
      draggedMoveable.mouseReleased();
      if (draggedMoveable instanceof Tiles) draggedMoveable.snapToTiles();
    } else {
      let inFrontMoveable = Moveable.inFront();
      if (inFrontMoveable) inFrontMoveable.mouseReleased();
    }
  }//}}}
};


let myp5 = new p5(sketch, "sketch")

