import Vue from 'vue'
import Vuex from 'vuex'

// 1. use上
Vue.use(Vuex)

// 2. 实例化使用
const store = new Vuex.Store({
    action: {
        // 连接业务 / 异步处理 & mutation之间
        setNodeInfo({ commit }, args) {
            // ajax 拉数据
            // 状态判断
            // 权限处理
            // then
            commit('SET_NODE_INFO', {
                ...args,
                // ...params
            })
        }
    },
    mutations: {
        // 直接流转状态的前线
        SET_NODE_INFO(state, { info }) {
            // 同步数据处理
            // 流转状态
            state.nodeInfo = info;
        }
    },
    state: {
        nodeInfo: {
            name: '-',
            age: 0,
            words: 'hello vue'
        }
    }
})

export default store;