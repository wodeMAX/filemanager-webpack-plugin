import path from 'path';

import { serial as test } from 'ava';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { mkdir, writeFile, existsSync } = fsFixtures(fixturesDir);

test.before(async () => {
  await mkdir('./testing');
});

test('should delete file when array of strings provided in delete function', async (t) => {
  await writeFile('./testing/deletable-file.js', '');

  const config = {
    onStart: {
      delete: ['./testing/deletable-file.js'],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/deletable-file.js');
  t.false(result);
  t.pass();
});

test('should support glob', async (t) => {
  await writeFile('./testing/deletable-file.js', '');
  await writeFile('./testing/deletable-file2.js', '');
  await writeFile('./testing/deletable-file3.js', '');

  const config = {
    onStart: {
      delete: ['./testing/*'],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.false(existsSync('./testing/deletable-file.js'));
  t.false(existsSync('./testing/deletable-file2.js'));
  t.false(existsSync('./testing/deletable-file3.js'));
  t.pass();
});

test('should fail webpack build when delete function receives anything other than an array of strings', async (t) => {
  const config = {
    onStart: {
      delete: [{ source: 'object instead of string' }],
    },
  };

  const compiler = getCompiler(fixturesDir);

  try {
    new FileManagerPlugin(config).apply(compiler);
  } catch {
    t.pass();
  }
});
