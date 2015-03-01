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
function related(res, params, mount, articleDir, cb) {
    var tr = trumpet();
    articleStream.pipe(tr).pipe(res);
    cb(tr.createWriteStream('#related'));

    // }, function(error) {
    //     res.statusCode = 404;
    //     res.write('invalid article requested');
    //     res.end();
    // });

}

/*
 * Reads an article from the filesystem
 */
function article(articlePath) {
    read(path.join(articleDir, params.article, 'index.html'), function(articleStream) {
        var tr = trumpet();
        articleStream.pipe(tr).pipe(res);
        cb(tr.createWriteStream('#related'));
    })
}


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

    /*
    return function(req, res, params) {

        layout(res, params, mount, articleDir, function(pipe) {
            var urls = discovered.map(function(article) {
                return mount + '/' + article;
            })

            linkstand(pipe, discovered, urls);

        })

    };
    */

}

module.exports.articles = articles;
