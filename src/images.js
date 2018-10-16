function Images(gl) {
  this.gl = gl;
  this.images = new Map();
}

Images.prototype.loadImage = function(uniqueName, url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const texture = this.gl.createTexture();
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

      this.images.set(uniqueName, new Sprite(image, texture));
      resolve(true);
    });
    image.src = url;
  });
};

function Sprite(image, texture) {
  this.image = image;
  this.textureInfo = {
    width: image.width,
    height: image.height,
    source: texture,
  }
}

export { Images }