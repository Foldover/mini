const Subscription = function (observed) {
  this.observed = observed;
};

const Event = function(of) {
  return {
    of: of || null,
    listeners: new Map(),
    listen: function(fn) { this.listeners.set(new Subscription(this), fn); },
    emit: function (value) { this.listeners.forEach((k, v) => k(value)) }
  }
};

const Behavior = function (value, of) {
  // Move value here for private access
  return {
    value: value || null,
    of: of || null,
    listeners: new Map(),
    listen: function(fn) { this.listeners.set(new Subscription(this), fn); fn(this.value) },
    emit: function (value) { this.value = value; this.listeners.forEach((k, v) => k(this.value)) }
  }
}

const snapshot = (behavior) => behavior.value;

const MouseEvent = (function () {
  return Event('mouseevent');
})();

const MouseDown = function (mouseEvent) {
  let b = Behavior(null, 'mouseX');
  mouseEvent.listen((value) => {
    b.emit(value);
  });

  return b;
}(MouseEvent);

function main() {
  let x = MouseDown.listen((value) => console.log(value));
}

const Time = () => performance.now();
const Interval = (ms) => {
  let previous = Time();
  const event = Event('interval');
  let timeout = undefined;

  const interval  = () => {
    const now = Time();
    setTimeout(interval, ms);
    event.emit(now - previous);
    previous = now;
  };

  interval();
  return event;
};

export {Subscription, Event, Behavior, Interval, MouseDown, MouseEvent}