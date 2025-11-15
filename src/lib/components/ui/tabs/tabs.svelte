<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	export let value: string;

	const activeTab = writable(value);

	setContext('activeTab', activeTab);

	$: $activeTab = value;
</script>

<div>
	<slot />
</div>