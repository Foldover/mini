import {Renderer} from "./renderer.js";
import {interval, take, filter, when} from "./donkey.js";
import {mousePosition, keyPress, keysDown, KEY} from "./inputs.js";

const renderer = new Renderer();

const player = function(){
  const result = {
    position: {
      x: 0,
      y: 0,
    },
    img: undefined
  };
  return result;
};

const player1 = player();
const player2 = player();

const startGame = () => {

  Promise.all([
    renderer.loadImage('snarl', 'assets/monks.png').then(img => player1.img = img),
    renderer.loadSpriteSheet('coin', 'assets/coin_animation.png', 44, 40).then(img => player2.img = img)
  ]).then(success => {

    interval(1000/60).listen(delta => {
      renderer.background(1, 0, 0, 1);
      renderer.drawImage(player1.img, player1.position.x, player1.position.y);
      renderer.drawImage(player2.img, player2.position.x, player2.position.y);
    });

    interval(1000/60).listen(delta => {
      player1.position.x += (delta / 50);
      player1.position.y += Math.sin(player1.position.x);
    });

    const keys = keysDown();

    when(keys, (value) => value[KEY.UP])
      .listen(value => player2.position.y -= 5);

    when(keys, (value) => value[KEY.DOWN])
      .listen(value => player2.position.y += 5);

    when(keys, (value) => value[KEY.LEFT])
      .listen(value => player2.position.x -= 5);

    when(keys, (value) => value[KEY.RIGHT])
      .listen(value => player2.position.x += 5);

    interval(50).listen(delta => player2.img.next());
  });
};

setTimeout(startGame, 1000);
