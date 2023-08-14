import createApp from "./app";

export default context => {
    return new Promise((resolve, reject) => {
        const { app, router } = createApp()

        // 进入首页
        router.push(context.url)
        router.onReady(() => {
            resolve(app)
        }, reject)
    })
}