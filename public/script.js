/* Helper functions */
const randomInt = (max) => Math.floor(Math.random() * max);
const randomRatio = (max, min) => (min + Math.random() * max).toFixed(1);

/* Block - Divide image into blocks */
class Block {
  constructor(edge, startX, startY) {
    this.edge = edge;
    this.startX = startX;
    this.startY = startY;
    this.angleRatio = randomRatio(0.3, 0.2);
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
      this.setup();
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
  grayscaleAnimation = () => {
    this.img = this.sadImg;
    this.ctx.filter = "grayscale(1)";
    this.initDrawImage();
    setTimeout(() => this.movingBlocks(0), 1000);
  };

  movingBlocks = (i) => {
    // Recursion
    this.blocksArray.forEach((block) => {
      const { updatedX, updatedY } = block.moveInSpiral(i);
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
    this.frameId = requestAnimationFrame(() => this.movingBlocks(i + 1));
  };

  stopAnimation = () => {
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.img = this.happyImg;
    this.ctx.filter = "none";
    this.initDrawImage();
    this.blocksArray = [];
  };
}

/* Text Glitch */
class GlitchText {
  constructor(goodTexts, badTexts, elementId) {
    this.goodTexts = goodTexts;
    this.badTexts = badTexts;
    this.frameId = null;
    this.domElem = document.getElementById(elementId);
    const { mainTextElem, shadowElems } = this.setup();
    this.mainTextElem = mainTextElem;
    this.shadowElems = shadowElems;
  }

  setup = () => {
    const mainTextElem = document.createElement("div");
    mainTextElem.classList.add("main-text");
    mainTextElem.textContent = this.goodTexts[0];
    this.domElem.appendChild(mainTextElem);

    const shadowElem1 = document.createElement("div");
    shadowElem1.classList.add("shadow");
    shadowElem1.textContent = this.goodTexts[0];
    this.domElem.appendChild(shadowElem1);

    const shadowElem2 = document.createElement("div");
    shadowElem2.classList.add("shadow");
    shadowElem2.classList.add("shawdow-red");
    shadowElem2.textContent = this.goodTexts[0];
    this.domElem.appendChild(shadowElem2);

    const shadowElems = [shadowElem1, shadowElem2];

    return { mainTextElem, shadowElems };
  };

  randomReplaceText = (isGood) => {
    if (isGood) {
      const randomIndex = randomInt(this.goodTexts.length);
      this.goodTexts.slice(randomIndex);
      return this.goodTexts[randomIndex];
    } else {
      const randomIndex = randomInt(this.badTexts.length);
      return this.badTexts[randomIndex];
    }
  };

  startAnimation = (i, glitchedImg) => {
    let displayText;
    if (i < 4) {
      displayText = this.randomReplaceText(true);
    } else if (i === 4) {
      displayText = this.randomReplaceText(false);
    } else {
      glitchedImg.grayscaleAnimation();
      setTimeout(() => {
        glitchedImg.stopAnimation();
        displayText = this.goodTexts[0];
        this.mainTextElem.textContent = displayText;
        this.shadowElems.forEach((shadowElem) => {
          shadowElem.textContent = displayText;
        });
      }, 3000);
      // Stop the animation after 5 times
      return this.stopGlitch();
    }
    this.mainTextElem.textContent = displayText;
    this.mainTextElem.classList.add("glitched");
    this.shadowElems.forEach((shadowElem) => {
      shadowElem.textContent = displayText;
      shadowElem.classList.add("glitched");
    });
    setTimeout(() => {
      this.mainTextElem.classList.remove("glitched");
      this.shadowElems.forEach((shadowElem) =>
        shadowElem.classList.remove("glitched")
      );
    }, 50 + randomInt(100));
    this.frameId = setTimeout(
      () => this.startAnimation(i + 1, glitchedImg),
      350 + randomInt(500)
    );
  };

  stopGlitch = () => {
    clearTimeout(this.frameId);
    this.frameId = null;
  };
}

const canvas = document.getElementById("cnv-element");
canvas.width = 1028;
canvas.height = 728;

const glitchText = new GlitchText(
  [
    "You look amazing today!",
    "Thanks for everything you do.",
    "You've done a great job!",
    "We're so lucky to have you.",
    "You make a difference in my life.",
    "Anytime you need help, I'm here for you.",
    "I trust you.",
    "I love the way you present.",
    "You're very good at that!",
  ],
  [
    "You're a loser!",
    "You're such a stupid person!",
    "You never get anything right.",
    "You're hopeless!",
    "I wish you never born.",
  ],
  "glitch-text"
);
const glitchImage = new ImageGlitch(
  "images/happy.jpg",
  "images/sad.jpg",
  canvas
);

const setupCanvas = () => {
  glitchImage.setup(30);
  /* Start Text animation */
  glitchText.startAnimation(0, glitchImage);
};

setupCanvas();
setInterval(() => setupCanvas(), 7000); // Keep playing the animation
