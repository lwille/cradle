var querystring = require('querystring'),
    Args = require('vargs').Constructor,
    cradle = require('../../cradle'),
    Database = require('./index').Database;

// Query a view, passing any options to the query string.
// Some query string parameters' values have to be JSON-encoded.
Database.prototype.view = function (path, options) {
    var args = new(Args)(arguments);

    path = path.split('/');
    path = ['_design', path[0], '_view', path[1]].map(querystring.escape).join('/');

    if (typeof(options) === 'object') {
        ['key', 'startkey', 'endkey'].forEach(function (k) {
            if (k in options) { options[k] = JSON.stringify(options[k]) }
        });
    }

    if (options && options.keys) {
        return this.query({
            method: 'POST', 
            path: path, 
            query: options
          }, args.callback);
    } else {
        return this.query({
            method: 'GET', 
            path: path, 
            query: options
        }, args.callback);
    }
};

Database.prototype.temporaryView = function (doc, callback) {
    return this.query({
        method: 'POST', 
        path: '_temp_view', 
        body: doc
    }, callback);
};

Database.prototype.viewCleanup = function (callback) {
    var headers = {};
    headers['Content-Type'] = "application/json";
    this.query({
        method: 'POST', 
        path: '/_view_cleanup', 
        headers: headers
    }, callback);
};

Database.prototype.compact = function (design) {
    var headers = {};
    headers['Content-Type'] = "application/json";
    this.query({
        method: 'POST',
        path: '/_compact' + (typeof(design) === 'string' ? '/' + querystring.escape(design) : ''),
        headers: headers
    }, Args.last(arguments));
};

// Query a list, passing any options to the query string.
// Some query string parameters' values have to be JSON-encoded.
Database.prototype.list = function (path, options) {
    var args = new(Args)(arguments);
    path = path.split('/');

    if (typeof(options) === 'object') {
        ['key', 'startkey', 'endkey'].forEach(function (k) {
            if (k in options) { options[k] = JSON.stringify(options[k]) }
        });
    }
    this.query({
      method: 'GET', 
      path: ['_design', path[0], '_list', path[1], path[2]].map(querystring.escape).join('/'), 
      query: options, 
    }, args.callback);
};