/*
 * (C) 2015 Seth Lakowske
 */

var fs             = require('fs');
var path           = require('path');
var walk           = require('walk')
var trumpet        = require('trumpet');
var linkstand      = require('./linkstand');


/*
 * Creates a stream of an article, if the article exists.
 */
function read (file, cb, error) {
    fs.stat(file, function(err, stat) {
        if (err == null) {
            cb(fs.createReadStream(file));
        } else if (err.code == 'ENOENT') {
            console.log(file + ' article does not exist');
            error(err);
        } else {
            console.log('error: ', err.code);
            error(err);
        }
    })
}

/*
 * Reads the layout of the article and pass the related links stream to cb.
 * Users can write related link objects to the stream
 */
function layout(res, params, mount, articleDir, cb) {
    res.setHeader('content-type', 'text/html');

    read(path.join(articleDir, params.article, 'index.html'), function(articleStream) {
        var tr = trumpet();
        articleStream.pipe(tr).pipe(res);
        cb(tr.createWriteStream('#related'));
    }, function(error) {
        res.statusCode = 404;
        res.write('invalid article requested');
        res.end();
    });

}

/*
 * Attaches an article renderer to a route at the given mount point
 *
 * @param {String} mount point where articles are served.  Should not end in a slash.
 * @param {String} articleDir points to where articles reside on the filesystem.
 * @param {Object} router is an instance from the routes module.
 */
function attach(mount, articleDir, router, cb) {

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

        router.addRoute(mount + '/:article', function(req, res, params) {

            layout(res, params, mount, articleDir, function(pipe) {
                var urls = discovered.map(function(article) {
                    return mount + '/' + article;
                })

                linkstand(pipe, discovered, urls);

            });

        });

        cb();

    });

}


module.exports = attach;
