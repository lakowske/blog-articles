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
 * @param {String} articleDir path to search under.
 * @param {Function} cb function takes one argument, the found articles under articleDir.
 */
function articles(articleDir, cb) {

    var discovered = []

    var walker = walk.walk(articleDir);

    walker.on('file', function (root, stat, next) {
        var match = /html/.test(stat.name)
        if (match) {
            file = path.basename(root);
            discovered.push(file);
        }
        next();
    });

    walker.on('end', function () {

        cb(discovered);

    });

}

module.exports.articles  = articles;
module.exports.linkstand = linkstand;
