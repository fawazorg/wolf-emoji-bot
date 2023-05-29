import Default from './default.js';
import Next from './next.js';
import Join from './join.js';
import Help from './help.js';
import Score from './score.js';
import GScore from './GlobalScore.js';
import Auto from './auto.js';
import Status from './status.js';
import Admin from './admin/index.js';

const Commands = [Next, Join, Auto, Status, GScore, Score, Help, Admin];

Default.children = Commands;

export default Default;
