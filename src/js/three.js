import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

import * as MyThree from '../../build/three.webgpu.js';

import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/OutputPass.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { fetchaudio } from './fetchaudio.js';
import { audioCache } from './var/audiocache.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import { float, If, PI, color, cos, instanceIndex, Loop, mix, mod, sin, instancedArray, Fn, uint, uniform, uniformArray, hash, vec3, vec4 } from '../../build/three.tsl.js';
import { listener, sound } from './var/threesound.js';
let scene, camera, renderer, animationId, analyser, orbitControls ,gui,button1;
const audioLoader = new THREE.AudioLoader();
let main = document.getElementById('main')
let currentSceneHandler = null;
function configaudio(buffer) {
	button1txt = 'pause'
	button1.innerText = button1txt
	sound.stop()
	sound.source?.mediaElement?.currentTime ? sound.source.mediaElement.currentTime= 0 : ''
	sound.setBuffer(buffer);
	sound.setLoop(false)
	sound.setVolume(.5)
	sound.play()
}
const sampleActions = {
    '1': () =>{		
		audioLoader.load('./sample1.mp3', function (buffer) {
				configaudio(buffer)
				});} ,
    '2': () => {
				audioLoader.load('./sample2.mp3', function (buffer) {
					configaudio(buffer)
				});
	},
	'3':() => {	
	audioLoader.load('./sample3.mp3', function (buffer) {
			configaudio(buffer)
	})} 
  };
let setfirst = false
let type = 'Youtube';
let url = {Youtube:'https://www.youtube.com/watch?v=mNEUkkoUoIA&list=RDmNEUkkoUoIA&start_radio=1',Spotify:'',Soundcloud:''}
const settings = {
	platform: type,
	value: url['Youtube']
	};
const volume = {Volume: .5}
const audioSettings = {
  loadAudio: () => fileInput.click()
};
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*';
fileInput.style.display = 'none';

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  const url = URL.createObjectURL(file);
  audioLoader.load(url, (buffer) => {
	configaudio(buffer)
  });
});

document.body.appendChild(fileInput);
let button1txt = ['play']
function initControllers(scene){
// Scene Controller	
const sceneController = {
  currentScene: scene,
  swapScene: (name) => {
    if (name === 'Sphere One') switchScene(initThreeScene);
    else if (name === 'Particle Scene') switchScene(loadpart);
  }}
  


gui.add(sceneController, 'currentScene', ['Sphere One', 'Particle Scene'])
  .name('Scene')
  .onChange(sceneController.swapScene);
camera.position.set(6, 8, 14);
camera.add(listener);
const Song = gui.addFolder('Song');

// audio url input
// const urltab = Song.add(settings, 'value').onChange(function (value) {
//     if(value){
// url[type] = value
// }
// }).name('url');

// samples tab
const samples = Song.add(
  {
    value: ' ' 
  },
  'value',
  {
    'Sample 1': '1',
    'Sample 2': '2',
    'Sample 3': '3'
  }
).name('Samples').onChange(function (value) {
  if (sampleActions[value]) {
    sampleActions[value]();
  }
});


// audio controllers
const container = document.createElement('div');
container.style.display = 'flex';
container.style.gap = '10px';
container.style.padding = '4px';

button1 = document.createElement('button');
button1.innerText = button1txt;
button1.onclick = (e) =>{
    if(sound.buffer && e.target.innerText == 'play' && !sound.isPlaying){
		button1txt = 'pause'
		button1.innerText = button1txt   
        sound.play();
        
    }else{
		button1txt = 'play'
        button1.innerText = button1txt
        sound.pause();
    }}
    
    const button2 = document.createElement('button');
    button2.innerText = 'stop';
    button2.onclick = () => {
        if(sound.buffer){
            button1.innerText = 'play';
            sound.stop();
        }
    };
    const button3 = document.createElement('button');
    button3.innerText = 'load';
    button3.onclick =async () =>{
   // Create a CSS spinner
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        // Add CSS styling for the spinner
        const style = document.createElement('style');
        style.textContent = `
        .spinner {
            margin:4px;
            width: 28px;
            height: 15px;
            border: 2px solid #999;
            border-top-color: #222;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
                }
                `;
document.head.appendChild(style);
const controllerDom = Song.domElement;
controllerDom.querySelector('.controller').appendChild(spinner);
let load ;
if (audioCache.has(url[type])) {
  load = audioCache.get(url[type]);
} else {
    const objectUrl =await fetchaudio(url[type],type)
    audioCache.set(url[type], objectUrl);
    load = objectUrl;
}
audioLoader.load(load, function (buffer) {
    spinner.remove();
	configaudio(buffer)
});
    }

container.appendChild(button1);
container.appendChild(button2);              
container.appendChild(button3);


Song.domElement.appendChild(container);

Song.add(volume, 'Volume', 0, 1).onChange(function (value) {
	sound.setVolume(value)
});
Song.add(audioSettings, 'loadAudio').name('Load Your Audio');

};

export function loadwhat(){
	window.localStorage.path = 'home'
	if(window.localStorage.scene == 'sc1') return initThreeScene()
	// loadingpage()
	if(window.localStorage.scene == 'sc2') return loadpart()
}
export function initThreeScene() {
window.localStorage.scene = 'sc1'
renderer = new THREE.WebGLRenderer({ antialias: true });
gui = new GUI();
scene = new THREE.Scene();
analyser = new THREE.AudioAnalyser(sound, 32);
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const vertexShader = document.getElementById("vertexshader").textContent;
const fragmentShader = document.getElementById("fragmentshader").textContent;
const params = {    
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    threshold: 0.5,
    strength: 0.4,
    radius: 0.8,
};

renderer.setSize(window.innerWidth, window.innerHeight);

main.appendChild(renderer.domElement);



initControllers('Sphere One')

const uniforms = {
  u_time: { value: 0.0 },
  u_frequency: { value: 0.0 },
  u_red: { value: params.red },
  u_green: { value: params.green },
  u_blue: { value: params.blue },
};
const geo = new THREE.IcosahedronGeometry(4,30);
const planeMaterial = new THREE.ShaderMaterial({
    uniforms
    ,vertexShader,
    fragmentShader,
    wireframe:true
});
let mesh = new THREE.Mesh(geo,planeMaterial)
scene.add(mesh)
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
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

 
    const clock = new THREE.Clock();
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
function animate() {
  uniforms.u_time.value = clock.getElapsedTime();
  uniforms.u_frequency.value = analyser.getAverageFrequency();
  bloomComposer.render();
  animationId = requestAnimationFrame(animate);
}
animate()
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
function loadpart(){
	window.localStorage.scene = 'sc2'
			let uniformm = {
					u_frequency:  0.1
			}
			let controls, updateCompute, analyser, orbitControls ;
			let velocityDamping,maxSpeed
			let attractorsPositions = uniformArray( [
					new MyThree.Vector3( -1, 0, 0 ),
					new MyThree.Vector3( 1 , 0, - 0.5 ),
					new MyThree.Vector3( 0, 0.5, 1 )
				] );
			init();

			function init() {

				camera = new MyThree.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.set( 3, 5, 8 );
				scene = new MyThree.Scene();
				// audio
				analyser = new MyThree.AudioAnalyser(sound, 32);
				camera.add(listener)
				const uniforms = {
					u_time: { value: 0.0 },
					u_frequency: { value: 0.0 },
				}
				const ambientLight = new MyThree.AmbientLight( '#ffffff', 0.5 );
				scene.add( ambientLight );

				// directional light

				const directionalLight = new MyThree.DirectionalLight( '#ffffff', 1.5 );
				directionalLight.position.set( 4, 2, 0 );
				scene.add( directionalLight );

				// renderer
				renderer = new MyThree.WebGPURenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.setClearColor( '#000000' );
        main.appendChild(renderer.domElement);

				controls = new OrbitControls( camera, renderer.domElement );
				controls.enableDamping = true;
				controls.minDistance = 0.1;
				controls.maxDistance = 50;

				window.addEventListener( 'resize', onWindowResize );

				// attractors

			
				const attractorsRotationAxes = uniformArray( [
					new MyThree.Vector3( 0, 1, 0 ),
					new MyThree.Vector3( 0, 1, 0 ),
					new MyThree.Vector3( 1, 0, - 0.5 ).normalize()
				] );
				const attractorsLength = uniform( attractorsPositions.array.length, 'uint' );
				const attractors = [];
				const helpersRingGeometry = new MyThree.RingGeometry( 1, 1.02, 32, 1, 0, Math.PI * 1.5 );
				const helpersMaterial = new MyThree.MeshBasicMaterial( { side: MyThree.DoubleSide } );

				for ( let i = 0; i < attractorsPositions.array.length; i ++ ) {

					const attractor = {};

					attractor.position = attractorsPositions.array[ i ];
					attractor.orientation = attractorsRotationAxes.array[ i ];
					attractor.reference = new MyThree.Object3D();
					attractor.reference.position.copy( attractor.position );
					attractor.reference.quaternion.setFromUnitVectors( new MyThree.Vector3( 0, 1, 0 ), attractor.orientation );
					scene.add( attractor.reference );

					attractor.helper = new MyThree.Group();
					attractor.helper.scale.setScalar( 0.325 );
					attractor.reference.add( attractor.helper );

					attractor.ring = new MyThree.Mesh( helpersRingGeometry, helpersMaterial );
					attractor.ring.rotation.x = - Math.PI * 0.5;


					attractors.push( attractor );

				}

				// particles

				const count = Math.pow( 2, 18 );
				const material = new MyThree.SpriteNodeMaterial( { blending: MyThree.AdditiveBlending, depthWrite: false } );

				const attractorMass = uniform( Number( `1e${7}` ) );
				const particleGlobalMass = uniform( Number( `1e${4}` ) );
				const timeScale = uniform( 1 );
				const spinningStrength = uniform( 2.75 );
				maxSpeed = uniform( 0 );
				const gravityConstant = 6.67e-11;
				velocityDamping = uniform(   );
				const scale = uniform( 0.008 );
				const boundHalfExtent = uniform( 8 );
				const colorA = uniform( color( '#5900ff' ) );
				const colorB = uniform( color( '#ffa575' ) );

				const positionBuffer = instancedArray( count, 'vec3' );
				const velocityBuffer = instancedArray( count, 'vec3' );
				const sphericalToVec3 = Fn( ( [ phi, theta ] ) => {

					const sinPhiRadius = sin( phi );

					return vec3(
						sinPhiRadius.mul( sin( theta ) ),
						cos( phi ),
						sinPhiRadius.mul( cos( theta ) )
					);

				} );

				// init compute

				const init = Fn( () => {

					const position = positionBuffer.element( instanceIndex );
					const velocity = velocityBuffer.element( instanceIndex );

					const basePosition = vec3(
						hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
						hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
						hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) )
					).sub( 0.5 ).mul( vec3( 5, 0.2, 5 ) );
					position.assign( basePosition );

					const phi = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI ).mul( 2 );
					const theta = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI );
					const baseVelocity = sphericalToVec3( phi, theta ).mul( 0.05 );
					velocity.assign( baseVelocity );

				} );

				const initCompute = init().compute( count );

				const reset = () => {

					renderer.computeAsync( initCompute );

				};

				const random = () => {
					setfirst = false
				};

				reset();

				// update compute

				const particleMassMultiplier = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).remap( 0.25, 1 ).toVar();
				const particleMass = particleMassMultiplier.mul( particleGlobalMass ).toVar();

				const update = Fn( () => {

					const delta = float( 1 / 60 ).mul( timeScale ).toVar(); // uses fixed delta to consistent result
					const position = positionBuffer.element( instanceIndex );
					const velocity = velocityBuffer.element( instanceIndex );

					// force

					const force = vec3( 0 ).toVar();

					Loop( attractorsLength, ( { i } ) => {

						const attractorPosition = attractorsPositions.element( i );
						const attractorRotationAxis = attractorsRotationAxes.element( i );
						const toAttractor = attractorPosition.sub( position );
						const distance = toAttractor.length();
						const direction = toAttractor.normalize();

						// gravity
						const gravityStrength = attractorMass.mul( particleMass ).mul( gravityConstant ).div( distance.pow( 2 ) ).toVar();
						const gravityForce = direction.mul( gravityStrength );
						force.addAssign( gravityForce );

						// spinning
						const spinningForce = attractorRotationAxis.mul( gravityStrength ).mul( spinningStrength );
						const spinningVelocity = spinningForce.cross( toAttractor );
						force.addAssign( spinningVelocity );

					} );

					velocity.addAssign( force.mul( delta ) );
					const speed = velocity.length();
					If( speed.greaterThan( maxSpeed ), () => {

						velocity.assign( velocity.normalize().mul( maxSpeed ) );

					} );
					velocity.mulAssign( velocityDamping.oneMinus() );

					// position

					position.addAssign( velocity.mul( delta ) );

					// box loop

					const halfHalfExtent = boundHalfExtent.div( 2 ).toVar();
					position.assign( mod( position.add( halfHalfExtent ), boundHalfExtent ).sub( halfHalfExtent ) );

				} );
				updateCompute = update().compute( count );

				// nodes

				material.positionNode = positionBuffer.toAttribute();

				material.colorNode = Fn( () => {

					const velocity = velocityBuffer.toAttribute();
					const speed = velocity.length();
					const colorMix = speed.div( maxSpeed ).smoothstep( 0, 0.5 );
					const finalColor = mix( colorA, colorB, colorMix );

					return vec4( finalColor, 1 );

				} )();

				material.scaleNode = particleMassMultiplier.mul( scale );

				// mesh

				const geometry = new MyThree.PlaneGeometry( 1, 1 );
				const mesh = new MyThree.InstancedMesh( geometry, material, count );
				scene.add( mesh );

				// debug
				
				gui = new GUI();
				initControllers('Particle Scene')

				gui.add( { particleGlobalMassExponent: particleGlobalMass.value.toString().length - 1 }, 'particleGlobalMassExponent', 1, 10, 1 ).onChange( value => particleGlobalMass.value = Number( `1e${value}` ) );
				gui.add( spinningStrength, 'value', 0, 10, 0.01 ).name( 'spinningStrength' );
				gui.add( scale, 'value', 0, 0.1, 0.001 ).name( 'scale' );
				gui.addColor( { color: colorA.value.getHexString( MyThree.SRGBColorSpace ) }, 'color' ).name( 'colorA' ).onChange( value => colorA.value.set( value ) );
				gui.addColor( { color: colorB.value.getHexString( MyThree.SRGBColorSpace ) }, 'color' ).name( 'colorB' ).onChange( value => colorB.value.set( value ) );
				gui.add( { reset }, 'reset' );
				gui.add(  {random} , 'random' ).name('Randomize Position');
			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );

			}
			let max = 1
			let min = analyser.getAverageFrequency();

			async function animate() {
				controls.update();
				let amp = analyser.getAverageFrequency()
				let res = (- 0.0012 * amp + amp) * 0.0012	
	if(!setfirst){
		setfirst = true				
		attractorsPositions.array[0].set(-1.7 * Math.random(), 0, 2 * Math.random() - 1 );
		attractorsPositions.array[1].set(1.7 * Math.random(), 2 * Math.random() - 1, -0.5); 
		attractorsPositions.array[2].set( 2.7 * Math.random() - 1,1 * Math.random() - 0.5, 1 ); 
}
				velocityDamping.value = res  > .18 ? res * .001 : res
				maxSpeed.value = 0.08 * amp
    			renderer.compute( updateCompute );
				renderer.render( scene, camera );
			}
    const gainNode = sound.getOutput();
	const meydaAnalyzer = Meyda.createMeydaAnalyzer({
	audioContext: listener.context,
	source: gainNode,
	bufferSize: 512,
	featureExtractors: ['rms', 'spectralCentroid', 'zcr'],
	callback: (features) => {
		// let feat = features.rms
		// 	if(max < feat){
		// 			max = feat
		// 		}
		// 		if(feat < min){
		// 			min = feat
		// 		}
				// let change = +toMinusOneToOne(feat, min, max).toPrecision(2) ? +toMinusOneToOne(feat, min, max).toPrecision(2) :  0
	}});
	meydaAnalyzer.start();

}
function toMinusOneToOne(value, min, max) {
  const clamped = Math.max(min, Math.min(value, max));

  const normalized = (clamped - min) / (max - min);

  return normalized * 2 -1 ;
}
export function destroyThreeScene() {
	cancelAnimationFrame(animationId);
  // 1. Stop animation loop
  if(gui){
    gui.destroy();
  }
  // 2. Remove renderer DOM element
  if (renderer && renderer.domElement && renderer.domElement.parentNode ) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  // 4. Dispose geometries, materials, textures
  if(scene){
    scene.traverse(object => {
      if (!object.isMesh) return;
      
      if (object.geometry) {
        object.geometry.dispose();
      }
     
    });
  }
    
    // 5. Optionally dispose audio
    if (camera && camera.children.length > 0) {
      camera.children.forEach(child => {
      if (child.type === "Audio" && child.context) {
        try {
          child.disconnect();
          child.context.close();
        } catch (e) {
          console.warn("Failed to clean up audio", e);
        }
      }
    });
  }

  // 6. Optional: dispose renderer
  renderer?.dispose();
// 7. Dispose audio and analyser
if (sound && sound.isAudio) {
  if (sound.isPlaying) {
    sound.stop();
  }
  try {
    sound.disconnect(); // Disconnect from audio context
  } catch (e) {
    console.warn("Audio disconnect failed", e);
  }
}

if (analyser && analyser.analyser) {
  try {
    analyser.analyser.disconnect();
    // Optional: clean internal data array reference
    analyser.data = null;
  } catch (e) {
    console.warn("Analyser disconnect failed", e);
  }
}

}
function switchScene(createSceneFn) {
  // Clean up previous scene
  destroyThreeScene()
  if (currentSceneHandler && currentSceneHandler.dispose) {
    currentSceneHandler.dispose();
  }
//   if(createSceneFn !== initThreeScene)loadingpage()
  // Setup new scene
  currentSceneHandler = createSceneFn();

}

const loadingpage = () => {
const style = document.createElement("style");
style.textContent = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: #111;
    font-family: sans-serif;
    overflow: hidden;
  }
  #loader {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
  }
  .spinner {
    border: 5px solid #444;
    border-top: 5px solid #fff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Loader container
const loader = document.createElement("div");
loader.id = "loader";

// Spinner
const spinner = document.createElement("div");
spinner.className = "spinner";
loader.appendChild(spinner);

// Append loader to body
document.body.appendChild(loader);

// Poll for currentScene
const waitForScene = setInterval(() => {
  if (typeof renderer !== "undefined" && renderer.domElement && renderer.domElement.parentNode || renderer) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.remove();
    }, 500);
    clearInterval(waitForScene);
  }
}, 1); // check every 100ms

}
