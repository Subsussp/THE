import * as THREE from 'three';
// import { Reflector } from 'three/addons/objects/Reflector.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TWEEN from 'https://unpkg.com/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "./src/jsm/shaders/VignetteShader.js";
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/DRACOLoader.js';
import { AfterimagePass } from './src/jsm/postprocessing/AfterimagePass.js';
gsap.registerPlugin(ScrollTrigger,ScrollSmoother,(gsap.plugins.ScrollToPlugin || ScrollToPlugin));
const sfx = new (window.AudioContext || window.webkitAudioContext)();
let buffer;
let buffer2;
let gain2 = sfx.createGain();
let animationId;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="smooth-wrapper disposable">
      <div class="smooth-content">
        <section class="smooth-visualzer" style="height:180vh;"></section> 
        <section class="last-visualzer" style="height:180vh;"></section> 
      </div>
    </div>
    <h2 id="description" class="disposable"></h2>
    <h1 id="statue" class="disposable"></h1>
  `);
window.addEventListener('DOMContentLoaded',()=>{
  window.scrollTo(0,0)
})
gain2.gain.value = .3
let Shouldplaysfx = true
fetch('./music/sfx.ogg')
  .then(r => r.arrayBuffer())
  .then(data => sfx.decodeAudioData(data))
  .then(decoded => buffer = decoded);
fetch('./music/mainsfx.ogg')
  .then(r => r.arrayBuffer())
  .then(data => sfx.decodeAudioData(data))
  .then(decoded => buffer2 = decoded);
const buttons = document.querySelectorAll('.sfxbtn');
if(buttons){
  buttons.forEach((button)=>{
    button.addEventListener('mouseenter', () => {
    if(!Shouldplaysfx)return;
    const source = sfx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain2).connect(sfx.destination);
    Shouldplaysfx = false
    source.start();
  })
    button.addEventListener('mouseleave', () => {
      Shouldplaysfx = true
  })

});
}
const smoother = ScrollSmoother.create({
  wrapper: '.smooth-wrapper',
  content: '.smooth-content',
  smooth: 1.5,
  effects: true
});

let enteredfromstatue = false;
let firstRender = true;
const loaderg = new GLTFLoader();
let main = document.getElementById('main')
let First = document.getElementById('First')
let second = document.getElementById('Second')
let third = document.getElementById('Third')
let scene = new THREE.Scene()
let space = 288 * (855 / window.innerHeight)
let turn = 0
let pheta = 0


// Settings 
let config = {
  DirectionalLight: true,
  PointLight: true,
  SpotLight: false,
  AmbientLight: false,
  HemisphereLight:false,
  DirectionalLightHelper: false,
  PointLightHelper:true,
  rotation:true,
  transition:false,
  RectAreaLight:false,
  distortion: 1.0,
  Reset:()=>{
    next('right')
    // camera.position.y = 40
    // camera.position.z = 200
    // camera.position.x = 0
    // camera.lookAt(new THREE.Vector3(0,40,0))
  },
}
config.SpotLightHelper = config.SpotLight


// Navbar audio animation
const audio = document.getElementById('audio');
let audioCtx, analyser, dataArray,gain;
let speed = 1
audio.addEventListener('play', async () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio)
    gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048
    source.connect(analyser);
    analyser.connect(gain).connect(filter).connect(audioCtx.destination)
    
    const bufferLength = analyser.frequencyBinCount;
    filter.type = "lowpass"
    console.log(filter.frequency.value)
    gsap.fromTo(filter.frequency,{value:20000}, {
        value: 200,
        ease: "power1.out",  
        scrollTrigger: {
          trigger: '.smooth-content',
          start: 'top top',
          end: '50% top',
          scrub: 3,
        },
  })
      gsap.to(gain.gain, {
        value: .4,
        ease: "power1.out",  
        scrollTrigger: {
          trigger: '.smooth-content',
          start: 'top top',
          end: '50% top',
          scrub: 3,
        },
  })
    dataArray = new Uint8Array(bufferLength)
  }
});
audio.pause()

audio.addEventListener('playing', () => {
  console.log('Audio is playing, starting analysis');

  function analyze() {
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }

    const average = sum / dataArray.length;


    const normalized = average / 160;
    speed =  normalized.toFixed(3)

     requestAnimationFrame(analyze);
  }

  analyze();
});

let canvas = document.getElementById('wave') 
let Loadercanvas = document.getElementById('wave2') 
const ctx = canvas.getContext("2d");
const ctx2 = Loadercanvas.getContext("2d");
let animateId = null;
canvas.height = 20
canvas.width = 20 * 6 / 3
Loadercanvas.height = 20
Loadercanvas.width = 20 * 6 / 3
let firstclick = true
let run = false
let allow = true
let opacity = 0
let opacityallowance = false
canvas.addEventListener('click',async (e)=>{
  if(!allow || firstclick){
    e.preventDefault()
    return
  }
  opacity = !run ? 0 : 1  
  run = !run
  if(run){
    audio.muted = false
    await audio.play();
  }else{
    audio.muted = true
    await audio.pause();
  }
  allow = false
  if(!animateId){
    loop()
  }
})
function drawlines(pheta,startingH = canvas.height,off = 0){
  ctx.beginPath()
  for(let i =0; i < canvas.width / 6 ;i++){
    let y = Math.sin((pheta + i * .5))
    ctx.moveTo(10.5 + i * 4,startingH )
    ctx.lineTo(10.5 + i * 4,startingH + off + (y * 7 - 8) * opacity* speed * 2 )
  }
  if(opacity< 1 && run && opacityallowance){
    opacity= +(opacity+ 0.04).toFixed(2);
  }
  if(opacity== 1 && opacityallowance){
    allow = true
  }
  if(opacity> 0 && !run && opacityallowance){
    opacity= +(opacity- 0.01).toFixed(2);
  }if(opacity== 0 && opacityallowance){
    allow = true
  }
  ctx.strokeStyle = "#ffffff"; 
  ctx.lineWidth = 1;    
  ctx.stroke()
}

function loop(){
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  if(pheta >= 360){
    pheta = 0
  }
  let phetaR = pheta * Math.PI / 180
  pheta += 2 * 4 * speed
  drawlines(phetaR,undefined,-3)
  animateId = requestAnimationFrame(loop)
}
drawlines(pheta,undefined,-3)

let loaderanimationr;
let factor = {o:0};
if(window.scrollY == 0){
  function DrawLines(){
    ctx2.clearRect(0, 0, Loadercanvas.width, Loadercanvas.height);
    ctx2.beginPath()
    for(let i =0; i < Loadercanvas.width / 6 ;i++){
      let rand = Math.random() 
      let alpha =  Math.min(1, ((rand*i / 2 ) + factor.o)); 
      ctx2.beginPath();
      ctx2.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx2.moveTo(10.5 + i * 4, Loadercanvas.height);
      ctx2.lineTo(10.5 + i * 4, Loadercanvas.height - 3 );
      ctx2.stroke();
    }
  }
  DrawLines()
loaderanimationr = setInterval(DrawLines, 300);
}


document.addEventListener('click',()=>{
  if(firstclick){
    firstclick = false
    canvas.click()
  }  
})

// ########################################

// Camera setup 
let camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.01,5000 )
camera.position.y = 68
camera.position.z = 180

// renderer
const renderer = new THREE.WebGLRenderer({ antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
main.appendChild(renderer.domElement);



const distanceZ = camera.position.z + 40; 
const fov = camera.fov * (Math.PI / 180); 

const height = 2 * Math.tan(fov / 2) * distanceZ;

const width = 505.7840285242011;

// Object setup 


const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); 
loaderg.setDRACOLoader(dracoLoader);
loader.setDRACOLoader(dracoLoader);
const gltf = await loaderg.loadAsync('https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/3D/Apollo/Statue.glb');
const glb = await loader.loadAsync( 'https://cdn.jsdelivr.net/gh/Subsussp/THE@gh-pages/3D/Statue.glb' )


let gmaterial = new THREE.MeshStandardMaterial({color: 0xffffff, 
  roughness: 0.2, 
  metalness: 0,
  side: THREE.FrontSide
});

let statue = glb.scene
statue.traverse(child => {
  if (child.isMesh) {
    if (child.geometry) {
      child.geometry.center();;    
    }
    child.material = gmaterial
  }
});



// let statue = new THREE.Mesh( geometry,gmaterial )
// let screengeo = new THREE.PlaneGeometry(width ,height)
// const renderTarget = new THREE.WebGLRenderTarget(width ,height)
// let smaterial = new THREE.MeshBasicMaterial({
//   map:renderTarget.texture
// });
// let screen = new THREE.Mesh( screengeo,smaterial )
// screen.position.set(0,0,-174.7)

// EXTRA SCENE

const vertexShader = document.getElementById("vertexshader").textContent;
const fragmentShader = document.getElementById("fragmentshaderN").textContent;
const params = {    
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    threshold: 0.5,
    strength: 0.4,
    radius: 0.8,
};

const uniforms = {
  u_time: { value: 0.0 },
  u_frequency: { value: 0.0 },
  u_red: { value: params.red },
  u_green: { value: params.green },
  u_blue: { value: params.blue },
  uOpacity: { value: 0.0 },
  fOpacity: { value: 1.0 },
};
const extrageo = new THREE.IcosahedronGeometry(4,30);
const planeMaterial = new THREE.ShaderMaterial({
    uniforms
    ,vertexShader,
    fragmentShader,
    wireframe:true,
    transparent:true,
    depthWrite:false
});
let extramesh = new THREE.Mesh(extrageo,planeMaterial)

extramesh.position.set(0,0,-0.7)

renderer.outputColorSpace = THREE.SRGBColorSpace;

// #######################


let statue2 = gltf.scene; 
statue2.traverse(child => {
  if (child.isMesh) {
    if (child.geometry) {
      child.geometry.computeVertexNormals();    
    }
  }
});
statue.position.set(space,50,0)
// statue.rotation.set(-Math.PI / 2,0,0)
statue2.scale.set(100,100,100);
statue2.position.set(0,-100,0);
// Line Panel
let lineprogress={progress:0}
const canvas3 = document.createElement("canvas");
canvas3.width = 512;
canvas3.height =102.4;

const ctx3 = canvas3.getContext("2d");
ctx3.fillRect(0, 0, canvas3.width, canvas3.height);

ctx3.fillStyle = "white";
document.fonts.load("700 50px Inter").then(() => {
  ctx3.font = "700 50px Inter";
  ctx3.letterSpacing = "-2px";
  ctx3.textBaseline = "middle";
  ctx3.textAlign= "center";
  ctx3.fillText("Click  on  the  Statue",canvas3.width / 2, canvas3.height / 2);
});

const textTexture = new THREE.CanvasTexture(canvas3);

let group = new THREE.Group()
let panelgeo = new THREE.PlaneGeometry(50,12,1,1)
let panelmat = new THREE.ShaderMaterial({
  uniforms: {
    uProgress: { value: 0 },
    uTexture: { value: textTexture }
  },
  transparent:true,
  depthTest:false,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uProgress;
    varying vec2 vUv;
    void main() {
      if(vUv.x > uProgress) discard; // reveal only left part
      vec4 tex = texture2D(uTexture, vUv);
      gl_FragColor = tex;
    }
  `,
})
let panel1 = new THREE.Mesh(panelgeo,panelmat)
panel1.position.set(27.47949611050889 + 10 + 25,63.99423323544384 + 30, 42)
const Panelpoints = [
  new THREE.Vector3(-10, 0, -20),
  new THREE.Vector3(0, 30, 40),
  new THREE.Vector3(10, 30, 40)
];

const curve = new THREE.CatmullRomCurve3(Panelpoints);
const smoothPoints = curve.getPoints(400);
const Panelgeometry = new THREE.BufferGeometry().setFromPoints(smoothPoints);
const Panelmaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const line = new THREE.Line( Panelgeometry, Panelmaterial );
line.computeLineDistances();
line.position.set(28.47949611050889,63.99423323544384,0)
group.add(panel1)
group.add(line)
scene.add(group)
const edges = new THREE.EdgesGeometry(panelgeo);

const line4 = new THREE.LineSegments(
  edges,
  new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uMinX: { value: -25 },
    uMaxX: { value: 25 },
    progress:{value: 1.0},
    Fade:{value: 0.0}
  },
  vertexShader: `
    varying float vFade;
    uniform float Fade;

    uniform float uMinX;
    uniform float uMaxX;
    uniform float progress;
    void main() {
      float t = (position.x - uMinX) / (uMaxX - uMinX);

      vFade = Fade - t * progress;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying float vFade;
    void main() {
      gl_FragColor = vec4(0.6, 0.6, 0.6, vFade );
    }
  `
})
);


panel1.add(line4);
let statues = [statue2,statue,]
let names = [`Apollo`,'Dionysus',]
let description = [`God Of Music`,'God Of Wine',]

// Light

let light = new THREE.DirectionalLight(0xfafafa,1)
const light1 = new THREE.PointLight(0xfafafa,100,90,0.7)

let mat = new THREE.ShaderMaterial({
  uniforms:{
    distortion2:{value:1.0},
    viewport:{value:window.innerHeight},
    uAudio: { value: new Float32Array(1024) },
    time: {value: 1.0},
    opacity: {value : 1.0}

  },
  transparent:true, 
  blending:THREE.NormalBlending,  
  vertexShader: `
  varying vec2 vUv;
  varying vec3 vposistion;
  uniform float uAudio[1024];
  uniform float time;
  uniform float distortion2;
vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}


mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);

  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

float saturate(float x)
{
  return clamp(x, 0.0, 1.0);
}

vec3 curl_noise(vec3 p)
{

  // return curlNoise(p);
  const float step = 0.01;
  float ddx = cnoise(p+vec3(step, 0.0, 0.0)) - cnoise(p-vec3(step, 0.0, 0.0));
  float ddy = cnoise(p+vec3(0.0, step, 0.0)) - cnoise(p-vec3(0.0, step, 0.0));
  float ddz = cnoise(p+vec3(0.0, 0.0, step)) - cnoise(p-vec3(0.0, 0.0, step));

  const float divisor = 1.0 / ( 2.0 * step );
  return ( vec3(ddy - ddz, ddz - ddx, ddx - ddy) * divisor );
}

vec3 fbm_vec3(vec3 p, float frequency, float offset)
{
  return vec3(
    cnoise((p+vec3(offset))*frequency),
    cnoise((p+vec3(offset+20.0))*frequency),
    cnoise((p+vec3(offset-30.0))*frequency)
  );
}
  uniform 
  void main(){
    vUv = uv;
    gl_PointSize = .2;
    vposistion = position;
    vec3 pos = position;
    int index = 1024 - int(mod((position.y + 0.5) * 1024.0, 1024.0));
    float audioValue = uAudio[index];
    vec3 distortion = curl_noise(vec3(pos.x + time ,pos.y,0.0));
    vec3 finalposition = pos * distortion;
    // vec3 finalposition = pos ;
    // vposistion.x += .4 - audioValue * 0.2 * time ;
    // pos.x += audioValue * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalposition, 1.0);

   }
  `,fragmentShader:`
    varying vec3 vposistion;
    uniform float opacity;
    void main() {
      float x = vposistion.x;
      float fade = 1.0 - (x / .4);
      // gl_FragColor = vec4(fade,fade,fade, fade); 
      gl_FragColor = vec4(1.0,1.0,1.0, opacity); 
    }
  `})
let mat2 = new THREE.ShaderMaterial({
  uniforms:{
    distortion:{value:config.distortion},
    viewport:{value:window.innerHeight},
    uAudio: { value: new Float32Array(1024) },
    pMouse: { value: new THREE.Vector2() },
    time: {value: 1.0},
    etime: {value: 1.0},
    maxY: {value: 66.0027},
    maxX: {value: 206.6101}
  },
  transparent:true, 
  blending:THREE.NormalBlending,  
  vertexShader: ` 
  varying vec2 vUv;
  varying vec3 vposistion;
  uniform float time;
  uniform float uAudio[1024];
  vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}


mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);

  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

float saturate(float x)
{
  return clamp(x, 0.0, 1.0);
}

vec3 curl_noise(vec3 p)
{

  // return curlNoise(p);
  const float step = 0.01;
  float ddx = cnoise(p+vec3(step, 0.0, 0.0)) - cnoise(p-vec3(step, 0.0, 0.0));
  float ddy = cnoise(p+vec3(0.0, step, 0.0)) - cnoise(p-vec3(0.0, step, 0.0));
  float ddz = cnoise(p+vec3(0.0, 0.0, step)) - cnoise(p-vec3(0.0, 0.0, step));

  const float divisor = 1.0 / ( 2.0 * step );
  return ( vec3(ddy - ddz, ddz - ddx, ddx - ddy) * divisor );
}

vec3 fbm_vec3(vec3 p, float frequency, float offset)
{
  return vec3(
    cnoise((p+vec3(offset))*frequency),
    cnoise((p+vec3(offset+20.0))*frequency),
    cnoise((p+vec3(offset-30.0))*frequency)
  );
}
  uniform float etime;
  uniform vec2 pMouse;
  void main(){
    vUv = uv;
    gl_PointSize = .2;
    vposistion = position;
    vec3 pos = position;
    int index = int(mod((position.x + 243.18946838378906) / (210.0 * 2.0) *  486.3789482219113, 1024.0));
    float audioValue = uAudio[index];
    vec3 distortion = curl_noise(vec3(pos.x + 20.0 *time  ,pos.y ,0.0));
    // vec3 distortion = curl_noise(vec3(pos.x + time * 50.0 ,pos.y ,0.0));

    vec3 finalposition = pos * distortion;
    vposistion.y -= 63.0 - audioValue * 20.0;
    vec4 clipos = projectionMatrix * modelViewMatrix * vec4(finalposition, 1.0);
    vec2 ndcpos = clipos.xy / clipos.w;
    float influnce = smoothstep(0.05,0.0,distance(ndcpos,pMouse));
    finalposition.y += influnce * (pMouse.y * 900.0- finalposition.y)* etime;
    finalposition.x += influnce * (pMouse.x * 800.0- finalposition.x)* etime;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalposition, 1.0);
   }
  `,fragmentShader:`
    varying vec3 vposistion;
    void main() {
      float y = abs(vposistion.y);
      float fade = 1.0 - (y / 63.0);
      // fade = fade * 7.4;
      gl_FragColor = vec4(fade,fade,fade, fade ); 
      // gl_FragColor = vec4(1.0,1.0,1.0, 1.0); 

    }
  `})
let count = 500000;
let plane2 = new THREE.PlaneGeometry(1.5,.4,window.innerWidth,480)
let geo = new THREE.BufferGeometry()
let points = new Float32Array(count * 3)
let particlesPerRow = 2500
let s = 0

let offset = width / particlesPerRow  ;
for(let i =0; i < count;i++){
   if(i > (particlesPerRow * (s + 1))){
    s++
  }
  let col = i % particlesPerRow;
  let x = -width/2 + col * offset

  let y = -s * offset 
  points[i * 3] = x
  points[i * 3 + 1] = y
  points[i * 3 + 2] = 0
}
geo.setAttribute('position',new THREE.BufferAttribute(points,3))
let plane = new THREE.PlaneGeometry(.4 ,1,480,innerHeight)
const pos = plane.attributes.position;
const pos2 = plane2.attributes.position;
for (let i = 0; i < pos.count; i++) {
  pos.setX(i, pos.getX(i) + .4  / 2); 
}
for (let i = 0; i < pos2.count; i++) {
  pos2.setY(i, pos2.getY(i) - .4 / 2);
}
pos.needsUpdate = true;
// pos2.needsUpdate = true;
let part = new THREE.Points(geo,mat2)
let part1 = new THREE.Points(plane,mat)
let part2 = new THREE.Points(plane2,mat2)
part.position.set(0,68,-40)
part1.scale.set(278,278,278)
part1.position.set(0,68,0)
part1.position.set(0,68,-40)
part1.rotateY(Math.PI)




let cameraB = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.01,5000 )
cameraB.position.y = 400
cameraB.position.x = 50
cameraB.position.z = 500
cameraB.lookAt(new THREE.Vector3(0,0,0))
let activecamera = camera
// let orbit = new OrbitControls(activecamera, renderer.domElement);
// orbit.enableDamping = true;
// orbit.enablePan = false;
// orbit.enableZoom = false;
// orbit.minAzimuthAngle = 0;  
// orbit.maxAzimuthAngle = 0;  


// addons 

// let mirror = new Reflector(new THREE.PlaneGeometry( 500, 500 ), {	
//   textureWidth: window.innerWidth * window.devicePixelRatio,
// 	textureHeight: window.innerHeight * window.devicePixelRatio
//   ,	
//   color: 0x4c4c4c

// })

// mirror.rotateX(-Math.PI / 2)
// mirror.position.y = -1
// scene.add(mirror)  
  
// Arrows 
let textureloder = new THREE.TextureLoader()
let Ltexture = await textureloder.loadAsync('./textures/left.png')
let Rtexture = await textureloder.loadAsync('./textures/right.png')
let right = new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({map:Rtexture,transparent:true,depthTest: false}))
let left = new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({map:Ltexture ,transparent:true,depthTest: false}))
const distance = activecamera.position.z;

const vFOV = THREE.MathUtils.degToRad(camera.fov);
const viewHeight = 2 * Math.tan(vFOV / 2) * distance;
const viewWidth = viewHeight * camera.aspect;
right.position.set(viewWidth / 2 - viewWidth / 10.345582401631388,viewHeight / 4,0)
right.rotateY(-1)

left.position.set(-viewWidth / 2 + viewWidth / 10.345582401631388,viewHeight / 4,0)
left.rotateY(1)
right.name = 'right'
left.name = 'left'


light.position.set(-1000,0,-1000)
light1.position.set(19,75.5327255724013,95.61752943615642)
// light1.position.set(-100,0,40)

scene.add(light) 
scene.add(light1) 

let ongoing;

statue.layers.set(1);
statue2.layers.set(1);
part1.layers.set(1)
part.layers.set(1)
left.layers.set(2)
right.layers.set(2)
activecamera.layers.enable(1)
activecamera.layers.enable(2)

scene.add(statue);
scene.add(statue2);

scene.add(right)
scene.add(left)

scene.add(extramesh)


scene.add(part)
// scene.add(part1)
// scene.add(part2)

const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, activecamera));

const afterimagePass = new AfterimagePass();
afterimagePass.uniforms['damp'].value = 0.65;  
composer.addPass(afterimagePass);



const Vignette = new ShaderPass(VignetteShader)
Vignette.uniforms["offset"].value = 1.7
Vignette.uniforms["darkness"].value = 1
composer.addPass(Vignette)

let index = 0
let directionro = -1  
// Animate 
function next(direction){
  if(direction == 'right'){directionro = 1}
  else{directionro = -1}
  new TWEEN.Tween(statues[turn].position).to({
  x: direction == 'right' ? space:-space}
).easing(TWEEN.Easing.Quadratic.InOut)
.start()
.onStart(()=>{
  document.getElementById('statue').style.opacity = 0
  document.getElementById('description').style.opacity = 0
})

  if((turn + 1) > statues.length - 1) {
    turn = 0 
  }else{
    turn++
    }
  statues[turn].position.x = direction == 'right'? -space : space
  origin(direction)
}

function origin(){  
  new TWEEN.Tween(statues[turn].position).to({
  x: 0}
).easing(TWEEN.Easing.Quadratic.InOut).onComplete(() => {
  index == 0 ? ++index : index = 0
  document.getElementById('statue').innerText = names[index]
  document.getElementById('description').innerText = description[index]
  document.getElementById('statue').style.opacity = 1
  document.getElementById('description').style.opacity = 1
  ongoing = false
  }).start()
}
let scrollProgress = {progress: 0};
gsap.to(scrollProgress, {
  progress:1,
  ease: "power1.out",  
  scrollTrigger: {
    trigger: '.last-visualzer',
    start: '5% top',
    end: 'bottom bottom',
    scrub: 3,
    snap: {
      snapTo: [0,1],
    },
    onUpdate: (e)=>{
      if(e.progress == 0){
        First.style.opacity = 0.3
        First.style.transform = `translateY(15px) scale(0.8)`
        second.style.opacity = 1.0
        extramesh.material.uniforms.fOpacity.value = 1
        if(extramesh.material.uniforms.UOpacity?.value)extramesh.material.uniforms.UOpacity.value = 1
      }else{ 
        First.style.opacity = e.progress * 0.6 + .3
        First.style.transform = `translateY(${e.progress * 60 + 15}px) scale(${e.progress * 0.2 + 0.8})`
        
        second.style.opacity = 1.0 - e.progress *0.5
        second.style.transform = `translateY(${e.progress * 50 + 25}px) scale(${1 - e.progress * 0.2 })`

        third.style.transform = `translateY(${e.progress * 55 + 35}px) scale(${0.8 - 0.2 * e.progress })`

        document.getElementsByClassName('os')[0].style.opacity = (1- e.progress)
        document.getElementsByClassName('is')[0].style.opacity = (1- e.progress)
        if(gain?.gain)gain.gain.value = (1- e.progress) * Math.random() 
        extramesh.material.uniforms.fOpacity.value = (1- e.progress) * Math.random() 
        if(e.progress == 1){
          if(scene && enteredfromstatue){
            window.addEventListener("wheel", (e) => {
              e.preventDefault();
            }, { passive: false });
            enteredfromstatue = false
            setTimeout(()=>{
              scene = null;
              renderer.dispose();
              renderer.domElement.remove(); 
              cancelAnimationFrame(animationId);
              document.body.querySelectorAll('.disposable').forEach((node)=>node.remove())
              ScrollTrigger.getAll().forEach(trigger => trigger.kill());
              let script = document.createElement('script')
              script.src = "./src/js/scripts.js"
              script.type = "module"  
              audioCtx.close();
              document.body.appendChild(script)
            },2000)
          }
          }
      }
    },
  },

})
gsap.to(activecamera.position, {
  z: 5.57642003011228, 
  y:192.335393361824,
  ease: "power1.out",  
  scrollTrigger: {
    trigger: '.smooth-content',
    start: 'top top',
    end: '50% top',
    scrub: 3,
    snap: {
      snapTo: [0,1],
    },
    onUpdate: (e)=>{
      let scrollinst = document.getElementById('scrollinst').style.opacity
      if(scrollinst != '0'){
        scrollinst = 1 - e.progress 
        First.style.transform = `translateY(${e.progress * 35 - 20}px) scale(${ 0.6 + 0.2 * e.progress })`
        second.style.opacity = e.progress * 0.6 + .4
        second.style.transform = `translateY(${e.progress * 30 - 5}px) scale(${ e.progress * 0.2 + 0.8 })`
        third.style.opacity = 1.0 - e.progress * 0.6
        third.style.transform = `translateY(${e.progress * 35}px) scale(${ 1 - 0.2 * e.progress })`
      }

    }
  }
});

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".smooth-content",
    start: "top top",
    end: "50% top",
    scrub: 0.3
  }
});

tl.to("#description", {
  opacity: 0,
  duration: 2
})
.to("#statue", {
  opacity: 0,
  duration: 2
}, "<.1")
.fromTo("#twisty",{  opacity: 0},{
  opacity: 1,
  duration: 3
},'>16')
gsap.to(extramesh.position, {
  y:189.335393361824,
  ease: "power1.out",  
  scrollTrigger: {
    trigger: '.smooth-content',
    start: 'top top',
    end: '50% top',
    scrub: 3
  }
});

gsap.to(extramesh.material.uniforms.uOpacity, {
  value:1  ,
  ease: "power3.in",  
  scrollTrigger: {
    trigger: '.smooth-content',
    start: 'top top',
    end: '50% top',
    scrub: 3
  }
},'<')
const clock = new THREE.Clock()
let previousTime = 0
function getAverageFrequency() {
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  return sum / dataArray.length;
}
function updateAudio() {
  if(analyser){
    analyser.getByteFrequencyData(dataArray) 
    uniforms.u_frequency.value = (getAverageFrequency()) * uniforms.uOpacity.value * uniforms.fOpacity.value;
    for (let i = 0; i < dataArray.length; i++) {
      mat.uniforms.uAudio.value[i] = dataArray[i] / 255;
      mat2.uniforms.uAudio.value[i] = dataArray[i] / 255;
  }};
}
let Mouse = new THREE.Vector2(0,0)
let dis = activecamera.position.z - light1.position.z
let pointPlaneHeight = dis * Math.tan(activecamera.fov / 2 *  Math.PI /180) * 2
let pointPlaneWidth = pointPlaneHeight * camera.aspect
let raycast = new THREE.Raycaster()
raycast.layers.enableAll()

function animate(time){
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  const fps = 1000 / deltaTime;
  if(Math.round(fps) < 400){
    geo.setDrawRange(0, 250000);
  }else{
    geo.setDrawRange(0, count);

  }
  extramesh.rotation.y +=  Math.PI / 360   
  light1.position.x +=( (((Mouse.x)) * pointPlaneWidth / 2  ) -  light1.position.x  ) * deltaTime * 2.6
  light1.position.y += (((1- (Mouse.y + 1 )/2) * pointPlaneHeight + 2)  -  (light1.position.y + 1 /2)) * deltaTime * 3.3
  TWEEN.update(time);
  if(firstRender){
    firstRender = false    
    if(window.scrollY == 0){
  let timeline = gsap.timeline({
      defaults:{
          ease:'power4.inOut',
          duration:3,
      }
  })
  timeline.to('#wave2',{
      scale:1,
      x:window.innerWidth/ 2 - 60,
      y:-window.innerHeight/ 2 + 50,
  })
  .to('#loader-cont',{
    opacity:0
  },"<")

  .to('#wave',{
        opacity:1,
        duration:2,
        onComplete:()=>{
          opacityallowance = true
        }
  
  })
  .to(factor,{
    o:1,
    duration:2
  },"<-.5")
  .to('#wave2',{
      opacity:0,
      duration:2,
      onComplete:()=>{
          document.getElementById('loader-cont').remove()         
          Loadercanvas.remove()
          clearInterval(loaderanimationr)
      }
  },'<')
}else{
  Loadercanvas.remove()
  document.getElementById('loader-cont').remove()         

}
    document.getElementById('statue').innerText = names[0]
    document.getElementById('description').innerText = description[0]
    new TWEEN.Tween(statue2.position).to({
    z: 0 ,
    y:0,
  },800
    ).easing(TWEEN.Easing.Quadratic.InOut)
    .start()

  }
  mat.uniforms.time.value = config.distortion * elapsedTime
  // mat.uniforms.opacity.value =- Math.random() * elapsedTime  
  mat2.uniforms.time.value = config.distortion * elapsedTime
  mat2.uniforms.etime.value =  deltaTime 
  uniforms.u_time.value = clock.getElapsedTime();

  updateAudio();
  previousTime = elapsedTime
  // camera.lookAt(new THREE.Vector3(0,activecamera.position.y ,0))

  if(config.transition){
    if(statue.position.x < -space){
      statue.position.x = space
      statue.position.x = -0.4 + statue.position.x 
    }else{
      statue.position.x = -0.4 + statue.position.x 
    }
    if(statue2.position.x < -space ){
      statue2.position.x = space
      statue2.position.x = -0.4 + statue2.position.x 
    }else{
      statue2.position.x = -0.4 + statue2.position.x 
    }
  }
  if(config.rotation){ 
    statue.rotation.y += directionro * Math.PI / 360   
    statue2.rotation.y += directionro * Math.PI / 360 
  }
  composer.render()

  animationId = requestAnimationFrame(animate)

}
line.geometry.setDrawRange(0, 0);
const totalVertices =Panelgeometry.attributes.position.count;
animate()
let firstline = {progress:0}
let panelp = {progress:0}
setTimeout(() => {

  const tl2 = gsap.timeline({
    ease: "power1.out",
  });

  tl2.to(firstline,{
    progress:1,
    duration:2,
    onUpdate:()=>{
      const count = Math.floor(totalVertices * firstline.progress);

       line.geometry.setDrawRange(0, count);
    }
  }).to(panelp,{
      progress:1,
      duration: 4 ,
      ease: "power2.inOut",
      onUpdate:()=>{
        panelmat.uniforms.uProgress.value = panelp.progress
      }
  },'-=.5').to(lineprogress,{
    progress:1,
    duration: 6 ,
    ease: "power3.out",

    onUpdate:()=>{
      line4.material.uniforms.progress.value = 1- lineprogress.progress
      line4.material.uniforms.Fade.value =  lineprogress.progress
      textTexture.needsUpdate = true;
    }
  },'-=2.4')
}, 4000);
// Mouse tracking 
window.addEventListener('mousemove',(e)=>{
  e.preventDefault()
  let cursorX = (e.clientX / window.innerWidth) * 2 -1
  let cursorY =  (e.clientY / window.innerHeight) * 2 - 1
  mat2.uniforms.pMouse.value.x = cursorX 
  mat2.uniforms.pMouse.value.y = -cursorY 
  raycast.setFromCamera(Mouse, camera);
  let intersections = raycast.intersectObjects([right,left])
  if(intersections.length > 0){
    document.body.style.cursor = 'pointer';
  }else{
    document.body.style.cursor = 'default';
  }
  Mouse.x = cursorX
  Mouse.y = cursorY
})

window.addEventListener('click',(e)=>{
  let cursorX = (e.clientX / window.innerWidth) * 2 -1
  let cursorY =  (e.clientY / window.innerHeight) * 2 - 1
  Mouse.x = cursorX
  Mouse.y = cursorY
  raycast.setFromCamera(Mouse,activecamera)
  let intersections = raycast.intersectObjects([right,left,statue2,statue],true)
  if(intersections.filter((object)=>object.object.name == "Object_4" || object.object.name == "Statue").length > 0 && !ongoing&& intersections.length > 0 && intersections[0]){
    ongoing = true
    enteredfromstatue = true
    gsap.to(window, {
          duration: 3,
          scrollTo: { y: document.body.scrollHeight * 0.52969565217 },
          ease: "power2.inOut",
          onComplete:()=>{
            ongoing = false
            setTimeout(()=>{
              const source = sfx.createBufferSource();
              source.buffer = buffer2;
              source.connect(gain2).connect(sfx.destination);
              source.start();
            }
            ,400)
          }
        });
    return
  }
  if(intersections.length > 0 && intersections[0] && !ongoing && intersections.filter((object)=>object.object.name == "left" || object.object.name == "right").length > 0){
      ongoing = true
      next(intersections[0].object.name)  
  }
})

// resizing 
window.addEventListener('resize',()=> {
  camera.aspect = window.innerWidth/ window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  mat2.uniforms.viewport = window.innerHeight
})

