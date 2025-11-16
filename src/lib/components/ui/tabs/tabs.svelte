<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface TabsProps {
		value: string;
		onValueChange?: (value: string) => void;
		children: Snippet;
		class?: string;
	}

	export interface TabsListProps {
		children: Snippet;
		class?: string;
	}

	export interface TabsTriggerProps {
		value: string;
		children: Snippet;
		class?: string;
	}

	export interface TabsContentProps {
		value: string;
		children: Snippet;
		class?: string;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils/shadcn.js';
	import { setContext, getContext } from 'svelte';

	let {
		value = $bindable(),
		onValueChange,
		children,
		class: className
	}: TabsProps = $props();

	setContext('tabs-value', {
		get value() {
			return value;
		},
		setValue: (newValue: string) => {
			value = newValue;
			onValueChange?.(newValue);
		}
	});
</script>

<div class={cn('', className)}>
	{@render children()}
</div>
