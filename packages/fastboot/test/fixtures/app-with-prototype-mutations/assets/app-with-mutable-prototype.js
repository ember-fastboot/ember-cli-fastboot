'use strict';



;define("app-with-mutable-prototype/app", ["exports", "app-with-mutable-prototype/resolver", "ember-load-initializers", "app-with-mutable-prototype/config/environment"], function (_exports, _resolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
  var _default = App;
  _exports.default = _default;
});
;define("app-with-mutable-prototype/controllers/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class ApplicationController extends Ember.Controller {
    init() {
      super.init();
      this.someArray.push('foo');
    }

  }

  _exports.default = ApplicationController;
  ApplicationController.prototype.someArray = [];
});
;define("app-with-mutable-prototype/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }

  };
  _exports.default = _default;
});
;define("app-with-mutable-prototype/instance-initializers/clear-double-boot", ["exports", "ember-cli-fastboot/instance-initializers/clear-double-boot"], function (_exports, _clearDoubleBoot) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _clearDoubleBoot.default;
    }
  });
});
;define("app-with-mutable-prototype/locations/none", ["exports", "ember-cli-fastboot/locations/none"], function (_exports, _none) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _none.default;
    }
  });
});
;define("app-with-mutable-prototype/resolver", ["exports", "ember-resolver"], function (_exports, _emberResolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberResolver.default;
  _exports.default = _default;
});
;define("app-with-mutable-prototype/router", ["exports", "app-with-mutable-prototype/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });
  Router.map(function () {});
  var _default = Router;
  _exports.default = _default;
});
;define("app-with-mutable-prototype/services/fastboot", ["exports", "ember-cli-fastboot/services/fastboot"], function (_exports, _fastboot) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _fastboot.default;
    }
  });
});
;define("app-with-mutable-prototype/templates/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "OVrv+M2j",
    "block": "{\"symbols\":[],\"statements\":[[0,\"Items: \"],[1,[23,0,[\"someArray\",\"length\"]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "app-with-mutable-prototype/templates/application.hbs"
    }
  });

  _exports.default = _default;
});
;

;define('app-with-mutable-prototype/config/environment', [], function() {
  if (typeof FastBoot !== 'undefined') {
return FastBoot.config('app-with-mutable-prototype');
} else {
var prefix = 'app-with-mutable-prototype';try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

}
});

;
if (typeof FastBoot === 'undefined') {
  if (!runningTests) {
    require('app-with-mutable-prototype/app')['default'].create({});
  }
}

//# sourceMappingURL=app-with-mutable-prototype.map
