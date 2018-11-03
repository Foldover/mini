const matrixStack = function () {
  const stack = [];

  const result = {};
  result.restore = function () {
    stack.pop();
    if (stack.length < 1) {
      stack[0] = m4.identity();
    }
  };
  result.save = function () {
    stack.push(result.getCurrentMatrix());
  };
  result.getCurrentMatrix = function () {
    return stack[stack.length - 1].slice();
  };
  result.setCurrentMatrix = function (matrix) {
    return stack[stack.length - 1] = matrix;
  };
  result.translate = function (x, y, z) {
    z = z !== undefined ? z : 0;
    const matrix = result.getCurrentMatrix();
    result.setCurrentMatrix(m4.translate(matrix, x, y, z));
  };
  result.rotateZ = function (radians) {
    const matrix = result.getCurrentMatrix();
    result.setCurrentMatrix(m4.zRotate(matrix, radians));
  };
  result.scale = function (x, y, z) {
    z = z !== undefined ? z : 1;
    const matrix = result.getCurrentMatrix();
    result.setCurrentMatrix(m4.scale(matrix, x, y, z));
  }
};

const m3 = {
  identity: function() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  },

  projection: function(width, height) {
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  },

  translate: function(m, tx, ty) {
    return m3.multiply(m, m3.translation(tx, ty));
  },

  rotate: function(m, radians) {
    return m3.multiply(m, m3.rotation(radians));
  },

  scale: function(m, sx, sy) {
    return m3.multiply(m, m3.scaling(sx, sy));
  },


  translation: function(x, y) {
    return [
      1, 0, 0,
      0, 1, 0,
      x, y, 1
    ];
  },
  
  rotation: function(radians) {
    const c = Math.cos(radians),
      s = Math.sin(radians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1
    ];
  },
  
  scaling: function (x, y) {
    return [
      x, 0, 0,
      0, y, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    const a00 = a[0 * 3 + 0];
    const a01 = a[0 * 3 + 1];
    const a02 = a[0 * 3 + 2];
    const a10 = a[1 * 3 + 0];
    const a11 = a[1 * 3 + 1];
    const a12 = a[1 * 3 + 2];
    const a20 = a[2 * 3 + 0];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];
    const b00 = b[0 * 3 + 0];
    const b01 = b[0 * 3 + 1];
    const b02 = b[0 * 3 + 2];
    const b10 = b[1 * 3 + 0];
    const b11 = b[1 * 3 + 1];
    const b12 = b[1 * 3 + 2];
    const b20 = b[2 * 3 + 0];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

const m4 = {
  identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  translate: function(m, x, y, z) {
    return m4.multiply(m, m4.translation(x, y, z));
  },

  xRotate: function(m, radians) {
    return m4.multiply(m, m4.xRotation(radians));
  },

  yRotate: function(m, radians) {
    return m4.multiply(m, m4.yRotation(radians));
  },

  zRotate: function(m, radians) {
    return m4.multiply(m, m4.zRotation(radians));
  },

  scale: function(m, x, y, z) {
    return m4.multiply(m, m4.scaling(x, y, z));
  },

  projection: function(width, height, depth) {
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  orthographic: function(left, right, bottom, top, near, far) {
    return [
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,

      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ];
  },

  translation: function(x, y, z) {
    return [
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      x, y, z, 1,
    ];
  },

  xRotation: function(radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  scaling: function(x, y, z) {
    return [
      x, 0,  0,  0,
      0, y,  0,  0,
      0,  0, z,  0,
      0,  0,  0,  1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },
};

export { m3, m4 }