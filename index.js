const startBtn = document.getElementById("startBtn");
const visibleText = document.getElementById("visibleText");
const spanText = document.querySelector("#visibleText span");
const canvas = document.getElementById("canvas");

const URL = "https://teachablemachine.withgoogle.com/models/0-BqYekki/";
let model, webcam, ctx, labelContainer, maxPredictions;

// window.addEventListener("load", () => {
//   init();
// });

startBtn.addEventListener("click", async function () {
  if (startBtn.innerText == "Start") {
    startBtn.innerText = "Starting";
    init();
  }
  if (startBtn.innerText == "Stop") {
    await webcam.stop();
    canvas.style.display = "none";
    spanText.innerText = "Off";
    startBtn.innerText = "Start";
    visibleText.style.border = "1px solid grey";
    spanText.style.color = "grey";
  }
});

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const size = 200;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM

  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }

  canvas.style.display = "block";
  startBtn.innerText = "Stop";
}

async function loop(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  //   for (let i = 0; i < maxPredictions; i++) {
  //     const classPrediction =
  //       prediction[i].className + ": " + prediction[i].probability.toFixed(2);
  //     labelContainer.childNodes[i].innerHTML = classPrediction;
  //   }

  if (startBtn.innerText == "Stop") {
    if (prediction[1].probability.toFixed(1) >= 0.5) {
      spanText.innerText = "Poor";
      visibleText.style.border = "1px solid red";
      spanText.style.color = "red";
    } else {
      spanText.innerText = "Good";
      visibleText.style.border = "1px solid greenyellow";
      spanText.style.color = "greenyellow";
    }
  }
  drawPose(pose);
  // finally draw the poses
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
