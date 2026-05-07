import * as migration_20260507_131047 from './20260507_131047';
import * as migration_20260507_132052 from './20260507_132052';

export const migrations = [
  {
    up: migration_20260507_131047.up,
    down: migration_20260507_131047.down,
    name: '20260507_131047',
  },
  {
    up: migration_20260507_132052.up,
    down: migration_20260507_132052.down,
    name: '20260507_132052'
  },
];
