<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import { DropZone } from '$lib/components/ui/drop-zone/index.js';
	import {
		FileQueue,
		type QueuedFile,
		type FileStatus
	} from '$lib/components/ui/file-queue/index.js';
	import Loader from '@lucide/svelte/icons/loader-circle';

	interface ImageFormat {
		label: string;
		value: string;
		mimeType: string;
		extension: string;
	}

	interface ImageMetadata {
		width: number;
		height: number;
		size: number;
	}

	let isProcessing = $state(false);
	let progress = $state(0);
	let message = $state('');
	let queuedFiles = $state<QueuedFile[]>([]);
	let currentProcessingIndex = $state(-1);
	let errorMessage = $state('');
	let imageMetadataMap = $state<Map<string, ImageMetadata>>(new Map());

	// Derived states
	const selectedFile = $derived(queuedFiles.length > 0 ? queuedFiles[0].file : null);
	const imageMetadata = $derived(
		selectedFile ? imageMetadataMap.get(queuedFiles[0]?.id) ?? null : null
	);
	const processedImages = $derived(queuedFiles.filter((f) => f.status === 'completed'));
	const originalSize = $derived(queuedFiles.reduce((sum, f) => sum + f.file.size, 0));
	const compressedSize = $derived(
		processedImages.reduce((sum, f) => sum + (f.compressedSize ?? 0), 0)
	);
	const compressionRatio = $derived(
		compressedSize > 0 && originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0
	);

	const imageFormats: ImageFormat[] = [
		{ label: 'WebP', value: 'webp', mimeType: 'image/webp', extension: '.webp' },
		{ label: 'JPEG', value: 'jpeg', mimeType: 'image/jpeg', extension: '.jpg' },
		{ label: 'PNG', value: 'png', mimeType: 'image/png', extension: '.png' }
	];

	let selectedFormatValue = $state('WebP');
	let selectedFormat = $state(imageFormats[0]);
	let quality = $state(80);
	let maxWidth = $state(0); // 0 means no limit

	const generateFileId = (): string => {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	};

	const handleFilesSelected = (files: File[]): void => {
		const maxSize = 100 * 1024 * 1024; // 100MB for images
		const validFiles: File[] = [];

		for (const file of files) {
			if (
				file.type.startsWith('image/') ||
				file.name.match(/\.(png|jpg|jpeg|webp|gif|bmp|tiff?)$/i)
			) {
				if (file.size > maxSize) {
					errorMessage = m.file_size_limit_error?.() ?? 'File too large';
					continue;
				}
				validFiles.push(file);
			}
		}

		if (validFiles.length === 0 && files.length > 0) {
			errorMessage = m.select_valid_image?.() ?? 'Please select valid image files';
			return;
		}

		errorMessage = '';

		const newQueuedFiles: QueuedFile[] = validFiles.map((file) => ({
			id: generateFileId(),
			file,
			status: 'pending' as FileStatus
		}));

		queuedFiles = [...queuedFiles, ...newQueuedFiles];

		for (const qf of newQueuedFiles) {
			getImageMetadataForFile(qf.id, qf.file);
		}
	};

	const removeFileFromQueue = (id: string): void => {
		queuedFiles = queuedFiles.filter((f) => f.id !== id);
		imageMetadataMap.delete(id);
		imageMetadataMap = new Map(imageMetadataMap);
	};

	const clearFileQueue = (): void => {
		queuedFiles = [];
		imageMetadataMap = new Map();
	};

	const getImageMetadataForFile = async (fileId: string, file: File): Promise<void> => {
		try {
			const img = new Image();
			img.src = URL.createObjectURL(file);

			await new Promise<void>((resolve) => {
				img.onload = () => {
					const metadata: ImageMetadata = {
						width: img.naturalWidth,
						height: img.naturalHeight,
						size: file.size
					};
					imageMetadataMap.set(fileId, metadata);
					imageMetadataMap = new Map(imageMetadataMap);
					URL.revokeObjectURL(img.src);
					resolve();
				};
			});
		} catch (error) {
			console.error('Failed to get image metadata:', error);
		}
	};

	const compressSingleImage = async (queuedFile: QueuedFile): Promise<void> => {
		const file = queuedFile.file;
		const metadata = imageMetadataMap.get(queuedFile.id);

		message = `Compressing ${file.name}...`;

		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = URL.createObjectURL(file);

			img.onload = () => {
				try {
					let targetWidth = img.naturalWidth;
					let targetHeight = img.naturalHeight;

					// Apply max width constraint if set
					if (maxWidth > 0 && img.naturalWidth > maxWidth) {
						const ratio = maxWidth / img.naturalWidth;
						targetWidth = maxWidth;
						targetHeight = Math.round(img.naturalHeight * ratio);
					}

					const canvas = document.createElement('canvas');
					canvas.width = targetWidth;
					canvas.height = targetHeight;

					const ctx = canvas.getContext('2d');
					if (!ctx) {
						throw new Error('Failed to get canvas context');
					}

					// Enable image smoothing for better quality when resizing
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = 'high';

					ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

					canvas.toBlob(
						(blob) => {
							if (!blob) {
								reject(new Error('Failed to create blob'));
								return;
							}

							blob.arrayBuffer().then((buffer) => {
								const data = new Uint8Array(buffer);

								queuedFiles = queuedFiles.map((f) =>
									f.id === queuedFile.id
										? {
												...f,
												status: 'completed' as FileStatus,
												result: data,
												compressedSize: data.length
											}
										: f
								);

								URL.revokeObjectURL(img.src);
								resolve();
							});
						},
						selectedFormat.mimeType,
						selectedFormat.value === 'png' ? undefined : quality / 100
					);
				} catch (error) {
					URL.revokeObjectURL(img.src);
					reject(error);
				}
			};

			img.onerror = () => {
				URL.revokeObjectURL(img.src);
				reject(new Error('Failed to load image'));
			};
		});
	};

	const compressImages = async (): Promise<void> => {
		const pendingFiles = queuedFiles.filter((f) => f.status === 'pending');
		if (pendingFiles.length === 0) return;

		isProcessing = true;
		progress = 0;
		errorMessage = '';

		try {
			for (let i = 0; i < pendingFiles.length; i++) {
				const queuedFile = pendingFiles[i];
				currentProcessingIndex = i;
				progress = Math.round((i / pendingFiles.length) * 100);

				queuedFiles = queuedFiles.map((f) =>
					f.id === queuedFile.id ? { ...f, status: 'processing' as FileStatus } : f
				);

				try {
					await compressSingleImage(queuedFile);
					message = `Completed ${i + 1}/${pendingFiles.length} files`;
				} catch (error) {
					console.error(`Compression failed for ${queuedFile.file.name}:`, error);
					queuedFiles = queuedFiles.map((f) =>
						f.id === queuedFile.id
							? { ...f, status: 'error' as FileStatus, error: String(error) }
							: f
					);
				}
			}

			progress = 100;
			const completedCount = queuedFiles.filter((f) => f.status === 'completed').length;
			message = `Compression completed! ${completedCount}/${pendingFiles.length} files processed.`;
		} catch (error) {
			console.error('Batch compression failed:', error);
			errorMessage = m.compression_failed?.() ?? 'Image compression failed';
			message = 'Compression failed';
		} finally {
			isProcessing = false;
			progress = 0;
			currentProcessingIndex = -1;
		}
	};

	const downloadSingleImage = (queuedFile: QueuedFile): void => {
		if (!queuedFile.result) return;

		const blob = new Blob([new Uint8Array(queuedFile.result)], { type: selectedFormat.mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		const baseName = queuedFile.file.name.replace(/\.[^/.]+$/, '');
		const filename = `compressed_${baseName}${selectedFormat.extension}`;

		a.download = filename;
		a.href = url;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const downloadAllImages = async (): Promise<void> => {
		const completedFiles = queuedFiles.filter((f) => f.status === 'completed' && f.result);
		if (completedFiles.length === 0) return;

		if (completedFiles.length === 1) {
			downloadSingleImage(completedFiles[0]);
			return;
		}

		for (const file of completedFiles) {
			downloadSingleImage(file);
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	};

	const handleFormatChange = (value: string | undefined): void => {
		if (!value) return;
		selectedFormatValue = value;
		const format = imageFormats.find((f) => f.label === value);
		if (format) {
			selectedFormat = format;
		}
	};
</script>

<div class="space-y-6">
	<!-- Upload Section -->
	<Card.Root>
		<Card.Content class="pt-6">
			<DropZone
				accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff"
				disabled={isProcessing}
				multiple={true}
				onFilesSelected={handleFilesSelected}
				size="large"
				showPrivacyBadge={true}
			/>
			<FileQueue
				files={queuedFiles}
				onRemove={removeFileFromQueue}
				onClearAll={clearFileQueue}
				disabled={isProcessing}
				class="mt-4"
			/>
		</Card.Content>
	</Card.Root>

	<!-- Configuration Section (only show when files are selected) -->
	{#if queuedFiles.length > 0}
		<Card.Root>
			<Card.Content class="space-y-6 pt-6">
				{#if imageMetadata}
					<div class="space-y-2">
						<h4 class="text-sm font-medium">{m.image_information?.() ?? 'Image Information'}</h4>
						<div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
							<div class="rounded-md bg-muted/50 p-2 text-center">
								<div class="text-xs text-muted-foreground">{m.dimensions?.() ?? 'Dimensions'}</div>
								<div class="font-medium">{imageMetadata.width}x{imageMetadata.height}</div>
							</div>
							<div class="rounded-md bg-muted/50 p-2 text-center">
								<div class="text-xs text-muted-foreground">{m.size?.() ?? 'Size'}</div>
								<div class="font-medium">{formatFileSize(imageMetadata.size)}</div>
							</div>
							<div class="rounded-md bg-muted/50 p-2 text-center">
								<div class="text-xs text-muted-foreground">{m.output_format?.() ?? 'Format'}</div>
								<div class="font-medium">{selectedFormat.label}</div>
							</div>
						</div>
					</div>
				{/if}

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<Label>{m.output_format?.() ?? 'Output Format'}</Label>
						<Select.Root type="single" value={selectedFormatValue} onValueChange={handleFormatChange}>
							<Select.Trigger class="mt-2 w-full">
								{selectedFormatValue}
							</Select.Trigger>
							<Select.Content>
								{#each imageFormats as format}
									<Select.Item value={format.label}>
										{format.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<Label>{m.max_width?.() ?? 'Max Width'} ({m.optional?.() ?? 'optional'})</Label>
						<Input
							type="number"
							placeholder={m.no_limit?.() ?? 'No limit'}
							bind:value={maxWidth}
							min="0"
							class="mt-2"
						/>
					</div>
				</div>

				{#if selectedFormat.value !== 'png'}
					<div>
						<Label>{m.quality?.() ?? 'Quality'}: {quality}%</Label>
						<Input
							type="range"
							min="1"
							max="100"
							bind:value={quality}
							class="mt-2"
						/>
						<div class="mt-1 flex justify-between text-xs text-muted-foreground">
							<span>{m.smaller_file?.() ?? 'Smaller file'}</span>
							<span>{m.better_quality?.() ?? 'Better quality'}</span>
						</div>
					</div>
				{/if}

				{#if errorMessage}
					<Alert.Root class="border-destructive">
						<Alert.Description>{errorMessage}</Alert.Description>
					</Alert.Root>
				{/if}

				<Button
					onclick={compressImages}
					disabled={queuedFiles.filter((f) => f.status === 'pending').length === 0 || isProcessing}
					class="h-12 w-full text-base font-semibold"
					size="lg"
				>
					{#if isProcessing}
						<Loader class="mr-2 h-5 w-5 animate-spin" />
						{m.compressing_images?.() ?? 'Compressing...'}
						{#if queuedFiles.length > 1}
							({currentProcessingIndex + 1}/{queuedFiles.filter((f) => f.status !== 'completed').length})
						{/if}
					{:else}
						{m.compress_images?.() ?? 'Compress Images'}
						{#if queuedFiles.filter((f) => f.status === 'pending').length > 1}
							({queuedFiles.filter((f) => f.status === 'pending').length} {m.files_label?.() ?? 'files'})
						{/if}
					{/if}
				</Button>

				{#if isProcessing && progress > 0}
					<div class="space-y-2">
						<div class="flex justify-between text-sm">
							<span>{m.progress?.() ?? 'Progress'}</span>
							<span>{progress}%</span>
						</div>
						<Progress value={progress} class="w-full" />
						<p class="text-center text-xs text-muted-foreground">{message}</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Results Section -->
	{#if processedImages.length > 0}
		<Card.Root class="border-green-500/30 bg-green-500/5">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<span class="text-green-500">✓</span>
					{m.image_results?.() ?? 'Image Results'}
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-3">
					<!-- Summary stats -->
					<div class="grid grid-cols-3 gap-3 text-center">
						<div class="rounded-lg bg-background p-3">
							<div class="text-xs text-muted-foreground">{m.original_size?.() ?? 'Original Size'}</div>
							<div class="font-semibold">{formatFileSize(originalSize)}</div>
						</div>
						<div class="rounded-lg bg-background p-3">
							<div class="text-xs text-muted-foreground">{m.compressed_size?.() ?? 'Compressed Size'}</div>
							<div class="font-semibold text-green-500">{formatFileSize(compressedSize)}</div>
						</div>
						<div class="rounded-lg bg-background p-3">
							<div class="text-xs text-muted-foreground">{m.size_reduction?.() ?? 'Size Reduction'}</div>
							<div class="font-semibold">{compressionRatio.toFixed(1)}%</div>
						</div>
					</div>

					<!-- Individual file results for batch -->
					{#if processedImages.length > 1}
						<div class="space-y-2">
							<h4 class="text-sm font-medium">
								{m.processed_files?.() ?? 'Processed Files'} ({processedImages.length})
							</h4>
							<div class="max-h-[150px] space-y-1 overflow-y-auto rounded-md border bg-background p-2">
								{#each processedImages as pi (pi.id)}
									<div
										class="flex items-center justify-between rounded p-2 text-sm hover:bg-accent/50"
									>
										<span class="truncate" title={pi.file.name}>{pi.file.name}</span>
										<div class="flex items-center gap-2">
											<span class="text-xs text-muted-foreground">
												{formatFileSize(pi.file.size)} → {formatFileSize(pi.compressedSize ?? 0)}
											</span>
											<Button variant="ghost" size="sm" onclick={() => downloadSingleImage(pi)}>
												{m.download?.() ?? 'Download'}
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<Button onclick={downloadAllImages} class="h-12 w-full text-base font-semibold" size="lg">
						{processedImages.length > 1
							? (m.download_all?.() ?? 'Download All')
							: (m.download_compressed_image?.() ?? 'Download Compressed Image')}
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if queuedFiles.length === 0}
		<!-- Empty state with How it works -->
		<Card.Root>
			<Card.Header>
				<Card.Title>{m.how_it_works()}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-3">
					<p class="text-sm">🖼️ <strong>Modern formats</strong> - WebP, JPEG, PNG with quality control</p>
					<p class="text-sm">📐 <strong>Resize support</strong> - Set max width to automatically scale down</p>
					<p class="text-sm">🔒 <strong>100% private</strong> - All processing happens in your browser</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
