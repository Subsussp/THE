import * as THREE from 'three';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

const audio = document.getElementById('audio');
document.addEventListener('DOMContentLoaded',async ()=>{
    // await audio.play()
})
let audioCtx, analyser, dataArray;
// let audioCtx2 = new AudioContext();
// let oscilli = audioCtx.createOscillator()
// let gain = audioCtx.createGain()
// let analyser2 = audioCtx.createAnalyser();
// analyser2.fftSize = 256
// gain.gain.value = 0;    
// oscilli.connect(gain).connect(analyser2)
// analyser2.connect(audioCtx.destination)
// oscilli.start()
// const bufferLength = analyser2.frequencyBinCount;
// dataArray = new Float32Array(bufferLength)
// oscilli.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 4);
audio.addEventListener('play', async () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio)
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256    
    source.connect(analyser);
    analyser.connect(audioCtx.destination)
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Float32Array(bufferLength)

}
});
window.addEventListener('keydown',(e)=>{
    if(e.key == 'a'){
       gain.gain.value = 1
    }
})
window.addEventListener('keyup',(e)=>{
    if(e.key == 'a'){
        gain.gain.value = 0
    }
})
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(60,window.innerWidth/ window.innerHeight ,0.1,1000)

let renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)
let orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.enablePan = true;
orbit.enableZoom = true;


camera.position.z = 5

let buffer = new THREE.BufferGeometry()
buffer.setAttribute("position", new THREE.BufferAttribute(new Float32Array([   
    1.0,   1.0,  0.0, 
    1.0,  -1.0,  0.0,  
    -1.0, -1.0,  0.0, 
    -1.0,  1.0,  0.0  ]
),3))
buffer.setIndex(  new THREE.BufferAttribute(
    new Uint16Array([
        0, 1, 3,
        1, 2, 3
    ]),
    1
)
)

let mat = new THREE.ShaderMaterial({
    uniforms:{
        resolution: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
        uAudio: {value: new Float32Array(128)}
    },
    side: THREE.DoubleSide,
    vertexShader: `
    varying vec3 pos;
    void main() {
        pos = position;  
        gl_Position = vec4(position,1);
        }
        `,
        fragmentShader: `
        uniform vec2 resolution;
        varying vec3 pos;
        uniform float uAudio[128];

        float getSample(float x){

            float index = x * 127.0 / resolution.x;

            int i0 = int(floor(index));
            int i1 = int(ceil(index));

            float t = fract(index);

            return mix(uAudio[i0], uAudio[i1], t);
        }
       void main(){

            float x = gl_FragCoord.x;
            float y = gl_FragCoord.y / resolution.y;

            float amp = getSample(x);

            amp = 0.5 - amp * 0.5;

            float thickness = 0.0004;

            float line = abs(thickness / (amp - y));

            gl_FragColor = vec4(vec3(line),1.0);
        }
            `
        })
        scene.add(new THREE.Mesh(buffer,mat))
let frame = 0
function animate(time){
    frame++
    if(analyser && frame % 4 == 0){
        analyser.getFloatTimeDomainData(dataArray)
        mat.uniforms.uAudio.value = dataArray
    }
    renderer.render(scene,camera)
    orbit.update()
    requestAnimationFrame(animate)
}
window.addEventListener('resize',()=> {
  camera.aspect = window.innerWidth/ window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  mat.uniforms.resolution.value= new THREE.Vector2(window.innerWidth, window.innerHeight);
})
animate()