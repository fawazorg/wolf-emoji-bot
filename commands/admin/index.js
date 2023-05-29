import Add from './add.js';
import Delete from './delete.js';
import Status from './stats.js';
import Help from './help.js';
import Solve from './solve.js';
import Default from './default.js';
import Count from './count.js';
import Refresh from './refresh.js';
import ContactAdd from './AddContact.js';

const Commands = [Add, Delete, Solve, Help, Status, Refresh, ContactAdd, Count];

Default.children = Commands;

export default Default;
