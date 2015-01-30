/*
 * (C) 2015 Seth Lakowske
 */

var hyperspace = require('hyperspace');

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

function toHTML(pipe, names, urls) {
    var linkStand = asTable();
    linkStand.pipe(pipe);

    for (var i = 0 ; i < names.length ; i++) {
         linkStand.write({name:names[i], url: urls[i]})
    }

    linkStand.end();
}

module.exports = toHTML;
