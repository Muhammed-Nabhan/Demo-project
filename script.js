const video = document.getElementById("video");

// Load face detection models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models")
]).then(startVideo);

// Start video streaming
function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        initializeFaceDetection();
      };
    })
    .catch(err => {
      console.error("Error accessing camera:", err);
    });
}

// Initialize face detection and emotion recognition
function initializeFaceDetection() {
  video.addEventListener("play", () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      // Get the dominant emotion from the detected expressions
      const emotions = detections.map(detection => {
        const expressions = detection.expressions;
        const maxExpression = Object.keys(expressions).reduce(
          (a, b) => (expressions[a] > expressions[b] ? a : b)
        );
        const maxPercentage = expressions[maxExpression];
        return { emotion: maxExpression, percentage: maxPercentage };
      });

      // Get the dominant emotion with the maximum percentage
      const dominantEmotion = getDominantEmotion(emotions);

      // Display the dominant emotion on the webpage
      const dominantEmotionElement = document.getElementById("dominant-emotion");
      dominantEmotionElement.textContent = ` ${dominantEmotion}`;

      const quoteElement=document.getElementById("quote");
      const quote=getpredefinedQuote(dominantEmotion);
      quoteElement.textContent=quote;

    }, 100);
  });
}

// Get the dominant emotion with the maximum percentage
function getDominantEmotion(emotions) {
  let maxPercentage = 0;
  let dominantEmotion = null;

  for (const emotionData of emotions) {
    const { emotion, percentage } = emotionData;
    if (percentage > maxPercentage) {
      maxPercentage = percentage;
      dominantEmotion = emotion;
    }
  }

  return dominantEmotion;
}

/// Fetch a random quote based on the detected emotion
function getpredefinedQuote(emotion) {
  const quotes={
    happy:"Happiness is a choice.",
    sad:"Every cloud has a silver lining.",
    angry:"Don't let anger control you.",
    surprised:"Life is full of surprises.",
    disgusted:"Choose to focus on the positive",
    fearful:"Face your fears and overcome them.",
    neutral:"Stay calm and find inner peace."
  };
return quotes[emotion] || "Emotion not recognized."
}


