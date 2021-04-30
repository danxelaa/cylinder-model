// cylinder.js
// CSE160 - Program 2: Transformation of Fancier Model
// Daniela A. Olano Guia
// dolanogu
// from Luca's cube.js starter code

class Cylinder {
  constructor(n, color) {
    // this.color = color;
    this.n = n;
    // coordinate
    this.vertices = [];
    // normal
    this.normals = [];
    // indices of vertices
    this.indices = [];

    // color 
    this.color = color;

    // temporary array
    let temp = [];
    let points = 2 * (this.n + 1);

    let x = 0;
    let y = 0;
    let z0 = 0;
    let z1 = 1;

    let angle = 0;
    let theta = (Math.PI * 2) / n;
    
    // get vertices
    // z = 0
    for (let i = 0; i < points / 2; i++) {
      if (i == 0) {
        x = 0;
        y = 0;
      } else {
        x = Math.cos(angle);
        y = Math.sin(angle);
        angle += theta;
      };

      temp.push(x, y, z0);

      this.vertices.push(x, y, z0);
    };
    
    for (let i = 0; i <= this.n; i++) {
      this.normals.push(0, 0, -1);
    };

    // z = 1
    angle = 0;

    for (let i = 0; i < points / 2; i++) {
      if (i == 0) {
        x = 0;
        y = 0;
      } else {
        x = Math.cos(angle);
        y = Math.sin(angle);
        angle += theta;
      };

      temp.push(x, y, z1);

      this.vertices.push(x, y, z1);
    };

    for (let i = 0; i <= this.n; i++) {
        this.normals.push(0, 0, 1);
    };

    let a1 = 0;
    let b1 = 0;
    let c1 = 0;
    let a2 = n + 1;
    let b2 = 0;
    let c2 = 0;

    for (let i = 1; i <= this.n; i++) {
      c1 = i;
      b2 = i + n + 1;
      if (i == this.n) {
        b1 = 1;
        c2 = n + 2;
      } else {
        b1 = c1 + 1;
        c2 = b2 + 1;
      };
      this.indices.push(a1, b1, c1);
      this.indices.push(a2, b2, c2);
    };

    let start = 2 * (n + 1) - 1;

    let p1 = 0;
    let p2 = 0;
    let p3 = 0;
    let p4 = 0;

    // Side rectangles
    for (let i = 1; i <= this.n; i++) {
      p1 = i;
      p4 = i + n + 1;
      if (i == this.n) {
          p2 = 1;
          p3 = 2 + n;
      } else {
          p2 = i + 1;
          p3 = i + n + 2;
      };

      let p1_x = temp[(p1 * 3) + 0];
      let p1_y = temp[(p1 * 3) + 1];
      let p1_z = temp[(p1 * 3) + 2];

      let p2_x = temp[(p2 * 3) + 0];
      let p2_y = temp[(p2 * 3) + 1];
      let p2_z = temp[(p2 * 3) + 2];
      
      let p3_x = temp[(p3 * 3) + 0];
      let p3_y = temp[(p3 * 3) + 1];
      let p3_z = temp[(p3 * 3) + 2];
      
      let p4_x = temp[(p4 * 3) + 0];
      let p4_y = temp[(p4 * 3) + 1];
      let p4_z = temp[(p4 * 3) + 2];

      this.vertices.push(p1_x, p1_y, p1_z);
      this.vertices.push(p2_x, p2_y, p2_z);
      this.vertices.push(p3_x, p3_y, p3_z);
      this.vertices.push(p4_x, p4_y, p4_z);

      this.indices.push(start + 1, start + 2, start + 3);
      this.indices.push(start + 3, start + 4, start + 1);

      start += 4;

      // Calculate normal
      let AB = new Vector3([p2_x - p1_x, p2_y - p1_y, p2_z - p1_z]);
      let AC = new Vector3([p4_x - p1_x, p4_y - p1_y, p4_z - p1_z]);

      let normal = Vector3.cross(AB, AC).normalize();
      for (let j = 0; j < 4; j++) {
        this.normals.push(normal.elements[0]);
        this.normals.push(normal.elements[1]);
        this.normals.push(normal.elements[2]);
      };

    };

    this.vertices = new Float32Array(this.vertices);
    this.normals = new Float32Array(this.normals);
    this.indices = new Uint16Array(this.indices);

    this.translate = [0.0, 0.0, 0.0];
    this.rotate = [0, 0.0, 0.0];
    this.scale = [1.0, 1.0, 1.0];

  };

  setScale(x, y, z) {
      this.scale[0] = x;
      this.scale[1] = y;
      this.scale[2] = z;
  };

  setRotate(x, y, z) {
      this.rotate[0] = x;
      this.rotate[1] = y;
      this.rotate[2] = z;
  };

  setTranslate(x, y, z) {
      this.translate[0] = x;
      this.translate[1] = y;
      this.translate[2] = z;
  };
};