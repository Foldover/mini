import {MouseEvent} from "./donkey";

const mouseDown = (event$) => {
  MouseEvent.emit({
    x: event$.clientX,
    y: event$.clientY,
    button: event$.button,
  })
};

window.addEventListener('mousedown', mouseDown);