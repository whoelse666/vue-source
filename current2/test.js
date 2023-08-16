/*
 * ****整体思路实现流程****
 *1. 实现 mount 挂在到#app ,在页面显示
 *2.将 setup->return 对象 挂载转到$data
 *3.将data 对象的变量读取值,(先不考虑更新响应,)
 *  3.1 reactive 实现: 用到 Proxy 代理  get,set
 *  3.2 ref: 返回一个实例 RefImpl 包括 get,set
 *  3.3 computed 先简单看成一个包装过的 可以有多个 ref 或者reactive 的计算结果的 ,增加了缓存;
 *
 * 然后考虑更新响应式
 * get 需要收集依赖, set 执行 收集的依赖
 * 利用 Map WeakMap 特性存储;
 * 4.1 每一个 ref.value 或reactive的每个属性(至少被调用一次) 对应一个 targetMap[target] ->depsMap
 * 4.2 每一个 depsMap 的值 (ref->value  reactive 每个属性)对应一个dep
 * 4.3 dep 数组存储所有用到 dep每一项的数组
 *
 */

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
  console.log( key, dep);

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
