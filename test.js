/*
 * (C) 2015 Seth Lakowske
 */

var test           = require('tape');
var articles       = require('./');
var routes         = require('routes');
var through        = require('through');

test('404s non-existent article', function(t) {

    var router = routes();
    //attach a request handler to router
    var article = articles('/articles', './test/noArticles', router, function() {

        var m = router.match('/bad/path');
        t.notOk(m, 'not a valid route');

        var m = router.match('/articles/nonExistent');
        t.ok(m, 'valid route');

        var output = ''
        var mockReq = {}

        var mockRes = through(function write(data) {
            output += data;
            this.queue(data);
        }, function(end) {
            t.equal(output, 'invalid article requested');
            t.end();
            this.queue(null);
        })

        mockRes.setHeader = function(type, value) {
            t.equal(type, 'content-type');
            t.equal(value, 'text/html');
        }

        if (m) m.fn(mockReq, mockRes, m.params);

    });

})

test('serves articles', function(t) {

    var router = routes();

    var article = articles('/articles', './test/articles', router, function() {
        var m = router.match('/bad/path');
        t.notOk(m, 'not a valid route');

        var m = router.match('/articles/sabado');
        t.ok(m, 'valid route');

        var output = ''
        var mockReq = {}

        var mockRes = through(function write(data) {
            output += data;
            this.queue(data);
        }, function(end) {
            t.equal(output, '<html>\n<body>\n<table id="related"><tr><td><a class="name" name="sabado" href="/articles/sabado">sabado</a></td></tr></table>\n</body>\n</html>\n\n');
            t.end();
            this.queue(null);
        })

        mockRes.setHeader = function(type, value) {
            t.equal(type, 'content-type');
            t.equal(value, 'text/html');
        }

        if (m) m.fn(mockReq, mockRes, m.params);

    })
})
