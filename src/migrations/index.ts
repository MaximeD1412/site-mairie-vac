import * as migration_20260519_075452 from './20260519_075452';
import * as migration_20260521_091237_event-categories from './20260521_091237_event-categories';
import * as migration_20260602_151020 from './20260602_151020';

export const migrations = [
  {
    up: migration_20260519_075452.up,
    down: migration_20260519_075452.down,
    name: '20260519_075452',
  },
  {
    up: migration_20260521_091237_event-categories.up,
    down: migration_20260521_091237_event-categories.down,
    name: '20260521_091237_event-categories',
  },
  {
    up: migration_20260602_151020.up,
    down: migration_20260602_151020.down,
    name: '20260602_151020'
  },
];
