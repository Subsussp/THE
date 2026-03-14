# THE — Audio Reactive Visualizer

[Live Demo](https://subsussp.github.io/THE)

**THE** is a WebGL-powered music visualizer that transforms audio tracks into dynamic, real-time visual experiences. Users can upload their own music, and the site will generate a unique audiovisual display using 3D graphics, shaders, and sound analysis.

---
## GPU Required

This project requires a **dedicated or integrated GPU** to run properly.  
If your system does not support **WebGL / WebGPU** or hardware acceleration,  
some features may not work, or performance may be severely degraded.

---

## Features

- **Audio Upload** — Upload local audio files (e.g., MP3, WAV)
- **Real-Time Audio Analysis** — Uses Web Audio API to extract frequency & amplitude data
- **3D Visual Effects** — Built with Three.js, custom shaders, and particle systems
- **Customizable Scenes** — Visuals react to beat, bass, treble, and volume
- **Optimized Performance** — Smooth animation loop with efficient rendering
- **Future Plans** — MIDI input, preset scenes, user controls, and mobile support

---

## Tech Stack

| Tool | Description |
|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" width="24"/> **JavaScript** | Main frontend language |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5" width="24"/> **HTML5** | Markup & UI |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" width="24"/> **CSS3** | Styling and layout |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" alt="Three.js" width="24"/> **Three.js** | 3D graphics & rendering |
| **Web Audio API** | Audio frequency & waveform analysis |
| **TSL (Three Shader Language)** | Shader logic for particle dynamics |
| **GLSL** | Custom fragment & vertex shaders |

---


## Credits

Thanks to [three.js WebGPU attractors example](https://github.com/mrdoob/three.js/blob/master/examples/webgpu_tsl_compute_attractors_particles.html) by [@mrdoob](https://github.com/mrdoob) I was able to create the great particles scene I integrated my own audio interactivity to the particles :).

---

## LICENSE

**All Rights Reserved**

Copyright (c) 2025

This project and all associated source code, assets, and content are the intellectual property of the author.

- **You may not** use, copy, modify, distribute, sublicense, or sell any part of this software for any purpose.
- **You may not** include this project or any part of it in your own projects, commercial or non-commercial.
- **You may not** host, mirror, or redistribute this content.
- **You may not** use this project or its code for learning, demonstration, or AI training purposes.

No rights are granted unless **explicit written permission** is provided by the author.

---

