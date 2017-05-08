#!/usr/bin/env node

'use strict';

const fs = require('fs');
const dns = require('dns');
const https = require('https');
const os = require('os');
const fse = require('fs-extra');
const got = require('got');
const chalk = require('chalk');
const logUpdate = require('log-update');
const cheerio = require('cheerio');
const ora = require('ora');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

const arg = process.argv[2];
const inf = process.argv[3];
const pre = chalk.bold.cyan('›');
const pos = chalk.bold.red('›');
const dot = chalk.white('⚫');
const spinner = ora();
const profile = `https://quora.com/profile/${inf}`;
const dir = `${os.homedir()}/Quora/`;
const images = Math.random().toString(15).substr(3, 5);
const commands = ['-u', '--user', '-d', '--download', '-h', '--help'];

if (arg === '-h' || arg === '--help' || commands.indexOf(arg) === -1) {
	console.log(`
 ${chalk.cyan('Usage')}   : quorafy [command] <username>

 ${chalk.cyan('Command')} :
  -u, ${chalk.dim('--user')}      Get general information about Quora user
  -d, ${chalk.dim('--download')}  Download profile picture of a Quora user

 ${chalk.cyan('Example')} :
 $ quorafy -u Adam-DAngelo
 $ quorafy -d Charlie-Cheever
 `);
	process.exit(1);
}

if (!inf) {
	logUpdate(`\n${pos} ${chalk.dim('Please provide a username!')}\n`);
	process.exit(1);
}

const firstName = `${inf.charAt(0).toUpperCase()}${inf.slice(1).split('-')[0]}`;

logUpdate();
spinner.text = `${chalk.dim('Quorafying')} ${firstName}`;
spinner.start();

const checkConnection = () => {
	dns.lookup('quora.com', err => {
		if (err) {
			logUpdate(`\n${pos} ${chalk.dim('Please check your internet connection!')}\n`);
			process.exit(1);
		} else {
			logUpdate();
			spinner.text = `${chalk.dim('Quorafying')} ${firstName}`;
		}
	});
};

fse.ensureDir(dir, err => {
	if (err) {
		process.exit(1);
	}
});

const showError = user => {
	logUpdate(`\n${pos} ${user} ${chalk.dim('is not a Quora user!')} \n`);
	process.exit(1);
};

if (arg === '-u' || arg === '--user') {
	checkConnection();
	got(profile).then(res => {
		const $ = cheerio.load(res.body);
		const count = '.EditableList .EditableListItem .list_count, .EditableList .StaticListItem .list_count, .EditableList .list_empty .list_count';
		const username = $('.ProfileNameAndSig h1').eq(0).text();
		logUpdate(`
	    ${chalk.bold('Quorafied')}

${dot}   Name        :   ${$('.ProfileNameAndSig h1').eq(0).text()}
${dot}   Biography   :   ${$('.UserCredential').eq(0).text()}
${dot}   Answers     :   ${$(count).eq(0).text()}
${dot}   Questions   :   ${$(count).eq(1).text()}
${dot}   Posts       :   ${$(count).eq(2).text()}
${dot}   Blogs       :   ${$(count).eq(3).text()}
${dot}   Followers   :   ${$(count).eq(4).text()}
${dot}   Following   :   ${$(count).eq(5).text()}
${dot}   Topics      :   ${$(count).eq(6).text()}
${dot}   Edits       :   ${$(count).eq(7).text()}

${pre}   ${username.split(' ')[0]}'s profile : https://quora.com/${inf}
   `);
		spinner.stop();
	}).catch(err => {
		if (err) {
			showError(inf);
		}
	});
}

if (arg === '-d' || arg === '--download') {
	checkConnection();
	got(profile).then(res => {
		const $ = cheerio.load(res.body);
		const src = $('.profile_photo_img').attr('src');
		const save = fs.createWriteStream(dir + `${images}.jpeg`);

		https.get(src, (res, cb) => {
			res.pipe(save);
			save.on('finish', () => {
				save.close(cb);
				logUpdate(`\n${pre} Image Saved!   ${chalk.dim(`[${images}].jpeg`)} \n`);
				spinner.stop();
				save.on('error', () => {
					process.exit(1);
				});
			});
		});
	}).catch(err => {
		if (err) {
			showError(inf);
		}
	});
}
