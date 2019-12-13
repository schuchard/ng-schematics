import test from 'ava';
import { parsePath } from './path';

test('parseName: should return path info', (t) => {
  t.deepEqual(parsePath(''), { dirname: '', path: '', filename: '' });
  t.deepEqual(parsePath('a'), { dirname: '', path: 'a', filename: 'a' });
  t.deepEqual(parsePath('a/'), { dirname: '', path: 'a', filename: 'a' });
  t.deepEqual(parsePath('a/b'), { dirname: 'a', path: 'a/b', filename: 'b' });
  t.deepEqual(parsePath('/a/b'), { dirname: '/a', path: '/a/b', filename: 'b' });
  t.deepEqual(parsePath('/a/b/'), { dirname: '/a', path: '/a/b', filename: 'b' });
  t.deepEqual(parsePath('/a/b/c'), { dirname: '/a/b', path: '/a/b/c', filename: 'c' });
});
