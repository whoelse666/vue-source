function isObject(data) {
  return data && typeof data === "object";
}
// Dep.target
let activeEffect = null;
let targetMap = new WeakMap();
/**
 *
 * {
 *  { seconds: 0 }: {
 *      seconds : [ ins.innerHTML =  <h3>this is reactive data: ${this.$data.time.seconds}</h3> ]
 *  }
 * }
 *
 * key string
 * key Object
 * {
 *      target: {  // Map()
 *          key:  // Set()
 *              [ReactiveEffect, ReactiveEffect, ReactiveEffect]
 *      }
 * }
 *
 * Record<string, any>;
 * string | object.
 *
 */

// 进行依赖的收集
function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  // 我再判断 depsMap 中，有没有 key
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  console.table(depsMap);
  trackEffect(dep);
}

function trackEffect(dep) {
  // Dep.target && dep.add(Dep.target)
  if (!dep.has(activeEffect)) dep.add(activeEffect);
}

// 触发

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    (depsMap.get(key) || []).forEach(effect => effect.run());
  }
}

export function reactive(data) {
  if (!isObject(data)) return;
  return new Proxy(data, {
    get(target, key, receiver) {
      const ret = Reflect.get(target, key, receiver);
      // { seconds: 0 }, seconds
      track(target, key);
      return isObject(ret) ? reactive(ret) : ret;
    },
    set(target, key, value, receiver) {
      Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return true;
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key);
      trigger(target, key);
      return ret;
    },
    has(target, key) {
      const ret = Reflect.has(target, key);
      track(target, key);
      return ret;
    },
    ownKeys(target) {
      // track(target)
      return Reflect.ownKeys(target);
    }
  });
}
/**
 * effect 函数中，第一个参数是一个函数
 * 如果这个函数中，有使用 ref/reactive
 * 我会执行更新。
 */
function effect(fn, options = {}) {
  let __effect = new ReactiveEffect(fn);
  options.lazy || __effect.run();
  return __effect;
}
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
  }
  run() {
    activeEffect = this; // this is __effect
    return this.fn();
  }
}

export function mount(ins /*ins is App  */, el) {
  // 设计了一个副作用函数，副作用就是fn
  // update 函数
  // 就是把 render 的 HTML, 放到 #app 里。
  effect(() => {
    ins.$data && update(ins, el);
  });

  ins.$data = ins.setup();
  update(ins, el);

  // 我们只要干一个事
  // 数据改变的时候，让 effect -> update 执行。

  function update(ins, el) {
    el.innerHTML = ins.render();
  }
}

export function computed(fn) {
  let __computed;
  const e = effect(fn, { lazy: true });
  __computed = {
    get value() {
      return e.run();
    }
  };
  return __computed;
}

export function ref(init) {
  class RefImpl {
    constructor(init) {
      this.__value = init;
    }
    get value() {
      track(this, "value");
      return this.__value;
    }

    set value(newVal) {
      this.__value = newVal;
      trigger(this, "value");
    }
  }
  return new RefImpl(init);
}
// 响应式，是通过代理来实现的。
