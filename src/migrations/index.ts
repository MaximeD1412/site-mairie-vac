import * as migration_20260519_075452 from './20260519_075452';
import * as migration_20260521_091237_event_categories from './20260521_091237_event-categories';

export const migrations = [
  {
    up: migration_20260519_075452.up,
    down: migration_20260519_075452.down,
    name: '20260519_075452'
  },
  {
    up: migration_20260521_091237_event_categories.up,
    down: migration_20260521_091237_event_categories.down,
    name: '20260521_091237_event-categories'
  },
];
