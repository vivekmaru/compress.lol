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

{#if isActive}
	<div
		class={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className
		)}
	>
		{@render children()}
	</div>
{/if}
