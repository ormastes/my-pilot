import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	version: 'insiders', // or 'stable'
	// command line arguments
	args: ['--enable-proposed-api'],
});
