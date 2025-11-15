<script lang="ts">
	import '../app.css';
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="flex justify-end p-4">
	<ThemeSwitcher />
</header>

<main>
	{@render children?.()}
</main>
