import './style.css'
import * as YUKA from 'yuka';
import * as THREE from 'three';
import Box from './box'

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
  
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.set( 5, 6, 5 );
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
  // enemyMesh.setPosition({x:2, y:3})
  enemyMesh.matrixAutoUpdate = false
  enemyMesh.castShadow = true
  scene.add(enemyMesh)
  const enemy = new YUKA.Vehicle()
  enemy.position.set(4, 6, 0)
  enemy.maxSpeed = 2
  enemy.setRenderComponent(enemyMesh, sync)

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

const speed = 0.04

function animate() {

  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  const deltaTime = time.update().getDelta();
  target.x = cube.position.x
  target.z = cube.position.z
  enemy.position.y = cube.position.y
  cube.update(ground)
  enemyMesh.update(ground)
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

}

function sync( entity, renderComponent ) {

  renderComponent.matrix.copy( entity.worldMatrix );

}

  animate();