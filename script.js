document.addEventListener('DOMContentLoaded', (event) => {
    const video = document.getElementById('video');

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://georgiomazraani.github.io/face-detection/models/'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://georgiomazraani.github.io/face-detection/models/'),
        faceapi.nets.faceRecognitionNet.loadFromUri('https://georgiomazraani.github.io/face-detection/models/'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://georgiomazraani.github.io/face-detection/models/')
    ]).then(startVideo);

    function startVideo() {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    onPlay();
                };
            })
            .catch(err => console.error("Error accessing camera: ", err));
    }

    function onPlay() {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = {
            width: video.width,
            height: video.height
        };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Mirror the canvas for drawing
            context.save();
            context.scale(-1, 1);
            context.translate(-canvas.width, 0);

            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            context.restore();

            // Draw face expressions without mirroring
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 100);
    }
});
