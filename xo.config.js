import globals from 'globals';

export default [
	{
		languageOptions: {
			parserOptions: {
				projectService: false,
			},
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
	},
	{
		rules: {
			'unicorn/prefer-top-level-await': 'off',
		},
	},
];
