import './style.css'
import * as YUKA from 'yuka';
import * as THREE from 'three';
import Box from './box'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3 } from 'three';

let renderer, scene, camera;

let entityManager, time, vehicle;

let onPathBehavior;

const params = {
  onPathActive: true,
  radius: 0.1
};

// init();

// function init() {

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.set( 3, 6, 3 );
  camera.lookAt( scene.position );
  camera.position.set( 6, 6, 6 );

  //

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize, false );

  // game setup

  const cube = new Box({width: 1, height: 1, depth: 1, color: 0xff0000});
  cube.castShadow = true
  cube.receiveShadow = true
  cube.velocity.y = -0.01
  cube.setPosition({y:0})
  scene.add(cube);

  const ground = new Box({width: 10, height: 1, depth: 10, color: 0x00ff00})
  ground.setPosition({y:-2});
  ground.receiveShadow = true
  scene.add(ground);

  //yuka

  entityManager = new YUKA.EntityManager()

  const enemyMesh = new Box({width: 1, height: 1, depth: 1, color: 0x0000ff})
  const loader = new GLTFLoader()
  // const enemyMesh = null
  const enemy = new YUKA.Vehicle()
  enemy.position.set(4, 6, 0)
  enemy.maxSpeed = 2
  loader.load('/Flower.glb', function (gltf) {
    // const enemyssaMesh = gltf.scene
    // enemyMesh.material.color.setHex(0xffffff)
    // enemyMesh.setPosition({x:2, y:3})
    enemyMesh.matrixAutoUpdate = false
    enemyMesh.castShadow = true
    scene.add(enemyMesh)
    enemy.setRenderComponent(enemyMesh, sync)
  })

  time = new YUKA.Time()
  
  const target = new YUKA.Vector3();

  
  enemy.updateOrientation = false
  const seekBehavior = new YUKA.SeekBehavior(target)
  enemy.steering.add(seekBehavior)
  entityManager.add(enemy)


  // light

  // const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  // scene.add( light );

  // White directional light at half intensity shining from the top.
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.set(5, 6, -2)
  directionalLight.castShadow = true;
  scene.add( directionalLight );
// }

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

var keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

window.addEventListener('keydown', (event) =>{
  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      keys.s.pressed = false
      break;
  
    case 'KeyS':
      keys.s.pressed = true
      keys.w.pressed = false
      break;
  
    case 'KeyA':
      keys.a.pressed = true
      keys.d.pressed = false
      break;
  
    case 'KeyD':
      keys.d.pressed = true
      keys.a.pressed = false
      break;
  
    default:
      break;
  }
})

window.addEventListener('keyup', (event) =>{
  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break;
  
    case 'KeyS':
      keys.s.pressed = false
      break;
  
    case 'KeyA':
      keys.a.pressed = false
      break;
  
    case 'KeyD':
      keys.d.pressed = false
      break;
  
    default:
      break;
  }
})
var mouse = new THREE.Vector2()
var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
var raycaster = new THREE.Raycaster();
var pointOfIntersection = new THREE.Vector3();
const cubeh = new Box({width: 0.4, height: 0.4, depth: 0.4, color: 0xff0000});
window.addEventListener('mousemove', (event)=>{
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, pointOfIntersection);
  // cubeh.lookAt(pointOfIntersection);
  cubeh.setPosition({x:pointOfIntersection.x, y: pointOfIntersection.y, z:pointOfIntersection.z})
  console.log(pointOfIntersection)
})

scene.add(cubeh)

const speed = 0.04

function animate() {

  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  const deltaTime = time.update().getDelta();
  target.x = cube.position.x
  target.z = cube.position.z
  const cubeScreenPosition = cube.position.clone().project(camera)
  // cube.lookAt(new Vector3(cube.position.x+(mouse.x-cubeScreenPosition.x)/2, cube.position.y, cube.position.z-(mouse.y-cubeScreenPosition.y)/2))
  // cubeh.position.set(new Vector3(1, 1, 1))
  // cubeh.setPosition({x:cube.position.x+1+(mouse.x-cubeScreenPosition.x)*2, y:cube.position.y, z:cube.position.z-1-(mouse.y-cubeScreenPosition.y)/2})
  enemy.position.y = cube.position.y
  cube.lookAt(new Vector3(cubeh.position.x, cube.position.y, cubeh.position.z))
  
  cube.update(ground)
  // enemyMesh.update(ground)
  
  enemy.lookAt(new YUKA.Vector3(target.x, enemy.position.y, target.z))
  entityManager.update(deltaTime)
  
  cube.velocity.x = 0
  cube.velocity.z = 0
  if(keys.w.pressed) {
    cube.velocity.x += -speed
    cube.velocity.z += -speed
  }
  if(keys.a.pressed) {
    cube.velocity.x += -speed
    cube.velocity.z += speed
  }
  if(keys.s.pressed) {
    cube.velocity.x += speed
    cube.velocity.z += speed
  }
  if(keys.d.pressed) {
    cube.velocity.x += speed
    cube.velocity.z += -speed
  }
  
  // cubeScreenPosition.x = ( cubeScreenPosition.x + 1) * window.innerWidth / 2;
  // cubeScreenPosition.y = - ( cubeScreenPosition.y - 1) * window.innerHeight / 2;
  // cubeScreenPosition.z = 0;
  // console.log({x: (mouse.x-cubeScreenPosition.x)/2, y: (mouse.y-cubeScreenPosition.y)/2});
  // cube.position.z-=0.01
}

function sync( entity, renderComponent ) {

  renderComponent.matrix.copy( entity.worldMatrix );

}

  animate();