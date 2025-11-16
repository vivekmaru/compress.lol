<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/shadcn.js';
	import { getContext } from 'svelte';

	interface Props {
		value: string;
		children: Snippet;
		class?: string;
	}

	let { value, children, class: className }: Props = $props();

	const context = getContext<{
		value: string;
		setValue: (value: string) => void;
	}>('tabs-value');

	const isActive = $derived(context.value === value);
</script>

<button
	type="button"
	onclick={() => context.setValue(value)}
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50',
		className
	)}
>
	{@render children()}
</button>
