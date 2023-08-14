## vuex3 基于mixin做数据混入，同时将状态数据基于vue实例的响应式实时更新
```js
    <template>
        <div>
            {{ $store.state.name }}
        </div>
    </tamplate>
    // 1. 挂载beforeCreate => Vue.mixin()混入，$store此时混入并将实例挂载在store上
    // 2. 拼装了一个store类，用于生产整个store实例功能
    get state() {
        return this._vm._data.$$state
    }
    // 3. 能够实现响应式的本质new Vue()，借助了vue实例的响应式能力
```