const textureInfo = function (width, height, texture) {
  const result = {};
  result.width = width;
  result.height = height;
  result.source = texture;
  return result;
};

const sprite = function (image, texture, gl) {
  const result = {};
  result.image = image;
  result.textureInfo = textureInfo(image.width, image.height, texture);
  result.positionsBuffer = gl.createBuffer();
  result.textureCoordinatesBuffer = gl.createBuffer();
  result.textureCoordinates = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  result.texturePositions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];

  result.getTextureCoordinates = function () {
    return result.textureCoordinates;
  };
  result.getTexturePositions = function () {
    return result.texturePositions;
  };

  return result;
};

const spriteSheet = function (image, texture, gl, width, height) {
  const result = {};
  result.image = image;
  result.textureInfo = textureInfo(width, height, texture);
  result.positionsBuffer = gl.createBuffer();
  result.textureCoordinatesBuffer = gl.createBuffer();
  result.count = image.width / width;
  result.textureCoordinates = function () {
    // TODO: support sprite sheet with multiple rows
    const texcoords = new Array(result.count * 6 * 2);
    for (let i = 0, c = 0; c < texcoords.length; c += 12, i++) {
      texcoords[c] = i * width / (result.image.width);
      texcoords[c + 1] = 0;
      texcoords[c + 2] = i * width / (result.image.width -  1);
      texcoords[c + 3] = 1;
      texcoords[c + 4] = (i * width + width) / (result.image.width - 1);
      texcoords[c + 5] = 0;
      texcoords[c + 6] = (i * width + width) / (result.image.width - 1);
      texcoords[c + 7] = 0;
      texcoords[c + 8] = i * width / (result.image.width - 1);
      texcoords[c + 9] = 1;
      texcoords[c + 10] = (i * width + width) / (result.image.width - 1);
      texcoords[c + 11] = 1;
    }
    return texcoords;
  }();
  result.texturePositions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  result.index = 0;
  result.next = function () {
    result.index++;
    if (result.index >= result.count) result.index = 0;
  };
  result.getTextureCoordinates = function () {
    return result.textureCoordinates.slice(result.index * 12, result.index * 12 + 12);
  };
  result.getTexturePositions = function () {
    return result.texturePositions;
  };

  return result;
};

export { sprite, spriteSheet }