export * from './utils';

import { minimist } from '@pyramation/minimist';
import { getMinimistOpts, processArgs, processArgPaths } from './utils';

export default (questions, ...payload) => {
  const opts = getMinimistOpts(questions);
  const argv = processArgs(questions, minimist(payload || [], opts));
  processArgPaths(questions, argv);
  // TODO add option for validateArgs
  return argv;
};
