# Important #

为了能够使用IP地址访问，请修改`node_modules/roadhog/lib/runServer.js`文件，在193行左右的`runDevServer`方法中的`devServer`变量最后加上`disableHostCheck: true`，否则通过IP地址访问会报`Invalid Host Header`。

支持 URL 重写，请修改`node_modules/roadhog/lib/runServer.js`文件，在`runDevServer`方法中的 webpack-dev-server 配置中加上
```
historyApiFallback: {
  rewrites: [
    { from: /^\/en\//, to: '/index-en.html' },
    { from: /^\//, to: '/index.html' },
  ]
},
```
