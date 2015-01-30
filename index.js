/*
 * (C) 2015 Seth Lakowske
 */

var path      = require('path');
var walk      = require('walk')
var hyperspace = require('hyperspace');

var discovered = []

function read (file) {
    return fs.createReadStream(path.join(__dirname, 'articles', file));
}

function layout(res, params) {
    res.setHeader('content-type', 'text/html');
    var tr = trumpet();
    read('/' + params.article + '/index.html').pipe(tr).pipe(res);
    return tr.createWriteStream('#related');
}

function articles(onFile, onEnd) {
   var walker = walk.walk('./articles');

    walker.on('file', function (root, stat, next) {
        onFile(root, stat);
        next();
    });

    walker.on('end', onEnd);
}

var html = '<tr><td><a class="name"></a></td></tr>';

function asTable() {
    return hyperspace(html, function(doc) {
        return {
            'a.name' : {
                name : doc.name,
                href : doc.url,
                _text : doc.name
            }
        }
    });
}

function toHTML(pipe) {
    var linkStand = asTable();
    linkStand.pipe(pipe);

    for (var i = 0 ; i < discovered.length ; i++) {
         linkStand.write({name:discovered[i], url: '/articles/' + discovered[i]})
    }

    linkStand.end();
}

articles(function(file, stat) {
    var match = /html/.test(stat.name)
    if (match) {
        file = path.basename(file);
        discovered.push(file);
    }
}, function() {
    //pipe.end();
});

module.exports.articles = articles;
module.exports.toHTML   = toHTML;
module.exports.asTable  = asTable;
module.exports.layout   = layout;
