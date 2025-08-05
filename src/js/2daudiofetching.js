import { fetchaudio } from "./fetchaudio.js";
import { audioCache } from "./var/audiocache.js";
import { audio,loadLocalAudio  } from './var/audioManager.js';
let audioCtx, source, analyser, dataArray;
const uploadBtn = document.getElementById("uploadBtn");
const loadBtn = document.getElementById("loadBtn");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const volumeSlider = document.getElementById("volumeSlider");
const colorSlider = document.getElementById("colorInput");
const canvas = document.getElementById("mcanvas");
const ctx = canvas.getContext("2d");
const slider = document.getElementById('volumeSlider');  
  function updateTrackFill(value) {
    const percent = value * 100 + '%';
    slider.style.setProperty('--track-fill', percent);
  }

  slider.addEventListener('input', () => {
    updateTrackFill(slider.value);
  });
// File input (hidden)
const input = document.getElementById('audioUploadInput');
uploadBtn.onclick = () => input.click();
input.onchange =async (e) => {
 const file = e.target.files[0];
  if (!file) return;
  playBtn.innerText = '⏸ Pause';

  const fileURL = URL.createObjectURL(file);
  audio.src = fileURL;
  audio.crossOrigin = "anonymous";
  try {
    audio.pause()
    await audio.play();

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
      function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barCount = dataArray.length;
        const barWidth = (canvas.width / barCount) * 1.8; // Adjust spacing
        let x = 0;
  for (let i = 0; i < barCount; i++) {
    const value = dataArray[i];
    const barHeight = (value / 255) * canvas.height;
  function hexToRGB(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
    if(colorSlider.value == '#000000'){
        const r = 25;
        const g = 50;
        const b = 200;
        const hex = "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0");
        colorSlider.value = hex
      }
    const { r, g, b } = hexToRGB(colorSlider.value);
    ctx.fillStyle = `rgb(${value + r},${g},${b})`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

      draw();

  } catch (err) {
    console.error("Playback error:", err);
  }
};

  // Initialize on load
  updateTrackFill(slider.value);

  canvas.width = 800;
  canvas.height = 300;


  loadBtn.onclick = async () => {
    
    const youtubeUrlInput = document.getElementById("youtubeUrl");
    const url = youtubeUrlInput.value.trim();
    if (!url) return alert("Please enter a YouTube URL");
    try {
      if (audioCache.has(url)) {
        audio.src = audioCache.get(url);
      } else {
        const objectUrl = await fetchaudio(url)
        audioCache.set(url, objectUrl);
        audio.src = objectUrl;
      }
      audio.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
      });

      try {
        await audio.play();
        playBtn.innerText = '⏸ Pause';
      } catch (playError) {
        console.error("Error calling play():", playError);
        return;
      }
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      source = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barCount = dataArray.length;
        const barWidth = (canvas.width / barCount) * 1.8; // Adjust spacing
        let x = 0;
  for (let i = 0; i < barCount; i++) {
    const value = dataArray[i];
    const barHeight = (value / 255) * canvas.height;
  function hexToRGB(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
    if(colorSlider.value == '#000000'){
        const r = 25;
        const g = 50;
        const b = 200;
        const hex = "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0");
        colorSlider.value = hex
      }
    const { r, g, b } = hexToRGB(colorSlider.value);
    ctx.fillStyle = `rgb(${value + r},${g},${b})`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

      draw();
    } catch (err) {
      console.error(err);
    }
  };

  playBtn.onclick = () => {
    if (audio && playBtn.innerText == '▶ Play') {
      audio.play();
      playBtn.innerText = '⏸ Pause'
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    }else if(audio && playBtn.innerText == '⏸ Pause'){
        playBtn.innerText = '▶ Play'
        audio.pause();
    }
  };

  stopBtn.onclick = () => {
    if (audio) {
      audio.pause();
      playBtn.innerText = '▶ Play'
      audio.currentTime = 0;
    }
  };

  volumeSlider.oninput = () => {
    if (audio) {
      audio.volume = volumeSlider.value;
    }
  };
