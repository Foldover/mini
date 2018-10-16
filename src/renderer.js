import { m4 } from "./matrix.js";
import { compileShader, createProgram } from "./utils.js";
import {GameScheduler} from "./gameScheduler.js";
import {Event, Interval} from "./donkey.js";

const vertexShader = `
attribute vec4 a_position;
attribute vec2 a_texcoord;
 
uniform mat4 u_matrix;
 
varying vec2 v_texcoord;
 
void main() {
   gl_Position = u_matrix * a_position;
   v_texcoord = a_texcoord;
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main() {
   gl_FragColor = texture2D(u_texture, v_texcoord);
}
`;

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

  this.gl.clearColor(0, 0, 0, 1);
  this.shaderPrograms = {};
  this.shaderPrograms.SPRITE = new SpriteShader(this.gl, loadShader(this.gl, vertexShader, fragmentShader));
  this.textureRenderable = createTextureRenderable(this.gl, this.shaderPrograms.SPRITE.program);
  this.ortho = m4.orthographic(0, this.gl.canvas.width, this.gl.canvas.height, 0, -1, 1);

  this.renderLoop = function(ms) {
    const event = Event('renderloop');
    Interval(ms).listen((delta) => {
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      event.emit(delta);
    });
    return event;
  }
}

Renderer.prototype.drawImage = function (sprite, x, y) {
  this.gl.useProgram(this.shaderPrograms.SPRITE.program);
  this.gl.bindTexture(this.gl.TEXTURE_2D, sprite.textureInfo.source);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureRenderable.positionsBuffer);
  this.gl.enableVertexAttribArray(this.shaderPrograms.SPRITE.positionLocation);
  this.gl.vertexAttribPointer(this.shaderPrograms.SPRITE.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureRenderable.textureCoordinatesBuffer);
  this.gl.enableVertexAttribArray(this.shaderPrograms.SPRITE.textureCoordinatesLocation);
  this.gl.vertexAttribPointer(this.shaderPrograms.SPRITE.textureCoordinatesLocation, 2, this.gl.FLOAT, false, 0, 0);

  const translated = m4.translate(this.ortho, x, y, 0);
  const scaled = m4.scale(translated, sprite.textureInfo.width, sprite.textureInfo.height, 1);
  this.gl.uniformMatrix4fv(this.shaderPrograms.SPRITE.matrixLocation, false, scaled);
  this.gl.uniform1i(this.shaderPrograms.SPRITE.textureLocation, 0);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};

Renderer.prototype.background = function(r, g, b, a) {
  this.gl.clearColor(r, g, b, a);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT);
}

export { Renderer };