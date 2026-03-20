import { load2DPage } from './back.js';
import { removeAllStyles } from './removeAllstyles.js';
import { initThreeScene, destroyThreeScene, loadwhat } from './three.js';
if(!window.localStorage.scene) {window.localStorage.scene = 'sc2'}
const main = document.getElementById('main');
if(!window.localStorage.path || window.localStorage.path == null || window.localStorage.path == 'home'){
  window.localStorage.path = 'home'
  loadwhat();
}
