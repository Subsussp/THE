import { audio } from "./var/audioManager.js";

export function destroyAudio() {
  if (audio) {
    audio.pause();
    audio.src = '';
    audio.removeAttribute('src'); // extra cleanup
    audio.load();
  }
}