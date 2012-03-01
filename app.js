/**
 * Created by JetBrains WebStorm.
 * User: marshal
 * Date: 12-2-29
 * Time: 下午10:06
 * To change this template use File | Settings | File Templates.
 */
//声明所需依赖库的对象
var $ = require('jquery'),
    fs = require('fs'),
    mongodb = require('mongodb'),
    http = require('http');

//http参数对象
var options = {
    host:'zh.wikipedia.org',
    port:80,
    path:'/wiki/%E5%9D%A6%E5%85%8B'
};

var html = '';//http获取html字符串
var tankBook = {};//分析html获得数据对象

http.get(options, function (res) {
    res.on('data',
        function (data) {//加载数据，一般会执行多次
            html += data;
        }).on('end', function () {//加载完成
            var dom = $(html);//生成文档树
            tankBook.title = dom.find('#firstHeading').text();//获取文档标题
            tankBook.coverImageUrl = dom.find('.thumbimage').first()[0].src;//获取文档封面图url
            console.log('book.title: ' + tankBook.title + ' book.coverImageUrl: ' + tankBook.coverImageUrl);
            savekImageFile();
        });
});

function savekImageFile() {
    var hostName = tankBook.coverImageUrl.split('/')[2];
    var path = tankBook.coverImageUrl.substring(tankBook.coverImageUrl.indexOf(hostName) + hostName.length);

    var options = {
        host:hostName,
        port:80,
        path:path
    };

    http.get(options, function (res) {
        res.setEncoding('binary');
        var imageData = '';

        res.on('data', function (data) {//图片加载到内存变量
            imageData += data;
        }).on('end', function () {//加载完毕保存图片
            fs.writeFile('tank.png', imageData, 'binary', function (err) {
                if (err) throw err;
                console.log('file saved');

                saveToDb();
            });
        });
    });
}

function saveToDb(){
    var server=new mongodb.Server('dev.witmob.com',27017),
        connect=new mongodb.Db('test',server);

    connect.open(function(err,db){
        db.collection('books',function(err,collection){
            collection.find(function(err,cursor){
                cursor.each(function(err,doc){
                    if(doc){
                        console.log('doc.title:'+doc.title);
                    }
                });
            });

//            collection.insert(tankBook);
        });
    });
}
