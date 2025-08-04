export let audio = new Audio();

export function loadLocalAudio(file) {
  if (!file) return;
  const objectUrl = URL.createObjectURL(file);
  audio.src = objectUrl;
  audio.load();
  audio.play();

}