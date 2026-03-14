import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/PointerLockControls.js';

import * as MyThree from '../../build/three.webgpu.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/OutputPass.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { fetchaudio } from './fetchaudio.js';
import { audioCache } from './var/audiocache.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import { float, If, PI, color, cos, instanceIndex, Loop, mix,atan,vec2,length , mod, sin, instancedArray, Fn, uint, uniform, uniformArray, hash, vec3, vec4, ceil, min, time } from '../../build/three.tsl.js';
import { listener, sound } from './var/threesound.js';
let scene, camera, renderer, animationId, analyser, orbitControls ,gui;
let minN = 0;
let minh = 0;
let maxN = 1;
let maxh = 1;
let button1 = document.createElement('button')
const audioLoader = new THREE.AudioLoader();
let main = document.getElementById('main')
let currentSceneHandler = null;
function configaudio(buffer) {
	minN = 0
	minh = 0;
	maxN = 1;
	maxh = 1;
	button1txt = 'pause'
	button1.innerText = button1txt
	sound.stop()
	sound.source?.mediaElement?.currentTime ? sound.source.mediaElement.currentTime= 0 : ''
	sound.setBuffer(buffer);
	sound.setLoop(false)
	sound.setVolume(.5)
	sound.play()
}
// samples tab settings
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
const fileInput = document.getElementById('audioUploadInput2');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  const url = URL.createObjectURL(file);
  audioLoader.load(url, (buffer) => {
	configaudio(buffer)
  });
});

let button1txt = ['play']
function initControllers(scene){

// Scene Controller	
const sceneController = {
  currentScene: scene,
  swapScene: (name) => {
    if (name === 'Sphere') switchScene(initThreeScene);
    else if (name === 'Particles') switchScene(loadpart);
    else if (name === 'Specturm') switchScene(SpectrumScene);
    else if (name === 'V4') switchScene(SparticleScene);
    else if (name === 'Vlow') switchScene(PlaneScene);
  }}
  


gui.add(sceneController, 'currentScene', ['Sphere', 'Particles','Specturm','V4','Vlow'])
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
    
// 	const button3 = document.createElement('button');
//     button3.innerText = 'load';
//     button3.onclick =async () =>{
//    // Create a CSS spinner
//         const spinner = document.createElement('div');
//         spinner.classList.add('spinner');
//         // Add CSS styling for the spinner
//         const style = document.createElement('style');
//         style.textContent = `
//         .spinner {
//             margin:4px;
//             width: 28px;
//             height: 15px;
//             border: 2px solid #999;
//             border-top-color: #222;
//             border-radius: 50%;
//             animation: spin 0.8s linear infinite;
//             }
            
//             @keyframes spin {
//                 to { transform: rotate(360deg); }
//                 }
//                 `;
// document.head.appendChild(style);
// const controllerDom = Song.domElement;
// controllerDom.querySelector('.controller').appendChild(spinner);
// let load ;
// if (audioCache.has(url[type])) {
//   load = audioCache.get(url[type]);
// } else {
//     const objectUrl =await fetchaudio(url[type],type)
//     audioCache.set(url[type], objectUrl);
//     load = objectUrl;
// }
// audioLoader.load(load, function (buffer) {
//     spinner.remove();
// 	configaudio(buffer)
// });
//     }

container.appendChild(button1);
container.appendChild(button2);              
// container.appendChild(button3);


Song.domElement.appendChild(container);

Song.add(volume, 'Volume', 0, 1).onChange(function (value) {
	sound.setVolume(value)
});
Song.add(audioSettings, 'loadAudio').name('Load Your Audio');

};

export function loadwhat(){
	window.localStorage.path = 'home'
	if(window.localStorage.scene == 'sc1') return initThreeScene()
	loadingpage()
	if(window.localStorage.scene == 'sc2') return loadpart()
	if(window.localStorage.scene == 'sc3') return SpectrumScene()
	if(window.localStorage.scene == 'sc4') return SparticleScene()
	if(window.localStorage.scene == 'sc5') return PlaneScene()
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



initControllers('Sphere')

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
				velocityDamping = uniform( 0 );
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
				initControllers('Particles')

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
			// let max = 1
			// let min = analyser.getAverageFrequency();

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

  // 6. Optional: dispose renderer
  renderer?.dispose();
// 7. Dispose audio and analyser
if (sound && sound.isAudio) {
  if (sound.isPlaying) {
    // sound.stop();
  }
  try {
    // sound.disconnect(); // Disconnect from audio context
  } catch (e) {
    console.warn("Audio disconnect failed", e);
  }
}

if (analyser && analyser.analyser) {
  try {
    // analyser.analyser.disconnect();
    // Optional: clean internal data array reference
    // analyser.data = null;
  } catch (e) {
    console.warn("Analyser disconnect failed", e);
  }
}

}
function switchScene(createSceneFn) {
  destroyThreeScene()
  if (currentSceneHandler && currentSceneHandler.dispose) {
    currentSceneHandler.dispose();
  }
  if(createSceneFn !== initThreeScene)loadingpage()
  currentSceneHandler = createSceneFn();
}
export function SpectrumScene() {
    window.localStorage.scene = 'sc3';

    const aspect = window.innerWidth / window.innerHeight;
    const clock = new THREE.Clock();
    scene = new THREE.Scene();
    gui = new GUI();
    analyser = new THREE.AudioAnalyser(sound, 64);
    analyser.fftSize = 1024;

    let settings = { pov: 36.0, bloom: true };
    camera = new THREE.PerspectiveCamera(settings.pov, aspect, 1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    main.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const uniforms = {
        u_time: { value: 1.0 },
        u_amplitude: { value: 3.0 },
        u_data_arr: { value: new Float32Array(64) },
    };

    const vertexShader = document.getElementById("vertexshader3").textContent;
    const fragmentShader = document.getElementById("fragmentshader3").textContent;

    const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);
    const planeMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        wireframe: true,
    });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    planeMesh.scale.set(2, 2, 2);
    planeMesh.position.y = 8;
    scene.add(planeMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffffff, 0.55);
    spotLight.position.set(0, 80, 10);
    scene.add(spotLight);

    // ------------------------
    // Post-processing: Bloom
    // ------------------------
	// Create composer
	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		1.5, // strength
		0.4, // radius
		0.35 // threshold
	);

	// Only white glow
	bloomPass.strength = 1.5;
	bloomPass.radius = 0.35;
	bloomPass.threshold = 0.3; // low threshold makes all bright areas glow white

	composer.addPass(bloomPass);

	initControllers('Specturm')
    camera.position.set(0, -40, 196);

    // GUI controls for bloom
    const bloomFolder = gui.addFolder("Bloom");
	bloomFolder.add(settings, "bloom").name("Enable Bloom");
    bloomFolder.add(bloomPass, "strength", 0.0, 3.0, 0.01).name("Strength");
    bloomFolder.add(bloomPass, "radius", 0.0, 1.0, 0.01).name("Radius");
    bloomFolder.add(bloomPass, "threshold", 0.0, 1.0, 0.01).name("Threshold");
	
	
    // GUI for plane & camera
    const audioWaveGui = gui.addFolder("Waveform");
    audioWaveGui.add(planeMaterial, "wireframe").name("Wireframe").listen();
    audioWaveGui.add(uniforms.u_amplitude, "value", 1.0, 8.0).name("Amplitude").listen();
    audioWaveGui.add(settings, "pov", 10.0, 100.0).onChange((value) => {
        camera.fov = value;
        camera.updateProjectionMatrix();
    });

    // ------------------------
    // Animation loop
    // ------------------------
    function animate() {
        animationId = requestAnimationFrame(animate);
        uniforms.u_time.value += clock.getDelta();

        const freqData = analyser.getFrequencyData();
        for (let i = 0; i < freqData.length; i++) {
            uniforms.u_data_arr.value[i] = freqData[i] 
        }

        controls.update();
        
    if (settings.bloom) {
        // Render with bloom
        composer.render();
    } else {
        // Render normally
        renderer.render(scene, camera);
    }
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

function toMinusOneToOne(value, min, max) {
	const clamped = Math.max(min, Math.min(value, max));
	const normalized = +(+clamped - +min) / (+max - +min);
	return normalized * 20 ;
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

const loader = document.createElement("div");
loader.id = "loader";
const spinner = document.createElement("div");
spinner.className = "spinner";
loader.appendChild(spinner);
document.body.appendChild(loader);
const waitForScene = setInterval(() => {
  if (typeof renderer !== "undefined" && renderer.domElement && renderer.domElement.parentNode || renderer) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.remove();
    }, 500);
    clearInterval(waitForScene);
  }
}, 1); 

}

export function SparticleScene(){
	window.localStorage.scene = 'sc4'
	scene = new THREE.Scene()
	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, .1, 1000 );
    gui = new GUI();
	analyser = new THREE.AudioAnalyser(sound, 2048);
	const freqBuffer = new Float32Array(analyser.analyser.frequencyBinCount);
	const clock = new THREE.Clock()
	const width = 80, height = 70;
	let angle = 0;
	// Settings 
	    let settings = { pov: 36.0, bloom: true ,Y:{value:0.0},X:{value:0.0},cameralock: true,

};

	// uniforms 
		const uniforms = {
		time:{value:0.0},
		reverse:{value:-1},
		Boombase:{value:0.0},	
		cameraPos: { value: new THREE.Vector3() },
		audioStrength: { value: 1 },
		speed: { value: 0.003 },
		speedMultiplier: { value: 0.2 },
	  	colorA: { value: new THREE.Color(0x5900ff) }, // use 24-bit color
  		colorB: { value: new THREE.Color(0xffa575) },
		highmid:{value:1.0},
		scaler:{value:1.0}
	}
	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	main.appendChild(renderer.domElement);
	const controls = new OrbitControls(camera, renderer.domElement);	
	// GUI 
	initControllers('V4')
    // ------------------------
    // Post-processing: Bloom
    // ------------------------
// Create composer
	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		1.5, // strength
		0.4, // radius
		0.35 // threshold
	);

	// Only white glow
	bloomPass.strength = 1.5;
	bloomPass.radius = 1;
	bloomPass.threshold = 0; // low threshold makes all bright areas glow white

	composer.addPass(bloomPass);
    // GUI controls for bloom
    const bloomFolder = gui.addFolder("Bloom");
	bloomFolder.add(settings, "bloom").name("Enable Bloom");
    bloomFolder.add(bloomPass, "strength", 0.0, 3.0, 0.01).name("Strength");
    bloomFolder.add(bloomPass, "radius", 0.0, 1.0, 0.01).name("Radius");
    bloomFolder.add(bloomPass, "threshold", 0.0, 1.0, 0.01).name("Threshold");
	
	

	
	function reverse(){
		uniforms.reverse.value = uniforms.reverse.value * -1
	}
	gui.add({reverse} , 'reverse')
	gui.add(settings.X, 'value', -30, 30, 0.01).name('X-axis')
	gui.add(settings.Y , 'value', -30, 30, 0.01).name('Y-axis')
	gui.add(uniforms.scaler , 'value', 0.1, 2, 0.01).name('Scaler')
	gui.add(settings , 'cameralock').name('Cameralock')
	gui.addColor({ color: '#' + uniforms.colorA.value.getHexString() }, 'color').name('colorA')
	.onChange(value => {
		uniforms.colorA.value.set(value); // convert string/hex to THREE.Color
	});

	gui.addColor({ color: '#' + uniforms.colorB.value.getHexString() }, 'color').name('colorB')
	.onChange(value => {
		uniforms.colorB.value.set(value); // convert string/hex to THREE.Color
	});



   	camera.position.set(0,20,0)

	// Mesh
	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array((width + 1) * (height + 1) * 3);
	const velocities = new Float32Array((width+1)*(height+1)*3);
	const R = 12;
	const r = 4;  
	const initialSpeed = 0.1;


let idx = 0;
for(let i=0; i<=width; i++){
    for(let j=0; j<=height; j++){
        const u = (i/width)*2*Math.PI;
        const v = (j/height)*2*Math.PI;

        const x = (R + r*Math.cos(v)) * Math.cos(u);
        const y = r * Math.sin(v);
        const z = (R + r*Math.cos(v)) * Math.sin(u);

        vertices[idx] = x;
        vertices[idx+1] = y;
        vertices[idx+2] = z;

        // velocity pointing **toward center along torus path**
        const dirX = -Math.sin(u) * initialSpeed;
        const dirZ = Math.cos(u) * initialSpeed;

        velocities[idx] = dirX * Math.random();
        velocities[idx+1] = 0;
        velocities[idx+2] = dirZ * Math.random();

        idx += 3;
    }
}

geometry.setAttribute('position', new THREE.BufferAttribute(vertices,3));
geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities,3));

// --- vertex shader ---
const LvertexShader = `precision mediump float;
varying float vMix;
attribute float randomFactor; // pass a random number per particle

attribute vec3 velocity;
uniform float time;
uniform float Boombase;
uniform float speed;
uniform float strength;
uniform float speedMultiplier;
uniform float highmid;
uniform vec3 cameraPos;

void main() {
    vec3 newPos = position;

    // move along torus path toward camera
    newPos += velocity ;

    // optional: slight radial breathing for effect
    float radial = highmid * 0.03 * sin(time*2.0  + length(newPos.xz));
    vec2 xz = newPos.xz;
    float len = length(xz);
    newPos.xz += normalize(xz) * radial;
    vMix = randomFactor; // each particle gets its own value

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);
    gl_PointSize = 3.0 + .1* Boombase; // points get bigger with speed
}

`;
// --- vertex shader ---
const vertexShader = `precision mediump float;

varying float vMix;
attribute float randomFactor; // per-particle control
attribute vec3 velocity;

uniform float time;
uniform float scaler;
uniform float Boombase;
uniform float highmid;

void main() {
    vec3 newPos = position;

    // move along torus path only for dynamic particles
    if (randomFactor > 0.5) {
        newPos += velocity;

        // distance from tunnel center (XZ plane)
        float radius = length(newPos.xz);

        // circular pulse: wave moving outward along radius
        float pulse = sin(radius * 10.0 - time * 1.06) * 0.05;

        // optional: combine with per-particle breathing
        float radial = highmid * 0.03 + pulse;
        vec2 xz = newPos.xz;
        newPos.xz += normalize(xz) * radial;

        // make point size react to pulse
		if(+(2.0 + pulse * 20.0 + 0.5 * highmid + Boombase * 0.5) > 100.0){
			gl_PointSize = (2.0 + pulse * 20.0 + 0.5 * highmid + Boombase * 0.5 ) * .5 * scaler ;
		}else{
			gl_PointSize =  scaler * (2.0 + pulse * 20.0 + 0.5 * highmid + Boombase * 0.5) ;
		}
    } else {
        // static particle
        gl_PointSize = 3.0 * scaler ;
    }

    vMix = randomFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}


`;

// --- fragment shader ---
const fragmentShader = `
precision mediump float;

uniform vec3 colorA;
uniform vec3 colorB;

varying float vMix;

void main() {
    vec2 uv = gl_PointCoord - 0.5;
    if(length(uv) > 0.5) discard;

    // electron glow: additive effect along color gradient
    vec3 blended = mix(colorA, colorB, vMix) * 1.2;
    gl_FragColor = vec4(blended, 1.0);
}


`;


	// --- material & points ---
	const material = new THREE.ShaderMaterial({
	uniforms,
	vertexShader:vertexShader,
	fragmentShader:fragmentShader,
	transparent:true
	});
	const Lmaterial = new THREE.ShaderMaterial({
	uniforms,
	vertexShader:LvertexShader,
	fragmentShader:fragmentShader,
	});
	material.transparent = true; // allow alpha
	const pointsV = [];
	for(let i = 0;i <= width * height * 3 + 300;){
		pointsV.push( new THREE.Vector3(vertices[i],vertices[i + 1],vertices[i + 2]) );
		pointsV.push(  new THREE.Vector3(vertices[i + (height + 1) * 3],vertices[i + (height + 1) * 3 + 1],vertices[i + (height + 1) * 3 + 2])  );
		i += 3
	}
const count = (width + 1) * height; // number of horizontal lines
const lineStarts = [];
const lineEnds = [];
const progress = new Float32Array(count);
const randomFactors = new Float32Array(count);

for (let row = 0; row < height; row++) {
    for (let col = 0; col <= width; col++) {
        const idx = row * (width + 1) + col;
        const nextCol = (col + 1) % (width + 1); // wrap for torus
        const startIdx = idx * 3;
        const endIdx = row * (width + 1) * 3 + nextCol * 3;

        // start vertex
        lineStarts.push(vertices[startIdx], vertices[startIdx + 1], vertices[startIdx + 2]);
        // end vertex
        lineEnds.push(vertices[endIdx], vertices[endIdx + 1], vertices[endIdx + 2]);

        progress[idx] = Math.random(); // random start along line
        randomFactors[idx] = Math.random(); // per-particle color mix
    }
}

geometry.setAttribute('randomFactor', new THREE.Float32BufferAttribute(randomFactors, 1));

	const Lgeometry = new THREE.BufferGeometry().setFromPoints( pointsV );

	const points = new THREE.Points( geometry, material );
	const line = new THREE.LineSegments( Lgeometry, Lmaterial );
	scene.add(line);
	scene.add(points);

	function animate() {
		animationId = requestAnimationFrame(animate)
	    controls.update(); 
		angle += -uniforms.reverse.value * uniforms.reverse.value * 0.001 * (uniforms.Boombase.value != -1 ? uniforms.Boombase.value * 1.2 : 1) * uniforms.audioStrength.value * 2 * uniforms.highmid.value * .8;
		const radius = 12;
		analyser.analyser.getFloatFrequencyData(freqBuffer);
		// Example: get bass intensity
		let bass = 0 ; 
		let highm = 0 ; 
		for(let i =0;i < 20;i++){
			if(freqBuffer[i] != -Infinity){
				bass += +freqBuffer[i]
			}
		}; 
		for(let i =0;i < 400;i++){
			if(freqBuffer[freqBuffer.length - i - 1] != -Infinity){
				highm += +freqBuffer[freqBuffer.length - i - 1]
			}
		}; 
		highm = highm / 400
		bass = bass / 20
		if(minh > highm){minh = +highm}
		if(maxh < highm){maxh = +highm}
		if(minN > bass){minN = +bass}
		if(maxN < bass){maxN = +bass}
		let value = toMinusOneToOne(+bass,+minN,+maxN)
		let valueh = toMinusOneToOne(+highm,+minh,+maxh)
		uniforms.time.value = clock.getElapsedTime();
		uniforms.Boombase.value = value
		uniforms.speed.value = bass 
		uniforms.highmid.value = valueh * 0.5
		uniforms.cameraPos.value.copy(camera.position);
		uniforms.audioStrength.value = analyser.getAverageFrequency() / 256.0;
		if(settings.cameralock){
			// Apply X shift as an angular offset
			const xOffset = settings.X.value / radius; // convert linear shift to angle
			const finalAngle = angle * uniforms.reverse.value - xOffset;
			camera.position.x = Math.cos(finalAngle) * radius;
			camera.position.z = Math.sin(finalAngle) * radius;
			camera.position.y = settings.Y.value;
			const forward = new THREE.Vector3(0, 0, 0).sub(camera.position).normalize();
			const up = new THREE.Vector3(0, 1, 0);
			const right = new THREE.Vector3().crossVectors(forward, up).normalize();

			const offset = uniforms.reverse.value * 20.0;
			const target = new THREE.Vector3().addVectors(
				new THREE.Vector3(0, 0, 0),
				right.multiplyScalar(offset)
			);

			// Optionally add small X shift to target for fine tuning
			target.x += settings.X.value * 0.2;

			camera.lookAt(target);
		}
		uniforms.speedMultiplier.value =  0.3;
	        
		if (settings.bloom) {
			// Render with bloom
			composer.render();
		} else {
			// Render normally
			renderer.render(scene, camera);
		}
	}
	function onWindowResize() {
    // update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// attach the event listener
window.addEventListener('resize', onWindowResize, false);
	animate()
}

var Sscene, orthoCamera, rtt,particles;
function Fbo( width, height, renderer, simulationMaterial, renderMaterial ,fftSize){
	function init(){
       Sscene = new THREE.Scene();
       orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,1/Math.pow( 2, 53 ),1);
       var options = {
            minFilter: THREE.NearestFilter,//important as we want to sample square pixels
            magFilter: THREE.NearestFilter,//
            format: THREE.RGBFormat,//could be RGBAFormat 
            type:THREE.FloatType//important as we need precise coordinates (not ints)
        };
        rtt = new THREE.WebGLRenderTarget( width,height, options);

		var geom = new THREE.BufferGeometry();
        geom.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array([   -1,-1,0, 1,-1,0, 1,1,0, -1,-1, 0, 1, 1, 0, -1,1,0 ]), 3 ) );
        geom.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array([   0,1, 1,1, 1,0,     0,1, 1,0, 0,0 ]), 2 ) );
        Sscene.add( new THREE.Mesh( geom, simulationMaterial ) );
 
        //create a vertex buffer of size width * height with normalized coordinates
        var l = (width * height );
        var vertices = new Float32Array( l * 3 );
        for ( var i = 0; i < l; i++ ) {
 
            var i3 = i * 3;
            vertices[ i3 ] = ( i % width ) / width ;
            vertices[ i3 + 1 ] = ( i / width ) / height;
            vertices[ i3 + 1 ] = 0;
        }
		const numParticles = width * height;
		const aIndex = new Float32Array(numParticles);

	
		for (let i = 0; i < numParticles; i++) {
		// Randomly assign a bin to each particle
		aIndex[i] = Math.floor(Math.random() * fftSize);
		}
		
		
		
        //create the particles geometry
        var geometry = new THREE.BufferGeometry();
		geometry.setAttribute("aIndex", new THREE.BufferAttribute(aIndex, 1));
        geometry.setAttribute( 'position',  new THREE.BufferAttribute( vertices, 3 ) );
		var uvs = new Float32Array(l*2);
		for (let i=0; i<l; i++){
			uvs[i*2] = (i % width)/width;
			uvs[i*2+1] = Math.floor(i/width)/height;
		}
		geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
		particles = new THREE.Points( geometry, renderMaterial )
		particles.frustumCulled = false;

	}
		return {update:Supdate,init:init,particles:particles}

		function Supdate(){
        //1 update the simulation and render the result in a target texture
			// renderer.render(Sscene, orthoCamera, rtt, true );
			renderer.setRenderTarget(rtt);
			renderer.render(Sscene, orthoCamera);
			renderer.setRenderTarget(null);
			particles.material.uniforms.positions.value = rtt.texture;
    };
}

export function PlaneScene(){
	window.localStorage.scene = 'sc5'
	var w = window.innerWidth;
    var h = window.innerHeight;
	let j = 0

	analyser = new THREE.AudioAnalyser(sound, 2048);
	let fragmentShader = `precision highp float;
varying vec2 vUv;

uniform sampler2D positions;  // original position texture (xyz stored in RGB)
uniform sampler2D uAudio;     // audio spectrum texture
uniform float uFFTSize;
uniform float uTime;
uniform float avg;         // attenuation over distance
uniform float baseboom;         // attenuation over distance
uniform vec2 uFieldSize;      // e.g. (width, height)

float audioFromDistance(float d) {
    float maxR = length(uFieldSize * 0.5);
    float norm = clamp(d / maxR, 0.0, 1.0);
    float idx = norm * (uFFTSize - 1.0);
    float fx = (idx + 0.5) / uFFTSize;
    return texture2D(uAudio, vec2(fx, 0.5)).r;
}

void main() {
    vec3 pos = texture2D(positions, vUv).rgb;
    // Compute “radial coordinate” from center of field
    vec2 centered = (vUv - vec2(0.5, 0.5)) * uFieldSize;
    float d = length(centered);
    // Audio value for this radius
    float audioVal = audioFromDistance(d);

    // Final displacement
	for (int i = 0; i <= 360; i++) {
		float angle = radians(float(i));      // convert to radians
		float wave = sin(pos.x * 10.0 + uTime) * audioVal * avg;
		pos.y += wave * avg;
	}

    gl_FragColor = vec4(pos, 1.0);}`;
	const waveTimesArray = new Float32Array(240);
	let waveTimes =[];

	// Audio 
	const freqBuffer = new Float32Array(analyser.analyser.frequencyBinCount);
	const fftSize = analyser.analyser.frequencyBinCount; // 1024
	const freqArray = new Uint8Array(fftSize);
	const audioTexture = new THREE.DataTexture(freqArray, fftSize, 1, THREE.RedFormat, THREE.UnsignedByteType);
	audioTexture.minFilter = audioTexture.magFilter = THREE.NearestFilter;
	audioTexture.needsUpdate = true;
	// waves texture 
	// how many simultaneous waves we allow
	const MAX_WAVES = 128;

	// wave map storage: RGBA float per wave: [ startTime, strength, speed, duration ]
	const waveData = new Float32Array(MAX_WAVES * 4);

	// init all wave start times negative so they are inactive
	for (let i = 0; i < MAX_WAVES; i++) {
	waveData[i * 4 + 0] = -1e6; // startTime (inactive)
	waveData[i * 4 + 1] = 0.0;   // strength
	waveData[i * 4 + 2] = 20.0;  // speed (default, can override per-wave)
	waveData[i * 4 + 3] = 5.0;   // duration (seconds)
	}

	// DataTexture: width = MAX_WAVES, height = 1, FloatType RGBA
	const waveTexture = new THREE.DataTexture(waveData, MAX_WAVES, 1, THREE.RGBAFormat, THREE.FloatType);
	waveTexture.minFilter = THREE.NearestFilter;
	waveTexture.magFilter = THREE.NearestFilter;
	waveTexture.wrapS = THREE.ClampToEdgeWrapping;
	waveTexture.wrapT = THREE.ClampToEdgeWrapping;
	waveTexture.needsUpdate = true;

	// ring buffer pointers
	let waveWriteIndex = 0;
	let activeWaveCount = 0; // up to MAX_WAVES
	function addWave(startTimeSec, strength = 1.0, speed = 20.0, duration = 5.0) {
		const i = waveWriteIndex % MAX_WAVES;
		const base = i * 4;
		waveData[base + 0] = startTimeSec; // startTime
		waveData[base + 1] = strength;
		waveData[base + 2] = speed;
		waveData[base + 3] = duration;

		waveTexture.image.data.set(waveData); // copy back into DataTexture backing buffer
		waveTexture.needsUpdate = true;

		waveWriteIndex = (waveWriteIndex + 1) % MAX_WAVES;
		activeWaveCount = Math.min(activeWaveCount + 1, MAX_WAVES);
		console.log(waveWriteIndex)
		console.log(activeWaveCount)
}

	// Cube Mesh
	const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
	const cmaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
	const cube = new THREE.Mesh( geometry, cmaterial ); 		
	// Rollercoster
	const points = [
		new THREE.Vector3(-30,30,50),
		new THREE.Vector3(30,23,60),
		new THREE.Vector3(60,18,90),
		new THREE.Vector3(60,18,-90),
		new THREE.Vector3(-30,30,-40),
		new THREE.Vector3(-100,37,-110),
		new THREE.Vector3(-80,15,74),
		new THREE.Vector3(-60,30,60),
	
	]
	const path = new THREE.CatmullRomCurve3(points,true)
	const pathGeo = new THREE.BufferGeometry().setFromPoints(path.getPoints(points.length * 10));
	const pathMat = new THREE.LineBasicMaterial({color: 0xff0000});
	const pathObject = new THREE.Line(pathGeo,pathMat)
	// normal scene creation 
	let helper = new THREE.AxesHelper(5);
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(60,w/h,1/Math.pow( 2, 53 ),10000 );
	gui = new GUI()
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( w,h );
	main.appendChild(renderer.domElement);
	initControllers('Vlow')

	const controls = new OrbitControls(camera, renderer.domElement);
	const Pointercontrols = new PointerLockControls(camera, renderer.domElement);
	// add click to activate pointer lock
	let activeControls = Pointercontrols

	// create a buffer with color data

	const width = 256;
	const height = 256;

	let img1 = document.getElementById('img1')
	const data =getImage(img1, width, height, 50)
	const dataRGBA = new Float32Array(width * height * 4);

	for (let i = 0; i < width * height; i++) {
		dataRGBA[i*4] = data[i*3];     // R
		dataRGBA[i*4 + 1] = data[i*3 + 1]; // G
		dataRGBA[i*4 + 2] = data[i*3 + 2]; // B
		dataRGBA[i*4 + 3] = 1.0;           // A = fully opaque
	}
	const floatTexture = new THREE.DataTexture(dataRGBA, width, height, THREE.RGBAFormat, THREE.FloatType);
	floatTexture.needsUpdate = true;


	// uniforms 
	const uniform = {
    positions: { value: floatTexture }, // initial positions DataTexture
    uAudio:    { value: audioTexture }, // your 1D audio DataTexture
    uFFTSize:  { value: fftSize },      // fft bin count (float)
    uTime:     { value: 0.0 },
    uOrigin:   { value: new THREE.Vector3(0, 0, 0) }, // origin for wave
    uWaveSpeed:{ value: 60.0}, // how fast wave moves (tune)
    uWaveFreq: { value: 0.5 },  // spatial frequency of wave (tune)
    uAmp:      { value: 1.0 },  // overall amplitude (tune)
    avg:      { value: 0.0 },  // overall amplitude (tune)
    baseboom:      { value: 1.0 },  // overall amplitude (tune)
    uAtten:    { value: 0.5 },   // attenuation per distance (tune)
    uWaveMap: { value: waveTexture },
	uWaveTimes:{value:waveTimesArray},
	uWaveK: { value: 6.0 },
	uWaveWidth: { value: 3.0 }
,
	uNumWaves:{value:0},
    uMaxWaves: { value: MAX_WAVES },
	uWaveSpeed :{ value: 20.0 },
	uFieldSize:{ value: new THREE.Vector2(width, height) },
}


	// ------------------- simulation Material -------------------
	var simulationShader = new THREE.ShaderMaterial({
	uniforms: uniform,
	vertexShader: `
		varying vec2 vUv;
		void main() {
		vUv = uv;
		gl_Position = vec4(position, 1.0);
		}`,
	fragmentShader: fragmentShader
	});
	// settings
	let settings = {
		PointerLockControls: true,
		cameralock: true,
		mode: 'Blackhole'
		,swapmodes: (Mode)=>{
			console.log(Mode)
			if(Mode == 'Blackhole'){
				simulationShader.fragmentShader = `precision highp float;
varying vec2 vUv;

uniform sampler2D positions;  // original position texture (xyz stored in RGB)
uniform sampler2D uAudio;     // audio spectrum texture
uniform float uFFTSize;
uniform float uTime;
uniform float uWaveSpeed;     // how fast the wave travels outward
uniform float uWaveFreq;      // how tightly waves oscillate per distance
uniform float uAmp;           // amplitude multiplier
uniform float uAtten;         // attenuation over distance
uniform float avg;         // attenuation over distance
uniform float baseboom;         // attenuation over distance
uniform vec2 uFieldSize;      // e.g. (width, height)

float audioFromDistance(float d) {
    float maxR = length(uFieldSize * 0.5);
    float norm = clamp(d / maxR, 0.0, 1.0);
    float idx = norm * (uFFTSize - 1.0);
    float fx = (idx + 0.5) / uFFTSize;
    return texture2D(uAudio, vec2(fx, 0.5)).r;
}

void main() {
    vec3 pos = texture2D(positions, vUv).rgb;

    // Compute “radial coordinate” from center of field
    vec2 centered = (vUv - vec2(0.5, 0.5)) * uFieldSize;
    float d = length(centered);

    // Audio value for this radius
    float audioVal = audioFromDistance(d);

    // Final displacement
	for (int i = 0; i <= 360; i++) {
		float angle = radians(float(i));      // convert to radians
		float wave = sin(pos.x * 10.0 + uTime) * audioVal * avg;
		pos.y += wave * avg;
	}



    gl_FragColor = vec4(pos, 1.0);
}`
				simulationShader.needsUpdate = true;

			}
			else if(Mode == 'mode 2'){
				simulationShader.fragmentShader = `precision highp float;
		varying vec2 vUv;
		
		uniform sampler2D positions;  // original position texture (xyz stored in RGB)
		uniform sampler2D uAudio;     // audio spectrum texture
		uniform sampler2D uWaveMap;   // RGBA float per wave: startTime, strength, speed, duration
		uniform float uFFTSize;
		uniform float uTime;
		uniform float uWaveSpeed;     // how fast the wave travels outward
		uniform float uWaveFreq;      // how tightly waves oscillate per distance
		uniform float uAmp;           // amplitude multiplier
		uniform float uAtten;         // attenuation over distance
		uniform float avg;         // attenuation over distance
		uniform float baseboom;         // attenuation over distance
		uniform vec2 uFieldSize;      // e.g. (width, height)
		uniform float uMaxWaves;      // int as float
		uniform float uWaveTimes[240];    
		uniform int uNumWaves;

		// parameters for wave shape
		uniform float uWaveK;     // spatial frequency of ripple (like k)
		uniform float uWaveWidth; // how thick the front is (in world units)

		
		float audioFromDistance(float d) {
			float maxR = length(uFieldSize * 0.5);
			float norm = clamp(d / maxR, 0.0, 1.0);
			float idx = norm * (uFFTSize - 1.0);
			float fx = (idx + 0.5) / uFFTSize;
			return texture2D(uAudio, vec2(fx, 0.5)).r;
		}
		void main() {
			vec3 pos = texture2D(positions, vUv).rgb;

			// Compute “radial coordinate” from center of field
			// Audio value for this radius
			// float audioVal = audioFromDistance(d);
			
			float d = length(pos.xz); // distance from origin
			// int maxI = int(uMaxWaves);
			
			float fade = exp(-d * 0.05);   // the 0.05 is decay rate, tweak it
			float angle = uTime;       
			float radius = (uTime - 0.0) * uWaveSpeed;
			// float phase;
			// if(abs(d - radius) > 5.0){
			// 	phase = uTime;
			// }else{
			// 	phase = d;
			// }
			//  or uTime * speed
			// float wave = sin(angle - d * baseboom ) * avg ; // Great shape
			// float wave = sin(angle * baseboom  - d ) * avg ;
			// float wave = sin( uTime - phase) * 2.0 ;
			float maxR = length(uFieldSize * 0.5);
			float phase = (d / maxR) * 6.28318530718 - uTime * uWaveSpeed;

			// Audio value for this radius
			float audioVal = audioFromDistance(d);

			// Attenuation (so further wave is weaker)
			float atten = exp(-uAtten * d);
	
			// Final displacement
			// distance from center

			// local time (0.0 to 1.0 each second)
			float t = fract(uTime);

			// make a ripple that grows outward during this 1 second
			float ripple = sin(baseboom - d * 10.0 - t * 6.2831 ) + baseboom ;// 2π per second
			// displace with audio
			pos.y += ripple * baseboom * audioVal ;

			// Final displacement
			// pos.y += wave * avg;
			gl_FragColor = vec4(pos, 1.0);
		}`
				simulationShader.needsUpdate = true;

			}
			else if(Mode == 'Waves'){
				simulationShader.fragmentShader = `precision highp float;
varying vec2 vUv;

uniform sampler2D positions;  // RGB = world pos
uniform sampler2D uAudio;     // audio spectrum (unused here but available)
uniform sampler2D uWaveMap;   // RGBA float per wave: startTime, strength, speed, duration
uniform float uTime;          // seconds
uniform float uMaxWaves;      // int as float
uniform vec2 uFieldSize;      // (width, height) of particle field

// parameters for wave shape
uniform float uWaveK;     // spatial frequency of ripple (like k)
uniform float uWaveWidth; // how thick the front is (in world units)

// helper to sample wave texel i
vec4 readWave(int i, float maxWaves) {
    // sample coordinate in [0,1]
    float fx = (float(i) + 0.5) / maxWaves;
    return texture2D(uWaveMap, vec2(fx, 0.5));
}

void main() {
    vec3 pos = texture2D(positions, vUv).rgb;

    // compute distance from center in "world" units consistent with uFieldSize
    vec2 centeredUV = (vUv - vec2(0.5, 0.5)) * uFieldSize;
    float d = length(centeredUV);

    float totalY = 0.0;

    // loop all wave slots (MAX_WAVES must match JS)
    int maxI = int(uMaxWaves);
    for (int i = 0; i < 512; i++) { // 512 is an upper-bound; ensure MAX_WAVES <= 512
        if (i >= maxI) break;
        vec4 w = readWave(i, uMaxWaves);
        float t0 = w.x;
        float strength = w.y;
        float speed = w.z;
        float duration = w.w;

        // ignore inactive slots (t0 very negative or zero)
        if (t0 < 0.0) continue;

        float age = uTime - t0;
        if (age < 0.0) continue;       // not started yet
        if (age > duration) continue;  // wave finished

        float radius = age * speed;    // current wavefront radius

        // how far from the current front
        float delta = d - radius;

        // prefer a localized front using smoothstep or gaussian
        float absDelta = abs(delta);

        // fade envelope: 1 at wavefront, 0 beyond waveWidth
        float envelope = smoothstep(uWaveWidth, 0.0, absDelta);

        // sinusoidal ripple along the front (phase depends on distance)
        float ripple = sin((d - radius) * uWaveK + age * 4.0);

        // accumulate
        totalY += ripple * strength * envelope;
    }

    // write back: keep pos.xz and update y
    pos.y += totalY;

    gl_FragColor = vec4(pos, 1.0);
}
`
				simulationShader.needsUpdate = true;

			}
		}
	}
	function add(){
		const now = performance.now() / 1000;
		// waveTimes.push(now)
		const strength = Math.max(0.2, simulationShader.uniforms.baseboom.value * 3.0); // tune
		addWave(now, strength, 30.0, 6.0);
	}
	gui.add(settings, 'mode', ['Blackhole', 'mode 2','Waves'])
	.name('Mode')
	.onChange(settings.swapmodes);
	let control1 = gui.add(settings , 'cameralock').name('Cameralock').onChange(()=>{
		if(settings.cameralock){
			j = 0
		}else{
			camera.position.set(233,182,120)
			camera.lookAt(0,0,0)
		}
	})
	let control = gui.add(settings, 'PointerLockControls').name('PointerLockControls:').onChange((enabled) => {
		if (enabled) {
			Pointercontrols.lock();
			activeControls = Pointercontrols;
		} 
		else {
			Pointercontrols.unlock();
			activeControls = controls;
		}
	})
	document.addEventListener('pointerlockchange', () => {
		if (document.pointerLockElement === renderer.domElement) {
			controls.enabled = false; // disable OrbitControls
			gui.close()
		} else {
			controls.enabled = true;  // re-enable OrbitControls
			gui.open()
		}
	});

	let lastClickTime = 0;
	// Double click 
	// document.addEventListener('click', () => {
	// 	const now = performance.now();

	// 	if (now - lastClickTime < 300) { // double click detected
	// 		if (settings.PointerLockControls) {
	// 		Pointercontrols.lock();
	// 		}
	// 	}

	// 	lastClickTime = now;
	// });
	// Movement
	const direction = new THREE.Vector3();
	const move = { forward: false, backward: false, left: false, right: false };

	document.addEventListener('keyup', (event) => {
	switch (event.code) {
		case 'KeyW': move.forward = false; break;
		case 'KeyS': move.backward = false; break;
		case 'KeyA': move.left = false; break;
		case 'KeyD': move.right = false; break;
	}
	});
	window.addEventListener("keydown", (e) => {
		console.log(e.code)
		  switch (e.code) {
			case 'KeyW': move.forward = true; break;
			case 'KeyS': move.backward = true; break;
			case 'KeyA': move.left = true; break;
			case 'KeyD': move.right = true; break;
			case 'Escape': gui.open(); break;
		}
	if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
		settings.PointerLockControls = !settings.PointerLockControls;
		
		control.updateDisplay(); // updates GUI checkbox
		if (settings.PointerLockControls) {
			j = 0
			activeControls = PointerLockControls
			settings.cameralock = true;
			Pointercontrols.lock();
			controls.enabled = false
		} else {
			settings.cameralock = false
			activeControls = controls
			camera.position.set(50,300,100)
			camera.lookAt(0,0,0)
			controls.enabled = true
			Pointercontrols.unlock();
		}
		control1.updateDisplay();

	}
	});
	const note = document.createElement('div');
	// const secondnote = document.createElement('div');
	const thnote = document.createElement('div');
	// secondnote.innerText = "Double click to lock";
	thnote.innerText = "ESC to unlock";
	thnote.className = "notes";
	note.className = "notes";
	// secondnote.className = "notes";
	thnote.style.top = '20vh';
	thnote.style.position = 'absolute';
	thnote.style.left = '10px';
	thnote.style.padding = '6px 10px';
	thnote.style.background = 'rgba(0,0,0,0.6)';
	thnote.style.color = 'white';
	thnote.style.fontFamily = 'sans-serif';
	thnote.style.fontSize = '14px';
	thnote.style.borderRadius = '4px';
	// secondnote.style.top = '20vh';
	// secondnote.style.position = 'absolute';
	// secondnote.style.left = '10px';
	// secondnote.style.padding = '6px 10px';
	// secondnote.style.background = 'rgba(0,0,0,0.6)';
	// secondnote.style.color = 'white';
	// secondnote.style.fontFamily = 'sans-serif';
	// secondnote.style.fontSize = '14px';
	// secondnote.style.borderRadius = '4px';
	note.innerText = "Press Shift to toggle the ride";
	note.style.position = 'absolute';
	note.style.top = '15vh';
	note.style.left = '10px';
	note.style.padding = '6px 10px';
	note.style.background = 'rgba(0,0,0,0.6)';
	note.style.color = 'white';
	note.style.fontFamily = 'sans-serif';
	note.style.fontSize = '14px';
	note.style.borderRadius = '4px';
	document.body.appendChild(note);
	// document.body.appendChild(secondnote);
	document.body.appendChild(thnote);
	// ------------------- Render Material -------------------
	const material = new THREE.ShaderMaterial({
		uniforms: {
				positions: { value: null },
				pointSize: { value: 2 },
				uFreq: {value:freqArray}
			},
		vertexShader: `
			uniform sampler2D positions;

			void main() {
				vec3 pos = texture2D(positions, uv).xyz;


				gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
				gl_PointSize = 2.0;
			}


		`,
		fragmentShader: `
				void main()
			{
				gl_FragColor = vec4( vec3( 1. ), .25 );
			}
		`,
		transparent: true,
        blending:THREE.AdditiveBlending
	});
	
	let FBO = Fbo( width,height, renderer, simulationShader, material,fftSize)
	window.addEventListener( "resize", onResize );
    onResize();
	FBO.init()
	scene.add(particles);
	// scene.add(helper);
	// scene.add(pathObject)
	// scene.add(cube);
	renderer.setAnimationLoop(update)
	let lastwave = 0 ;
	let lastping = 0 ;
	function getRandomData( width, height, size ){
		
			var len = width * height * 3;
			var data = new Float32Array( len );
			while( len-- )data[len] = ( Math.random() * 2 - 1 ) * size ;
			return data;
	}
	function getImage( img, width, height, elevation ){
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d"); // <-- This is the 2D context
		ctx.drawImage(img, 0, 0);
		var imgData = ctx.getImageData(0,0,width,height);
		var iData = imgData.data;
		var l = (width * height);
		var data = new Float32Array( l * 3 );
		for ( var i = 0; i < l; i++ ) {
			var i3 = i * 3;
			var i4 = i * 4;
			data[ i3 ]      = ( ( i % width ) / width  -.5 ) * width;
			data[ i3 + 1 ]  = ( iData[i4] / 0xFF * 0.299 +iData[i4+1]/0xFF * 0.587 + iData[i4+2] / 0xFF * 0.114 ) * elevation;
			data[ i3 + 2 ]  = ( ( i / width ) / height -.5 ) * height;
		}
		return data;
	}
    function onResize(){
        var w = window.innerWidth;
        var h = window.innerHeight;
        renderer.setSize(w,h);
        camera.aspect = w/h;
        camera.updateProjectionMatrix();
    }
	function update(time){
		FBO.update();	
		analyser.analyser.getByteFrequencyData(freqArray); // fills with 0..255
		analyser.analyser.getFloatFrequencyData(freqBuffer); // fills with 0..255
		console.log(camera.position)
		const tsec = time * 0.001;
		let size = points.length + 1
		let bass = 0 ; 
		let highm = 0 ; 
		for(let i =0;i < 20;i++){
			if(freqBuffer[i] != -Infinity){
				bass += +freqBuffer[i]
			}
		}; 
		for(let i =0;i < 400;i++){
			if(freqBuffer[freqBuffer.length - i - 1] != -Infinity){
				highm += +freqBuffer[freqBuffer.length - i - 1]
			}
		}; 
		highm = highm / 400
		bass = bass / 20
		if(minh > highm){minh = +highm}
		if(maxh < highm){maxh = +highm}
		if(minN > bass){minN = +bass}
		if(maxN < bass){maxN = +bass}
		let value = toMinusOneToOne(+bass,+minN,+maxN)
		let valueh = toMinusOneToOne(+highm,+minh,+maxh)
		simulationShader.uniforms.uTime.value = tsec; // seconds
		let avgfq =(analyser.getAverageFrequency() / 256.0) * 50;
		
		// Update the texture
		audioTexture.image.data.set(freqArray);
		audioTexture.needsUpdate = true;
		simulationShader.uniforms.avg.value = avgfq;
		simulationShader.uniforms.baseboom.value = value;
		simulationShader.uniforms.uAudio.value = audioTexture;
		simulationShader.uniforms.uFFTSize.value = fftSize;
		// Waves

		if ((value > 13.5 || valueh * value > 27 ) && (tsec - lastwave) > 0.3) { 
		lastwave = tsec;
		const strength = Math.max(0.2, value * .06 * valueh); // tune mapping
		console.log(1/(avgfq * 3.0) * 60.0)
		addWave(tsec, strength, avgfq * 6.0 /*speed*/,1/(avgfq * 6.0) * 200.0 /*duration*/);
		}

		// const waveLifetime = 11; // seconds, how long a wave affects particles
		// if(avgfq > 4 && tsec - lastwave > 1){
		// 	lastwave = tsec
		// 	waveTimes.push(tsec)
		// } 
		// for (let i = 0; i < waveTimes.length; i++) {
		// 		waveTimesArray[i] = waveTimes[i] || 0.0;
		// }
		// waveTimes = waveTimes.filter(t0 => tsec - t0 < waveLifetime);
		// simulationShader.uniforms.uNumWaves.value = waveTimes.length;
		// simulationShader.uniforms.uWaveTimes.value = waveTimesArray;
		if(settings.PointerLockControls && activeControls === Pointercontrols){
			const speed = 0.5;
			direction.set(0, 0, 0);
			if (move.backward) direction.z -= 1;
			if (move.forward) direction.z += 1;
			if (move.left) direction.x -= 1;
			if (move.right) direction.x += 1;
			direction.normalize();
			activeControls.moveRight(direction.x * speed);
			activeControls.moveForward(direction.z * speed);
		}
		// Curve
		const pathLength = path.getLength(); // dynamic total length
		// const t = (time / 3000 % size) / size;
		const loopTime = 25.0; // seconds
		const distance = (tsec % loopTime) / loopTime * pathLength;
		const u = path.getUtoTmapping(distance / pathLength); 
		const position = path.getPoint(u)
		const positionc = path.getPoint(u + .12)
		if( (tsec - lastping) > 25){
			lastping = tsec
			let index = Math.floor(Math.random() * 256 - 128);
			let indez = Math.floor(Math.random() * 256 - 128);
			let height = Math.floor(Math.random() * 20 + 15);
			let index1 = Math.floor(Math.random() * 256 - 128);
			let indez1 = Math.floor(Math.random() * 256 - 128);
			let height1 = Math.floor(Math.random() * 20 + 15);
			let index2 = Math.floor(Math.random() * 256 - 128);
			let indez2 = Math.floor(Math.random() * 256 - 128);
			let height2 = Math.floor(Math.random() * 20 + 15);
			let x = index   
			let y =  height ;                
			let z = indez ; 
			points[2] = new THREE.Vector3(index2,height2,indez2)
			points[points.length - 2] = new THREE.Vector3(index1,height1,indez1)
			points[points.length - 1] = new THREE.Vector3(x,y,z)
			path.points = points; 
    		path.updateArcLengths(); 
		}
		if(settings.cameralock){
			camera.position.copy(position)
			if(j == 0){
				j = 1 
				camera.lookAt(position.clone().add(path.getTangentAt(u).normalize())) 
			}
		}
		const updatedPoints = path.getPoints(points.length * 10);
		pathGeo.setFromPoints(updatedPoints);

		cube.position.copy(positionc)
		cube.lookAt(position.clone().add(path.getTangentAt(u).normalize()))
		renderer.render( scene, camera );
	}
}
