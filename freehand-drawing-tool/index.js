let APP;


function dragElement(menubar) {//{{{
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  menubar.addEventListener("mousedown", dragMouseDown)
  menubar.addEventListener("mouseup", closeDragElement);
  document.addEventListener("mousemove", elementDrag);

  function dragMouseDown(e) {
    menubar.dataset.isDragged = "true";
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    // call a function whenever the cursor moves:
  }

  function elementDrag(e) {
    if (menubar.dataset.isDragged == "true") {
      e.preventDefault();
      console.log(menubar.dataset.isDragged)
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      menubar.style.top = (menubar.offsetTop - pos2) + "px";
      menubar.style.left = (menubar.offsetLeft - pos1) + "px";
      console.log(menubar.style.top, menubar.style.left);

    }
  }

  function closeDragElement(e) {
    menubar.dataset.isDragged = "false";
  }
}//}}}

function highestDivisior(number, divisors) {
  return Math.max(...divisors.filter(it => (number % it) == 0))
}

function lerp(x1, y1, x2, y2, t) {
  return [t * x2 + (1 - t) * x1, t * y2 + (1 - t) * y1]
}

class DrawingApp {
  constructor(canvasparentid) {
    this.canvasparent = document.getElementById(canvasparentid);
    this.canvasparent.style.background = "#EEEEEE";
    this.canvasparentBbox = this.canvasparent.getBoundingClientRect()
    this.origin = [this.canvasparentBbox.left, this.canvasparentBbox.top];
    this.width = this.canvasparentBbox.width;
    this.height = this.canvasparentBbox.height;



    this.devisors = [2, 3, 4]
    this.numberWidthTiles = highestDivisior(this.width, this.devisors);
    this.numberHeightTiles = highestDivisior(this.height, this.devisors);
    this.tileWidth = this.width / this.numberWidthTiles;
    this.tileHeight = this.height / this.numberHeightTiles;

    this.setupMenubar()
    this.setupCanvas()

    // fix: use ctx.getImageData(...)
    //
    // this.canvasData = [...Array(this.numberWidthTiles * this.numberHeightTiles)].map((it, i) => {
    //   let tileCol = i % this.numberWidthTiles
    //
    //   let tileRow = Math.floor(((i - tileCol) / this.numberWidthTiles));
    //   return {
    //     tile: [tileRow, tileCol],
    //     data: [...Array(this.tileHeight)].map(jt => [...Array(this.tileWidth)].map(kt => 0))
    //   }
    // });


  }
  // setupElements() {
  //   this.appDiv = document.createElement("div");
  //   this.appDiv.id = "freehand-drawing-canvas";
  //   this.appDiv.width = this.width;
  //   this.appDiv.height = this.height;
  //   this.appDiv.style.position = "absolute";
  //   this.appDiv.style.top = `${this.canvasparentBbox.top}px`;
  //   this.appDiv.style.left = `${this.canvasparentBbox.left}px`;
  //   this.appDiv.style["z-index"] = 10;
  //
  //
  //   document.body.appendChild(this.appDiv);
  // }

  setupCanvas() {//{{{
    this.canvas = document.createElement("canvas");
    this.canvas.id = "freehand-drawing-canvas";
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.visibility = "hidden";
    this.canvas.style["z-index"] = 10;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = `${this.canvasparentBbox.top}px`;
    this.canvas.style.left = `${this.canvasparentBbox.left}px`;
    this.canvas.style.border = "dashed #555555";
    document.body.appendChild(this.canvas);

    this.penDown = false;
    this.drawColor = "#929292";
    this.drawSize = 2;
    this.lastTouchPosition = undefined;
    this.movementTouchPosition = undefined;

    let ctx = this.context2d;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    //Event Listeners

    this.canvas.addEventListener("mousedown", (e) => {
      let ctx = this.context2d;
      ctx.beginPath();
      if (this.lastTouchPosition == undefined) {

        this.lastTouchPosition = this.localCoordinate(e.x, e.y);
        ctx.moveTo(...this.lastTouchPosition);
      }

      this.penDown = true;
    })

    this.canvas.addEventListener("touchstart", (e) => {
      this.penDown = true;
    })


    this.canvas.addEventListener("mouseleave", (e) => {
      this.penDown = false;

    })
    this.canvas.addEventListener("mouseup", (e) => {
      this.penDown = false;
      let ctx = this.context2d;
      this.lastTouchPosition = undefined;

    })

    this.canvas.addEventListener("touchend", (e) => {
      this.penDown = false;
      this.lastTouchPosition = undefined;
      this.movementTouchPosition = undefined;

    })


    this.canvas.addEventListener("mousemove", (e) => {
      console.log(this.lastTouchPosition);
      if (this.penDown) {

        let [nowX, nowY] = this.localCoordinate(e.x, e.y)
        let [lastX, lastY] = [nowX - e.movementX, nowY - e.movementY];
        // console.log(e.movementX ** 2 + e.movementY ** 2)
        // let scale = 10 / (e.movementX ** 2 + e.movementY ** 2);
        let scale = (Math.abs(e.movementX) < 5 && Math.abs(e.movementY) < 5) ? 2 : 1;
        // let [lastX, lastY] = [nowX - scale * e.movementX, nowY - scale * e.movementY];
        // ctx.beginPath();
        // ctx.beginPath();

        ctx.strokeStyle = this.drawColor;
        ctx.fillStyle = this.drawColor;
        ctx.lineWidth = this.drawSize;
        ctx.lineTo(nowX, nowY);
        ctx.stroke();
        this.lastTouchPosition = [nowX, nowY];
        // ctx.moveTo(nowX, nowY + 50);
        // ctx.lineTo(lastX1, lastY1 + 50);
        // ctx.stroke();
        // ctx.beginPath();
        // ctx.arc((nowX + lastX) / 2, (nowY + lastY) / 2, this.drawSize / 10, 0, 2 * Math.PI);
        // ctx.fill()
        // ctx.closePath();
      }
      return false
    })



    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();//{{{
      this.canvas.addEventListener("touchstart", (e) => {
        // ctx = this.context2d;
        // ctx.beginPath();
        //console.warn("Touch!");
        //document.getElementsByTagName("h1")[0].style.background = "#EABAC5";
        this.penDown = true;
      })
      if (this.penDown) {

        // console.log(e)
        let [nowX, nowY] = this.localCoordinate(e.touches[0].clientX, e.touches[0].clientY);

        if (this.lastTouchPosition == undefined) {
          this.lastTouchPosition = this.localCoordinate(e.touches[0].clientX, e.touches[0].clientY);

          return false
        }

        let [lastX, lastY] = this.lastTouchPosition;
        this.movementTouchPosition = [nowX - lastX, nowY - lastY];
        console.log(this.movementTouchPosition);
        let scale = (Math.abs(this.movementTouchPosition[0]) < 5 && Math.abs(this.movementTouchPosition[1]) < 5) ? 2 : 1;
        [lastX, lastY] = [nowX - scale * this.movementTouchPosition[0], nowY - scale * this.movementTouchPosition[1]];


        this.lastTouchPosition = this.localCoordinate(e.touches[0].clientX, e.touches[0].clientY);
        let ctx = this.context2d;

        // console.log("t", e.touches[0].clientX, e.touches[0].clientY);
        // console.log("dt", e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        ctx.beginPath();
        ctx.strokeStyle = this.drawColor;

        // ctx.fillStyle = "#" + (parseInt(this.drawColor.replace("#", "0x")) + 500000).toString(16);
        ctx.fillStyle = this.drawColor;
        ctx.lineWidth = this.drawSize;
        // ctx.stroke();
        // ctx.moveTo((nowX + lastX) / 2, (nowY + lastY) / 2);
        // ctx.lineTo(lastX, lastY);
        // ctx.stroke();
        ctx.moveTo(nowX, nowY);
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
        // ctx.moveTo(...lerp(...nowX, ...lastX, 0.25));
        // ctx.lineTo(...lerp(...nowX, ...lastX, 0.75))
        // ctx.stroke();
        // ctx.beginPath();
        // ctx.arc((nowX + lastX) / 2, (nowY + lastY) / 2, this.drawSize / 4, 0, 2 * Math.PI);
        // ctx.fill()
        // ctx.closePath();

        // ctx.fill()
      }
      return false//}}}
    }, { passive: false }
    )


  }//}}}

  setupMenubar() {
    this.menubar = document.createElement("div");
    this.menubar.id = "freehand-drawing-menubar";
    this.menubar.style.background = "#AAAAAA55";
    // this.menubar.style.width = `${this.width - 32}px`;
    this.menubar.style.width = "300px";
    this.menubar.style.height = "50px";
    // this.menubar.style.transform = `translate(32px, ${- 36}px)`
    this.menubar.style.position = "absolute";
    this.menubar.style.top = 0;
    this.menubar.style.left = 0;
    // this.menubar.style.top = `${ this.canvasparentBbox.top } px`;
    // this.menubar.style.left = `${ this.canvasparentBbox.left } px`;
    this.menubar.style["z-index"] = 15;
    this.menubar.dataset.isDragged = "false";
    document.body.appendChild(this.menubar);



    this.canvasToggle = document.createElement("button");//{{{
    this.canvasToggle.id = "canvas-toggle"
    this.canvasToggle.style.width = "50px";
    this.canvasToggle.style.height = "50px";
    this.canvasToggle.style.fontSize = '16pt';
    this.canvasToggle.style.background = "url('pen-on.png')"
    this.canvasToggle.style["border-radius"] = '50px';
    // this.canvasToggle.style.height = "32px";
    this.canvasToggle.style.position = 'absolute';
    this.canvasToggle.style.border = "none";

    // this.canvasToggle.style.transform = `translate(-${ this.width }px, ${ this.height - 32 }px)`
    this.menubar.appendChild(this.canvasToggle);

    this.menubarButtonsDiv = document.createElement("div");
    this.menubarButtonsDiv.id = "freehand-drawing-menubar-buttons";
    this.menubarButtonsDiv.style.background = "#AAAAAA55";
    this.menubarButtonsDiv.style.height = "50px";
    this.menubarButtonsDiv.style.width = "250px";
    this.menubarButtonsDiv.style.visibility = "hidden";

    this.menubarButtonsDiv.style.transform = "translate(50px, 0px)"
    this.menubar.appendChild(this.menubarButtonsDiv);


    this.menubarButtons = {}
    this.menubarButtons.colorGray = document.createElement("button");
    this.menubarButtons.colorGreen = document.createElement("button");
    this.menubarButtons.colorPurple = document.createElement("button");
    this.menubarButtons.undo = document.createElement("button");
    this.menubarButtons.redo = document.createElement("button");
    // this.menubarButtons.size1 = document.createElement("button");
    // this.menubarButtons.size2 = document.createElement("button");

    this.menubarButtons.colorGray.style.fontSize = '16pt';
    this.menubarButtons.colorGray.dataset.color = "gray"
    this.menubarButtons.colorGray.style.transform = `translate(20px, 0px)`
    this.menubarButtons.colorGray.style.background = "url('pen-gray.png')"
    this.menubarButtons.colorGray.style.width = "50px";
    this.menubarButtons.colorGray.style.height = "50px";
    this.menubarButtons.colorGray.style["border-radius"] = "50px";
    this.menubarButtons.colorGray.style.opacity = 1;

    this.menubarButtons.colorGreen.style.fontSize = '16pt';
    this.menubarButtons.colorGreen.dataset.color = "green"
    this.menubarButtons.colorGreen.style.transform = `translate(20px, 0px)`
    this.menubarButtons.colorGreen.style.background = "url('pen-green.png')"
    this.menubarButtons.colorGreen.style.width = "50px";
    this.menubarButtons.colorGreen.style.height = "50px";
    this.menubarButtons.colorGreen.style["border-radius"] = "50px";
    this.menubarButtons.colorGreen.style.opacity = 0.7;

    this.menubarButtons.colorPurple.style.fontSize = '16pt';
    this.menubarButtons.colorPurple.dataset.color = "purple"
    this.menubarButtons.colorPurple.style.transform = `translate(20px, 0px)`
    this.menubarButtons.colorPurple.style.background = "url('pen-purple.png')"
    this.menubarButtons.colorPurple.style.width = "50px";
    this.menubarButtons.colorPurple.style.height = "50px";
    this.menubarButtons.colorPurple.style["border-radius"] = "50px";
    this.menubarButtons.colorPurple.style.opacity = 0.7;


    this.menubarButtons.undo.style.transform = `translate(30px, 0px)`
    this.menubarButtons.undo.style.background = "url('undo.png')"
    this.menubarButtons.undo.style.width = "50px";
    this.menubarButtons.undo.style.height = "50px";
    this.menubarButtons.undo.style["border-radius"] = "50px";

    this.menubarButtons.redo.style.transform = `translate(30px, 0px)`
    this.menubarButtons.redo.style.background = "url('redo.png')"
    this.menubarButtons.redo.style.width = "50px";
    this.menubarButtons.redo.style.height = "50px";
    this.menubarButtons.redo.style["border-radius"] = "50px";

    function highlightColorButton(color, buttons) {
      let allButtons = ["colorGray", "colorGreen", "colorPurple"];
      allButtons.filter(it => it != color).forEach(it => {
        buttons[it].style.opacity = 0.7;
      })
      buttons[color].style.opacity = 1;
    }

    //
    // this.menubarButtons.size0.style.fontSize = '16pt';
    // this.menubarButtons.size0.textContent = "."
    // this.menubarButtons.size0.style.transform = `translate(90px, 0px)`
    //
    // this.menubarButtons.size1.style.fontSize = '16pt';
    // this.menubarButtons.size1.textContent = "o"
    // this.menubarButtons.size1.style.transform = `translate(100px, 0px)`
    //
    // this.menubarButtons.size2.style.fontSize = '16pt';
    // this.menubarButtons.size2.textContent = "O"
    // this.menubarButtons.size2.style.transform = `translate(100px, 0px)`


    let drawColors = { "gray": "#929292", "purple": "#963bd8", "green": "#2dac11" };
    // let drawSizes = { ".": 2, "o": 4, "O": 6 };
    Object.entries(this.menubarButtons).forEach(([label, button]) => {
      if (label.startsWith("color")) {

        button.addEventListener("click", (e) => {
          console.log(e.target.dataset.color)
          this.drawColor = drawColors[e.target.dataset.color];
          highlightColorButton(label, this.menubarButtons)

        })
      } else if (label.startsWith("size")) {
        button.addEventListener("click", (e) => {
          console.log(e.target.textContent)
          this.drawSize = drawSizes[e.target.textContent];

        })
      }
      this.menubarButtonsDiv.appendChild(button)
    })




    //this.menubar.appendChild(this.canvasToggle);
    this.canvasToggle.addEventListener("click", (e) => {
      console.log(e)
      console.log(this)
      if (this.canvas.style.visibility == "hidden") {
        this.canvasToggle.style.background = "url('pen-off.png')"
        this.canvas.style.visibility = "visible";
        this.menubarButtonsDiv.style.visibility = "visible";




      } else {
        this.canvasToggle.style.background = "url('pen-on.png')"
        this.canvas.style.visibility = "hidden"
        this.menubarButtonsDiv.style.visibility = "hidden";
      }
    })

    //}}}
  }

  get context2d() {
    return this.canvas.getContext("2d");
  }

  localCoordinate(windowX, windowY) {
    return [windowX + window.scrollX - this.origin[0], windowY + window.scrollY - this.origin[1]]
  }

  insideCanvas(windowX, windowY) {
    let [x, y] = this.localCoordinate(windowX, windowY)
    // console.log(x, y)
    return ((0 <= x) && (x <= this.width)) && ((0 <= y) && (y <= this.height))
  }

  canvasDataIndex(x, y) {
    return undefined
  }

  penDownToogle() {
    this.penDown = !this.penDown
  }


}



function point(ctx, atX, atY, style) {
  ctx.strokeStyle = style.strokeStyle;
  ctx.moveTo(atX, atY);
  ctx.lineTo(atX - 0.1, atY - 0.1);
}


window.onload = ((e) => {
  // CANVASPARENT.textContent = "ABC"
  // CANVASPARENT.style.background = "#EEEEEE"
  APP = new DrawingApp("content")
  dragElement(APP.menubar)

  // APP.canvasData[0].data.forEach((it, i) => {
  //   it.forEach((jt, j) => {
  //
  //     APP.canvasData[0].data[i][j] = (i == 5) ? 1 : 0;
  //
  //   })
  // })
  //
  console.log(APP.width, APP.height);

  let ctx = APP.context2d;
  ctx.font = "30px Arial";
  // ctx.beginPath();
  // APP.canvasData[0].data.forEach((it, i) => {
  //   it.forEach((jt, j) => {
  //     if (jt == 1) {
  //       // ctx.beginPath();
  //       point(ctx, j, i);
  //       // ctx.arc(i, j, 1, 0, 2 * Math.PI);
  //       // ctx.stroke();
  //       // ctx.closePath();
  //     }
  //   })
  // })
  // ctx.stroke();
  // ctx.closePath();




  BUILDTIME();

})


const BUILDTIME = () => document.getElementsByTagName('h1')[0].textContent = 'Wed Jun 18 11:00:38 AM CEST 2025'
