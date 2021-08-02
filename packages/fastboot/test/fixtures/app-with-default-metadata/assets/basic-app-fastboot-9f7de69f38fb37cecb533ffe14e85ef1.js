define("~fastboot/app-factory",["basic-app/app","basic-app/config/environment"],(function(e,t){return e=e.default,t=t.default,{default:function(){return e.create(t.APP)}}})),define("basic-app/initializers/ajax",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
var t=Ember.get,i=function(e){var i=t(this,"fastboot.request.protocol")
if(/^\/\//.test(e.url))e.url=i+e.url
else if(!/^https?:\/\//.test(e.url))try{e.url=i+"//"+t(this,"fastboot.request.host")+e.url}catch(a){throw new Error("You are using Ember Data with no host defined in your adapter. This will attempt to use the host of the FastBoot request, which is not configured for the current host of this request. Please set the hostWhitelist property for in your environment.js. FastBoot Error: "+a.message)}if(!najax)throw new Error("najax does not seem to be defined in your app. Did you override it via `addOrOverrideSandboxGlobals` in the fastboot server?")
najax(e)},a={name:"ajax-service",initialize:function(e){e.register("ajax:node",i,{instantiate:!1}),e.inject("adapter","_ajaxRequest","ajax:node"),e.inject("adapter","fastboot","service:fastboot")}}
e.default=a})),define("basic-app/initializers/cat",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
var t={name:"cat",initialize:function(e){console.log("I got a cat")}}
e.default=t})),define("basic-app/initializers/error-handler",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
var t={name:"error-handler",initialize:function(){Ember.onerror||(Ember.onerror=function(e){var t="There was an error running your app in fastboot. More info about the error: \n ".concat(e.stack||e)
console.error(t)})}}
e.default=t})),define("basic-app/initializers/initializer",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
e.default={name:"initialize",initialize:function(){return"But I warn you, if you don't tell me that this means war,\n            if you still try to defend the infamies and horrors perpetrated by that\n            Antichrist--I really believe he is Antichrist--I will have nothing more\n            to do with you and you are no longer my friend, no longer my 'faithful\n            slave,' as you call yourself!"}}})),define("basic-app/instance-initializers/initializer",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
e.default={name:"instant-initialize",initialize:function(){return"It was in July, 1805, and the speaker was the well-known Anna Pavlovna\n            Scherer, maid of honor and favorite of the Empress Marya Fedorovna."}}})),define("basic-app/instance-initializers/setup-fetch",["exports","fetch"],(function(e,t){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
var i={name:"fetch",initialize:function(e){var i=e.lookup("service:fastboot");(0,t.setupFastboot)(i.get("request"))}}
e.default=i}))
