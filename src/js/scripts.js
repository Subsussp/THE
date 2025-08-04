import { load2DPage } from './back.js';
import { removeAllStyles } from './removeAllstyles.js';
import { initThreeScene, destroyThreeScene, loadwhat } from './three.js';
window.onload = () => {
  if (!window.localStorage.scene) {
    window.localStorage.scene = '';
  }

  const main = document.getElementById('main');

  if (
    !window.localStorage.path ||
    window.localStorage.path === null ||
    window.localStorage.path === 'home'
  ) {
    window.localStorage.path = 'home';

    const oldScript = document.querySelector('script[src="./src/js/2daudio.js"]');
    if (oldScript) oldScript.remove();

    document.getElementById('crd') && document.getElementById('crd').remove();

    loadwhat(); // 🚨 runs your scene loader
  } else if (window.localStorage.path === '2d') {
    Promise.resolve()
      .then(() => load2DPage(main))
      .then(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = './src/js/2daudiofetching.js';
        document.body.appendChild(script);
      });
  }
};

