/*
 * (C) 2015 Seth Lakowske
 */

var test           = require('tape');
var articles       = require('./');
var router         = require('routes')();

test('handles non-existent article', function(t) {

    //attach a request handler to router
    var article = articles('/articles', './test/noArticles', router);

    var m = router.match('/bad/path');
    t.notOk(m, 'not a valid route');

    var m = router.match('/articles/nonExistent');
    t.ok(m, 'valid route');

    //if (m) m.fn(mockReq, mockRes, m.params);

})
