# 在多页面项目下使用 Webpack + Vue
# start
## vue-cli
<b>init project</b>
```
$ npm install -g vue-cli
$ vue init Plortinus/vue-multiple-pages new-project
$ cd new-project
$ npm install
```
## 常用命令
```
# 开发运行
$ npm run dev

#编译运行
$ npm run build
$ node server.js
```

## 项目目录结构
```
├─src(源代码目录)
│   ├─assets(公共资源)
│   ├─components(公共组件)
│   ├─module(页面模块)
│   │   ├─user(用户模块)
│   │   │   ├─components(模块公共组件)
│   │   │   ├─scss(模块scss文件)
│   │   │   ├─login(登录模块)
│   │   │   │   ├─app.js(entry 文件)
│   │   │   │   ├─app.html(template，可省略)
│   │   │   │   ├─app.vue(登录模块逻辑)
│   │   │   └─index
│   │   │       ├─app.js
│   │   │       ├─app.html
│   │   │       └─app.vue
│   │   └─module1(其他模块)
│   │       ├─components
│   │       ├─scss
│   │       ├─login
│   │       └─index
│   └─app.html(子模块app.html省略时使用)
└─server.js(编译后的web server)
```

## 编译目录结构
```
├─dist(目录)
│   ├─assets
│   ├─static
│   │   ├─css
│   │   │   ├─user
│   │   │   │   ├─index.css
│   │   │   │   └─login.css
│   │   ├─fonts
│   │   ├─js
│   │   │   ├─user
│   │   │   │   ├─index.js
│   │   │   │   └─login.js
│   ├─user
│   │   ├─index.html
│   │   └─login.html
│   └─module1
```

## 多页面运行原理
 首先我们需要修改webpack.base.conf.js中的entry，并将公共的js合并到vendor.js中，这些需要node的glob模块和webpack的CommonsChunkPlugin
    
    <code>filename: utils.js</code>
```js
    var path = require('path')
    var glob = require('glob')
    var fs = require('fs')
    
    function fsExistsSync(path) {
        try {
            fs.accessSync(path, fs.F_OK);
        } catch (e) {
            return false;
        }
        return true;
    }
    
    exports.getEntries = function () {
        const entries = {};
    
        glob.sync('./src/module/**/app.vue').forEach(function (_path) {
            const chunk = _path.split('./src/module/')[1].split('/app.vue')[0];
            const temp = _path.split('app.vue')[0] + 'app.js';
            if (fsExistsSync(temp)) {
                _path = temp;
            } else {
                _path = './src/app.js';
            }
            entries[chunk] = _path;
        });
        return entries;
    }
    
    exports.getHtmlWebpackPlugin = function () {
        var HtmlWebpackPlugin = require('html-webpack-plugin')
        var plugins = {
            plugins: []
        }
        var prod = process.env.NODE_ENV === 'production';
        glob.sync('./src/module/**/app.vue').forEach(function (_path) {
            const chunk = _path.split('./src/module/')[1].split('/app.vue')[0]
            const filename = prod
                ? config.build.assetsRoot + '/' + chunk + '.html'
                : chunk + '.html';
    
            const temp = path.join(_path.split('/app.vue')[0], 'app.html');
            if (fsExistsSync(temp)) {
                _path = temp;
            } else {
                _path = './src/app.html';
            }
            console.log(temp, filename, _path)
            const htmlConf = {
                filename: filename,
                template: _path,
                inject: true,
                favicon: './src/assets/image/favicon.png',
                chunks: ['vendors', chunk]
            }
            if (prod) {
                htmlConf.minify = {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true
                }
                htmlConf.chunksSortMode = 'dependency'
            }
    
            plugins.plugins.push(new HtmlWebpackPlugin(htmlConf))
        });
        return plugins;
    }
```

webpack.base.conf.js
```js
    //获取entries 和chunks
    var entries = utils.getEntries();
    var chunks = Object.keys(entries);
    
    module.exports = {
        // entry: {
        //   app: './src/main.js'
        // },
        entry: entries,
        plugins: [
            new CommonsChunkPlugin({
                name: "vendors",
                filename: 'static/js/vendors.js',
                chunks: chunks,
                minChunks: chunks.length
            })
        ],
        ...
    }
```
webpack.dev.conf.js
```js
    var utils = require('./utils')
    var webpack = require('webpack')
    var config = require('../config')
    var merge = require('webpack-merge')
    var baseWebpackConfig = require('./webpack.base.conf')
    var HtmlWebpackPlugin = require('html-webpack-plugin')
    var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
    
    // add hot-reload related code to entry chunks
    Object.keys(baseWebpackConfig.entry).forEach(function (name) {
        baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
    })
    
    var webpackConfig = merge(baseWebpackConfig, {
        module: {
            rules: utils.styleLoaders({sourceMap: config.dev.cssSourceMap})
        },
        // cheap-module-eval-source-map is faster for development
        devtool: '#cheap-module-eval-source-map',
        plugins: [
            new webpack.DefinePlugin({
                'process.env': config.dev.env
            }),
            // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            // https://github.com/ampedandwired/html-webpack-plugin
            // new HtmlWebpackPlugin({
            //     filename: 'index.html',
            //     template: 'index.html',
            //     inject: true
            // }),
            new FriendlyErrorsPlugin()
        ]
    })
    
    var HtmlPlugin = utils.getHtmlWebpackPlugin();
    webpackConfig = merge(webpackConfig, HtmlPlugin);
    
    module.exports = webpackConfig;

```
webpack.prod.conf.js
```js
    //1.屏蔽掉原有的HtmlWebpackPlugin和CommonsChunkPlugin对vendor的处理
    //2.在module.exports = webpackConfig之前添加
    var HtmlPlugin = utils.getHtmlWebpackPlugin();
    webpackConfig = merge(webpackConfig, HtmlPlugin);

```