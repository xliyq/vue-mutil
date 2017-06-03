var http = require('http')
var fs = require('fs')
var url = require('url')
var path = require('path')
var mine = {
    'css': 'text/css',
    'gif': 'image/gif',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'swf': 'application/x-shockwave-flash',
    'tiff': 'image/tiff',
    'txt': 'text/plain',
    'wav': 'audio/x-wav',
    'wma': 'audio/x-ms-wma',
    'wmv': 'video/x-ms-wmv',
    'xml': 'text/xml'
}

// 创建服务器
http.createServer(function (request, response) {
    // 解析请求，包括文件名
    var pathname = url.parse(request.url).pathname
    var ext = path.extname(pathname)
    ext = ext ? ext.slice(1) : 'unknown'
    // 输出请求的文件名
    console.log('Request for ' + pathname + 'received.')
    fs.readFile(pathname.substr(1), 'binary', function (err, file) {
        if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            })
            response.end(err)
        } else {
            var contentType = mine[ext] || 'text/plain'
            response.writeHead(200, {
                'Content-Type': contentType
            })
            response.write(file, 'binary')
            response.end()
        }
    })

    // // 从文件系统中读取请求的文件内容
    // fs.readFile(pathname.substr(1), function (err, data) {
    //     if (err) {
    //         console.log(err)
    //         // HTTP 状态码: 404 : NOT FOUND
    //         // Content Type: text/plain
    //         response.writeHead(404, {'Content-Type': 'text/html'})
    //     } else {
    //         // HTTP 状态码: 200 : OK
    //         // Content Type: text/plain
    //         response.writeHead(200, {'Content-Type': 'text/html'})
    //
    //         // 响应文件内容
    //         response.write(data.toString())
    //     }
    //     //  发送响应数据
    //     response.end()
    // })
}).listen(8081)
// 控制台会输出以下信息
console.log('Server running at http://127.0.0.1:8081/')
