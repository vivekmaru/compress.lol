<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
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

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<Card.Root>
		<Card.Header>
			<Card.Title>{m.upload_image?.() ?? 'Upload Images'}</Card.Title>
			<Card.Description>{m.upload_image_description?.() ?? 'Select images to compress'}</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div>
				<Label>{m.choose_image_file?.() ?? 'Choose Image Files'}</Label>
				<DropZone
					accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff"
					disabled={isProcessing}
					multiple={true}
					onFilesSelected={handleFilesSelected}
					class="mt-2"
				/>
				<FileQueue
					files={queuedFiles}
					onRemove={removeFileFromQueue}
					onClearAll={clearFileQueue}
					disabled={isProcessing}
					class="mt-3"
				/>
			</div>

			{#if imageMetadata}
				<div class="space-y-2">
					<h4 class="font-medium">{m.image_information?.() ?? 'Image Information'}</h4>
					<div class="grid grid-cols-2 gap-2 text-sm">
						<div>{m.dimensions?.() ?? 'Dimensions'}: {imageMetadata.width}x{imageMetadata.height}</div>
						<div>{m.size?.() ?? 'Size'}: {formatFileSize(imageMetadata.size)}</div>
					</div>
				</div>
			{/if}

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

			<div>
				<Label>{m.max_width?.() ?? 'Max Width'} ({m.optional?.() ?? 'optional'})</Label>
				<Input
					type="number"
					placeholder={m.no_limit?.() ?? 'No limit'}
					bind:value={maxWidth}
					min="0"
					class="mt-2"
				/>
				<p class="mt-1 text-xs text-muted-foreground">
					{m.max_width_description?.() ?? 'Set to 0 for no limit. Images wider than this will be resized.'}
				</p>
			</div>

			{#if errorMessage}
				<Alert.Root class="border-destructive">
					<Alert.Description>{errorMessage}</Alert.Description>
				</Alert.Root>
			{/if}

			<Button
				onclick={compressImages}
				disabled={queuedFiles.filter((f) => f.status === 'pending').length === 0 || isProcessing}
				class="w-full"
			>
				{#if isProcessing}
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

	<Card.Root>
		<Card.Header>
			<Card.Title>{m.image_results?.() ?? 'Image Results'}</Card.Title>
			<Card.Description>{m.image_results_description?.() ?? 'Compression results and download'}</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if processedImages.length > 0}
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.original_size?.() ?? 'Original Size'}:</span>
						<Badge variant="secondary">{formatFileSize(originalSize)}</Badge>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.compressed_size?.() ?? 'Compressed Size'}:</span>
						<Badge variant="default">{formatFileSize(compressedSize)}</Badge>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.size_reduction?.() ?? 'Size Reduction'}:</span>
						<Badge variant="outline">{compressionRatio.toFixed(1)}%</Badge>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.output_format?.() ?? 'Output Format'}:</span>
						<Badge variant="secondary">{selectedFormat.label}</Badge>
					</div>

					{#if processedImages.length > 1}
						<div class="mt-4 space-y-2">
							<h4 class="text-sm font-medium">
								{m.processed_files?.() ?? 'Processed Files'} ({processedImages.length})
							</h4>
							<div class="max-h-[150px] space-y-1 overflow-y-auto rounded-md border p-2">
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

					<Button onclick={downloadAllImages} class="w-full">
						{processedImages.length > 1
							? (m.download_all?.() ?? 'Download All')
							: (m.download_compressed_image?.() ?? 'Download Compressed Image')}
					</Button>
				</div>
			{:else}
				<div class="py-8 text-center text-muted-foreground">
					{m.upload_compress_image_message?.() ?? 'Upload and compress images to see results here'}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
