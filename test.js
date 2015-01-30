/*
 * (C) 2015 Seth Lakowske
 */

var test           = require('tape');
var articles       = require('./');
var router         = require('routes')();
var through        = require('through');

test('handles non-existent article', function(t) {

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
