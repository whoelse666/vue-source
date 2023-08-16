let activeEffect = null;
const targetMap = new WeakMap();

/*
 * {
 *      target: {  // Map()
 *          key:  // Set()
 *              [ReactiveEffect, ReactiveEffect, ReactiveEffect]
 *      }
 * }
 */
function isObject(data) {
  return data && typeof data === 'object';
}

function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    if (!dep) depsMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) dep.add(activeEffect);
  /* 
WeakMap 与 Map 在 API 上的区别主要是两个，
一是没有遍历操作（即没有keys()、values()和entries()方法），也没有size属性
*/
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    (depsMap.get(key) || []).forEach(activeEffect => activeEffect.run());
    // (depsMap.get(key) || []).forEach(activeEffectItem => activeEffectItem && activeEffectItem());
  }
}

export function mount(ins, el) {
  effect(() => {
    ins.$data && update(ins, el);
  });
  ins.$data = ins.setup(); //初始化 data
  update(ins, el);
}

function update(ins, el) {
  el.innerHTML = ins.render();
}

export function reactive(data) {
  if (!isObject(data)) return 'data 不是对象';
  // return data;
  return new Proxy(data, {
    get(target, key, receiver) {
      const ret = Reflect.get(target, key, receiver);
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
      track(target, key);
      return Reflect.ownKeys(target);
    }
  });
}
export function ref(val) {
  class RefImpl {
    constructor(val) {
      this.__value = val;
    }

    get value() {
      track(this, 'value');
      return this.__value;
    }
    set value(newVal) {
      this.__value = newVal;
      trigger(this, 'value');
    }
  }
  return new RefImpl(val);
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
