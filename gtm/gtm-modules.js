  function closest(elm, seletor) {
    if ('closest' in elm) return elm.closest(seletor);
    if (typeof jQuery === 'function') return jQuery(elm).closest(seletor)[0];

    var parent = elm.parentNode;

    while (parent != document) {
      if (matches(parent, seletor)) {
        return parent;
      }
      parent = parent.parentNode;
    }
    return undefined;
  }
  function getCookie(key) {
    key = ('; ' + key + '=');
    var cookie = ('; ' + document.cookie);
    var index = cookie.indexOf(key);
    var end;
    if (index === -1) {
      return '';
    }
    cookie = cookie.substring(index + key.length);
    end = cookie.indexOf(';');
    return window.unescape(end === -1 ? cookie : cookie.substring(0, end));
  }

  function setCookie(name, value, opts) {
    var exdate, cookie;
    opts = opts || {};

    cookie = name + "=" + window.escape(value);
    if (opts.exdays) {
      exdate = new Date();
      exdate.setDate(exdate.getDate() + opts.exdays);
      cookie += "; expires=" + exdate.toUTCString();
    }
    if (opts.domain) {
      cookie += "; domain=" + opts.domain;
    }
    cookie += "; path=" + (opts.path || '/');
    return (document.cookie = cookie);
  }

  function cookie(name, value, opts) {
    if (typeof value === 'undefined')
      return getCookie(name);

    return setCookie(name, value, opts);
  }

  function delegate(id, event, selector, oldHandler, parent) {
    if (typeof jQuery === "function") {
      var elm = jQuery(parent || document);
      var handler = safeFn(id, oldHandler, {
        event: event,
        selector: selector,
        immediate: false
      });
      if (typeof elm.on === "function") {
        return elm.on(event, selector, handler);
      } else if (typeof elm.delegate === "function") {
        return elm.delegate(selector, event, handler);
      }
    }

    var method;

    if (typeof parent === 'string') {
      parent = document.querySelectorAll(parent);
    }

    if (typeof document.addEventListener === "function") {
      method = "addEventListener";
    } else {
      method = "attachEvent";
      event = "on" + event;
    }

    function handler(e) {
      for (var target = e.target; target && target != this; target = target.parentNode) {
        if (matches(target, selector)) {
          var handler = safeFn(id, oldHandler, {
            event: event,
            selector: selector,
            immediate: false
          });
          handler.call(target, e);
          break;
        }
      }
    }

    if (Object.prototype.toString.call(parent) === '[object NodeList]') {
      for (var parentIndex = 0; parentIndex <= parent.length - 1; parentIndex++) {
        (parent[parentIndex] || document)[method](event, handler, false);
      }
    } else {
      (parent || document)[method](event, handler, false);
    }
  }

  function find(parent, sel) {
    return parent.querySelectorAll(sel);
  }

  function flatten(arrs) {
    var currentArray, currentElement, i, j;
    var result = [];

    if (arrs.length === 1) return arrs[0];

    while (arrs.length > 0) {
      currentArray = arrs.shift();
      for (i = 0; currentArray.length > i; i++) {
        currentElement = currentArray[i];
        j = 0;
        while (j < result.length && currentElement !== result[j]) {
          j += 1;
        }
        if (j === result.length) result.push(currentElement);
      }
    }

    return result;
  }
  function getKey(key, opt_root) {
    if (!key || typeof key !== 'string') return undefined;

    var result = opt_root || window;
    var splitKey = key.split('.');

    for (var i = 0; i < splitKey.length && result != null; i++) {
      if (result.hasOwnProperty(splitKey[i])) {
        result = result[splitKey[i]];
      } else {
        return undefined;
      }
    }
    return result;
  }
  function hasClass(e, className) {
    if ('classList' in e) return e.classList.contains(className);

    return new RegExp('\\b' + className + '\\b').test(e.className);
  }

  function init(opt_options) {
    window[options.helperName] = undefined;
    options = merge(options, opt_options);
    window[options.helperName] = window[options.helperName] || {};
    window[options.helperName].options = options;
    expose();
  }

  function internalMap(elms, func, exArgs) {
    var ret = [];
    var elm, args;
    for (var index = 0; index < elms.length; index++) {
      elm = elms[index];
      if (elm instanceof HTMLElement === false) throw 'internalMap: Esperado elemento HTML';
      args = [elm].concat(exArgs);
      ret.push(func.apply(this, args));
    }
    return ret;
  }

  function matches(elm, seletor) {
    if ('matches' in elm) return elm.matches(seletor);
    if (typeof jQuery === "function") return jQuery(elm).is(seletor);
    var elms = elm.parentNode.querySelectorAll(seletor);

    for (var i = 0; i < elms.length; i++) {
      if (elms[i] === elm) {
        return true;
      }
    }
    return false;
  }

  function has(obj, key) {
    return hasOwnProperty.call(obj, key);
  }

  function merge(obj, obj2) {
    if (obj2) {
      for (var key in obj2) {
        if (has(obj2, key)) {
          obj[key] = obj2[key];
        }
      }
    }
    return obj;
  }

  function on(id, event, selector, oldCallback, parent) {
    if (parent) {
      delegate(id, event, selector, oldCallback, parent);
    } else {
      var elm;
      var callback;
      if (typeof jQuery === "function") {
        elm = window.jQuery(selector);
        callback = safeFn(id, oldCallback, {
          isLocal: true,
          event: event,
          selector: selector,
          immediate: false,
          elm: elm
        });
        if (typeof elm.on === "function") {
          return elm.on(event, callback);
        } else if (typeof elm.bind === "function") {
          return elm.bind(event, callback);
        }
      }

      var array;
      if (typeof selector === "string") {
        array = document.querySelectorAll(selector);
      } else if (typeof selector.length === "undefined" || selector === window) {
        array = [selector];
      } else {
        array = selector;
      }

      for (var count = 0; count < array.length; count++) {
        elm = array[count];
        callback = safeFn(id, oldCallback, {
          isLocal: true,
          event: event,
          selector: selector,
          immediate: false,
          elm: elm
        });
        if (typeof elm.addEventListener === "function") {
          elm.addEventListener(event, callback);
        } else {
          elm.attachEvent("on" + event, callback);
        }
      }
    }
  }

  function push(obj, id) {
    var info = {
      'object': obj,
      'tag': id
    };
    if (options.debug) {
      log.info(info);
    }

    window[options.dataLayerName].push(obj);
  }

  function reduceBool(arr) {
    for (var i = 0; i < arr.length; i++) {
      var elm = arr[i];
      if (typeof elm === "boolean") {
        if (elm) {
          return true;
        }
      } else {
        throw "Esperado boolean";
      }
    }
    return false;
  }

  function reduceString(arr) {
    var ret = '';
    for (var i = 0; i < arr.length; i++) {
      var elm = arr[i];
      if (typeof elm === "string") {
        ret += elm;
      } else {
        throw "Esperado texto";
      }
    }
    return ret;
  }

  function sanitize(str, capitalized) {
    var split, i;
    if (!str) return '';

    str = str.toLowerCase()
      .replace(/^\s+/, '')
      .replace(/\s+$/, '')
      .replace(/\s+/g, '_')
      .replace(/[áàâãåäæª]/g, 'a')
      .replace(/[éèêëЄ€]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõöøº]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç¢©]/g, 'c')
      .replace(/[^a-z0-9_\-]/g, '_');

    if (capitalized) {
      split = str.split(/_+/g);
      for (i = 0; i < split.length; i++) {
        if (split[i]) split[i] = split[i][0].toUpperCase() + split[i].slice(1);
      }
      return split.join('');
    }

    return str.replace(/_+/g, '_');
  }

  function text(elm, opt) {
    var text = '';
    if (opt && opt.onlyFirst) {
      var children = elm.childNodes;

      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType === 3) {
          text += children[i].nodeValue;
        }
      }
    } else {
      text = elm.innerText || elm.textContent || elm.innerHTML.replace(/<[^>]+>/g, '');
    }
    return (opt && opt.sanitize) ? sanitize(text) : text;
  }
  function event(category, action, label, value, object, id) {
    try {
      if (options.sentPageview === false && options.waitQueue) {
        return options.eventQueue.push(arguments);
      }

      object = object || {};
      object.eventNoInteraction = object.eventNoInteraction || false;
      var obj = {
        category: category,
        action: action,
        label: label,
        object: object
      };
      if (id) {
        obj.tag = id;
      }
      log.info(obj);
      window[options.dataLayerName].push(merge({
        event: options.customNameEvent,
        eventCategory: category,
        eventAction: action,
        eventValue: value,
        eventLabel: label
      }, object));
    } catch (err) {
      log.info(err);
    }
  }
  function getDataLayer(key) {
    return window.google_tag_manager[options.containerID].dataLayer.get(key);
  }

  function localHelperFactory(id, args) {
    var localHelper = {
      event: function(category, action, label, value, object) {
        return event(category, action, label, value, object, id);
      },
      pageview: function(path, object) {
        return pageview(path, object, id);
      },
      safeFn: function(id, callback, opt) {
        return safeFn(id, callback, opt);
      },
      on: function(event, selector, callback, parent) {
        return on(id, event, selector, callback, parent);
      },
      wrap: function(elm, func, params) {
        if (typeof elm === 'string') {
          elm = find(window.document, elm);
        } else if (elm instanceof HTMLElement) {
          elm = [elm];
        } else if ((elm instanceof Array || elm instanceof NodeList) === false) {
          throw 'wrap: Esperado receber seletor, elemento HTML, NodeList ou Array';
        }

        if (func && typeof func === 'function') {
          return internalMap(elm, func, params);
        }

        return {
          hasClass: function(className, reduce) {
            var arr = internalMap(elm, hasClass, [className]);
            if (reduce) {
              return reduceBool(arr);
            }
            return arr;
          },
          matches: function(selector, reduce) {
            var arr = internalMap(elm, matches, [selector]);
            if (reduce) {
              return reduceBool(arr);
            }
            return arr;
          },
          closest: function(selector) {
            return internalMap(elm, closest, [selector]);
          },
          text: function(opt) {
            var arr = internalMap(elm, text, [opt]);
            if (opt && opt.onlyText) {
              return reduceString(arr);
            }
            return arr;
          },
          find: function(sel) {
            var elms = internalMap(elm, find, [sel]);
            return localHelper.wrap(flatten(elms));
          },
          map: function(func, params) {
            return internalMap(elm, func, params);
          },
          nodes: elm
        };
      },
      push: function(obj) {
        return push(obj, id);
      },
      sanitize: sanitize,
      getDataLayer: getDataLayer,
      cookie: cookie,
      getKey: getKey,
      id: id,
      args: args,
      fn: fn
    };
    return localHelper;
  }
  function pageview(path, object, id) {
    try {
      var obj = {
        path: path,
        object: object
      };
      if (id) {
        obj.tag = id;
      }
      log.info(obj);
      window[options.dataLayerName].push(merge({
        event: options.customNamePageview,
        path: path
      }, object));
    } catch (err) {
      log.info(err);
    }
  }

  function safeFn(id, callback, opt) {
    opt = opt || {};
    var safe = function() {
      try {
        callback.call(this === window ? null : this, localHelperFactory(id, arguments, {
          id: id,
          event: (opt.event || undefined),
          selector: (opt.selector || undefined)
        }));
      } catch ($$e) {
        if (!options.debug) {
          if (Math.random() <= options.errorSampleRate) {
            window[options.dataLayerName].push({
              event: options.exceptionEvent,
              dataQuality: {
                category: options.exceptionCategory,
                action: id,
                label: String($$e),
                event: (opt.event || undefined),
                selector: (opt.selector || undefined)
              }
            });
          }
        } else {
          var logObj = {
            exception: $$e,
            tag: id,
            event: (opt.event || undefined),
            selector: (opt.selector || undefined)
          }
          console.warn('Exception: ', logObj);
        }
      }
    };

    return opt.immediate === false ? safe : safe();
  }