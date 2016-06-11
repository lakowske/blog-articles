/*
 * (C) 2015 Seth Lakowske
 */

var test           = require('tape');
var articles       = require('./');

var routes         = require('routes');
var through        = require('through');
var fs             = require('fs');
var trumpet        = require('trumpet');

function slurp(stream, cb) {
    var content = '';
    stream.on('data', function(data) {
        content += data;
    })
    stream.on('end', function() {
        cb(content);
    })
}

function pre(msg) {
    var first = true;
    return through(function(data) {
        if (first) {
            this.push(msg);
            first = false;
        }
        this.push(data);
    })
}

function suffix(stream, msg) {

    var tr = through();
    
    stream.on('data', function(data) {

        tr.write(data);

    });

    stream.on('end', function() {
        tr.write(msg);
        tr.end();
    });

    stream.pipe(tr);
    
    return tr;

}

test('404s non-existent article', function(t) {

    var router = routes();
    //attach a request handler to router
    var article = articles.articles('./test/noArticles', function(found) {
        t.ok(found.length === 0);
        t.end();
    });

});

test('serves articles', function(t) {

    var router = routes();
    var articleDir = './articles/';
    var article = articles.articles(articleDir, function(found) {
        console.log(found);
        found.map(function(article) {
            var index = article.path
            var stream = fs.createReadStream(index);
            slurp(stream, function(result) {
                //console.log('result: ' + result);
                t.end();
            });
        })
    })
})

test('trumpet read tags', function(t) {
    
    var stream = fs.createReadStream('./articles/sabado/index.html');

    var related = trumpet();
    var body = related.createStream('body');

    stream.pipe(related);

    slurp(body, function(content) {
        body.write(content);
        body.write('woohoo');
        body.end();
    })

    //suffix(body, 'hi wisconsin\n').pipe(body);
    //body.pipe(pre('hi wisconsin, ')).pipe(body);
    slurp(related, function(result) {
        console.log('result: ' + result);
        t.end();
    });


})

test('trumpets articles', function(t) {

    var router = routes();
    var articleDir = './articles/';

    var article = articles.articles(articleDir, function(found) {
        console.log(found);

        found.map(function(article) {
            var index = article.path
            var stream = fs.createReadStream(index);
            console.log(index, stream);
            
            var related = trumpet();
            var ws      = related.createWriteStream('#related');
            var stand   = articles.linkstand.toHTML(found);
            stand.pipe(process.stdout);
            stand.pipe(ws);
            slurp(related, function(result) {
                console.log('result: ' + result);
                t.end();
            })
            //stream.pipe(related).pipe(process.stdout);

        })


    })
})

