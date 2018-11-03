const listener = function (signal) {
  const signalRef = signal;

  const result = {};

  result.stop = function () {
    signalRef.unlisten(result);
  };

  return result;
};

const signal = function (isContinuous, initialValue, scheduler) {
  const result = {};
  let innerValue = initialValue;
  let isReady = !!isContinuous;

  result.listeners = new Map();

  result.listen = function (fn) {
    const r = listener(result);
    result.listeners.set(r, fn);
    return r;
  };
  result.unlisten = function (listener) {
    result.listeners.delete(listener);
  };
  result.next = function (value) {
    innerValue = value;
    isReady = true;
  };
  result.emit = function () {
    result.listeners.forEach((v, k) => v(innerValue));
    isReady = !!isContinuous;
  };
  result.isReady = function () {
    return isReady;
  };

  if (scheduler != null) scheduler.addSignal(result);
  else defaultScheduler.addSignal(result);

  return result;
};

const filter = function (inSignal, fn) {
  const signalRef = inSignal;

  const result = signal();

  result.listener = signalRef.listen(function (value) {
    result.next(fn(value));
  });

  return result;
};

export const when = function (inSignal, predicate) {
  const signalRef = inSignal;

  const result = signal();

  result.listener = signalRef.listen(function (value) {
    if (predicate(value)) {
      result.next(value);
    }
  });

  return result;
};

const scheduler = function (fn) {
  const signals = [];

  const result = {};

  result.start = function () {
    fn(signals);
  };

  result.addSignal = function (signal) {
    signals.push(signal);
  };

  return result;
};

let defaultScheduler = scheduler(function (signals) {
  const what = function () {
    signals.forEach(s => {
      if (s.isReady()) {
        s.emit();
      }
    });
    setTimeout(what, 1000 / 60);
  };

  what();
});

const interval = function (ms) {
  const result = signal();
  let previousTime = performance.now();

  setInterval((() => {
    const now = performance.now();
    result.next(now-previousTime);
    previousTime = now;
  }), ms);

  return result;
};

const take = function (inSignal, n) {
  const result = {};
  let count = 0;
  result.__proto__ = filter(inSignal, function (value) {
    count++;
    if (count === n) {
      inSignal.unlisten(result.listener);
    }
    return value;
  });
  return result;
};

export function setDefaultScheduler(_scheduler) {
  defaultScheduler = _scheduler;
}

export { listener, signal, filter, scheduler, defaultScheduler }
export { interval, take }
