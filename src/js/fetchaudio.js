import { ROOTURL } from "./var/URL.js";

export async function fetchaudio(url,type = 'youtube'){
    const blob = await fetch(`${ROOTURL}/audio?url=${encodeURIComponent(url)}&type=${type}`).then(r => r.blob());
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl
}