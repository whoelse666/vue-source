## vuex4 基于单例模式，参数注入
```js
    const store = new Store();

    const rootInstance = {
        parent: null,
        provides: {
            store
        }
    }

    const parentInstance = {
        parent: parentInstance,
        provides: {
            store
        }
    }

    store.dispatch('change')
    // 共享同一单例实例
```

<!-- 面试：手写vuex4原理 -->
```js
    import { inject, reactive } from 'vue'

    export function createStore(options) {
        return new Store(options)
    }

    export function useStore(injectKey = 'store') {
        return inject(injectKey)
    }

    class Store {
        // Vue配置use的入口安装
        install(vue, injectKey = 'store') {
            vue.provide(injectKey, this)
            vue.config.globalProperties.$store = this
        }

        constructor(options) {
            const store = this
            // 1. state 响应式
            // store._state.data = xxxxxx
            store._state = reactive({
                data: options.state
            })
            // 2. 实现getters
            const _getters = options.getters

            store.getters = {}
            forEachValue(_getters, (fn, key) => {
                Object.defineProperty(store.getters, key, {
                    enumerable: true,
                    get: () => fn(store.state)
                })
            })

            // dispatch commit 注册
            const _mutations = options.mutations

            store._mutations = Object.create(null)
            forEachValue(_mutations, (mutation, key) => {
                store._mutations[key] = value => {
                    mutation.call(store, store.state, value)
                }
            })

            const _actions = options.actions

            store._actions = Object.create(null)
            forEachValue(_actions, (action, key) => {
                store._actions[key] = value => {
                    action.call(store, store.state, value)
                }
            })
        }

        get state() {
            return this._state.data
        }

        dispatch = (type, value) => {
            this._actions[type](value)
        }
        commit = (type, value) => {
            this._mutations[type](value)
        }
    }

    function forEachValue(obj, fn) {
        (object.keys(obj) || []).forEach(key => fn(obj[key], key))
    }
```