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

function toHTML(names, urls) {
    var linkStand = asTable();

    for (var i = 0 ; i < names.length ; i++) {
         linkStand.write({name:names[i], url: urls[i]})
    }

    linkStand.end();

    return linkStand;
}

module.exports.toHTML = toHTML;
module.exports.asTable = asTable;
