#! /usr/bin/env node

import { Command } from 'commander/esm.mjs'
import chalk from 'chalk';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const packageConfig = require('../package.json')
// import packageConfig from '../package.json' assert { type: 'json' };

const program = new Command();

program.command('create <app-name>')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exists')
  .action((appName, cmd) => {
    console.log(appName, cmd);
  })

program.command('config [value]')
  .description('inspect and modify the config')
  .option('-g --get <path>', 'get value from option')
  .option('-s --set <path> <value>', 'set value')
  .option('-d --delete <path>', 'delete value from config')
  .option('-l --list', 'list all config options')
  .action((value, cmd) => {
    console.log(value, cmd);
  })

program.on('--help', () => {
  console.log(`
    Run ${chalk.cyan('promobx <command> --help')} show details
  `);
})

program.version(`promobx@${packageConfig.version}`)
program.usage('<command> [options]')

program.parse(process.argv)
