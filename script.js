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

      fetchQuoteByEmotion(dominantEmotion);

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

// Fetch a random quote based on the detected emotion
function fetchQuoteByEmotion(emotion) {
  const apiUrl = "https://zenquotes.io/api/random";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const quote = data[0].q;
      displayQuote(quote);
    })
    .catch(error => {
      console.error("Error fetching quote:", error);
    });
}

// Display the quote on the webpage
function displayQuote(quote) {
  const quoteElement = document.getElementById("quote");
  quoteElement.textContent = quote;
}
