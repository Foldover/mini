import {Event, Behavior, Subscription, Interval} from "./donkey.js";

const GameScheduler = new (function () {
  this.timers = new Map();
  this.renderer = null;
  this.images = null;

  this.interval = Interval;

  // this.start = () => {
  //   this.renderer = new Renderer();
  //   this.images = new Images(this.renderer.gl);
  //   this.loop();
  // }
  //
  // this.loop = () => {
  //   this.renderer.gl.viewport(0, 0, this.renderer.gl.canvas.width, this.renderer.gl.canvas.height);
  //   this.timers.forEach((key, value)=> {
  //     key();
  //   });
  //   requestAnimationFrame(this.loop);
  // };
})();

const timer = function(ms) {
  const scheduler = GameScheduler;
  return {
    subscribe: (fn) => {
      const subscription = new Subscription();
      scheduler.timers.set(subscription, fn);
      return subscription;
    }
  }
};


export {GameScheduler, timer}