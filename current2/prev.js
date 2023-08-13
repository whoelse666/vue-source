// 

let deps = null;
// let reactions = [];

const handler = () => {
    let reactions = [];
    return {
        get(target, key, descriptor) {
            if(deps) {
                // 恰好，fn 执行，并且 get 函数触发。
                // 也就是说，fn 中，引用了 track 的数据，也就是说，我要把这个收集起来。
                reactions.push(deps);
            }
            return Reflect.get(target, key, descriptor)
        },
        set(target, key, value, descriptor) {
            const res = Reflect.set(target, key, value, descriptor);
            reactions.forEach((item) => item())
            return res;
        }
    }
};

function walk(data, handler) {
    if(typeof data !== "object") return data;
    for(let key in data) {
        data[key] = walk(data[key], handler)
    };

    return new Proxy(data, handler())
}

function track(data) {
    return walk(data, handler)
}

function effect(fn) {
    // 我要知道，fn 中引用了这个 count 没
    // 就要知道，在 fn 执行的时候，get 函数触发了没
    deps = fn;
    fn();
    deps = null;
}


/************  test  *************/
const initData = { count : 0 };

const data = track(initData);

// effect 的参数，是一个函数，如果这个函数用到了 被 track
// 的数据，那么修改数据，会让副作用函数执行。
// 如果这个fn执行的时候，并且触发了get,我就把这个函数，收集起来。
effect(() => {
    console.log(data.count);  // get
});

effect(() => {
    // fetchApi()
})

data.count = 1; 
data.count = 2;


