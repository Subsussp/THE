import * as THREE from 'three';

const audioLoader = new THREE.AudioLoader();

const sampleFiles = {
  '1': 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/music/sample1.mp3',
  '2': 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/music/sample2.mp3',
  '3': 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/music/sample3.mp3',
  '4': 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/music/Farfromanyroad.mp3',
  '5': 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/music/sample5.mp3',
  '6': 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/music/sample6.mp3',
  '7': 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/music/sample7.mp3',
};
const loadedSamples = {};
function loadSample(file) {
  return new Promise(resolve => audioLoader.load(file, resolve));
}
function getAudiofiles(){
  Object.entries(sampleFiles).forEach(([key, path]) => {
    loadSample(path).then(buffer => {
      loadedSamples[key] = buffer;
    });
  });
}
export {loadedSamples,getAudiofiles}