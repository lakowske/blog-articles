/*
 * (C) 2015 Seth Lakowske
 */

var fs             = require('fs');
var path           = require('path');
var walk           = require('walk')
var trumpet        = require('trumpet');
var linkstand      = require('./linkstand');
var Rx             = require('rxjs/Rx');

/*
 * Remove the front of a path.
 */
function trimPathPrefix(prefix, path) {
    var pathParts = path.split('/')
    var prefixParts = prefix.split('/')
    while (prefixParts.length > 0 && pathParts.length > 0 && prefixParts[0] === pathParts[0]) {
        prefixParts.shift()
        pathParts.shift()
    }

    return pathParts.join('/');
}

/*
 * Find html based articles under the given articleDir and passes found articles to callback
 *
 * @param {String} articleDir relative path to search under.
 * @param {Function} cb function takes one argument, the found articles under articleDir.
 */
function articles(articleDir, basePath, cb) {
    
    var discovered = []

    var walker = walk.walk(articleDir);

    walker.on('file', function (root, stat, next) {
        var match = /html/.test(stat.name)
        file = path.basename(root);
        root = path.normalize(root);
        url = path.join(root, stat.name);
        
        var depth = root.split('/').length;
        if (match && depth <= 5) {
            var typePath = path.join(root, 'type.json');
            var articleUrl = trimPathPrefix(basePath, root);
            var article = {name:file, root:root, path:url, type: {}, url:'/' + articleUrl + '/'};
            try {
                var stats = fs.statSync(typePath);
                var type = JSON.parse(fs.readFileSync(typePath, 'utf-8'));
                article.type = type;
            } catch (err) {
                //nothing
            }

            discovered.push(article);
        }
        next();
    });

    walker.on('end', function () {

        cb(discovered);

    });

}

function articlesObservable(articleDir, basePath) {
    return Rx.Observable.create(function(observer) {
        var walker = walk.walk(articleDir);

        walker.on('file', function (root, stat, next) {
            var match = /html/.test(stat.name)
            file = path.basename(root);
            root = path.normalize(root);
            url = path.join(root, stat.name);
            
            var depth = root.split('/').length;
            if (match && depth <= 5) {
                var typePath = path.join(root, 'type.json');
                var articleUrl = trimPathPrefix(basePath, root);
                var article = {name:file, root:root, path:url, type: {}, url:'/' + articleUrl + '/'};
                try {
                    var stats = fs.statSync(typePath);
                    var type = JSON.parse(fs.readFileSync(typePath, 'utf-8'));
                    article.type = type;
                } catch (err) {
                    observer.error(err);
                }

                observer.next(article);
            }
            next();
        });

        walker.on('end', function () {
            observer.complete();
        });
        
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
module.exports.articlesObservable = articlesObservable;
