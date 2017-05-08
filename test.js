import childProcess from 'child_process';
import test from 'ava';

test.cb('user', t => {
	const cp = childProcess.spawn('./cli.js', ['-u', 'Charlie-Cheever'], {stdio: 'inherit'});

	cp.on('error', t.ifError);

	cp.on('close', code => {
		t.is(code, 0);
		t.end();
	});
});

test.cb('download', t => {
	const cp = childProcess.spawn('./cli.js', ['--download', 'Adam-DAngelo'], {stdio: 'inherit'});

	cp.on('error', t.ifError);

	cp.on('close', code => {
		t.is(code, 0);
		t.end();
	});
});
