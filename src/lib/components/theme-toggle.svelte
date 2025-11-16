<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';

	let isDark = $state(false);

	// Initialize theme from localStorage or system preference
	onMount(() => {
		const stored = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		isDark = stored === 'dark' || (!stored && prefersDark);
		updateTheme();
	});

	function updateTheme() {
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	function toggleTheme() {
		isDark = !isDark;
		updateTheme();
	}
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={toggleTheme}
	aria-label="Toggle theme"
	class="relative"
>
	{#if isDark}
		<Moon class="h-5 w-5" />
	{:else}
		<Sun class="h-5 w-5" />
	{/if}
</Button>
