import * as THREE from "three";

export default class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color,
    velocity = { x: 0, y: 0, z: 0 },
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: color })
    );
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.velocity = velocity;

    this.top = this.position.y + this.height / 2;
    this.bottom = this.position.y - this.height / 2;

    this.gravity = -0.002;
  }

  update(ground = null) {
    this.top = this.position.y + this.height / 2;
    this.bottom = this.position.y - this.height / 2;

    this.velocity.y += this.gravity;

    this.position.x += this.velocity.x;
    if (!ground) this.position.y += this.velocity.y;
    else if (this.bottom > ground.top) this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
  }

  setPosition({
    x = this.position.x,
    y = this.position.y,
    z = this.position.z,
  }) {
    this.position.set(x, y, z);

    this.top = this.position.y + this.height / 2;
    this.bottom = this.position.y - this.height / 2;
  }
}
