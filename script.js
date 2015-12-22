/* global $:false Handlebars:false marked:false MathJax:false */
$.fn.serializeJson = function() {
  var obj = {};
  $.each(this.serializeArray(), function() {
    obj[this.name] = this.value;
  });
  return obj;
};
$.fn.isVisible = function() {
  return $.expr.filters.visible(this[0]);
};

var LIMIT_TIME = 2;
var LIMIT_MEM = 256 * 1024 * 1024;
var parallelNum = 2;

$(function(){
  var storageKey = 'yehd2015-ctf';

  var questionList = [];
  var userInfo = {};

  loadQuestionList()
    .then(formSettings)
    .then(loadUserInfo);

  function loadQuestionList() {
    return fetch('./questionList.json')
      .then(function(res) { return res.json(); })
      .then(function(json) {
        questionList = json.map(function(f) { return f.split('-'); })
          .map(function(a) { return a.concat(a.splice(1).join('-')); })
          .map(function(a) { return {
            point: parseInt(a[0], 10),
            name: a[1],
            question: a.join('-')
          }; });
        return questionList;
      })
      .then(function(list) {
        var $qListContainer = $('main#qList');
        var source = $('template', $qListContainer).html();
        var template = Handlebars.compile(source);
        list.forEach(function(qInfo) {
          var $panel = $(template(qInfo));
          $('a.toggle-details', $panel).on('click', toggleDetails);
          $qListContainer.append($panel);
        });
      });
  }

  function formSettings() {
    $('form').on('submit', function(ev) {
      ev.preventDefault();
    });
    $('#qList .panel form').on('submit', submitCode);
  }

  function submitCode(ev) {
    var $button = $('button');
    var $target = $(ev.currentTarget);
    var $parent = $target.parent();
    $button.attr('disabled', true);
    $('.alert', $parent).hide(250);
    $('.alert-info', $parent).text('Pending.... Please Wait.').show(250);

    var code = $('textarea', $target).val();
    var lang = $('select#lang').val();

    var problemName = $target.data('question');
    var problemDataDir = './' + problemName + '/data/';

    var resToText = function (res) {
      if (res.ok) return res.text();
      else throw new Error(res.status);
    };

    var caseNum = 0;
    (function fetchQuestions(qList, caseNum) {
      caseNum++;
      var caseStr = (caseNum >= 10) ? '' + caseNum : '0' + caseNum;
      return Promise.all([
        fetch(problemDataDir + caseStr + '.q').then(resToText),
        fetch(problemDataDir + caseStr + '.ans').then(resToText),
      ])
      .then(function (res) {
        qList.push({ input: res[0], output: res[1] });
        return fetchQuestions(qList, caseNum);
      })
      .catch(function (err) {
        if (qList.length !== 0) return qList;
        else throw err;
      });
    })([], 0)
    .then(function postToPaiza (qList) {

      function main (result) {
        var q = qList.shift();
        if (!q) return Promise.resolve(result);
        return paiza(lang, code, q.input)
          .then(judgeStatus.bind(null, q))
          .then((result) => {
            if (result.status !== 'AC') return result;
            else return main(result);
          });
      }

      var parallel = [];
      for (var i = 0; i < parallelNum; i++) {
        parallel.push(main());
      }
      return Promise.all(parallel);
    })
    .then(function(results) {
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        if (results[i].status === 'AC') continue;
        $('.alert', $parent).hide(250);
        $('.alert-warning', $parent).empty()
          .append($('<span>').text('Failed. Status is '))
          .append($('<span>').addClass('label label-default').text(results[i].status))
          .show(250);
        return;
      }

      var score = parseInt(problemName.split('-')[0], 10);
      userInfo.score += score;
      userInfo.submit.push({
        question: problemName,
        score: score
      });
      $('.alert', $parent).hide(250);
      $('.alert-info', $parent).text('Accept!').show(250);
    })
    .catch(function(err) {
      console.error(err.stack || err);
      $('.alert', $parent).hide(250);
      $('.alert-warning', $parent).text(err.message).show(250);
    })
    .then(function() {
      $button.removeAttr('disabled');
    })
    .then(loadSubmitted);
  }

  function judgeStatus (q, res) {
    if (res.build_result === 'failure') {
      return { status: 'CE' };
    }
    if (res.time > LIMIT_TIME) {
      return { status: 'TLE' };
    }
    if (res.memory > LIMIT_MEM) {
      return { status: 'MLE' };
    }
    switch (res.result) {
      case 'failure': {
        return { status: 'RE' };
      }
      case 'timeout': {
        return { status: 'TLE' };
      }
      case 'success': {
        if (res.stdout === q.output) {
          return { status: 'AC' };
        } else {
          return { status: 'WA' };
        }
      }
    }
  }

  function loadUserInfo() {
    try {
      userInfo = JSON.parse(localStorage.getItem(storageKey));
    } catch (_e) {
      userInfo = {};
    }
    if (
      !userInfo || userInfo.constructor.name !== 'Object' ||
      !userInfo.submit || userInfo.submit.constructor.name !== 'Array' ||
      (userInfo.score == null) || userInfo.score.constructor.name !== 'Number'
    ) {
      userInfo = { score: 0, submit: [], lang: 'c' };
    }

    $('#lang').on('change', function(ev) {
      userInfo.lang = $(ev.currentTarget).val();
      saveUserInfo();
    });
    console.log(userInfo.lang);
    $('#lang').val(userInfo.lang);

    loadSubmitted();
  }

  function loadSubmitted() {
    var score = parseInt(userInfo.score || 0, 10);
    $('#userStatus').text('Your Score: ' + score + ' pts');
    $('#login').hide(0);

    $('.panel-title .label-info').hide(0);
    (userInfo.submit || []).forEach(function(sInfo) {
      $('.panel[data-question="' + sInfo.question + '"]')
        .find('.label-info').show(0);
    });
    saveUserInfo();
  }

  function saveUserInfo() {
    localStorage.setItem(storageKey, JSON.stringify(userInfo));
  }

  function toggleDetails(ev) {
    ev.preventDefault();

    var $target = $(ev.currentTarget);
    var question = $target.data('question');
    var $details = $('.panel[data-question="' + question + '"] .details');
    if (!$details.isVisible()) {
      fetch('/' + question + '/README.md')
        .then(function(res) { return res.text(); })
        .then(function(md) {
          $details.html(md);
          return new Promise(function(resolve) {
            this.resolve = resolve;
            MathJax.Hub.Queue(
              ['Typeset', MathJax.Hub, $details[0]],
              ['resolve', this]
            );
          });
        })
        .then(function() {
          var renderer = new marked.Renderer();
          (function() {
            var link = renderer.link.bind(renderer);
            renderer.link = function(href, title, text) {
              if (!href.match(/^http/)) href = '/' + question + '/' + href;
              return link(href, title, text);
            };
            var image = renderer.image.bind(renderer);
            renderer.image = function(href, title, text) {
              if (!href.match(/^http/)) href = '/' + question + '/' + href;
              return image(href, title, text);
            };
          })();
          $details.html(marked($details.html() + '\n\n----', {
            sanitize: false, renderer: renderer
          }));
          $('a', $details).attr({ target: '_blank' });
          $details.show(500);
        });
    } else {
      $details.hide(500);
    }
  }

});
