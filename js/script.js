// asg2.js
// CSE160 - Program 2: Transformation of Fancier Model
// Daniela A. Olano Guia
// dolanogu
// from Lucas's asg2.js starter code (Thanks Lucas!)

// Shaders (GLSL)
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;

    uniform vec3 u_Color;
    uniform vec3 u_lightColor;
    uniform vec3 u_lightDirection;

    varying vec4 v_Color;

    void main() {
        vec3 lightDir = normalize(u_lightDirection);

        // Transfoming the normal vector to handle object transormations
        vec3 normal = normalize(u_NormalMatrix * vec4(a_Normal, 1.0)).xyz;

        // Calculates the diffuse light (flat shading)
        float nDotL = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = u_lightColor * u_Color * nDotL;

        v_Color = vec4(diffuse, 1.0);

        gl_Position = u_ModelMatrix * vec4(a_Position, 1.0);
    }
`;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;

// Cylinders in the world
let cylinders = [];
let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();
let lightDirection = new Vector3([1.0, 1.0, -1.0]); // light source

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_Color = null;
let u_lightColor = null;
let u_lightDirection = null;

// Initialize buffer
function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
};

function drawCylinder(cylinder) {
  modelMatrix.setIdentity();

  modelMatrix.translate(cylinder.translate[0], cylinder.translate[1], cylinder.translate[2]);

  // Apply rotations
  modelMatrix.rotate(cylinder.rotate[0], 1, 0, 0);
  modelMatrix.rotate(cylinder.rotate[1], 0, 1, 0);
  modelMatrix.rotate(cylinder.rotate[2], 0, 0, 1);

  // Apply scaling
  modelMatrix.scale(cylinder.scale[0], cylinder.scale[1], cylinder.scale[2]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Compute normal matrix N_mat = (M^-1).T
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  // Set u_Color variable from fragment shader
  gl.uniform3f(u_Color, cylinder.color[0], cylinder.color[1], cylinder.color[2]);

  // Send vertices and indices from cube to the shaders
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cylinder.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cylinder.normals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cylinder.indices, gl.STATIC_DRAW);

  if (wireframe === false) {
    gl.drawElements(gl.TRIANGLES, cylinder.indices.length, gl.UNSIGNED_SHORT, 0);
    return;
  };

  let length = cylinder.indices.length;
  for (let i = 0; i < length; i += 3) {
    gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * 2);
  };
};

function draw() {
    // Draw frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(let cylinder of cylinders) {
        drawCylinder(cylinder);
    };

    requestAnimationFrame(draw);
};

// Add new cylinder
function addCylinder(n, color) {
    // Create a new cylinder
    let cylinder = new Cylinder(n, color);
    console.log(color);
    cylinders.push(cylinder);

    // Add an option in the selector
    let selector = document.getElementById("cylSelect");
    let cylinderOption = document.createElement("option");
    cylinderOption.text = "Cylinder " + cylinders.length;
    cylinderOption.value = cylinders.length - 1;
    selector.add(cylinderOption);

    // Activate the cube we just created
    selector.value = cylinderOption.value;

    return cylinder;
};

// create cylinder using user input
function inputCylinder() {
  // get number of sides (n)
  let n = parseInt(document.getElementById('nsides').value);
  
  // get color of cylinder (rgb format, 0-1)
  let color = document.getElementById('color').value;
  console.log(color);
  let rgb = [
    parseInt(color[1]+color[2], 16)/255, 
    parseInt(color[3]+color[4], 16)/255, 
    parseInt(color[5]+color[6], 16)/255
  ];

  // add user's cylinder to canvas
  addCylinder(n, rgb);
};

// wireframe toggle is set to false (default off)
let wireframe = false;
// set wireframe mode to true (on) or false (off) based on user input
function wireframeMode() {
  wireframe = document.getElementById("wireframe").checked;
  console.log(wireframe);
};

// delete all cylinders from canvas
function deleteAll() {
  cylinders = [];

  let select = document.getElementById("cylSelect");
  let length = select.options.length;
  for (i = length-1; i >= 0; i--) {
    select.options[i] = null;
  };
};

function removeSelected() {
  let selector = document.getElementById("cylSelect");
  console.log(selector);
  if (cylSelect != null) {
    console.log(selector);
    console.log(cylinders);
    console.log("selectedIndex:",selector.selectedIndex);
    selector.options[selector.selectedIndex] = null;
    cylinders.splice(selector.selectedIndex, 1);
  };
};

// Translate the cylinder based on user input
function userTranslate(value, axis) {
  // Get the selected cube
  let selector = document.getElementById('cylSelect');
  let selectedCyl = cylinders[selector.value];

  // translate along x-axis
  if (axis === 'x') {
    selectedCyl.translate[0] = value/100;
    return;
  };

  // translate along y-axis
  if (axis === 'y') {
    selectedCyl.translate[1] = value/100;
    return;
  };

  // translate along z-axis
  if (axis === 'z') {
    selectedCyl.translate[2] = value/100;
    return;
  };
};

// Rotate cylinder based on user input
function userRotate(value, axis) {
  // Get the selected cube
  let selector = document.getElementById('cylSelect');
  let selectedCyl = cylinders[selector.value];

  // rotate along x-axis
  if (axis === 'x') {
    selectedCyl.rotate[0] = value;
    return;
  };

  // rotate along y-axis
  if (axis === 'y') {
    selectedCyl.rotate[1] = value;
    return;
  };

  // rotate along z-axis
  if (axis === 'z') {
    selectedCyl.rotate[2] = value;
  return;
  };
};

// Scale cylinder based on user input
function userScale(value, axis) {
  // Get the selected cube
  let selector = document.getElementById('cylSelect');
  let selectedCyl = cylinders[selector.value];

  // scale along x-axis
  if (axis === 'x') {
    selectedCyl.scale[0] = value/200;
    return;
  };
  // translate along y-axis
  if (axis === 'y') {
    selectedCyl.scale[1] = value/200;
    return;
  };
  // translate along z-axis
  if (axis === 'z') {
    selectedCyl.scale[2] = value/200;
    return;
  };
  // translate all
  for(let i = 0; i < 3; i++) {
    selectedCyl.scale[i] = value/200;
  };
};

function main() {
    // Retrieve <canvas> element from html document
    canvas = document.getElementById("canvas");

    // Get the rendering context for webgl
    gl = canvas.getContext("webgl");
    // check if webgl context loaded, if not close program
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    };

    // Clear screen
    gl.enable(gl.DEPTH_TEST);
    // Specify the color for clearing <canvas>
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Compiling both shaders and sending them to the GPU
    if(!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed to initialize shaders.");
        return -1;
    };

    // Retrieve uniforms from shaders
    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_lightColor = gl.getUniformLocation(gl.program, "u_lightColor");
    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");

    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    };

    // Set light data
    gl.uniform3f(u_lightColor, 1.0, 1.0, 1.0);
    gl.uniform3fv(u_lightDirection, lightDirection.elements);

    // draw initial cylinders
    let cyl1 = addCylinder(36, [0.16, 0.1, 0.3]);
    cyl1.setTranslate(-0.12, 0.34, 0);
    cyl1.setScale(0.2, 0.25, 0.55);
    cyl1.setRotate(-70, 40, 0);

    let cyl2 = addCylinder(36, [0.7, 0.5, 0.3]);
    cyl2.setTranslate(0.2, 0.4, 0);
    cyl2.setScale(0.09, 0.07, 0.7);
    cyl2.setRotate(100, 50, 0);

    draw();
}
