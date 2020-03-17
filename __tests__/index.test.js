import {
  getMinimistOpts,
  processArgs,
  validateArgs,
  processPositionalArgs
} from '../src/utils';

import { minimist } from '@pyramation/minimist';

import cases from 'jest-in-case';

const questions = {
  strings: [
    {
      _: true,
      name: 'sources',
      type: 'array',
      items: {
        type: 'path'
      },
      required: true
    },
    {
      _: true,
      name: 'target',
      type: 'path',
      required: true
    },
    {
      name: 'recursive',
      type: 'boolean',
      default: false,
      alias: 'r'
    }
  ],
  booleans: [
    {
      _: true,
      name: 'flags',
      type: 'array',
      items: {
        type: 'boolean'
      }
    },
    {
      _: true,
      name: 'opt',
      type: 'string',
      alias: 'o',
      required: true
    }
  ],
  noUnderscores: [
    {
      name: 'sources',
      type: 'array',
      items: {
        type: 'path'
      },
      required: true
    },
    {
      name: 'target',
      type: 'path',
      required: true
    }
  ],
  cd: [
    {
      _: true,
      name: 'path',
      type: 'path',
      default: '/'
    }
  ],
  otherDefaults: [
    {
      _: true,
      name: 'a',
      type: 'string',
      default: '/'
    },
    {
      _: true,
      name: 'b',
      type: 'string',
      default: 'blastmeC'
    },
    {
      name: 'c',
      type: 'boolean'
    }
  ],
  ls: [
    {
      _: true,
      name: 'path',
      type: 'path',
      default: '.'
    },
    {
      name: 'long',
      type: 'boolean',
      default: false,
      alias: 'l'
    },
    {
      name: 'hidden',
      type: 'boolean',
      default: false,
      alias: 'a'
    }
  ],
  add: [
    {
      _: true,
      name: 'gitdir',
      type: 'path',
      description: 'git directory path',
      required: true
    },
    {
      _: true,
      name: 'dir',
      type: 'path',
      description: 'repository path',
      required: true
    },
    {
      _: true,
      name: 'filepath',
      type: 'path',
      description: 'filepath to add',
      required: true
    }
  ]
};

const commands = {
  strings: 'cp -r a b c d e',
  booleans: 'flags a b c d e',
  noUnderscores: 'cp --sources a --sources b --sources c --sources d --target e'
};

const singleValuesForArrays = {
  strings: 'cp -r a b',
  booleans: 'flags a a',
  noUnderscores: 'cp --sources d --target e'
};

cases(
  'argument parsing',
  options => {
    const opts = getMinimistOpts(questions[options.name]);
    expect(opts).toMatchSnapshot();
    const [_cmd, ...payload] = commands[options.name].split(' ');
    const argv = processArgs(questions[options.name], minimist(payload, opts));
    expect(argv).toMatchSnapshot();
  },
  [{ name: 'strings' }, { name: 'booleans' }, { name: 'noUnderscores' }]
);

cases(
  'missing required arguments',
  options => {
    const opts = getMinimistOpts(questions[options.name]);
    expect(opts).toMatchSnapshot();
    expect(() => {
      const argv = processArgs(questions[options.name], minimist([], opts));
      validateArgs(questions[options.name], argv);
    }).toThrow();
  },
  Object.keys(commands).map(name => ({ name }))
);

cases(
  'array casting',
  options => {
    const opts = getMinimistOpts(questions[options.name]);
    expect(opts).toMatchSnapshot();
    const [_cmd, ...payload] = singleValuesForArrays[options.name].split(' ');
    const argv = processArgs(questions[options.name], minimist(payload, opts));
    validateArgs(questions[options.name], argv);
    expect(argv).toMatchSnapshot();
  },
  [{ name: 'strings' }, { name: 'booleans' }, { name: 'noUnderscores' }]
);

cases(
  'ls',
  options => {
    const opts = getMinimistOpts(questions.ls);
    expect(opts).toMatchSnapshot();
    const [_cmd, ...payload] = options.name.split(' ');
    const argv = processArgs(questions.ls, minimist(payload, opts));
    validateArgs(questions.ls, argv);
    expect(argv).toMatchSnapshot();
  },
  [{ name: 'ls' }, { name: 'ls -la' }, { name: 'ls .' }]
);

const gitAdd = {
  flags: 'git-add --gitdir . --dir etc --filepath etc/terminal/.bash_history',
  noflag: 'git-add . etc etc/terminal/.bash_history',
  mixed0: 'git-add --gitdir . etc --filepath etc/terminal/.bash_history',
  mixed1: 'git-add --gitdir . etc etc/terminal/.bash_history',
  mixed2: 'git-add --gitdir . --dir etc etc/terminal/.bash_history',
  mixed3: 'git-add --gitdir . etc etc/terminal/.bash_history',
  mixed4: 'git-add . --dir etc etc/terminal/.bash_history',
  mixed5: 'git-add . --dir etc --filepath etc/terminal/.bash_history',
  mixed6: 'git-add . etc --filepath etc/terminal/.bash_history'
};

cases(
  'git-add',
  options => {
    const opts = getMinimistOpts(questions.add);
    const [_cmd, ...payload] = gitAdd[options.name].split(' ');
    const positional = processPositionalArgs(
      questions.add,
      minimist(payload, opts)
    );
    expect(positional).toEqual({
      _: [],
      dir: 'etc',
      filepath: 'etc/terminal/.bash_history',
      gitdir: '.'
    });
    const argv = processArgs(questions.add, minimist(payload, opts));
    validateArgs(questions.add, argv);
    expect(argv).toEqual({
      _: [],
      dir: 'etc',
      filepath: 'etc/terminal/.bash_history',
      gitdir: '.'
    });
  },
  Object.keys(gitAdd).map(name => ({ name }))
);

const changeDirectory = {
  noArgs: 'cd',
  args: 'cd a'
};

cases(
  'cd',
  options => {
    const opts = getMinimistOpts(questions.cd);
    const [_cmd, ...payload] = changeDirectory[options.name].split(' ');
    const mini = minimist(payload, opts);
    expect(mini).toMatchSnapshot();
    const positional = processPositionalArgs(
      questions.cd,
      minimist(payload, opts)
    );
    expect(positional).toMatchSnapshot();
    const argv = processArgs(questions.cd, minimist(payload, opts));
    validateArgs(questions.cd, argv);
    expect(argv).toMatchSnapshot();
  },
  Object.keys(changeDirectory).map(name => ({ name }))
);

const otherDefaults = {
  noArgs: 'cd',
  args: 'cd a'
};

cases(
  'defaults',
  options => {
    const opts = getMinimistOpts(questions.otherDefaults);
    const [_cmd, ...payload] = otherDefaults[options.name].split(' ');
    const mini = minimist(payload, opts);
    expect(mini).toMatchSnapshot();
    const positional = processPositionalArgs(
      questions.otherDefaults,
      minimist(payload, opts)
    );
    expect(positional).toMatchSnapshot();
    const argv = processArgs(questions.otherDefaults, minimist(payload, opts));
    validateArgs(questions.otherDefaults, argv);
    expect(argv).toMatchSnapshot();
  },
  Object.keys(otherDefaults).map(name => ({ name }))
);

const split = {
  commands: {
    noArgs: 'split',
    flag: 'split -d l',
    param: 'split --direction l',
    root: 'split yo --direction l'
  },
  args: [
    {
      _: true,
      name: 'root',
      type: 'string'
    },
    {
      name: 'direction',
      type: 'string',
      alias: 'd',
      filter: dir => {
        if (dir === 'u') return 'up';
        if (dir === 'd') return 'down';
        if (dir === 'l') return 'left';
        if (dir === 'r') return 'right';
        return dir;
      }
    },
    {
      name: 'locked',
      type: 'boolean',
      default: false,
      alias: 'l'
    },
    {
      name: 'targetable',
      type: 'boolean',
      default: true,
      alias: 't'
    },
    {
      name: 'closeable',
      type: 'boolean',
      default: true,
      alias: 'c'
    },
    {
      name: 'minWidth',
      type: 'number'
    },
    {
      name: 'maxWidth',
      type: 'number'
    },
    {
      name: 'minHeight',
      type: 'number'
    },
    {
      name: 'maxHeight',
      type: 'number'
    },
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'select',
      type: 'boolean',
      default: true,
      alias: 's'
    }
  ]
};

cases(
  'split',
  options => {
    const opts = getMinimistOpts(split.args);
    const [_cmd, ...payload] = split.commands[options.name].split(' ');
    const argv = processArgs(split.args, minimist(payload, opts));
    validateArgs(split.args, argv);
    expect(argv).toMatchSnapshot();
  },
  Object.keys(split.commands).map(name => ({ name }))
);
