// node服务
// 0. 加载依赖
const express = require('express')
const Vue = require('vue')
// const fs = require('fs')

const app = express()
const renderer = require('vue-server-renderer').createRenderer()

// 渲染器渲染page得到html内容
// 1. page
const page = new Vue({
    template: "<div>hello, ssr!</div>"
})
// const { createBundleRenderer } = require("vue-server-renderer")
// const serverBundle = require('../dist/server/vue-ssr-server-bundle.json')
// const clientManifest = require('../dist/server/vue-ssr-client-manifest.json')
// const renderer = createBundleRenderer(serverBundle, {
//     runInNewContext: false,
//     template: fs.readFileSync('../public/index/temp/html', 'utf-8'),
//     clientManifest
// })

// 处理静态文件请求
app.use(express.static('../dist/client'))

// 2. 传递接口
// app.get('/', async (req, res) => {
// 路由权限交给vue
app.get('*', async (req, res) => {
    try {
        const html = await renderer.renderToString(page)
        // const context = {
        //     url: req.url,
        //     title: 'ssr test'
        // }
        // const html = await renderer.renderToString(context) 
        res.send(html)
    } catch (error) {
        res.status(500).send('server inner ERROR')
    }
})

// 3. 监听
app.listen(3000, () => {
    console.log('start')
})