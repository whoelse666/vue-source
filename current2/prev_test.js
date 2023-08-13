let dep = null;
function handler() {
  let reactions = new Set();
  return {
    get: function (target, name, receiver) {
      if (dep) {
        reactions.add(dep);
      }
      return Reflect.get(target, name, receiver);
    },
    set: function (target, name, val, receiver) {
      let res = Reflect.set(target, name, val, receiver);
      reactions.forEach(item => item());
      return res;
    }
  };
}

function walk(data, handler) {
  if (typeof data !== "object") return data;
  for (const key in data) {
    data[key] = walk(data[key], handler());
  }
  return new Proxy(data, handler());
}

function track(data) {
  return walk(data, handler);
}

function effect(fn) {
  dep = fn;
  fn();
  dep = null;
}
let initData = { count: 0 };

let data = track(initData);

effect(() => {
  console.log(data.count);
});

data.count++
data.count++
data.count++
