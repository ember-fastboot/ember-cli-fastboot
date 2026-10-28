import { modifier } from 'ember-modifier';

const decorateDocument = modifier(() => {
  document.documentElement.lang = 'en';
  document.body.classList.add('from-app');
});

const head = () => document.head;

<template>
  {{#in-element (head) insertBefore=null}}
    <meta name="from-app" content="yes" />
  {{/in-element}}

  <h1 {{decorateDocument}}>Document</h1>
</template>
