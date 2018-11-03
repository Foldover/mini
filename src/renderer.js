import {m4} from "./matrix.js";
import {compileShader, createProgram} from "./utils.js";
import {scheduler, setDefaultScheduler} from "./donkey.js";
import {spriteSheet, sprite} from "./images.js";

let vertexShader;

let fragmentShader;

const shaderHeaders = new Headers();
shaderHeaders.append("Content-Type", "text/plain");

const shaderFetchOptions = {
  method: "GET",
  mode: 'same-origin',
  headers: shaderHeaders
};

const textureRenderable = {
  positions: texturePositions(),
  positionsBuffer: null,
  textureCoordinates: textureCoordinates(),
  textureCoordinatesBuffer: null,
};

function texturePositions() {
  return [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
}

function textureCoordinates() {
  return [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
}

function createTextureRenderable(gl, program) {
  const result = Object.assign({}, textureRenderable);
  result.positionsBuffer = gl.createBuffer();
  result.textureCoordinatesBuffer = gl.createBuffer();
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, result.positionsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result.positions), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, result.textureCoordinatesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result.textureCoordinates), gl.STATIC_DRAW);
  return result;
}

function loadShader(gl, vertexSource, fragmentSource) {
  const vertexCompiled = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
  const fragmentCompiled = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
  const program = createProgram(gl, vertexCompiled, fragmentCompiled);
  return program;
}

function SpriteShader(gl, program) {
  this.program = program;
  this.positionLocation = gl.getAttribLocation(program, 'a_position');
  this.textureCoordinatesLocation = gl.getAttribLocation(program, 'a_texcoord');
  this.matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  this.textureLocation = gl.getUniformLocation(program, 'u_texture');
}

function Renderer() {
  this.canvas = document.createElement('canvas');
  this.canvas.width = 800;
  this.canvas.height = 600;
  document.body.appendChild(this.canvas);
  const ctx = this.canvas.getContext('webgl');
  this.gl = ctx;
  this.gl.enable(this.gl.BLEND);
  this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  this.images = new Map();

  this.gl.clearColor(0, 0, 0, 1);
  this.shaderPrograms = {};

  const vertexShaderPromise = fetch('shaders/image.vs', shaderFetchOptions)
    .then(response => {
      response.text()
        .then(text => vertexShader = text);
    })
    .catch(error => console.warn(error));

  const fragmentShaderPromise = fetch('shaders/image.fs', shaderFetchOptions)
    .then(response => {
      response.text()
        .then(text => fragmentShader = text);
    })
    .catch(error => console.warn(error));
  Promise.all([vertexShaderPromise, fragmentShaderPromise])
    .then(response => {
      this.shaderPrograms.SPRITE = new SpriteShader(this.gl, loadShader(this.gl, vertexShader, fragmentShader));
    });
  this.ortho = m4.orthographic(0, this.gl.canvas.width, this.gl.canvas.height, 0, -1, 1);
  this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

  this.renderLoop = scheduler(function(signals) {
    const what = () => {
      signals.forEach(s => {
        if (s.isReady()) {
          s.emit();
        }
      });
      setTimeout(what, 1000 / 60);
    };

    what();
  });
  setDefaultScheduler(this.renderLoop);
  this.renderLoop.start();
}

Renderer.prototype.loadImage = function(uniqueName, url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const texture = this.gl.createTexture();
    // REMOVE THIS
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]));

    // let's assume all images are not a power of 2
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    image.addEventListener('load', () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      const newSprite = sprite(image, texture, this.gl);
      this.gl.useProgram(this.shaderPrograms.SPRITE.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, newSprite.positionsBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(newSprite.getTexturePositions()), this.gl.STATIC_DRAW);
      this.images.set(uniqueName, newSprite);
      resolve(newSprite);
    });
    image.src = url;
  });
};

Renderer.prototype.loadSpriteSheet = function(uniqueName, url, width, height) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const texture = this.gl.createTexture();
    // REMOVE THIS
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]));

    // let's assume all images are not a power of 2
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    image.addEventListener('load', () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      const newSprite = spriteSheet(image, texture, this.gl, width, height);
      this.gl.useProgram(this.shaderPrograms.SPRITE.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, newSprite.positionsBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(newSprite.getTexturePositions()), this.gl.STATIC_DRAW);
      this.images.set(uniqueName, newSprite);
      resolve(newSprite);
    });
    image.src = url;
  });
};

Renderer.prototype.drawImage = function (aSprite, x, y, dstWidth, dstHeight) {
  dstWidth = dstWidth || aSprite.textureInfo.width;
  dstHeight = dstHeight || aSprite.textureInfo.height;
  this.gl.useProgram(this.shaderPrograms.SPRITE.program);
  this.gl.bindTexture(this.gl.TEXTURE_2D, aSprite.textureInfo.source);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, aSprite.positionsBuffer);
  this.gl.enableVertexAttribArray(this.shaderPrograms.SPRITE.positionLocation);
  this.gl.vertexAttribPointer(this.shaderPrograms.SPRITE.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, aSprite.textureCoordinatesBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(aSprite.getTextureCoordinates()), this.gl.STATIC_DRAW);
  this.gl.enableVertexAttribArray(this.shaderPrograms.SPRITE.textureCoordinatesLocation);
  this.gl.vertexAttribPointer(this.shaderPrograms.SPRITE.textureCoordinatesLocation, 2, this.gl.FLOAT, false, 0, 0);

  const translated = m4.translate(this.ortho, x, y, 0);
  const scaled = m4.scale(translated, dstWidth, dstHeight, 1);
  this.gl.uniformMatrix4fv(this.shaderPrograms.SPRITE.matrixLocation, false, scaled);
  this.gl.uniform1i(this.shaderPrograms.SPRITE.textureLocation, 0);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};

Renderer.prototype.background = function (r, g, b, a) {
  this.gl.clearColor(r, g, b, a);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
};

export {Renderer};