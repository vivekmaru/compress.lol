import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const defaultValue = 'dark';
const initialValue = browser ? window.localStorage.getItem('theme') ?? defaultValue : defaultValue;

export const theme = writable<Theme>(initialValue as Theme);

theme.subscribe((value) => {
	if (browser) {
		window.localStorage.setItem('theme', value);
	}
});

export { theme as default };
