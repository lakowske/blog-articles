/*
 * (C) 2015 Seth Lakowske
 */

var test           = require('tape');
var articles       = require('./');

var routes         = require('routes');
var through        = require('through');
var fs             = require('fs');
var trumpet        = require('trumpet');

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
    var articleDir = './test/articles/';
    var article = articles.articles(articleDir, function(found) {
        found.map(function(article) {
            var index = article.path
            var stream = fs.createReadStream(index);
            stream.pipe(process.stdout);
            t.end();
        })
    })
})

test('trumpets articles', function(t) {

    var router = routes();
    var articleDir = './test/articles/';

    var article = articles.articles(articleDir, function(found) {
        console.log(found);

        found.map(function(article) {
            var index = article.path
            var stream = fs.createReadStream(index);

            var related = trumpet();
            var ws      = related.createWriteStream('#related');
            var stand   = articles.linkstand.toHTML(found);
            stand.pipe(ws);
            stream.pipe(related).pipe(process.stdout);

        })


    })
})

