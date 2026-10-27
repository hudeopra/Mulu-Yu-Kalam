import * as migration_20261026_173520_init_blog_schema from './20261026_173520_init_blog_schema';

export const migrations = [
  {
    up: migration_20261026_173520_init_blog_schema.up,
    down: migration_20261026_173520_init_blog_schema.down,
    name: '20261026_173520_init_blog_schema'
  },
];
