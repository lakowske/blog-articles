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

/*
 * Captures streams
 */
function streamCapture() {
    this.value  = '';
    this.stream = through(function(data) {
        this.value += data;
    });
}

streamCapture.prototype.get = function() {
    this.value;
}

test('can compose an article page', function(t) {

    var mount      = '/articles';
    var articleDir = '../test/articles';

    articles(articleDir, function(discovered) {

        t.deepEqual(discovered, ['sabado'], 'found an article');

        var urls = discovered.map(function(article) {

            //Generated url to respond to (could be multiple urls if desired)
            var url = mount + '/' + article;

            var articleStream = fs.createReadStream(path.join(articleDir, article, 'index.html'));

            var links = [{name:'hi', url:'articles/hi'},
                         {name:'seth', url:'articles/seth'}]

            var related = linkstand.streamLinks(links, '#related');

            var output = '';
            var recorder = through(function(data) {
                output += data;
            })

            articleStream.pipe(related).pipe(recorder);

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

test('can compose from multiple streams', function(t) {
    var articleDir = '../test/articles';

    var articleStream  = fs.createReadStream(path.join(articleDir, 'sabado', 'index.html'));
    var related = require('../linkstand').streamLinks([{name:'seth', url:'sethlakowske.com'}], '#related');

    var output = '';
    var recorder = through(function(data) {
        output += data;
    })

    articleStream.pipe(related).pipe(recorder);

    articleStream.on('end', function() {

        t.same(output,
               ''
               + '<html>\n'
               + '<body>\n'
               + '<table id="related">'
               + '<tr><td><a class="name" name="seth" href="sethlakowske.com">seth</a></td></tr>'
               + '</table>\n'
               + '</body>\n'
               + '</html>\n\n','an expanded web page');
        t.end();

    })
})
