/*
 * (C) 2015 Seth Lakowske
 */

var hyperspace = require('hyperspace');
var trumpet    = require('trumpet');

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

function toHTML(links) {
    var linkStand = asTable();

    for (var i = 0 ; i < links.length ; i++) {

        linkStand.write({name:links[i].name, url: links[i].url})
    }

    linkStand.end();

    return linkStand;
}

function streamLinks(links, selector) {
    var related = trumpet();
    var ws = related.createWriteStream('#related');
    toHTML(links).pipe(ws);
    return related;
}

module.exports.toHTML      = toHTML;
module.exports.asTable     = asTable;
module.exports.streamLinks = streamLinks;
