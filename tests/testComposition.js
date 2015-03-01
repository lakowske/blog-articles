/*
 * (C) 2015 Seth Lakowske
 */

var test      = require('tape');
var articles  = require('../').articles;
var linkstand = require('../linkstand');
var fs        = require('fs');
var path      = require('path');
var through   = require('through');
var trumpet   = require('trumpet');

test('can compose an article page', function(t) {

    var mount      = '/articles';
    var articleDir = '../test/articles';

    articles('../test/articles', function(discovered) {

        t.deepEqual(discovered, ['sabado'], 'found an article');

        var urls = discovered.map(function(article) {

            //Generated url to respond to (could be multiple urls if desired)
            var url = mount + '/' + article;

            var articleStream = fs.createReadStream(path.join(articleDir, article, 'index.html'));

            var tr = trumpet();
            var ws = tr.createWriteStream('#related');

            var names = ['hi', 'seth']
            var urls  = ['articles/hi', 'articles/seth']

            var stand = linkstand.toHTML(names, urls);
            stand.pipe(ws);

            var output = '';
            var recorder = through(function(data) {
                output += data;
            })
            articleStream.pipe(tr).pipe(recorder);

            articleStream.on('end', function() {
                t.same(output,
''
+ '<html>\n'
+ '<body>\n'
+ '<table id="related">'
+ '<tr><td><a class="name" name="hi" href="articles/hi">hi</a></td></tr>'
+ '<tr><td><a class="name" name="seth" href="articles/seth">seth</a></td></tr>'
+ '</table>\n'
+ '</body>\n'
+ '</html>\n\n','an expanded web page');
                t.end();
            })

        })

    })

})
