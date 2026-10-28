import { describe, expect, test } from 'vitest';

import { FastBootHeaders, FastBootInfo, FastBootRequest } from '../packages/fastboot/src/info.js';

const request = {
  method: 'GET',
  url: '/photos?page=2&sort=new',
  protocol: 'https',
  headers: { host: 'example.com', cookie: 'a=1; b="two%20words"; a=ignored', accept: ['text/html', 'text/plain'] },
};

describe('FastBootRequest', () => {
  test('the parts of the request', () => {
    let fastbootRequest = new FastBootRequest(request, ['example.com']);

    expect(fastbootRequest.method).toBe('GET');
    expect(fastbootRequest.path).toBe('/photos?page=2&sort=new');
    expect(fastbootRequest.protocol).toBe('https:');
    expect(fastbootRequest.queryParams).toEqual({ page: '2', sort: 'new' });
    expect(fastbootRequest.cookies).toEqual({ a: '1', b: 'two words' });
    expect(fastbootRequest.headers.getAll('accept')).toEqual(['text/html', 'text/plain']);
  });

  test('host is the Host header when it matches allowedHosts', () => {
    expect(new FastBootRequest(request, ['example.com']).host).toBe('example.com');
    expect(new FastBootRequest(request, [/\.com$/]).host).toBe('example.com');
    expect(new FastBootRequest(request, ['/^example\\.(com|org)$/']).host).toBe('example.com');
  });

  test('host throws when it does not match allowedHosts, or when there is no allowedHosts', () => {
    expect(() => new FastBootRequest(request, ['other.com']).host).toThrow('does not match');
    expect(() => new FastBootRequest(request, undefined).host).toThrow('allowedHosts');
  });
});

test('FastBootHeaders names are case-insensitive', () => {
  let headers = new FastBootHeaders({ 'Content-Type': 'text/html' });

  headers.append('Set-Cookie', 'a=1');
  headers.append('set-cookie', 'b=2');

  expect(headers.get('content-type')).toBe('text/html');
  expect(headers.getAll('SET-COOKIE')).toEqual(['a=1', 'b=2']);
  expect(Array.from(headers.entries())).toEqual([
    ['content-type', 'text/html'],
    ['set-cookie', 'a=1'],
    ['set-cookie', 'b=2'],
  ]);
  expect(headers.toJSON()).toEqual({ 'content-type': ['text/html'], 'set-cookie': ['a=1', 'b=2'] });
});

test('FastBootInfo.settled waits for promises that were deferred while it waited', async () => {
  let info = new FastBootInfo({});
  let steps = [];

  info.deferRendering(
    Promise.resolve().then(() => {
      steps.push('first');
      info.deferRendering(new Promise((resolve) => setTimeout(resolve, 10)).then(() => steps.push('second')));
    }),
  );

  await info.settled();

  expect(steps).toEqual(['first', 'second']);
});
