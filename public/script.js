// Initialise messages & images & audio
const [goodMessages, badMessages] = [
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
];

const canvas = document.getElementById("cnv-element");
canvas.width = 1028;
canvas.height = 728;

const glitchImage = new ImageGlitch(
  "images/happy.jpg",
  "images/sad.jpg",
  canvas
);

const startMessageAnimation = (i, cb) => {
  let displayText;
  if (i < 4) {
    // Display good message for 4 times
    displayText = randomReplaceText(true, goodMessages, badMessages);
  } else if (i === 4) {
    // Display bad message on the 5-th time
    displayText = randomReplaceText(false, goodMessages, badMessages);
  } else {
    return cb();
  }
  document.getElementById("glitch-text").innerHTML = "";
  const glitchedMsg = new GlitchMessage(displayText, "glitch-text");
  glitchedMsg.startGlitch();
  // Replace with new message after some time
  setTimeout(() => startMessageAnimation(i + 1, cb), 350 + randomInt(500));
};

const startAnimation = () => {
  glitchImage.setup(30);

  startMessageAnimation(0, () => {
    glitchImage.grayscaleEffect();
    setTimeout(() => glitchImage.movingBlocks(0), 1000);
    setTimeout(() => {
      // Stop image glitch effect after 3 seconds
      glitchImage.stopGlitch();
      // Start the whole animation again
      startAnimation();
    }, 5000);
  });
};

startAnimation();
