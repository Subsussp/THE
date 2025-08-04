import { destroyAudio } from './Destroyaudio.js';
import { removeAllStyles } from './removeAllstyles.js';
import { destroyThreeScene } from './three.js';
import { ROOTURL } from './var/URL.js';

export function load2DPage(container) {
   destroyThreeScene(); // stop animation loop, remove canvas, etc.
   removeAllStyles()
   document.getElementById('togglebar') && document.getElementById('togglebar').remove()
   
   // Remove old script if it exists
   const oldScript = document.querySelector('script[src="./src/js/2daudiofetching.js"]');
   if (oldScript) oldScript.remove();
   
   // Dynamically load the CSS for the new page (if not already loaded)
   if (!document.querySelector('link[href="./src/app.css"]')) {
     const link = document.createElement('link');
     link.rel = 'stylesheet';
     link.href = './src/app.css';
     document.head.appendChild(link);
    }

const script = document.createElement('script');
script.src = './src/js/2daudiofetching.js?t=' + Date.now(); // forces reload
script.type = 'module';
document.body.appendChild(script);
  container.innerHTML =  `
<div
id='togglebar'
class="flex ml-2 absolute top-[2%] bg-black w-fit px-1.25 py-1.25 shadow-box-up rounded-2xl dark:bg-box-dark dark:shadow-box-dark-out"
>
<div
  class="flex items-center justify-center gap-x-4 dark:shadow-buttons-box-dark rounded-2xl w-full px-1.5 py-1.5 md:px-3 md:py-3"
>
  <button
    title="Go to 3d Visualizer page"
    id="backTo3D"
    class="w-12 h-12 h-auto select-none
 text-xl mt-1 flex items-center justify-center text-white border-2 border-transparent shadow-button-flat-nopressed focus:opacity-100 focus:outline-none active:shadow-button-flat-pressed font-medium rounded-full text-sm dark:bg-button-curved-default-dark dark:shadow-button-curved-default-dark dark:border-0"
  >
    3D
  </button>

  <!-- Separator -->
  <div class="w-px h-6 bg-gray-500 dark:bg-gray-400"></div>
  
  <a
  href="https://mail.google.com/mail/u/0/?fs=1&to=sofaomda738@gmail.com&tf=cm"
  title="Contact me"
  class="w-12 h-12 text-light-blue-light dark:text-gray-400 border-2 inline-flex items-center justify-center p-2.5 border-transparent bg-light-secondary shadow-button-flat-nopressed focus:opacity-100 focus:outline-none active:shadow-button-flat-pressed font-medium rounded-full text-sm dark:bg-button-curved-default-dark dark:shadow-button-curved-default-dark dark:border-0"
  >
  <svg
  xmlns="http://www.w3.org/2000/svg"
  class="w-5 h-5"
  viewBox="0 0 20 20"
  fill="currentColor"
  >
  <path
  fill-rule="evenodd"
  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
  clip-rule="evenodd"
  ></path>
  </svg>  
  </a>
   <!-- Separator -->
  <div class="w-px h-6 bg-gray-500 dark:bg-gray-400"></div>
  
  <div 
  class="w-12 h-12 select-none font-[570] transition ease-in-out duration-300 hover:text-white text-light-blue-light dark:text-gray-400 border-2 inline-flex items-center justify-center p-2.5 border-transparent bg-light-secondary shadow-button-flat-nopressed focus:opacity-100 focus:outline-none active:shadow-button-flat-pressed rounded-full dark:bg-button-curved-default-dark dark:shadow-button-curved-default-dark dark:border-0"
  >
  <button id="toggleBtn" title="What feature or improvement would you like to see?" type="button">Idea?</button>
</div>

</div>

</div>
</div>
  <div class="mcontainer">
    <header>
      <img class="logo" src="https://cdn-icons-png.flaticon.com/512/9602/9602783.png" alt="Logo" />
      <h1 id="youtubeUrlabel">Visualize Your Favorite Music</h1>
    </header>
<div class="input-group">
<input type="text" id="youtubeUrl" placeholder="Paste YouTube URL here" />
  <div class="group">
  <button class="btn" id="loadBtn">Load & Play</button>
    <button class="btn" id="uploadBtn">Upload</button>
  </div>
</div>

<canvas id="mcanvas"></canvas>

<div class="mcanvas-footer">
  <label class="color-picker">
    Pick a Theme: <input type="color" id="colorInput" />
  </label>
  <input id="volumeSlider" type="range" min="0" max="1" step="0.001" value="1" />
</div>

<div id="controls">
  <button class="btn" id="playBtn">▶ Play</button>
  <button class="btn" id="stopBtn">⏹ Stop</button>
</div>
`;
  const suggestionContainer = document.getElementById('suggestionContainer');
  const toggleBtn = document.getElementById('toggleBtn');
  const input = document.getElementById('suggestionInput');
  toggleBtn.textContent = suggestionContainer.classList.contains('hidden') ? 'Idea?' : 'Hide';
  toggleBtn.addEventListener('click', () => {
    suggestionContainer.classList.toggle('hidden');
    toggleBtn.textContent = suggestionContainer.classList.contains('hidden') ? 'Idea?' : 'Hide';
  });

  suggestionContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
      fetch(`${ROOTURL}/sugg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      }).then(res => {
        if (res.ok) {
          alert('Suggestion sent');
        } else {
          alert('Failed to send suggestion');
        }
      }).catch(err => {
        alert('Fetch error:', err);
      });
    }
    input.value = '';
  });
  
  document.getElementById('backTo3D').onclick = () => {
    import('./three.js').then(module => {
      if(!window.localStorage.scene.includes('sc'))window.localStorage.scene = 'sc1'
      removeAllStyles()
         if (!document.querySelector('link[href="./src/style.css"]')) {
     const link = document.createElement('link');
     link.rel = 'stylesheet';
     link.href = './src/style.css';
     document.head.appendChild(link);
    }
    !suggestionContainer.classList.contains('hidden') && suggestionContainer.classList.add('hidden');

    container.innerHTML = `<div
id='togglebar'
class="flex ml-2 absolute top-[2%] bg-white w-fit px-1.25 py-1.25 shadow-box-up rounded-2xl dark:bg-box-dark dark:shadow-box-dark-out"
>
<div
  class="flex items-center justify-center gap-x-4 bg-white text-black shadow-buttons-box-dark rounded-2xl w-full px-1.5 py-1.5 md:px-3 md:py-3"
>
  <button
    title="Go to 2d Visualizer page"
    onclick="init2d()"
    class="w-12 h-12 flex items-center justify-center border-2 border-transparent shadow-button-flat-nopressed focus:opacity-100 focus:outline-none active:shadow-button-flat-pressed font-medium rounded-full text-sm bg-white text-black"
  >
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_429_10997)">
        <path d="M8 8C8 6.97631 8.39052 5.95262 9.17157 5.17157C10.7337 3.60947 13.2663 3.60947 14.8284 5.17157C16.3905 6.73366 16.3905 9.26632 14.8284 10.8284L9.17157 16.4853C8.42143 17.2354 8 18.2528 8 19.3137L8 20L16 20" stroke="#292929" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_429_10997">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    <span class="text-lg font-semibold scale-[1.1]">D</span>
  </button>

  <!-- Separator -->
  <div class="w-px h-6 bg-gray-500"></div>

  <a
      href="https://mail.google.com/mail/u/0/?fs=1&to=sofaomda738@gmail.com&tf=cm"

    title="Contact me"
    class="w-12 h-12 flex items-center justify-center border-2 border-transparent shadow-button-flat-nopressed focus:opacity-100 focus:outline-none active:shadow-button-flat-pressed font-medium rounded-full text-sm bg-white text-black"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clip-rule="evenodd"
      ></path>
    </svg>
  </a>
</div>


</div>`;
      destroyAudio()
      module.loadwhat();
    });
  };
}
