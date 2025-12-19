import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

export const initializeHandDetection = async () => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: runningMode,
      numHands: 1,
      // Lowering to 0.5 for better detection in average lighting
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    console.log("HandLandmarker initialized successfully (Confidence: 0.5)");
  } catch (error) {
    console.error("Failed to initialize HandLandmarker:", error);
    throw error;
  }
};

export const detectHands = (video: HTMLVideoElement): HandLandmarkerResult | null => {
  if (!handLandmarker) return null;
  // Ensure video has data
  if (video.currentTime <= 0 || video.videoWidth === 0 || video.videoHeight === 0) return null;

  try {
    let startTimeMs = performance.now();
    return handLandmarker.detectForVideo(video, startTimeMs);
  } catch (e) {
    console.warn("Detection error:", e);
    return null;
  }
};