import test from 'ava';
import { normalizePath, parsePath } from './path';

test('normalizePath: a', (t) => {
  t.is(normalizePath('a'), 'a');
});

test('normalizePath: a/b', (t) => {
  t.is(normalizePath('a/b'), 'a/b');
});

test('normalizePath: /a/b', (t) => {
  t.is(normalizePath('a/b'), 'a/b');
});

test('parseName: should return path info', (t) => {
  t.deepEqual(parsePath('a'), { dirname: '', path: 'a', filename: 'a' });
  t.deepEqual(parsePath('a/'), { dirname: '', path: 'a', filename: 'a' });
  t.deepEqual(parsePath('a/b'), { dirname: 'a', path: 'a/b', filename: 'b' });
  t.deepEqual(parsePath('/a/b'), { dirname: '/a', path: '/a/b', filename: 'b' });
  t.deepEqual(parsePath('/a/b/'), { dirname: '/a', path: '/a/b', filename: 'b' });
  t.deepEqual(parsePath('/a/b/c'), { dirname: '/a/b', path: '/a/b/c', filename: 'c' });
});
