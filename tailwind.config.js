module.exports = {
	future: {
		removeDeprecatedGapUtilities: true,
	},
	important: true,
	theme: {
		colors: {
			primary: {
				DEFAULT: '#101010',
				dark: '#ee9d00',
			},
			secondary: {
				DEFAULT: '#191b1e',
			},
			white: {
				DEFAULT: '#fff',
				darker: '#eee',
			},
			black: {
				DEFAULT: '#000',
				transparent: 'rgba(0, 0, 0, 0.2)',
				smoke: 'rgba(0, 0, 0, 0.4)',
				semitransparent: 'rgba(0, 0, 0, 0.8)',
			},
			primaryText: {
				DEFAULT: '#3a3a3a'
			},
			greyText: {
				DEFAULT: '#565046',
				light: '#898F82'
			},
			orange: {
				DEFAULT: '#ec5020',
			},
			buttonDisabled: {
				DEFAULT: '#646464',
			},
			buttonPrimary: {
				DEFAULT: '#F25409',
			},
			gray: {
				DEFAULT: '#ECECEC',
			},
			lightGray: {
				DEFAULT: '#ECECEC50',
			},
			actionYellow: {
				DEFAULT: '#F9B041',
			},
			actionDarkYellow: {
				DEFAULT: '#EC9938',
			},
			actionOrange: {
				DEFAULT: '#F17345',
			},
			red: {
				DEFAULT: '#D94E21',
			},
			orangeIcon: {
				DEFAULT: '#f25409',
			},

			transparent: 'rgba(0, 0, 0, 0)',
			dark: '#333',
			red: 'red',
			blue: 'blue',
			green: 'green',
			teal: 'teal',
			purple: 'purple',
			gray: 'gray',

			facebook: '#3b5998',
			twitch: '#6441a5',
			google: '#dd4b39',
			discord: '#7289da',
		},
		screens: {
			xs: '320px',
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1200px',
			xxl: '1600px',
			xxxl: '1920px',
			xxxxl: '2100px',
		},

		borderRadius: {
			'none': '0',
			'sm': '0.125rem',
			'default': '0.25rem',
			'md': '0.375rem',
			'lg': '0.5rem',
			'xl': '0.75rem',
			'2xl': '1.0rem',
			'3xl': '1.2rem',
			'full': '9999px',
		},

		fontSize: {
			'3xs': '0.35rem',
			'xxs': '0.7rem',
			'xs': '.75rem',
			'sm': '.875rem',
			'base': '1rem',
			'lg': '1.125rem',
			'xl': '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
			'5xl': '3rem',
			'6xl': '4rem',
			'7xl': '5rem',
		},

		extend: {
			gap: {
				3.5: '0.875rem',
			},
			height: {
				44: '10rem',
				46: '11rem',
			},
			width: {
			},
			maxWidth: {
				'home-cat-container': '280px',
				'home-cat-label': '85%',
				'home-cat-label-mobile': '90%',
			},
			maxHeight: {
				'product-list-item': '200px',
			},
			inset: {
			},
			margin: {
				'-5': '-1.25rem',
				'-10': '-2.5rem',
				'home-tabs': '-42px',
			},
			padding: {
				'content': '64px',
				'content-mobile': '32px',
			},
			boxShadow: {
			},
		},
	},
	variants: {
		borderRadius: ['responsive', 'hover', 'focus', 'first', 'last'],
		borderWidth: ['responsive', 'hover', 'focus', 'first', 'last'],
		margin: ['responsive', 'hover', 'focus', 'first', 'last', 'odd'],
		padding: ['responsive', 'hover', 'focus', 'first'],
		background: ['responsive', 'odd', 'even'],
		backgroundColor: ['responsive', 'hover', 'odd', 'even'],
	},

	purge: {
		mode: 'all',
		content: ['./index.html', './src/**/*.js'],
		options: {
			safelist: [/^(ql-|famfamfam-flag-|flag-|dx-|horizontalSlider|carousel|slideHorizontal|slide|slideInner|sliderTray)/],
			defaultExtractor: content => content.match(/[\w-/:.]+(?<!:)/g) || [],
		},
	},
};
