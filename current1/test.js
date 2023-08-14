export function Vue(options) {
  this.__init(options);
}

Vue.prototype.__init = function (options) {
  this.$el = options.el;
  this.$data = options.data;
  this.$methods = options.methods;
  this.$options = options;
  proxy(this, this.$data);
  new Observer(this.$data);
  new Compiler(this);
};

function proxy(target, data) {
  const keyList = Object.keys(data);
  keyList.forEach(key => {
    Object.defineProperty(target, key, {
      get() {
        return data[key];
      },
      set(newValue) {
        if (data[key] != newValue) {
          data[key] = newValue;
        }
      },
      enumerable: true,
      configurable: true
      // writable: false,
      // value: 'static'
    });
  });
}

class Observer {
  constructor(data) {
    this.walk(data);
  }

  walk(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key]);
      });
    }
  }
  defineReactive(data, key, value) {
    let that = this;
    if (value && typeof value === 'object') {
      that.walk(value);
    }
    Object.defineProperty(data, key, {
      get() {
        return value;
      },
      set(newValue) {
        if (newValue != value) {
          value = newValue;
          that.walk(value);
        }
      },
      enumerable: true,
      configurable: true
    });
  }
}

class Dep {
  constructor() {
    this.watchers = new Set();
  }
  add(watcher) {
    if (watcher && watcher.update) this.watchers.push(watcher);
  }
  notify() {
    this.watchers.forEach(watcher => {
      watcher.update();
    });
  }
}

class Compiler {
  constructor(vm) {
    this.el = vm.$el;
    this.vm = vm;
    this.methods = vm.$methods;
    this.compile(vm.$el);
  }
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (node.nodeType === 3) {
        // console.log('node.textContent', node.textContent);
        // 文本节点
        this.compileText(node);
      } else if (node.nodeType === 1) {
        this.compileElement(node);
      }
    });
  }
  compileText(node) {
    // console.log('node.textContent', node);
  }
  compileElement(node) {}
}
