var path = require('path')
var config = require('../config')
var glob = require('glob')
var fs = require('fs')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

exports.assetsPath = function (_path) {
    var assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory
    return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
    options = options || {}

    var cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: process.env.NODE_ENV === 'production',
            sourceMap: options.sourceMap
        }
    }

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        var loaders = [cssLoader]
        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
        }

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.extract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            })
        } else {
            return ['vue-style-loader'].concat(loaders)
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {indentedSyntax: true}),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
    var output = []
    var loaders = exports.cssLoaders(options)
    for (var extension in loaders) {
        var loader = loaders[extension]
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        })
    }
    return output
}


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
