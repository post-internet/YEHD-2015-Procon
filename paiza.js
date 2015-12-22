/*
 * Based node-paiza-io (MIT Copyright (c) 2015 TSUYUSATO Kitsune)
 */
(function(window) {

var config =
{
  "api_key": "guest",
  "base_url": "http://api.paiza.io",
  "api": {
    "create": {
      "method": "POST",
      "path": "/runners/create"
    },
    "get_status": {
      "method": "GET",
      "path": "/runners/get_status"
    },
    "get_details": {
      "method": "GET",
      "path": "/runners/get_details"
    }
  }
};

var api = {
  wrap_request: function (method, base_url, path, parameter, callback) {
    var options = {
      method: method,
      url: base_url + path
    };
    if (method.toUpperCase() === 'POST') {
      options.body = JSON.stringify(parameter);
      options.headers = {
        'Content-Type': 'application/json'
      };
    } else {
      var qsArray = [];
      Object.keys(parameter).map(function (key) {
        var value = parameter[key];
        var qs = encodeURIComponent(key) + '=' + encodeURIComponent(value);
        qsArray.push(qs);
      });
      options.url += '?' + qsArray.join('&');
    }

    fetch(options.url, options)
      .then(function (res) {
        if (res.ok) return res.json();
        else throw new Error(res.status);
      })
      .then(function request_callback(body) {
        if (body.error) {
          error = new Error('paiza.io error: ' + body.error);
          error.paizaIoMessage = body.error;
          return callback(error);
        }

        return callback(null, body);
      })
      .catch(function (err) {
        return callback(error);
      });
  },

  // === exports ===

  // wrapper of runners/create
  create: function (parameter, callback) {
    return api.wrap_request(
      config.api.create.method,
      parameter.base_url || config.base_url,
      config.api.create.path,
      parameter,
      callback);
  },

  // wrapper of runners/get_status
  get_status: function (parameter, callback) {
    return api.wrap_request(
      config.api.get_status.method,
      parameter.base_url || config.base_url,
      config.api.get_status.path,
      parameter,
      callback);
  },

  // wrapper of runners/get_details
  get_details: function (parameter, callback) {
    return api.wrap_request(
      config.api.get_details.method,
      parameter.base_url || config.base_url,
      config.api.get_details.path,
      parameter,
      callback);
  }
};

function paiza_io(language, code, input, option, callback) {
  // `parameter` is a optional parameter.
  if (!callback) {
    callback = option;
    option = {};
  }

  option = Object.assign({
    base_url: config.base_url,
    retry_get_status_time: 1000,
    max_get_status_loop: 10,
    api_key: config.api_key
  }, option);

  var parameter = Object.assign({
    language: language,
    source_code: code,
    input: input,
    api_key: option.api_key,
    base_url: config.base_url
  }, option.parameter);

  create(parameter, option, callback);
}

function create(parameter, option, callback) {
  api.create(parameter, get_status(option, callback));
}

function get_status(option, callback) {
  return function create_callback(error, body) {
    if (error) return callback(error);

    (function loop(count, body) {
      if (body.status === 'completed') {
        return get_details(body.id, option, callback);
      }
      if (count >= option.max_get_status_loop) {
        // TODO: change an error message to courteouseness.
        return callback(new Error('get_status_loop overflow!'));
      }

      setTimeout(function get_status_loop_timeout() {
        api.get_status({
          id: body.id,
          api_key: option.api_key,
        }, function (error, body) {
          if (error) return callback(error);
          loop(count + 1, body);
        });
      }, option.retry_get_status_time);
    })(0, body);
  }
}

function get_details(id, option, callback) {
  api.get_details({
    id: id,
    api_key: option.api_key,
  }, callback);
}

function paizaPromise() {
  var args = Array.prototype.slice.apply(arguments);
  return new Promise(function (resolve, reject) {
    args.push(function (err, res) {
      if (!err) resolve(res);
      else reject(err);
    });
    paiza_io.apply(paiza_io, args);
  });
}

var fetch;
if (typeof module !== 'undefined' && module.exports) {
  fetch = require('node-fetch');
  module.exports = paizaPromise;
} else {
  fetch = window.fetch;
  window.paiza = paizaPromise;
}

})(this);
