let target = null;

export function Vue(options) {
  this.__init(options);
}

Vue.prototype.__init = function (options) {
  this.$options = options;
  this.$el = options.el;
  this.$data = options.data;
  this.$methods = options.methods;
  proxy(this, this.$data);
  new Observer(this.$data);
  new Compiler(this);
};

function proxy(target, data) {
  const keyList = Array.from(Object.keys(data));
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
      Array.from(Object.keys(data)).forEach(key => {
        this.defineReactive(data, key, data[key]);
      });
    }
  }

  defineReactive(data, key, value) {
    let that = this;
    let dep = new Dep();
    if (value && typeof value === 'object') {
      that.walk(value);
    }
    Object.defineProperty(data, key, {
      get() {
        if (target) {
          dep.add(target);
        }
        return value;
      },
      set(newValue) {
        if (value != newValue) {
          value = newValue;
          that.walk(newValue); //对新的值监听
          dep.notify();
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
    if (watcher && watcher.update) this.watchers.add(watcher);
  }
  notify() {
    this.watchers.forEach(watcher => watcher.update());
  }
}

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm; // vue的实例
    this.key = key;
    this.cb = cb;
    target = this;
    this.__old = vm[key];
    target = null;
  }

  update() {
    let newVal = this.vm[this.key];
    if (this.__old !== newVal) this.cb(newVal);
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
        // 文本节点
        this.compileText(node);
      } else if (node.nodeType === 1) {
        this.compileElement(node);
      }
      // TAG 递归节点树
      if (node.childNodes && node.childNodes.length) this.compile(node);
    });
  }
  compileText(node) {
    const reg = /\{\{(.*)\}\}/;
    let value = node.textContent;
    if (reg.test(value)) {
      const key = RegExp.$1.toString();
      node.textContent = value.replace(reg, this.vm[key]);
      new Watcher(this.vm, key, val => {
        node.textContent = val;
      });
    }
  }
  compileElement(node) {
    if (node.attributes && node.attributes.length > 0) {
      Array.from(node.attributes).forEach(attr => {
        let attrName = attr.name;
        const key = attr.value;
        /*     v-model='message'
        attr.name = 'v-model'
        attr.value = 'message' */
        // v-on:, v-model
        if (attrName.startsWith('v-')) {
          attrName = attrName.indexOf(':') > -1 ? attrName.substr(5) : attrName.substr(2);
          console.log('attrName', attrName);

          this.update(node, key, attrName, this.vm[key]);
        }
      });
    }
  }

  update(node, key, attrName, value) {
    if (attrName == 'model') {
      node.value = value;
      new Watcher(this.vm, key, val => (node.value = val));
      node.addEventListener('input', e => {
        this.vm[key] = value;
      });
    } else if (attrName == 'click') {
      node.addEventListener(attrName, this.methods[key].bind(this.vm));
    }
  }
}
