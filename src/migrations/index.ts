import * as migration_20260519_075452 from './20260519_075452';
import * as migration_20260521_091237_event-categories from './20260521_091237_event-categories';
import * as migration_20260602_151020 from './20260602_151020';
import * as migration_20260604_000000_news-events-html from './20260604_000000_news-events-html';
import * as migration_20260605_000000_layout-json from './20260605_000000_layout-json';
import * as migration_20260606_000000_site-settings-logo from './20260606_000000_site-settings-logo';
import * as migration_20260612_000000_working-copies from './20260612_000000_working-copies';
import * as migration_20260612_155518 from './20260612_155518';

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
    name: '20260602_151020',
  },
  {
    up: migration_20260604_000000_news-events-html.up,
    down: migration_20260604_000000_news-events-html.down,
    name: '20260604_000000_news-events-html',
  },
  {
    up: migration_20260605_000000_layout-json.up,
    down: migration_20260605_000000_layout-json.down,
    name: '20260605_000000_layout-json',
  },
  {
    up: migration_20260606_000000_site-settings-logo.up,
    down: migration_20260606_000000_site-settings-logo.down,
    name: '20260606_000000_site-settings-logo',
  },
  {
    up: migration_20260612_000000_working-copies.up,
    down: migration_20260612_000000_working-copies.down,
    name: '20260612_000000_working-copies',
  },
  {
    up: migration_20260612_155518.up,
    down: migration_20260612_155518.down,
    name: '20260612_155518'
  },
];
