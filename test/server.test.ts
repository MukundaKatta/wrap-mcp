import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { wrap } from '../src/server.js';

test('does not wrap short lines', () => {
  assert.equal(wrap('hello world', { width: 80 }), 'hello world');
});

test('wraps at word boundary', () => {
  const out = wrap('one two three four five', { width: 10 });
  const lines = out.split('\n');
  for (const l of lines) assert.ok(l.length <= 10);
});

test('preserves existing newlines as paragraph breaks', () => {
  const out = wrap('one\ntwo\n', { width: 80 });
  assert.equal(out, 'one\ntwo\n');
});

test('breaks long words by default', () => {
  const out = wrap('abcdefghijklmnop', { width: 5 });
  const lines = out.split('\n');
  for (const l of lines) assert.ok(l.length <= 5);
});

test('does not break long words when break_long_words=false', () => {
  const out = wrap('abcdefghijklmnop', { width: 5, break_long_words: false });
  assert.equal(out, 'abcdefghijklmnop');
});

test('rejects width < 1', () => {
  assert.throws(() => wrap('x', { width: 0 }));
});

test('rejects non-integer width', () => {
  assert.throws(() => wrap('one two three', { width: 7.5 }));
  assert.throws(() => wrap('one two three', { width: Number.NaN }));
});

test('rejects non-string text', () => {
  // @ts-expect-error intentionally passing a non-string
  assert.throws(() => wrap(42, { width: 10 }));
});

test('defaults width to 80 when omitted', () => {
  const long = 'word '.repeat(30).trim();
  const out = wrap(long);
  for (const l of out.split('\n')) assert.ok(l.length <= 80);
});

test('wraps each paragraph independently', () => {
  const out = wrap('alpha beta gamma\ndelta epsilon zeta', { width: 11 });
  assert.equal(out, 'alpha beta\ngamma\ndelta\nepsilon\nzeta');
});

test('collapses internal whitespace runs to a single space when wrapping', () => {
  const out = wrap('aa  bb cccccc dd', { width: 8 });
  assert.equal(out, 'aa bb\ncccccc\ndd');
});
