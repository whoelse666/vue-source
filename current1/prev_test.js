let deps = null;

function handler() {
  return {
    get(target, key, descriptor) {
      const val = Reflect.get(target, key, descriptor);
      console.log('get===', val);
      return val

    },
    set(target, key, value) {
      const val = Reflect.set(target, key, value);
    }
  }

}
const initData = { count: 1 }

const data = new Proxy(initData, handler())

let a = data.count

data.count = 2
// data.count=3