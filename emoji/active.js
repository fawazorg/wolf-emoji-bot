import Group from './model/group.js';

const setLastActive = async (id) => {
  await Group.findOneAndUpdate({ id }, { lastActiveAt: new Date() }, { upsert: true });
};

const getInactiveGroups = async (daysPass) => {
  return Group.aggregate([
    {
      $project: {
        id: '$id',
        days: {
          $dateDiff: {
            startDate: '$lastActiveAt',
            endDate: '$$NOW',
            unit: 'day'
          }
        }
      }
    },
    { $match: { days: { $gt: daysPass } } }
  ]);
};

const deleteGroup = async (id) => {
  await Group.findOneAndDelete({ id });
};

/**
 *
 * @param {import('wolf.js').WOLF} client
 */
const refreshUnsetGroup = async (client) => {
  const groups = await client.group.list();

  return groups.reduce(async (pv, group) => {
    const names = await pv;

    await setLastActive(group.id);

    return [...names, `[${group.name}]`];
  }, []);
};

export { setLastActive, getInactiveGroups, refreshUnsetGroup, deleteGroup };
