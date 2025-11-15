<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let value: string;

	const activeTab: Writable<string> = getContext('activeTab');
</script>

{#if $activeTab === value}
	<div {...$$restProps}>
		<slot />
	</div>
{/if}