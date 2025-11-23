<script lang="ts">
	import type { FFmpeg } from '@ffmpeg/ffmpeg';
	import { fetchFile } from '@ffmpeg/util';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import { DropZone } from '$lib/components/ui/drop-zone/index.js';
	import { FileQueue, type QueuedFile, type FileStatus } from '$lib/components/ui/file-queue/index.js';
	import Loader from '@lucide/svelte/icons/loader-circle';

	interface AudioFormat {
		label: string;
		value: string;
		extension: string;
		codec: string;
		description: string;
	}

	interface AudioMetadata {
		duration: number;
		bitrate: number;
		size: number;
		sampleRate: number;
		channels: number;
	}

	interface Props {
		ffmpeg: FFmpeg | undefined;
		isLoaded: boolean;
		progress: number;
		message: string;
		estimatedTimeRemaining: number;
		isChromium: boolean;
	}

	let {
		ffmpeg,
		isLoaded,
		progress = $bindable(),
		message = $bindable(),
		estimatedTimeRemaining = $bindable(),
		isChromium
	}: Props = $props();

	let isProcessing = $state(false);
	let queuedFiles = $state<QueuedFile[]>([]);
	let currentProcessingIndex = $state(-1);
	let errorMessage = $state('');
	let audioMetadataMap = $state<Map<string, AudioMetadata>>(new Map());
	let startTime = $state<number>(0);

	// Derived states
	const selectedFile = $derived(queuedFiles.length > 0 ? queuedFiles[0].file : null);
	const audioMetadata = $derived(
		selectedFile ? audioMetadataMap.get(queuedFiles[0]?.id) ?? null : null
	);
	const processedAudios = $derived(queuedFiles.filter((f) => f.status === 'completed'));
	const originalSize = $derived(queuedFiles.reduce((sum, f) => sum + f.file.size, 0));
	const compressedSize = $derived(
		processedAudios.reduce((sum, f) => sum + (f.compressedSize ?? 0), 0)
	);

	const generateFileId = (): string => {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	};

	const audioFormats: AudioFormat[] = [
		{ label: 'MP3', value: 'mp3', extension: '.mp3', codec: 'libmp3lame', description: 'Universal compatibility' },
		{ label: 'AAC', value: 'aac', extension: '.aac', codec: 'aac', description: 'High quality, small size' },
		{ label: 'Opus', value: 'opus', extension: '.opus', codec: 'libopus', description: 'Best compression' },
		{ label: 'OGG Vorbis', value: 'ogg', extension: '.ogg', codec: 'libvorbis', description: 'Open format' },
		{ label: 'M4A', value: 'm4a', extension: '.m4a', codec: 'aac', description: 'Apple devices' },
		{ label: 'WAV', value: 'wav', extension: '.wav', codec: 'pcm_s16le', description: 'Uncompressed' },
		{ label: 'FLAC', value: 'flac', extension: '.flac', codec: 'flac', description: 'Lossless compression' }
	];

	const qualitySettings = [
		{ label: m.high(), value: 'high', bitrate: '320k' },
		{ label: m.medium(), value: 'medium', bitrate: '192k' },
		{ label: m.low(), value: 'low', bitrate: '128k' }
	];

	let selectedFormatValue = $state('mp3');
	let selectedFormat = $state(audioFormats[0]);
	let selectedQualityValue = $state('medium');
	let selectedQuality = $state(qualitySettings[1]);

	const handleFilesSelected = (files: File[]): void => {
		const maxSize = 5 * 1024 * 1024 * 1024;
		const validFiles: File[] = [];

		for (const file of files) {
			if (
				file.type.startsWith('audio/') ||
				file.name.match(/\.(mp3|aac|ogg|opus|wav|flac|m4a|wma|ape|alac|aiff|webm)$/i)
			) {
				if (file.size > maxSize) {
					errorMessage = m.file_size_limit_error();
					continue;
				}
				validFiles.push(file);
			}
		}

		if (validFiles.length === 0 && files.length > 0) {
			errorMessage = m.select_valid_audio();
			return;
		}

		errorMessage = '';

		// Add files to queue
		const newQueuedFiles: QueuedFile[] = validFiles.map((file) => ({
			id: generateFileId(),
			file,
			status: 'pending' as FileStatus
		}));

		queuedFiles = [...queuedFiles, ...newQueuedFiles];

		// Get metadata for each new file
		for (const qf of newQueuedFiles) {
			getAudioMetadataForFile(qf.id, qf.file);
		}
	};

	const removeFileFromQueue = (id: string): void => {
		queuedFiles = queuedFiles.filter((f) => f.id !== id);
		audioMetadataMap.delete(id);
		audioMetadataMap = new Map(audioMetadataMap);
	};

	const clearFileQueue = (): void => {
		queuedFiles = [];
		audioMetadataMap = new Map();
	};

	const getAudioMetadataForFile = async (fileId: string, file: File): Promise<void> => {
		try {
			const audio = document.createElement('audio');
			audio.src = URL.createObjectURL(file);

			await new Promise<void>((resolve) => {
				audio.onloadedmetadata = () => {
					const estimatedBitrate = Math.round((file.size * 8) / audio.duration / 1000);

					const metadata: AudioMetadata = {
						duration: audio.duration,
						bitrate: estimatedBitrate,
						size: file.size,
						sampleRate: 44100, // Default, actual value would need FFmpeg probe
						channels: 2 // Default stereo
					};
					audioMetadataMap.set(fileId, metadata);
					audioMetadataMap = new Map(audioMetadataMap);
					URL.revokeObjectURL(audio.src);
					resolve();
				};
			});
		} catch (error) {
			console.error('Failed to get audio metadata:', error);
		}
	};

	const compressSingleAudio = async (queuedFile: QueuedFile): Promise<void> => {
		if (!ffmpeg || !isLoaded) return;

		const file = queuedFile.file;
		const inputDir = '/input';
		await ffmpeg.createDir(inputDir);

		message = `Mounting ${file.name}...`;
		await ffmpeg.mount('WORKERFS' as any, { files: [file] }, inputDir);

		try {
			message = `Compressing ${file.name}...`;

			const args = ['-i', `${inputDir}/${file.name}`];

			// Audio codec and format specific settings
			if (selectedFormat.value === 'mp3') {
				args.push('-c:a', 'libmp3lame', '-b:a', selectedQuality.bitrate);
			} else if (selectedFormat.value === 'aac' || selectedFormat.value === 'm4a') {
				args.push('-c:a', 'aac', '-b:a', selectedQuality.bitrate);
			} else if (selectedFormat.value === 'opus') {
				const opusBitrate =
					selectedQuality.value === 'high'
						? '256k'
						: selectedQuality.value === 'medium'
							? '128k'
							: '96k';
				args.push('-c:a', 'libopus', '-b:a', opusBitrate);
			} else if (selectedFormat.value === 'ogg') {
				args.push('-c:a', 'libvorbis', '-b:a', selectedQuality.bitrate);
			} else if (selectedFormat.value === 'wav') {
				args.push('-c:a', 'pcm_s16le');
			} else if (selectedFormat.value === 'flac') {
				args.push('-c:a', 'flac', '-compression_level', '8');
			}

			args.push('-f', selectedFormat.value === 'm4a' ? 'mp4' : selectedFormat.value);
			args.push('-y', `output${selectedFormat.extension}`);

			console.log('FFmpeg audio args:', args);
			await ffmpeg.exec(args);

			message = `Reading compressed ${file.name}...`;
			const data = (await ffmpeg.readFile(`output${selectedFormat.extension}`)) as Uint8Array;

			// Update queued file with result
			queuedFiles = queuedFiles.map((f) =>
				f.id === queuedFile.id
					? { ...f, status: 'completed' as FileStatus, result: data, compressedSize: data.length }
					: f
			);

			await ffmpeg.deleteFile(`output${selectedFormat.extension}`);
		} finally {
			await ffmpeg.unmount(inputDir);
			await ffmpeg.deleteDir(inputDir);
		}
	};

	const compressAudio = async (): Promise<void> => {
		const pendingFiles = queuedFiles.filter((f) => f.status === 'pending');
		if (pendingFiles.length === 0 || !isLoaded || !ffmpeg) return;

		isProcessing = true;
		progress = 0;
		errorMessage = '';
		startTime = Date.now();
		estimatedTimeRemaining = 0;

		try {
			for (let i = 0; i < pendingFiles.length; i++) {
				const queuedFile = pendingFiles[i];
				currentProcessingIndex = i;

				// Update status to processing
				queuedFiles = queuedFiles.map((f) =>
					f.id === queuedFile.id ? { ...f, status: 'processing' as FileStatus } : f
				);

				try {
					await compressSingleAudio(queuedFile);
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

			const completedCount = queuedFiles.filter((f) => f.status === 'completed').length;
			message = `Compression completed! ${completedCount}/${pendingFiles.length} files processed.`;
		} catch (error) {
			console.error('Batch compression failed:', error);
			errorMessage = 'Audio compression failed. Please try again.';
			message = 'Compression failed';
		} finally {
			isProcessing = false;
			progress = 0;
			startTime = 0;
			estimatedTimeRemaining = 0;
			currentProcessingIndex = -1;
		}
	};

	const mimeTypes: Record<string, string> = {
		mp3: 'audio/mpeg',
		aac: 'audio/aac',
		opus: 'audio/opus',
		ogg: 'audio/ogg',
		m4a: 'audio/mp4',
		wav: 'audio/wav',
		flac: 'audio/flac'
	};

	const downloadSingleAudio = (queuedFile: QueuedFile): void => {
		if (!queuedFile.result) return;

		const blob = new Blob([new Uint8Array(queuedFile.result)], {
			type: mimeTypes[selectedFormat.value] || 'audio/mpeg'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		const filename = `compressed_${selectedFormat.value}_${queuedFile.file.name.replace(/\.[^/.]+$/, '')}${selectedFormat.extension}`;

		a.download = filename;
		a.href = url;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const downloadAllAudios = async (): Promise<void> => {
		const completedFiles = queuedFiles.filter((f) => f.status === 'completed' && f.result);
		if (completedFiles.length === 0) return;

		// If only one file, download directly
		if (completedFiles.length === 1) {
			downloadSingleAudio(completedFiles[0]);
			return;
		}

		// For multiple files, download each one
		for (const file of completedFiles) {
			downloadSingleAudio(file);
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatDuration = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const formatTimeRemaining = (seconds: number): string => {
		if (seconds < 60) return `${seconds}s`;
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}m ${secs}s`;
	};

	const compressionRatio = $derived(
		compressedSize > 0 && originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0
	);

	const handleFormatChange = (value: string | undefined): void => {
		if (!value) return;
		selectedFormatValue = value;
		const format = audioFormats.find((f) => f.label === value);
		if (format) {
			selectedFormat = format;
		}
	};

	const handleQualityChange = (value: string | undefined): void => {
		if (!value) return;
		selectedQualityValue = value;
		const quality = qualitySettings.find((q) => q.label === value);
		if (quality) {
			selectedQuality = quality;
		}
	};
</script>

<div class="space-y-6">
	<!-- Upload Section -->
	<Card.Root>
		<Card.Content class="pt-6">
			<DropZone
				accept="audio/*,.mp3,.aac,.ogg,.opus,.wav,.flac,.m4a,.wma,.ape,.alac,.aiff,.webm"
				disabled={!isLoaded || isProcessing}
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
				{#if audioMetadata}
					<div class="space-y-2">
						<h4 class="text-sm font-medium">{m.audio_information()}</h4>
						<div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
							<div class="rounded-md bg-muted/50 p-2 text-center">
								<div class="text-xs text-muted-foreground">{m.duration()}</div>
								<div class="font-medium">{formatDuration(audioMetadata.duration)}</div>
							</div>
							<div class="rounded-md bg-muted/50 p-2 text-center">
								<div class="text-xs text-muted-foreground">{m.bitrate()}</div>
								<div class="font-medium">{audioMetadata.bitrate} kbps</div>
							</div>
							<div class="rounded-md bg-muted/50 p-2 text-center">
								<div class="text-xs text-muted-foreground">{m.size()}</div>
								<div class="font-medium">{formatFileSize(audioMetadata.size)}</div>
							</div>
							<div class="rounded-md bg-muted/50 p-2 text-center">
								<div class="text-xs text-muted-foreground">{m.channels()}</div>
								<div class="font-medium">{audioMetadata.channels}ch</div>
							</div>
						</div>
					</div>
				{/if}

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<Label>{m.output_format()}</Label>
						<Select.Root type="single" value={selectedFormatValue} onValueChange={handleFormatChange}>
							<Select.Trigger class="mt-2 w-full">
								{selectedFormatValue || m.select_output_format()}
							</Select.Trigger>
							<Select.Content>
								{#each audioFormats as format}
									<Select.Item value={format.label}>
										{format.label} - {format.description}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<Label>{m.quality()}</Label>
						<Select.Root type="single" value={selectedQualityValue} onValueChange={handleQualityChange}>
							<Select.Trigger class="mt-2 w-full">
								{selectedQualityValue}
							</Select.Trigger>
							<Select.Content>
								{#each qualitySettings as quality}
									<Select.Item value={quality.label}>
										{quality.label} ({quality.bitrate})
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				{#if errorMessage}
					<Alert.Root class="border-destructive">
						<Alert.Description>{errorMessage}</Alert.Description>
					</Alert.Root>
				{/if}

				<Button
					onclick={compressAudio}
					disabled={queuedFiles.filter((f) => f.status === 'pending').length === 0 ||
						!isLoaded ||
						isProcessing}
					class="h-12 w-full text-base font-semibold"
					size="lg"
				>
					{#if isProcessing}
						<Loader class="mr-2 h-5 w-5 animate-spin" />
						{m.compressing_audio()}
						{#if queuedFiles.length > 1}
							({currentProcessingIndex + 1}/{queuedFiles.filter((f) => f.status !== 'completed').length})
						{/if}
					{:else}
						{m.compress_audio()}
						{#if queuedFiles.filter((f) => f.status === 'pending').length > 1}
							({queuedFiles.filter((f) => f.status === 'pending').length} {m.files_label?.() ?? 'files'})
						{/if}
					{/if}
				</Button>

				{#if isProcessing && progress > 0}
					<div class="space-y-2">
						<div class="flex justify-between text-sm">
							<span>{m.progress()}</span>
							<div class="flex items-center gap-2">
								<span>{progress}%</span>
								{#if estimatedTimeRemaining > 0}
									<span class="text-muted-foreground">• ~{formatTimeRemaining(estimatedTimeRemaining)}</span>
								{/if}
							</div>
						</div>
						<Progress value={progress} class="w-full" />
						<p class="text-center text-xs text-muted-foreground">{message}</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Results Section -->
	{#if processedAudios.length > 0}
		<Card.Root class="border-green-500/30 bg-green-500/5">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<span class="text-green-500">✓</span>
					{m.audio_results()}
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-3">
					<!-- Summary stats -->
					<div class="grid grid-cols-3 gap-3 text-center">
						<div class="rounded-lg bg-background p-3">
							<div class="text-xs text-muted-foreground">{m.original_size()}</div>
							<div class="font-semibold">{formatFileSize(originalSize)}</div>
						</div>
						<div class="rounded-lg bg-background p-3">
							<div class="text-xs text-muted-foreground">{m.compressed_size()}</div>
							<div class="font-semibold text-green-500">{formatFileSize(compressedSize)}</div>
						</div>
						<div class="rounded-lg bg-background p-3">
							<div class="text-xs text-muted-foreground">{m.size_reduction()}</div>
							<div class="font-semibold">{compressionRatio.toFixed(1)}%</div>
						</div>
					</div>

					<!-- Individual file results for batch -->
					{#if processedAudios.length > 1}
						<div class="space-y-2">
							<h4 class="text-sm font-medium">
								{m.processed_files?.() ?? 'Processed Files'} ({processedAudios.length})
							</h4>
							<div class="max-h-[150px] space-y-1 overflow-y-auto rounded-md border bg-background p-2">
								{#each processedAudios as pa (pa.id)}
									<div
										class="flex items-center justify-between rounded p-2 text-sm hover:bg-accent/50"
									>
										<span class="truncate" title={pa.file.name}>{pa.file.name}</span>
										<div class="flex items-center gap-2">
											<span class="text-xs text-muted-foreground">
												{formatFileSize(pa.file.size)} → {formatFileSize(pa.compressedSize ?? 0)}
											</span>
											<Button variant="ghost" size="sm" onclick={() => downloadSingleAudio(pa)}>
												{m.download?.() ?? 'Download'}
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<Button onclick={downloadAllAudios} class="h-12 w-full text-base font-semibold" size="lg">
						{processedAudios.length > 1
							? (m.download_all?.() ?? 'Download All')
							: m.download_compressed_audio()}
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
					<p class="text-sm">🎵 <strong>Multiple formats</strong> - MP3, AAC, Opus, OGG, WAV, FLAC, M4A</p>
					<p class="text-sm">🎚️ <strong>Quality control</strong> - Choose between high, medium, and low quality</p>
					<p class="text-sm">🔒 <strong>100% private</strong> - All processing happens in your browser</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
