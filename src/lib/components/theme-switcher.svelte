<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	import { theme } from '$lib/store/theme';

	function toggleTheme() {
		theme.update((value) => (value === 'light' ? 'dark' : 'light'));
	}
</script>

<button on:click={toggleTheme} class="p-2 rounded-md hover:bg-muted" data-testid="theme-switcher">
	{#if $theme === 'light'}
		<Moon class="h-5 w-5" />
	{:else}
		<Sun class="h-5 w-5" />
	{/if}
</button>
