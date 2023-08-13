export function Vue(options = {}) {
  this.__init(options);
}

Vue.prototype.__init = function (options) {
  this.$options = options;
  this.$el = options.el;
  this.$data = options.data;
  this.$methods = options.methods;
  proxy(this, this.$data) //TODO:代理 this.a -> this.data.a
  observer(this.$data); //TODO:监听 data 下面的属性,
  new Compiler(this)
}


function proxy(target, data) {
  Array.from(Object.keys(data)).forEach(key => {
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        return data[key]
      },
      set: function (newVal) {
        if (newVal !== data[key]) {
          data[key] = newVal
        }
      },
    })
  })
}

function observer(data) {
  new Observer(data);
}

class Observer {
  constructor(data) {
    this.walk(data)
  }

  walk(data) {
    if (data && typeof data === 'object') {
      Array.from(Object.keys(data)).forEach((key) => this.defineReactive(data, key, data[key]))
    }
  }

  defineReactive(data, key, value) {
    let that = this;
    this.walk(value)
    // 每一个数据，都给你一个依赖的数组。
    let dep = new Dep();
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        if (Dep.target) {
          dep.add(Dep.target)
        }
        return value
      },
      set(newVal) {
        if (newVal !== value) {
          // data[key] = newVal
          value = newVal;
          that.walk(newVal);
          dep.notify()
        }
      },
    })
  }

}


class Dep {
  constructor() {
    this.watchers = new Set();
  }

  add(watcher) {
    if (watcher && watcher.update) this.watchers.add(watcher);
  }

  notify() {
    this.watchers.forEach(watch => watch.update())
  }
}


class Watcher {
  constructor(vm, key, cb) {

    this.vm = vm; // vue的实例
    this.key = key;
    this.cb = cb;
    //TODO this 是每一个 new Watcher 实例
    Dep.target = this;
    this.__old = vm[key];
    Dep.target = null;

  }

  update() {
    let newVal = this.vm[this.key];
    if (this.__old !== newVal) this.cb(newVal)
  }
}

class Compiler {
  constructor(vm) {
    this.el = vm.$el;
    this.vm = vm;
    this.methods = vm.$methods;
    this.compile(vm.$el)
  }

  compile(el) {
    let childNodes = el.childNodes;
    // 类数组
    Array.from(childNodes).forEach(node => {
      // 如果是文本节点
      if (node.nodeType === 3) {
        this.compileText(node)
      } else if (node.nodeType === 1) {
        this.compileElement(node)
      }

      if (node.childNodes && node.childNodes.length) this.compile(node);
    })
  }

  compileText(node) {
    // 我们只考虑 {{ message }}
    let reg = /\{\{(.+?)\}\}/;
    let value = node.textContent;
    if (reg.test(value)) {
      let key = RegExp.$1.trim();
      node.textContent = value.replace(reg, this.vm[key]);
      new Watcher(this.vm, key, val => {
        node.textContent = val;
      })
    }
  }

  compileElement(node) {
    if (node.attributes.length) {
      Array.from(node.attributes).forEach(attr => {
        let attrName = attr.name;
        if (attrName.startsWith('v-')) {
          // v-on:, v-model
          attrName = attrName.indexOf(':') > -1 ? attrName.substr(5) : attrName.substr(2);
          let key = attr.value;
          this.update(node, key, attrName, this.vm[key])
        }
      })
    }
  }

  update(node, key, attrName, value) {
    if (attrName === "model") {
      node.value = value;
      new Watcher(this.vm, key, val => node.value = val);
      node.addEventListener('input', () => {
        this.vm[key] = node.value
      })
    } else if (attrName === 'click') {
      node.addEventListener(attrName, this.methods[key].bind(this.vm))
    }
  }
}






