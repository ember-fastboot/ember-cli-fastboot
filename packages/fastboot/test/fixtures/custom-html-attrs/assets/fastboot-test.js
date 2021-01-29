"use strict";



define('fastboot-test/app', ['exports', 'fastboot-test/resolver', 'ember-load-initializers', 'fastboot-test/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var Application = Ember.Application;


  var App = Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('fastboot-test/components/set-html-class', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var Component = Ember.Component;
  var getOwner = Ember.getOwner;


  // cribbed from ember-wormhole
  function getDOM(context) {
    var renderer = context.renderer;

    if (!renderer._dom) {
      // pre glimmer2
      var container = getOwner ? getOwner(context) : context.container;
      var documentService = container.lookup('service:-document');

      if (documentService) {
        return documentService;
      }

      renderer = container.lookup('renderer:-dom');
    }

    if (renderer._dom && renderer._dom.document) {
      // pre Ember 2.6
      return renderer._dom.document;
    } else {
      throw new Error('ember-wormhole could not get DOM');
    }
  }

  function getHtmlElement(context) {
    return getDOM(context).documentElement;
  }

  exports.default = Component.extend({
    init: function init() {
      this._super.apply(this, arguments);
      var html = getHtmlElement(this);
      var attr = html.getAttribute('class');
      var name = this.get('name');
      if (attr) {
        var classList = attr.split(/\s+/);
        if (classList.indexOf(name) === -1) {
          classList.push(name);
          html.setAttribute('class', classList.join(' '));
        }
      } else {
        html.setAttribute('class', name);
      }
    }
  });
});
define('fastboot-test/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('fastboot-test/helpers/app-version', ['exports', 'fastboot-test/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  var version = _environment.default.APP.version;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (hash.hideSha) {
      return version.match(_regexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_regexp.shaRegExp)[0];
    }

    return version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define('fastboot-test/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('fastboot-test/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('fastboot-test/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'fastboot-test/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _config$APP = _environment.default.APP,
      name = _config$APP.name,
      version = _config$APP.version;
  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('fastboot-test/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('fastboot-test/initializers/data-adapter', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('fastboot-test/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('fastboot-test/initializers/export-application-global', ['exports', 'fastboot-test/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('fastboot-test/initializers/injectStore', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('fastboot-test/initializers/store', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('fastboot-test/initializers/transforms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('fastboot-test/instance-initializers/clear-double-boot', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "clear-double-boot",

    initialize: function initialize(instance) {
      if (typeof FastBoot === 'undefined') {
        var originalDidCreateRootView = instance.didCreateRootView;

        instance.didCreateRootView = function () {
          var elements = document.querySelectorAll(instance.rootElement + ' .ember-view');
          for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.parentNode.removeChild(element);
          }

          originalDidCreateRootView.apply(instance, arguments);
        };
      }
    }
  };
});
define("fastboot-test/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('fastboot-test/locations/none', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var computed = Ember.computed,
      _Ember$computed = Ember.computed,
      bool = _Ember$computed.bool,
      readOnly = _Ember$computed.readOnly,
      service = Ember.inject.service,
      get = Ember.get,
      getOwner = Ember.getOwner;


  var TEMPORARY_REDIRECT_CODE = 307;

  exports.default = Ember.NoneLocation.extend({
    implementation: 'fastboot',
    fastboot: service(),

    _config: computed(function () {
      return getOwner(this).resolveRegistration('config:environment');
    }),

    _fastbootHeadersEnabled: bool('_config.fastboot.fastbootHeaders'),

    _redirectCode: computed(function () {
      return get(this, '_config.fastboot.redirectCode') || TEMPORARY_REDIRECT_CODE;
    }),

    _response: readOnly('fastboot.response'),
    _request: readOnly('fastboot.request'),

    setURL: function setURL(path) {
      if (get(this, 'fastboot.isFastBoot')) {
        var response = get(this, '_response');
        var currentPath = get(this, 'path');
        var isInitialPath = !currentPath || currentPath.length === 0;

        if (!isInitialPath) {
          path = this.formatURL(path);
          var isTransitioning = currentPath !== path;

          if (isTransitioning) {
            var host = get(this, '_request.host');
            var redirectURL = '//' + host + path;

            response.statusCode = this.get('_redirectCode');
            response.headers.set('location', redirectURL);
          }
        }

        // for testing and debugging
        if (get(this, '_fastbootHeadersEnabled')) {
          response.headers.set('x-fastboot-path', path);
        }
      }

      this._super.apply(this, arguments);
    }
  });
});
define('fastboot-test/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('fastboot-test/router', ['exports', 'fastboot-test/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var EmberRouter = Ember.Router;


  var Router = EmberRouter.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {});

  exports.default = Router;
});
define('fastboot-test/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define('fastboot-test/services/fastboot', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var deprecate = Ember.deprecate,
      computed = Ember.computed,
      get = Ember.get,
      assert = Ember.assert;
  var deprecatingAlias = computed.deprecatingAlias,
      readOnly = computed.readOnly;


  var RequestObject = Ember.Object.extend({
    init: function init() {
      this._super.apply(this, arguments);

      var request = this.request;
      delete this.request;

      this.method = request.method;
      this.body = request.body;
      this.cookies = request.cookies;
      this.headers = request.headers;
      this.queryParams = request.queryParams;
      this.path = request.path;
      this.protocol = request.protocol;
      this._host = function () {
        return request.host();
      };
    },


    host: computed(function () {
      return this._host();
    })
  });

  var Shoebox = Ember.Object.extend({
    put: function put(key, value) {
      assert('shoebox.put is only invoked from the FastBoot rendered application', this.get('fastboot.isFastBoot'));
      assert('the provided key is a string', typeof key === 'string');

      var fastbootInfo = this.get('fastboot._fastbootInfo');
      if (!fastbootInfo.shoebox) {
        fastbootInfo.shoebox = {};
      }

      fastbootInfo.shoebox[key] = value;
    },
    retrieve: function retrieve(key) {
      if (this.get('fastboot.isFastBoot')) {
        var shoebox = this.get('fastboot._fastbootInfo.shoebox');
        if (!shoebox) {
          return;
        }

        return shoebox[key];
      }

      var shoeboxItem = this.get(key);
      if (shoeboxItem) {
        return shoeboxItem;
      }

      var el = document.querySelector('#shoebox-' + key);
      if (!el) {
        return;
      }
      var valueString = el.textContent;
      if (!valueString) {
        return;
      }

      shoeboxItem = JSON.parse(valueString);
      this.set(key, shoeboxItem);

      return shoeboxItem;
    }
  });

  var FastBootService = Ember.Service.extend({
    cookies: deprecatingAlias('request.cookies', { id: 'fastboot.cookies-to-request', until: '0.9.9' }),
    headers: deprecatingAlias('request.headers', { id: 'fastboot.headers-to-request', until: '0.9.9' }),
    isFastBoot: typeof FastBoot !== 'undefined',

    init: function init() {
      this._super.apply(this, arguments);

      var shoebox = Shoebox.create({ fastboot: this });
      this.set('shoebox', shoebox);
    },


    host: computed(function () {
      deprecate('Usage of fastboot service\'s `host` property is deprecated.  Please use `request.host` instead.', false, { id: 'fastboot.host-to-request', until: '0.9.9' });

      return this._fastbootInfo.request.host();
    }),

    response: readOnly('_fastbootInfo.response'),
    metadata: readOnly('_fastbootInfo.metadata'),

    request: computed(function () {
      if (!this.isFastBoot) return null;
      return RequestObject.create({ request: get(this, '_fastbootInfo.request') });
    }),

    deferRendering: function deferRendering(promise) {
      assert('deferRendering requires a promise or thennable object', typeof promise.then === 'function');
      this._fastbootInfo.deferRendering(promise);
    }
  });

  exports.default = FastBootService;
});
define("fastboot-test/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "6ODeLWMf", "block": "{\"symbols\":[],\"statements\":[[1,[25,\"set-html-class\",null,[[\"name\"],[\"it-works\"]]],false],[0,\"\\n\"],[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "fastboot-test/templates/application.hbs" } });
});
define("fastboot-test/templates/components/set-html-class", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kLdYPuaq", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1]],\"hasEval\":false}", "meta": { "moduleName": "fastboot-test/templates/components/set-html-class.hbs" } });
});


define('fastboot-test/config/environment', [], function() {
  if (typeof FastBoot !== 'undefined') {
return FastBoot.config('fastboot-test');
} else {
var exports = {'default': {"modulePrefix":"fastboot-test","environment":"development","rootURL":"/","locationType":"auto","EmberENV":{"FEATURES":{},"EXTEND_PROTOTYPES":{"Date":false}},"APP":{"name":"fastboot-test","version":"0.0.0+ed16c3c2"},"exportApplicationGlobal":true}};Object.defineProperty(exports, '__esModule', {value: true});return exports;
}
});


if (typeof FastBoot === 'undefined') {
  if (!runningTests) {
    require('fastboot-test/app')['default'].create({"name":"fastboot-test","version":"0.0.0+ed16c3c2"});
  }
}

define('~fastboot/app-factory', ['fastboot-test/app', 'fastboot-test/config/environment'], function(App, config) {
  App = App['default'];
  config = config['default'];

  return {
    'default': function() {
      return App.create(config.APP);
    }
  };
});

//# sourceMappingURL=fastboot-test.map
