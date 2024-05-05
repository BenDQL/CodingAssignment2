/* Helper functions */
const randomInt = (max) => Math.floor(Math.random() * max);
const randomRatio = (max, min) => (min + Math.random() * max).toFixed(1);

const randomReplaceText = (isGood, goodMessages, badMessages) => {
  // Display positive / negative message
  if (isGood) {
    const randomIndex = randomInt(goodMessages.length);
    return goodMessages[randomIndex];
  } else {
    const randomIndex = randomInt(badMessages.length);
    return badMessages[randomIndex];
  }
};

/* Block - Divide image into blocks */
class Block {
  constructor(edge, startX, startY) {
    this.edge = edge;
    this.startX = startX;
    this.startY = startY;
    this.angleRatio = randomRatio(0.2, 0.1);
  }

  // Generate the {x, y} to let block move in spiral with speed ratio
  moveInSpiral = (i) => {
    const a = 5,
      b = 5;
    const angle = this.angleRatio * i;
    const updatedX = this.startX + (a + b * angle) * Math.cos(angle);
    const updatedY = this.startY + (a + b * angle) * Math.sin(angle);

    return { updatedX, updatedY };
  };
}

/* Image Glitch */
class ImageGlitch {
  constructor(path1, path2, cnv) {
    // Initialise happy image
    const happyImg = new Image();
    happyImg.crossOrigin = "anonymous";
    happyImg.src = path1;
    this.happyImg = happyImg;
    this.img = happyImg;
    this.img.onload = () => {
      this.initDrawImage(this.img);
    };
    // Initialise happy image
    const sadImg = new Image();
    sadImg.crossOrigin = "anonymous";
    sadImg.src = path2;
    this.sadImg = sadImg;

    // Canvas & context
    this.cnv = cnv;
    this.ctx = cnv.getContext("2d");
    this.frameId = null;
    this.blocksArray = [];
  }

  setup = (amount) => {
    for (let i = 0; i < amount; i = i + 2) {
      for (let j = 0; j < amount; j = j + 2) {
        const edge = Math.floor(500 / amount);
        const startX = i * edge;
        const startY = j * edge;
        const block = new Block(edge, startX, startY, this, this.cnv);
        this.blocksArray.push(block);
      }
    }
  };

  drawImg = (sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) =>
    this.ctx.drawImage(
      this.img,
      sx,
      sy,
      sWidth,
      sHeight,
      dx,
      dy,
      dWidth,
      dHeight
    );

  initDrawImage = () => {
    this.drawImg(
      0,
      0,
      this.img.width,
      this.img.height,
      (this.cnv.width - this.img.width) / 2,
      (this.cnv.height - this.img.height) / 2,
      this.img.width,
      this.img.height
    );
  };

  // Make the image gray
  grayscaleEffect = () => {
    this.img = this.sadImg;
    this.ctx.filter = "grayscale(1)";
    this.initDrawImage();
  };

  movingBlocks = (i) => {
    // Recursion
    this.blocksArray.forEach((block) => {
      const { updatedX, updatedY } = block.moveInSpiral(Math.floor(i));
      const canvasX = (this.cnv.width - this.img.width) / 2;
      const canvasY = (this.cnv.height - this.img.height) / 2;
      this.drawImg(
        block.startX,
        block.startY,
        block.edge,
        block.edge,
        canvasX + updatedX,
        canvasY + updatedY,
        block.edge,
        block.edge
      );
    });
    this.frameId = requestAnimationFrame(() => this.movingBlocks(i + 0.5));
  };

  stopGlitch = () => {
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.img = this.happyImg;
    this.ctx.filter = "none";
    this.initDrawImage();
    this.blocksArray = [];
  };
}

/* Message Glitch */
class GlitchMessage {
  constructor(message, elementId) {
    this.msg = message;
    this.domElem = document.getElementById(elementId);
    const { mainTextElem, shadowElems } = this.setup();
    this.mainTextElem = mainTextElem;
    this.shadowElems = shadowElems;
  }

  setup = () => {
    // Add child div for displaying main text and its shadow layer for glitched effect
    const mainTextElem = document.createElement("div");
    mainTextElem.classList.add("main-text");
    mainTextElem.textContent = this.msg;
    this.domElem.appendChild(mainTextElem);

    const shadowElem1 = document.createElement("div");
    shadowElem1.classList.add("shadow");
    shadowElem1.textContent = this.msg;
    this.domElem.appendChild(shadowElem1);

    const shadowElem2 = document.createElement("div");
    shadowElem2.classList.add("shadow");
    shadowElem2.classList.add("shawdow-red");
    shadowElem2.textContent = this.msg;
    this.domElem.appendChild(shadowElem2);

    const shadowElems = [shadowElem1, shadowElem2];

    return { mainTextElem, shadowElems };
  };

  startGlitch = () => {
    // Start the glitched text effect
    this.mainTextElem.classList.add("glitched");
    this.shadowElems.forEach((shadowElem) => {
      shadowElem.classList.add("glitched");
    });
    setTimeout(() => {
      this.mainTextElem.classList.remove("glitched");
      this.shadowElems.forEach((shadowElem) =>
        shadowElem.classList.remove("glitched")
      );
    }, 50 + randomInt(100));
  };
}
