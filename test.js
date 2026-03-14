import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import TWEEN from 'https://unpkg.com/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "./src/jsm/shaders/VignetteShader.js";
import { AfterimagePass } from './src/jsm/postprocessing/AfterimagePass.js';
import {MaskPass,ClearMaskPass}  from './src/jsm/postprocessing/MaskPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/OutputPass.js';
gsap.registerPlugin(ScrollTrigger,ScrollSmoother,(gsap.plugins.ScrollToPlugin || ScrollToPlugin));

const smoother = ScrollSmoother.create({
  wrapper: '.smooth-wrapper',
  content: '.smooth-content',
  smooth: 1.5,
  effects: true
});

let firstRender = true;
const gui = new GUI()
const loaderg = new GLTFLoader();
let main = document.getElementById('main')
let scene = new THREE.Scene()
let space = 288
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
let audioCtx, analyser, dataArray;
let speed = 1
audio.addEventListener('play', async () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio)
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048
    source.connect(analyser);
    analyser.connect(audioCtx.destination)
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength)
  }
});
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
const ctx = canvas.getContext("2d");
let animateId = null;
canvas.height = 20
canvas.width = 20 * 6 / 3
let run = false
let allow = true
let opacity = 0
canvas.addEventListener('click',async (e)=>{
  if(!allow){
    e.preventDefault()
    return
  }
  opacity = !run ? 0 : 1  
  run = !run
  if(run){
      await audio.play();
  }else{
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
    ctx.lineTo(10.5 + i * 4,startingH + off + (y * 7 - 8) * opacity * speed * 2 )
  }
  if(opacity < 1 & run){
    opacity = +(opacity + 0.04).toFixed(2);
  }
  if(opacity == 1){
    allow = true
  }
  if(opacity > 0 && !run){
    opacity = +(opacity - 0.01).toFixed(2);
  }if(opacity == 0){
    allow = true
  }
  ctx.strokeStyle = "#ffffff"; // pure white
  ctx.lineWidth = 1;           // thick enough to avoid anti-aliasing
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
drawlines(Math.PI / 180,undefined,-3)
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

const width = height * camera.aspect;


// Object setup 
let box = new THREE.BoxGeometry(30,30,30)
let material = new THREE.MeshNormalMaterial({color:0x44aa88})
let mesh = new THREE.Mesh(box,material)
// scene.add(mesh)
const gltf = await loaderg.loadAsync('./3D/Apollo/scene.gltf');

const loader = new STLLoader();
const geometry = await loader.loadAsync( './3D/Statue.stl' )
geometry.center();
geometry.computeVertexNormals();
let gmaterial = new THREE.MeshStandardMaterial({color: 0xffffff, 
  roughness: 0.5, 
  metalness: 0,
  side: THREE.DoubleSide
});



let statue = new THREE.Mesh( geometry,gmaterial )
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
const colorsFolder = gui.addFolder('Colors');
colorsFolder.add(params, 'red', 0, 1).onChange(function (value) {
  uniforms.u_red.value = Number(value);
});
colorsFolder.add(params, 'green', 0, 1).onChange(function (value) {
  uniforms.u_green.value = Number(value);
});
colorsFolder.add(params, 'blue', 0, 1).onChange(function (value) {
  uniforms.u_blue.value = Number(value);
});

const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(params, 'threshold', 0, 1).onChange(function (value) {
  bloomPass.threshold = Number(value);
});
bloomFolder.add(params, 'strength', 0, 3).onChange(function (value) {
  bloomPass.strength = Number(value);
});
bloomFolder.add(params, 'radius', 0, 1).onChange(function (value) {
  bloomPass.radius = Number(value);
});

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight)
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();
const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
bloomComposer.addPass(outputPass);
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
statue.rotation.set(-Math.PI / 2,0,0)
statue2.scale.set(100,100,100);
statue2.position.set(0,-100,0);
 



let statues = [statue2,statue,]
let names = [`Apollo`,'Dionysus',]
let description = [`God Of Music`,'God Of Wine',]

// TESTING
let light = new THREE.DirectionalLight(0xfafafa,1)
const light1 = new THREE.PointLight(0xfafafa, 3,0,1.0)
let light2 = new THREE.SpotLight(0xffffff, 100.0,20000.0)
let light3 = new THREE.AmbientLight(0xfafafa,1)
let light4 = new THREE.RectAreaLight(0xfafafa,1,20,20)
let helper = new THREE.DirectionalLightHelper(light)
let helper1 = new THREE.PointLightHelper(light1)
let helper2 = new THREE.SpotLightHelper(light2)
let helper4 = new RectAreaLightHelper(light4)
// light2.target = statue;  // MUST add the target to scene
light2.decay = 1;  // MUST add the target to scene
let Lights = gui.addFolder('Lights')
Lights.add(config,'DirectionalLight').onChange((value)=>{
  config.DirectionalLight = value
  if(value){
      scene.add(light)
      scene.add(helper)
      scene.add(Transform1)
  }
  else{
    scene.remove(light)
    scene.remove(helper)
    scene.remove(Transform1)
  }
})

Lights.add(config,'PointLight').onChange((value)=>{
  config.PointLight = value
  if(value){
    scene.add(light1)
    scene.add(helper1)
    scene.add(Transform2)
  }
  else{
    scene.remove(light1)
    scene.remove(helper1)
    scene.remove(Transform2)
  }
})
Lights.add(config,'SpotLight').onChange((value)=>{
  config.SpotLight = value
   if(value){
      scene.add(light2)
      scene.add(helper2)
      scene.add(Transform3)
  }
  else{
    scene.remove(light2)
    scene.remove(helper2)
    scene.remove(Transform3)
  }
})
Lights.add(config,'AmbientLight').onChange((value)=>{
  config.AmbientLight = value
  if(value){
      scene.add(light3)
      scene.add(Transform4)
  }
  else{
    scene.remove(light3)
    scene.remove(Transform4)
  }
})
Lights.add(config,'RectAreaLight').onChange((value)=>{
  config.HemisphereLight = value
  if(value){
      scene.add(light4)
      scene.add(helper4)
      scene.add(Transform5)
  }
  else{
    scene.remove(light4)
    scene.remove(helper4)
    scene.remove(Transform5)
  }
})
Lights.add(config,'Reset')
Lights.add(config,'rotation').onChange((value)=>{
  config.rotation = value
})
Lights.add(config,'transition').onChange((value)=>{
  config.tranistion= value
})
let sunlight = gui.addFolder('Directional light')
sunlight.add(light,'intensity', 0,300,1)
const colorParams = { color: light.color.getHex() };
sunlight.addColor(colorParams, 'color').onChange((value) => {
    light.color.set(value);
});
sunlight.add(light.position, 'x',-1000,1000,1)
sunlight.add(light.position, 'y',-1000,1000,1)
sunlight.add(light.position, 'z',-1000,1000,1)
sunlight.close()


let pointlight = gui.addFolder('Point light')
pointlight.add(light1,'intensity', 0,300,1)
const colorParam = { color: light1.color.getHex() };
pointlight.addColor(colorParam, 'color').onChange((value) => {
    light1.color.set(value);
});
pointlight.add(light1.position, 'x',-1000,1000,1)
pointlight.add(light1.position, 'y',-1000,1000,1)
pointlight.add(light1.position, 'z',-1000,1000,1)
pointlight.close()


let spotlight = gui.addFolder('Spot light')
spotlight.add(light2,'angle', Math.PI / 50 , Math.PI  ,Math.PI / 50)
spotlight.add(light2,'penumbra', 0,20,0.1)
spotlight.add(light2,'decay', 1,4,1)
spotlight.add(light2,'intensity', 0,300,1)

const colorPara = { color: light2.color.getHex() };
spotlight.addColor(colorPara, 'color').onChange((value) => {
    light2.color.set(value);
});
spotlight.add(light2.position, 'x',-1000,1000,1)
spotlight.add(light2.position, 'y',-1000,1000,1)
spotlight.add(light2.position, 'z',-1000,1000,1)
spotlight.close()

let AmbientLight = gui.addFolder('Ambient Light')
AmbientLight.add(light3,'intensity', 0,300,1)
const colorParam2 = { color: light3.color.getHex() };
AmbientLight.addColor(colorParam2, 'color').onChange((value) => {
    light3.color.set(value);
});
AmbientLight.add(light3.position, 'x',-1000,1000,1)
AmbientLight.add(light3.position, 'y',-1000,1000,1)
AmbientLight.add(light3.position, 'z',-1000,1000,1)
AmbientLight.close()


let RectAreaLight = gui.addFolder('RectArea Light')
RectAreaLight.add(light4,'intensity', 0,300,1)
const colorParam3 = { color: light4.color.getHex() };
RectAreaLight.addColor(colorParam3, 'color').onChange((value) => {
    light4.color.set(value);
});
RectAreaLight.add(light4.position, 'x',-1000,1000,1)
RectAreaLight.add(light4.position, 'y',-1000,1000,1)
RectAreaLight.add(light4.position, 'z',-1000,1000,1)
RectAreaLight.close()
let distortion = gui.addFolder('distortion')
distortion.add(config,'distortion', -10.0,10.0,0.01)

gui.close()


// END OF TESTING


// const spotlight = new THREE.SpotLight(0xffffff, 7); // color, intensity
// spotlight.position.set(0, 250, 100);
// spotlight.angle = Math.PI / 12;
// spotlight.penumbra = 1.5;      // edge softness
// spotlight.decay = 1; 
// spotlight.target = statue;  // MUST add the target to scene
// scene.add(spotlight);
// const spotLightHelper = new THREE.SpotLightHelper( spotlight );
// scene.add( spotLightHelper );

// const sunLight = new THREE.DirectionalLight(0xfafafa, 3.08)
// sunLight.position.set(-100,3,-100)
// scene.add(sunLight)

// const fillLight = new THREE.PointLight(0xfafafa)
// fillLight.position.set(0,0,0)
// scene.add(fillLight)
//##################################################
// const sunLight = new THREE.DirectionalLight(0xE3E3E3, 2.08)
// sunLight.position.set(-100,0,-100)
// scene.add(sunLight)

// const fillLight = new THREE.PointLight(0xfafafa, 10)
// fillLight.position.set(0,45,60.8)
// scene.add(fillLight)

//##################################################
// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(10, 10, 10);
// scene.add(light);

// const ambient = new THREE.AmbientLight(0x404040, 1); // soft light
// scene.add(ambient);


// camera.position.x = 0
// camera.position.y = 0
// camera.position.z = 0.6507093902939213
// camera.position.x = 150
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
    time: {value: 1.0},
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
const count = 500000;
// const count = 750000;
let plane2 = new THREE.PlaneGeometry(1.5,.4,window.innerWidth,480)
let geo = new THREE.BufferGeometry()
let points = new Float32Array(count * 3)
let particlesPerRow = 2500
let s = 0


console.log("Visible width:", width, "Visible height:", height);

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
  pos.setX(i, pos.getX(i) + .4  / 2); // shift right by half width
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
let orbit = new OrbitControls(activecamera, renderer.domElement);
orbit.enableDamping = true;
orbit.enablePan = false;
orbit.enableZoom = false;
orbit.minAzimuthAngle = 0;  
orbit.maxAzimuthAngle = 0;  
// orbit.target.copy(statue.position);
let Camerapos = gui.addFolder('Camera')
Camerapos.add(activecamera.position, 'x',-1000,1000,1)
Camerapos.add(activecamera.position, 'y',-1000,1000,1)
Camerapos.add(activecamera.position, 'z',-1000,1000,1)
window.addEventListener('keydown',(e)=>{
    if(e.key == 's'){
      orbit.dispose();
      activecamera = activecamera == cameraB ? camera: cameraB
      
      orbit = new OrbitControls(activecamera, renderer.domElement);
      orbit.enableDamping = true;
      
      orbit.target.copy(statue.position);
      orbit.update();
      scene.traverse((obj) => {
        if (obj instanceof TransformControls) {
          obj.camera = activecamera;
        }
      });
  }
  if(e.key == 't'){
    activecamera.position.x = activecamera.position.x + 400
    camera.lookAt(new THREE.Vector3(400,50,0))
    orbit.target.copy(statue2.position);

  }
  if(e.key == 'Enter'){
    config.Preview = !config.Preview 
    if(config.Preview){
      scene.traverse((obj) => {
        if (obj instanceof TransformControls) {
          obj.visible = false;
          obj.enabled = false;
        }
        if (obj.isHelper) {
          obj.visible = false;
        }
      });
    }else{
      scene.traverse((obj) => {
        if (obj instanceof TransformControls) {
          obj.visible = true;
          obj.enabled = true;
        }
        if (obj.isHelper) {
          obj.visible = true;
        }
      });
    }
  }
  if(e.key == '1'){
    if(config.DirectionalLight){
      config.DirectionalLightHelper = !config.DirectionalLightHelper 
      if (config.DirectionalLightHelper) {
        scene.add(helper)
        scene.add(Transform1) 
        Transform1.enabled = true;
      } else {
        scene.remove(helper)
        scene.remove(Transform1)
        Transform1.enabled = false;
      }
    }
  }
  if(e.key == '2'){
    if(config.PointLight){
      config.PointLightHelper = !config.PointLightHelper 
      if (config.PointLightHelper) {
        scene.add(helper1)
        scene.add(Transform2)
        Transform2.enabled = true;
      } else {
        scene.remove(helper1)
        scene.remove(Transform2)
        Transform2.enabled = false;
      }
    } 
  }
  if(e.key == '3'){
    if(config.SpotLight){
      config.SpotLightHelper = !config.SpotLightHelper
      if(config.SpotLightHelper){
        scene.add(helper2)
        scene.add(Transform3)
      }else{
        scene.remove(helper2)
        scene.remove(Transform3)
      }
    }
  }
  })

// addons 
const gridHelper = new THREE.GridHelper(500, 20);
gridHelper.scale.setScalar(4);
const axesHelper = new THREE.AxesHelper(50);
axesHelper.scale.setScalar(4);
let Transform = new TransformControls(activecamera,renderer.domElement)
let Transform1 = new TransformControls(activecamera,renderer.domElement)
let Transform2 = new TransformControls(activecamera,renderer.domElement)
let Transform3 = new TransformControls(activecamera,renderer.domElement)
let Transform4 = new TransformControls(activecamera,renderer.domElement)
let Transform5 = new TransformControls(activecamera,renderer.domElement)
let mirror = new Reflector(new THREE.PlaneGeometry( 500, 500 ), {	
  textureWidth: window.innerWidth * window.devicePixelRatio,
	textureHeight: window.innerHeight * window.devicePixelRatio
  ,	
  color: 0x4c4c4c

})

mirror.rotateX(-Math.PI / 2)
mirror.position.y = -1
// scene.add(mirror)  
  
Transform.attach(statue)
Transform1.attach(light)
Transform2.attach(light1)
Transform3.attach(light2)
Transform4.attach(light3)
Transform5.attach(light4)
Transform.setSize(.4)
Transform.setMode('rotate')

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
right.position.set(viewWidth / 2 - 40,viewHeight / 4,0)
right.rotateY(-1)
left.position.set(-viewWidth / 2 + 40,viewHeight / 4,0)
left.rotateY(1)
right.name = 'right'
left.name = 'left'


// scene.add(Transform)
// scene.add(axesHelper);
// scene.add(gridHelper);
light.position.set(-1000,0,-1000)
light1.position.set(19,75.5327255724013,95.61752943615642)
// light1.position.set(-100,0,40)
light2.position.set(0,0,100)
light3.position.set(0,-100,0)
gridHelper.isHelper = true
axesHelper.isHelper = true
helper.isHelper = true
helper1.isHelper = true
helper2.isHelper = true
helper4.isHelper = true

config.DirectionalLight && scene.add(light) 
// & scene.add(helper) 
// & scene.add(Transform1)
config.PointLight && scene.add(light1) &
//  scene.add(helper1)
  // & scene.add(Transform2)
config.SpotLight && scene.add(light2) & 
// scene.add(helper2) 
// & scene.add(Transform3)
config.AmbientLight && scene.add(light3)  & scene.add(Transform4)
config.RectAreaLight && scene.add(light4) & scene.add(helper4)  & scene.add(Transform5)

Transform.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value;
});

Transform1.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value; 
});

Transform2.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value; 
});

Transform3.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value; 
});

Transform4.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value; 
});

Transform5.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value; 
});

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
// const maskPass = new MaskPass(scene, activecamera);
// composer.addPass(maskPass);

const afterimagePass = new AfterimagePass();
afterimagePass.uniforms['damp'].value = 0.65;  
composer.addPass(afterimagePass);
// composer.addPass(new ClearMaskPass());



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

function origin(direction){  
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
let scrollProgress = 0;

gsap.to(activecamera.position, {
  z: 5.57642003011228, 
  y:192.335393361824,
  ease: "power1.out",  
  scrollTrigger: {
    trigger: '.smooth-content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 3,
    snap: {
      snapTo: [0,1],
    }
  },

});
gsap.to(activecamera.position, {
  z: 1.57642003011228, 
  y:292.335393361824,
  ease: "power1.out",  
  scrollTrigger: {
    trigger: '.smooth-visualzer',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 3,
    snap: {
      snapTo: [0,1],
    }
  },

});
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".smooth-content",
    start: "top top",
    end: "bottom bottom",
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
.to("#twisty",{
  opacity: 1,
  duration: 3
},'>16')
gsap.to(extramesh.position, {
  y:189.335393361824,
  ease: "power1.out",  
  scrollTrigger: {
    trigger: '.smooth-content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 3
  }
});

gsap.to(extramesh.material.uniforms.uOpacity, {
  value:1  ,
  ease: "power3.in",  
  scrollTrigger: {
    trigger: '.smooth-content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 3
  }
})

let cursor = {x:0,y:0}
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
    uniforms.u_frequency.value = (getAverageFrequency()) * uniforms.uOpacity.value;
    for (let i = 0; i < dataArray.length; i++) {
      mat.uniforms.uAudio.value[i] = dataArray[i] / 255;
      mat2.uniforms.uAudio.value[i] = dataArray[i] / 255;
  }};
}

function animate(time){
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  extramesh.rotation.y +=  Math.PI / 360   
  bloomComposer.render()
  helper.update()
  helper1.update()
  helper2.update()
  orbit.update();

  TWEEN.update(time);
  if(firstRender){
    firstRender = false    
    document.getElementById('statue').innerText = names[0]
    document.getElementById('description').innerText = description[0]
    canvas.click()
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
  // mat2.uniforms.time.value = time * deltaTime / 100
  uniforms.u_time.value = clock.getElapsedTime();

  updateAudio();
  previousTime = elapsedTime
  camera.lookAt(new THREE.Vector3(0,activecamera.position.y ,0))

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
    statue.rotation.z += directionro * Math.PI / 360   
    statue2.rotation.y += directionro * Math.PI / 360 
  }
  composer.render()
  requestAnimationFrame(animate)

}
animate()
let raycast = new THREE.Raycaster()
raycast.layers.enableAll()
let dragging = false;
let lastz = 0;
let lasty = 0;
let mouse = { x: 0, y: 0 };

// Mouse tracking 
window.addEventListener('mousemove',(e)=>{
  e.preventDefault()
  let cursorX = (e.clientX / window.innerWidth) * 2 -1
  let cursorY =  (e.clientY / window.innerHeight) * 2 - 1
  if(dragging){
    console.log("Y: "+activecamera.position.y)
    console.log("Z: " +activecamera.position.z)
  }
  let Mouse = new THREE.Vector2(cursorX,cursorY)
  raycast.setFromCamera(Mouse,activecamera)
  let intersections = raycast.intersectObjects([right,left],true)
  if(intersections.length > 0){
    renderer.domElement.style.cursor = 'pointer';
  }else{
    renderer.domElement.style.cursor = 'default';
  }

  cursor.x = cursorX
  cursor.y = cursorY
})
window.addEventListener('mousedown',(e)=>{
 
  dragging = true
})
window.addEventListener("mouseup",(e)=>{
  dragging = false
})
window.addEventListener('click',(e)=>{
  let cursorX = (e.clientX / window.innerWidth) * 2 -1
  let cursorY =  (e.clientY / window.innerHeight) * 2 - 1
  let Mouse = new THREE.Vector2(cursorX,cursorY)
  raycast.setFromCamera(Mouse,activecamera)
  let intersections = raycast.intersectObjects([right,left],true)
  if(intersections.length > 0 && intersections[0] && !ongoing){
      ongoing = true
      next(intersections[0].object.name)  
  }
})
    // gsap.to(window, {
    //   duration: 3,
    //   scrollTo: { y: document.body.scrollHeight },
    //   ease: "power2.inOut"
    // },"+=4");
// resizing 
window.addEventListener('resize',()=> {
  camera.aspect = window.innerWidth/ window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
})

