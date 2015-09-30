/*
 * (C) 2015 Seth Lakowske
 */

var fs             = require('fs');
var path           = require('path');
var walk           = require('walk')
var trumpet        = require('trumpet');
var linkstand      = require('./linkstand');

/*
 * Find html based articles under the given articleDir and passes found articles to callback
 *
 * @param {String} articleDir relative path to search under.
 * @param {Function} cb function takes one argument, the found articles under articleDir.
 */
function articles(articleDir, cb) {
    
    var discovered = []

    var walker = walk.walk(articleDir);

    walker.on('file', function (root, stat, next) {
        var match = /html/.test(stat.name)
        file = path.basename(root);
        root = path.normalize(root);
        url = path.join(root, stat.name);
        if (match) {
            discovered.push({name:file, root:root, path:url, url:'/' + root + '/'});
        }
        next();
    });

    walker.on('end', function () {

        cb(discovered);

    });

}

function related(discovered) {
    var related = trumpet();
    var ws      = related.createWriteStream('#related');
    var stand   = linkstand.toHTML(discovered);
    stand.pipe(ws);
    return related;
}

module.exports.articles  = articles;
module.exports.linkstand = linkstand;
module.exports.related   = related;
