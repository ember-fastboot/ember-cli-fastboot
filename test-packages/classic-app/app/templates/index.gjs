import pageTitle from 'ember-page-title/helpers/page-title';
import Counter from '../components/counter';

const currentPath = () => window.location.pathname;

<template>
  {{pageTitle "Home"}}

  <h1>Welcome</h1>
  <p id="location">{{currentPath}}</p>
  <Counter />
</template>
