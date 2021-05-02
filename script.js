// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const context = canvas.getContext('2d');
const generate = document.querySelector('button[type=submit]');
const clear = document.querySelector('button[type=reset]');
const read = document.querySelector('button[type=button]');
const imgInput = document.getElementById('image-input');
const form = document.getElementById('generate-meme');
const topText = document.getElementById('text-top');
const bottomText = document.getElementById('text-bottom');
const volGroup = document.getElementById('volume-group');
const voiceSelect = document.getElementById('voice-selection');
const volSlider = volGroup.querySelectorAll('input')[0];
const vol = document.querySelector('#volume-group img');
const synthesis = window.speechSynthesis;

voiceSelect.disabled = false;
var voices = [];
populateVoices();
synthesis.onvoiceschanged = populateVoices;

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  // clear canvas context
  context.clearRect(0, 0, canvas.width, canvas.height);
  // toggle relevant buttons
  generate.disabled = false;
  clear.disabled = true;
  read.disabled = true;
  // fill canvas context with black
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  // draw uploaded image onto canvas
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// Fires whenever the img input changes
imgInput.addEventListener('change', () => {
  // load in selected image into img src attribute
  img.src = URL.createObjectURL(imgInput.files[0]);
  // set img alt attribute by extracting img file name from file path
  img.alt = imgInput.files[0].name;
});

// Fires whenever the form object is submitted
form.addEventListener('submit', (event) => {
  event.preventDefault();
  // grab text in two inputs 
  let top = topText.value;
  let bottom = bottomText.value;
  // add relevant text to canvas
  context.fillStyle = 'white';
  context.font = '48px Helvetica';
  context.textAlign = 'center';
  context.fillText(top, canvas.width / 2, canvas.height * 0.10);
  context.fillText(bottom, canvas.width / 2, canvas.height * 0.96);
  // toggle relevant buttons
  generate.disabled = true;
  clear.disabled = false;
  read.disabled = false;
});

// Fires whenever the clear button is clicked
clear.addEventListener('click', () => {
  // clear image and/or text present
  context.clearRect(0, 0, canvas.width, canvas.height);
  form.reset();
  // toggle relevant buttons
  generate.disabled = false;
  clear.disabled = true;
  read.disabled = true;
});

// Fires whenever the read text button is clicked
read.addEventListener('click', () => {
  // browser speak text in two inputs out loud using selected voice type
  let top = topText.value;
  let bottom = bottomText.value;
  var readTop = new SpeechSynthesisUtterance(top);
  var readBottom = new SpeechSynthesisUtterance(bottom);
  var selectedVoice = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for (var i = 0; i < voices.length ; i++) {
    if (voices[i].name === selectedVoice) {
      readTop.voice = voices[i];
      readBottom.voice = voices[i];
    }
  }
  readTop.volume = volSlider.value / 100;
  readBottom.volume = volSlider.value / 100;
  synthesis.speak(readTop);
  synthesis.speak(readBottom);
});

// Fires whenever the volume group div has an input
volGroup.addEventListener('input', () => {
  // update vol val to inc or dec the vol at which text is read if read text button clicked
  // change volume icons depending on volume ranges
  if (volSlider.value >= 67) {
    vol.src = 'icons/volume-level-3.svg';
    vol.alt = 'Volume Level 3';
  }
  else if (volSlider.value >= 34) {
    vol.src = 'icons/volume-level-2.svg';
    vol.alt = 'Volume Level 2';
  }
  else if (volSlider.value >= 1) {
    vol.src = 'icons/volume-level-1.svg';
    vol.alt = 'Volume Level 1';
  }
  else {
    vol.src = 'icons/volume-level-0.svg';
    vol.alt = 'Volume Level 0';
  }
});

function populateVoices() {
  for (var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
