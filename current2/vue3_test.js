let activeEffect = null,
  targetMap = new WeakMap();

function isObject(data) {
  return data && typeof data === "object";
}

function effect(data) {
  return data && typeof data === "object";
}

export function mount(app, el) {
  effect(() => {
    ins.$data && update(app, el);
  });

  app.$data = app.setup();
  update(app, el);

  function update() {
    el.innerHTML = app.render();
  }
}

export function ref(val) {
  class RefImpl {
    constructor(initVal) {
      this.val = initVal;
    }

    get value() {
      return this.val;
    }

    set value(newVal) {
      this.val = newVal;
    }
  }
  return new RefImpl(val);
}

export function reactive(data) {
  if (!isObject(data)) return;
  return new Proxy(data, {
    get(target, key, receiver) {
      const ret = Reflect.get(target, key, receiver);
      track(target, key);
      return isObject(ret) ? reactive(ret) : ret;
    },
    set(target, key, val, receiver) {
      const ret = Reflect.set(target, key, val, receiver);
      trigger(target, key);
      return ret;
    },
    has(target, key) {}
  });
}

export function computed() {
  return 0;
}

function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    targetMap.set(key, dep);
  }
  trackEffect(dep);
}

function trackEffect(dep) {
  //TODO:这里将dep 赋值this is __effect-> new ReactiveEffect
  if (!dep.has(activeEffect)) dep.add(activeEffect);
}

function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (depsMap) {
      (depsMap.get(key) || []).forEach(effect => effect.run());
    }
}

/**************************************************************************************************************/
// let activeEffect = null;
// let targetMap = new WeakMap();

// function isObject(data) {
//   return data && typeof data === "object";
// }

// export function mount(ins /*ins is App  */, el) {
//   effect(() => {
//     ins.$data && update(ins, el);
//   });
//   ins.$data = ins.setup(); //  ins.$data = ins.setup()-> return { args}
//   update(ins, el);

//   function update(ins, el) {
//     el.innerHTML = ins.render();
//   }
// }

// export function ref(init) {
//   class RefImpl {
//     constructor(init) {
//       this.__value = init;
//     }
//     get value() {
//       track(this, "value");
//       return this.__value;
//     }
//     set value(newValue) {
//       if (this.__value === newValue) return;
//       this.__value = newValue;
//       trigger(this, "value");
//       // return true;
//     }
//   }
//   return new RefImpl(init);
// }

// export function reactive(data) {
//   if (!isObject(data)) return;
//   return new Proxy(data, {
//     get(target, key, receiver) {
//       const ret = Reflect.get(target, key, receiver);
//       track(target, key);
//       return isObject(ret) ? reactive(ret) : ret;
//     },
//     set(target, key, value, receiver) {
//       Reflect.set(target, key, value, receiver);
//       trigger(target, key);
//       return true;
//     },
//     has: function (target, key) {
//       const ret = Reflect.has(target, key);
//       track(target, key);
//       return ret;
//     }
//     /*  deleteProperty(target, key) {
//       const ret = Reflect.deleteProperty(target, key);
//       trigger(target, key);
//       return ret;
//     },
//     ownKeys(target) {
//       // track(target)
//       return Reflect.ownKeys(target);
//     } */
//   });
// }

// export function computed(fn) {
//   let __computed;
//   const e = effect(fn, { lazy: true });
//   __computed = {
//     get value() {
//       return e.run();
//     }
//   };
//   return __computed;
// }

// function track(target, key) {
//   let depsMap = targetMap.get(target);
//   if (!depsMap) {
//     depsMap = new Map();
//     targetMap.set(target, depsMap);
//   }
//   let dep = depsMap.get(key);
//   if (!dep) {
//     dep = new Set();
//     depsMap.set(key, dep);
//   }
//   trackEffect(dep);
// }

// function trackEffect(dep) {
//   //TODO:这里将dep 赋值this is __effect-> new ReactiveEffect
//   if (!dep.has(activeEffect)) dep.add(activeEffect);
// }

// function trigger(target, key) {
//   const depsMap = targetMap.get(target);
//   if (depsMap) {
//     (depsMap.get(key) || []).forEach(effect => effect.run());
//   }
// }

// function effect(fn, options = {}) {
//   let __effect = new ReactiveEffect(fn);
//   options.lazy || __effect.run();
//   return __effect;
// }
// class ReactiveEffect {
//   constructor(fn) {
//     this.fn = fn;
//   }
//   run() {
//     activeEffect = this; // this is __effect
//     return this.fn();
//   }
// }

// /*
//  *                        _oo0oo_
//  *                       o8888888o
//  *                       88" . "88
//  *                       (| -_- |)
//  *                       0\  =  /0
//  *                     ___/`---'\___
//  *                   .' \\|     |// '.
//  *                  / \\|||  :  |||// \
//  *                 / _||||| -:- |||||- \
//  *                |   | \\\  - /// |   |
//  *                | \_|  ''\---/''  |_/ |
//  *                \  .-\__  '-'  ___/-. /
//  *              ___'. .'  /--.--\  `. .'___
//  *           ."" '<  `.___\_<|>_/___.' >' "".
//  *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//  *          \  \ `_.   \_ __\ /__ _/   .-` /  /
//  *      =====`-.____`.___ \_____/___.-`___.-'=====
//  *                        `=---='
//  *
//  *
//  *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  *
//  *            佛祖保佑     永不宕机     永无BUG
//  *
//  *        佛曰:
//  *                写字楼里写字间，写字间里程序员；
//  *                程序人员写程序，又拿程序换酒钱。
//  *                酒醒只在网上坐，酒醉还来网下眠；
//  *                酒醉酒醒日复日，网上网下年复年。
//  *                但愿老死电脑间，不愿鞠躬老板前；
//  *                奔驰宝马贵者趣，公交自行程序员。
//  *                别人笑我忒疯癫，我笑自己命太贱；
//  *                不见满街漂亮妹，哪个归得程序员？
//  */
