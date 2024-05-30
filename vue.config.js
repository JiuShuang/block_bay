const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 跨域的代理中转服务器服务
  devServer: {
    proxy: {
      "/api":{   // /vue代理target
        target: 'http://127.0.0.1:5001',      // 后端接口的根目录
        // secure: true,           // 如果是 https ,需要开启这个选项，http为false
        changeOrigin: true,        // 是否跨域
      }
    },
  }
})

