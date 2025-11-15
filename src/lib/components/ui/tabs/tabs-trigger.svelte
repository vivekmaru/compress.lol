<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { cn } from '$lib/utils';

	export let value: string;

	const activeTab: Writable<string> = getContext('activeTab');

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<button
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		$activeTab === value && 'bg-background text-foreground shadow-sm'
	)}
	on:click={() => ($activeTab = value)}
	{...$$restProps}
>
	<slot />
</button>