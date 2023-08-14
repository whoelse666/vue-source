 const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
 const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
 const nodeExternals = require('webpack-node-externals')
 const merge = require('lodash.merge')

 // 环境变量
 const TARGET_NODE = process.env.WEBPACK_TARGET === 'node'
 const target = TARGET_NODE ? 'server' : 'client'

 module.exports = {
     css: {
         extract: false
     },
     outputDir: './dist/' + target,
     configureWebpack: () => ({
         entry: `./src/entry-${target}.js`,
         devtool: 'source-map',
         target: TARGET_NODE ? 'node' : 'web',
         node: TARGET_NODE ? undefined : false,
         // 使用node风格导出
         output: {
             libraryTarget: TARGET_NODE ? 'commonjs2' : undefined
         },
         // 外置依赖，优化打包大小
         externals: TARGET_NODE
            ? nodeExternals({
                whitelist: [/\.css$/]
            })
            : undefined,
        plugins: [
            TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()
        ]
     })
 }