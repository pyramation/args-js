import { join } from './path';

const parseType = (m, type, question) => {
  if (type === 'string') {
    m.string.push(question.name);
  } else if (type === 'path') {
    m.string.push(question.name);
  } else if (type === 'boolean') {
    m.boolean.push(question.name);
  } else if (type === 'array') {
    return parseType(m, question.items.type, question);
  }
  return m;
};

const getMinimistOpts = questions =>
  questions.reduce(
    (m, question) => {
      if (question.hasOwnProperty('alias')) {
        m.alias[question.alias] = question.name;
      }
      return parseType(m, question.type, question);
    },
    { alias: {}, boolean: [], string: [] }
  );

const processPositionalArgs = (questions = [], argv = { _: [] }) => {
  const _questions = questions.filter(
    q => q.hasOwnProperty('_') && typeof argv[q.name] === 'undefined'
  );

  const types = _questions.map(q => q.type);

  const arrayOccurences = types.reduce(
    (m, v) => (v === 'array' ? m + 1 : m),
    0
  );

  if (arrayOccurences > 1) {
    throw new Error('cannot have more than one array');
  }

  const argLength = argv._.length;
  const len = types.length - arrayOccurences;

  const args = types.map(q =>
    q === 'array' ? Math.max(1, argLength - len) : 1
  );

  const ranges = args.reduce(
    (m, v, i) =>
      i === 0 ? m.concat([[0, v]]) : m.concat([[m[i - 1][1], m[i - 1][1] + v]]),
    []
  );

  const max = ranges.length ? ranges[ranges.length - 1][1] : 0;

  // if (max < argv._.length)  /* too many positional arguments */
  // else if (max > argv._.length) /* not enough positional arguments */

  const arr = argv._.splice(0, max);
  ranges.forEach((range, i) => {
    const question = _questions[i];
    const value = Array.prototype.slice.apply(arr, range);
    argv[question.name] = question.type === 'array' ? value : value[0];
  });

  return argv;
};

const processFilteredArgs = (questions = [], argv = { _: [] }) => {
  // now run the filter command if on any questions
  questions
    .filter(q => q.hasOwnProperty('filter') && typeof q.filter === 'function')
    .forEach(question => {
      argv[question.name] =
        argv[question.name] instanceof Array
          ? argv[question.name].map(question.filter)
          : question.filter(argv[question.name]);
    });

  return argv;
};

const processArrayArgs = (questions = [], argv = { _: [] }) => {
  //  arrays here
  questions
    .filter(q => q.type === 'array')
    .forEach(question => {
      argv[question.name] =
        argv[question.name] instanceof Array
          ? argv[question.name]
          : [argv[question.name]];
    });

  return argv;
};

const processDefaultArgs = (questions = [], argv = { _: [] }) => {
  //  defaults here

  questions
    .filter(q => typeof q.default !== 'undefined' || q.type === 'boolean')
    .map(q => (typeof q.default !== 'undefined' ? q : { ...q, default: false }))
    .forEach(question => {
      const n = question.name;
      argv[n] =
        argv[n] instanceof Array
          ? argv[n].length
            ? argv[n]
            : [question.default]
          : typeof argv[n] !== 'undefined'
          ? argv[n]
          : question.default;
    });

  return argv;
};

const processArgs = (questions = [], argv = { _: [] }) => {
  processPositionalArgs(questions, argv);
  processDefaultArgs(questions, argv);
  processFilteredArgs(questions, argv);
  processArrayArgs(questions, argv);
  return argv;
};

const validateArgs = (questions = [], argv = { _: [] }) => {
  questions
    .filter(q => q.required)
    .forEach(question => {
      if (typeof argv[question.name] === 'undefined') {
        throw new Error(`${question.name} is required`);
      } else if (question.type === 'array') {
        if (
          argv[question.name] instanceof Array &&
          !argv[question.name].length
        ) {
          throw new Error(`${question.name} is required`);
        }
      }
    });
};

const resolvePath = function(path = '.', cwd = '/') {
  return path.startsWith('/') ? path : join(cwd, path);
};

const processArgPaths = (questions = [], argv = { _: [] }, cwd = '/') => {
  questions
    .filter(
      q => q.type === 'path' || (q.type === 'array' && q.items.type === 'path')
    )
    .forEach(question => {
      argv[question.name] =
        question.type === 'array'
          ? argv[question.name].map(path => resolvePath(path, cwd))
          : argv[question.name]
          ? resolvePath(argv[question.name], cwd)
          : undefined;
    });

  return argv;
};

export {
  getMinimistOpts,
  processArgs,
  processArgPaths,
  validateArgs,
  processArrayArgs,
  processFilteredArgs,
  processPositionalArgs
};
