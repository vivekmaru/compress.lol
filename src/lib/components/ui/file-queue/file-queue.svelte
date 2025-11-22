<script lang="ts">
	import { cn } from '$lib/utils/shadcn.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import X from '@lucide/svelte/icons/x';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Check from '@lucide/svelte/icons/check';
	import Loader from '@lucide/svelte/icons/loader-circle';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import FileIcon from '@lucide/svelte/icons/file';
	import * as m from '$lib/paraglide/messages.js';
	import type { QueuedFile, FileStatus } from './types.js';

	interface Props {
		files: QueuedFile[];
		onRemove: (id: string) => void;
		onClearAll: () => void;
		disabled?: boolean;
		class?: string;
	}

	let { files, onRemove, onClearAll, disabled = false, class: className }: Props = $props();

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	};

	const getStatusBadge = (status: FileStatus) => {
		switch (status) {
			case 'pending':
				return { variant: 'secondary' as const, text: m.status_pending?.() ?? 'Pending' };
			case 'processing':
				return { variant: 'default' as const, text: m.status_processing?.() ?? 'Processing' };
			case 'completed':
				return { variant: 'default' as const, text: m.status_completed?.() ?? 'Completed' };
			case 'error':
				return { variant: 'destructive' as const, text: m.status_error?.() ?? 'Error' };
		}
	};

	const getStatusIcon = (status: FileStatus) => {
		switch (status) {
			case 'pending':
				return FileIcon;
			case 'processing':
				return Loader;
			case 'completed':
				return Check;
			case 'error':
				return AlertCircle;
		}
	};
</script>

{#if files.length > 0}
	<div class={cn('space-y-2', className)}>
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">
				{m.files_in_queue?.() ?? 'Files in queue'}: {files.length}
			</span>
			<Button variant="ghost" size="sm" onclick={onClearAll} disabled={disabled}>
				<Trash2 class="mr-1 h-3 w-3" />
				{m.clear_all?.() ?? 'Clear all'}
			</Button>
		</div>

		<div class="max-h-[200px] space-y-1 overflow-y-auto rounded-md border p-2">
			{#each files as queuedFile (queuedFile.id)}
				{@const statusInfo = getStatusBadge(queuedFile.status)}
				{@const StatusIcon = getStatusIcon(queuedFile.status)}
				<div
					class={cn(
						'flex items-center justify-between rounded-md p-2 text-sm transition-colors',
						queuedFile.status === 'processing' && 'bg-primary/5',
						queuedFile.status === 'completed' && 'bg-green-500/5',
						queuedFile.status === 'error' && 'bg-destructive/5'
					)}
				>
					<div class="flex min-w-0 flex-1 items-center gap-2">
						<StatusIcon
							class={cn(
								'h-4 w-4 flex-shrink-0',
								queuedFile.status === 'processing' && 'animate-spin text-primary',
								queuedFile.status === 'completed' && 'text-green-500',
								queuedFile.status === 'error' && 'text-destructive'
							)}
						/>
						<span class="truncate" title={queuedFile.file.name}>
							{queuedFile.file.name}
						</span>
					</div>

					<div class="flex flex-shrink-0 items-center gap-2">
						<span class="text-xs text-muted-foreground">
							{formatFileSize(queuedFile.file.size)}
							{#if queuedFile.compressedSize}
								<span class="text-green-500">
									→ {formatFileSize(queuedFile.compressedSize)}
								</span>
							{/if}
						</span>

						<Badge variant={statusInfo.variant} class="text-xs">
							{statusInfo.text}
						</Badge>

						<Button
							variant="ghost"
							size="icon"
							class="h-6 w-6"
							onclick={() => onRemove(queuedFile.id)}
							disabled={disabled || queuedFile.status === 'processing'}
						>
							<X class="h-3 w-3" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
