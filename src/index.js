import {Renderer} from "./renderer.js";
import {Images} from "./images.js";
import {GameScheduler, timer} from "./gameScheduler.js";
import {Interval} from "./donkey.js";

export {Renderer, Images, GameScheduler}

const renderer = new Renderer();
const images = new Images(renderer.gl);

let time = 0;

Promise.all([
  images.loadImage('snarl', 'assets/monks.png'),
  images.loadImage('swords', 'assets/greatswords.png')
]).then(rs => {
  renderer.renderLoop(1000/60).listen((delta) => {
    time += delta / 1000;
    renderer.background(1, 0, 0, 1);
    renderer.drawImage(images.images.get('snarl'), 200 + (Math.sin(time) * 100), 200 + (Math.cos(time) * 150));
  });
}).then(rs => {
  Interval(1000/60).listen(delta => {
    renderer.drawImage(images.images.get('swords'), 50 + (Math.sin(time) * 100), 50);
  })
})