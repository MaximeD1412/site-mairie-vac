import * as migration_20260519_075452 from './20260519_075452';
import * as migration_20260521_091237_event_categories from './20260521_091237_event-categories';
import * as migration_20260602_151020 from './20260602_151020';
import * as migration_20260604_000000_news_events_html from './20260604_000000_news-events-html';
import * as migration_20260605_000000_layout_json from './20260605_000000_layout-json';

export const migrations = [
  {
    up: migration_20260519_075452.up,
    down: migration_20260519_075452.down,
    name: '20260519_075452',
  },
  {
    up: migration_20260521_091237_event_categories.up,
    down: migration_20260521_091237_event_categories.down,
    name: '20260521_091237_event-categories',
  },
  {
    up: migration_20260602_151020.up,
    down: migration_20260602_151020.down,
    name: '20260602_151020',
  },
  {
    up: migration_20260604_000000_news_events_html.up,
    down: migration_20260604_000000_news_events_html.down,
    name: '20260604_000000_news-events-html',
  },
  {
    up: migration_20260605_000000_layout_json.up,
    down: migration_20260605_000000_layout_json.down,
    name: '20260605_000000_layout-json',
  },
];
