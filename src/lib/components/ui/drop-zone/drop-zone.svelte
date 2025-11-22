<script lang="ts">
	import { cn } from '$lib/utils/shadcn.js';
	import Upload from '@lucide/svelte/icons/upload';
	import Shield from '@lucide/svelte/icons/shield-check';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		accept: string;
		disabled?: boolean;
		multiple?: boolean;
		onFilesSelected: (files: File[]) => void;
		class?: string;
		showPrivacyBadge?: boolean;
		size?: 'default' | 'large';
	}

	let {
		accept,
		disabled = false,
		multiple = false,
		onFilesSelected,
		class: className,
		showPrivacyBadge = false,
		size = 'default'
	}: Props = $props();

	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	const handleDragEnter = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) {
			isDragging = true;
		}
	};

	const handleDragLeave = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
	};

	const handleDragOver = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;

		if (disabled) return;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			const fileArray = Array.from(files);
			const validFiles = filterValidFiles(fileArray);
			if (validFiles.length > 0) {
				onFilesSelected(multiple ? validFiles : [validFiles[0]]);
			}
		}
	};

	const handleClick = (): void => {
		if (!disabled && fileInput) {
			fileInput.click();
		}
	};

	const handleKeyDown = (e: KeyboardEvent): void => {
		if ((e.key === 'Enter' || e.key === ' ') && !disabled && fileInput) {
			e.preventDefault();
			fileInput.click();
		}
	};

	const handleFileInput = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			const fileArray = Array.from(files);
			const validFiles = filterValidFiles(fileArray);
			if (validFiles.length > 0) {
				onFilesSelected(multiple ? validFiles : [validFiles[0]]);
			}
		}
		// Reset input so same file can be selected again
		target.value = '';
	};

	const filterValidFiles = (files: File[]): File[] => {
		// Parse accept string into patterns
		const acceptPatterns = accept.split(',').map((p) => p.trim().toLowerCase());

		return files.filter((file) => {
			const fileName = file.name.toLowerCase();
			const fileType = file.type.toLowerCase();

			return acceptPatterns.some((pattern) => {
				// Handle wildcard types like "video/*"
				if (pattern.endsWith('/*')) {
					const baseType = pattern.slice(0, -2);
					return fileType.startsWith(baseType);
				}
				// Handle exact MIME types
				if (pattern.includes('/')) {
					return fileType === pattern;
				}
				// Handle file extensions like ".mp4"
				if (pattern.startsWith('.')) {
					return fileName.endsWith(pattern);
				}
				return false;
			});
		});
	};
</script>

<div
	class={cn(
		'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
		size === 'large' ? 'min-h-[280px]' : 'min-h-[180px]',
		isDragging
			? 'border-primary bg-primary/10'
			: 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	role="button"
	tabindex={disabled ? -1 : 0}
	aria-label={m.drop_zone_aria_label?.() ?? 'Drop files here or click to browse'}
>
	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		{disabled}
		onchange={handleFileInput}
		class="sr-only"
		tabindex="-1"
	/>

	<div class="flex flex-col items-center gap-3 text-center">
		<div
			class={cn(
				'rounded-full transition-colors',
				size === 'large' ? 'p-4' : 'p-3',
				isDragging ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
			)}
		>
			<Upload class={cn(size === 'large' ? 'h-8 w-8' : 'h-6 w-6')} />
		</div>

		{#if isDragging}
			<p class={cn('font-medium text-primary', size === 'large' ? 'text-base' : 'text-sm')}>
				{m.drop_files_here?.() ?? 'Drop files here'}
			</p>
		{:else}
			<div class="space-y-1">
				<p class={cn('font-medium', size === 'large' ? 'text-base' : 'text-sm')}>
					{m.drag_and_drop?.() ?? 'Drag and drop files here'}
				</p>
				<p class={cn('text-muted-foreground', size === 'large' ? 'text-sm' : 'text-xs')}>
					{m.or_click_to_browse?.() ?? 'or click to browse'}
				</p>
			</div>
		{/if}

		{#if multiple}
			<p class={cn('text-muted-foreground', size === 'large' ? 'text-sm' : 'text-xs')}>
				{m.multiple_files_supported?.() ?? 'Multiple files supported'}
			</p>
		{/if}

		{#if showPrivacyBadge}
			<div class="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
				<Shield class="h-3.5 w-3.5 text-green-500" />
				<span>{m.privacy_badge?.() ?? '100% private · Files never leave your device'}</span>
			</div>
		{/if}
	</div>
</div>
