import * as MyThree from '../../../build/three.webgpu.js';

export let listener = new MyThree.AudioListener();
export let sound = new MyThree.Audio(listener);