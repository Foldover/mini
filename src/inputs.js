import {signal} from "./donkey.js";

export const KEY = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
};

const mousePosition = function () {
  const result = {};
  result.__proto__ = signal(true, {x: 0, y: 0});

  window.addEventListener('mousemove', (e) => result.next({x: e.clientX, y: e.clientY}));

  return result;
};

export const keyPress = function () {
  const result = {};
  result.__proto__ = signal();

  window.addEventListener("keypress", (e) => result.next(e));

  return result;
};

export const keysDown = function () {
  const result = {};
  const keysDown = {};
  result.__proto__ = signal(true, {});

  window.addEventListener("keydown", (e) => {
    if (!keysDown.hasOwnProperty(e.keyCode)) {
      keysDown[e.keyCode] = true;
    }
    result.next(keysDown);
  });

  window.addEventListener("keyup", (e) => {
    if (keysDown.hasOwnProperty(e.keyCode)) {
      delete keysDown[e.keyCode];
    }
    result.next(keysDown);
  });

  return result;
};

export {mousePosition}