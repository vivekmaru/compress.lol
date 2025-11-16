<script lang="ts">
	import type { FFmpeg } from '@ffmpeg/ffmpeg';
	import { fetchFile } from '@ffmpeg/util';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as m from '$lib/paraglide/messages.js';

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
	let selectedFile = $state<File | null>(null);
	let processedAudio = $state<Uint8Array | null>(null);
	let originalSize = $state(0);
	let compressedSize = $state(0);
	let errorMessage = $state('');
	let audioMetadata = $state<AudioMetadata | null>(null);
	let startTime = $state<number>(0);

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

	const handleFileSelect = (event: Event): void => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (
			file &&
			(file.type.startsWith('audio/') ||
				file.name.match(/\.(mp3|aac|ogg|opus|wav|flac|m4a|wma|ape|alac|aiff|webm)$/i))
		) {
			const maxSize = 5 * 1024 * 1024 * 1024;
			if (file.size > maxSize) {
				errorMessage = m.file_size_limit_error();
				target.value = '';
				return;
			}

			selectedFile = file;
			originalSize = file.size;
			errorMessage = '';
			processedAudio = null;
			getAudioMetadata(file);
		} else {
			errorMessage = m.select_valid_audio();
		}
	};

	const getAudioMetadata = async (file: File): Promise<void> => {
		try {
			const audio = document.createElement('audio');
			audio.src = URL.createObjectURL(file);

			await new Promise<void>((resolve) => {
				audio.onloadedmetadata = () => {
					const estimatedBitrate = Math.round((file.size * 8) / audio.duration / 1000);

					audioMetadata = {
						duration: audio.duration,
						bitrate: estimatedBitrate,
						size: file.size,
						sampleRate: 44100, // Default, actual value would need FFmpeg probe
						channels: 2 // Default stereo
					};
					URL.revokeObjectURL(audio.src);
					resolve();
				};
			});
		} catch (error) {
			console.error('Failed to get audio metadata:', error);
		}
	};

	const compressAudio = async (): Promise<void> => {
		if (!selectedFile || !isLoaded || !ffmpeg) return;

		isProcessing = true;
		progress = 0;
		errorMessage = '';
		startTime = Date.now();
		estimatedTimeRemaining = 0;

		try {
			const inputDir = '/input';
			await ffmpeg.createDir(inputDir);

			message = 'Mounting input file...';
			await ffmpeg.mount('WORKERFS' as any, { files: [selectedFile] }, inputDir);

			message = 'Compressing audio...';

			const args = ['-i', `${inputDir}/${selectedFile.name}`];

			// Audio codec and format specific settings
			if (selectedFormat.value === 'mp3') {
				args.push('-c:a', 'libmp3lame', '-b:a', selectedQuality.bitrate);
			} else if (selectedFormat.value === 'aac' || selectedFormat.value === 'm4a') {
				args.push('-c:a', 'aac', '-b:a', selectedQuality.bitrate);
			} else if (selectedFormat.value === 'opus') {
				// Opus has different bitrate ranges (6k-510k)
				const opusBitrate = selectedQuality.value === 'high' ? '256k' : selectedQuality.value === 'medium' ? '128k' : '96k';
				args.push('-c:a', 'libopus', '-b:a', opusBitrate);
			} else if (selectedFormat.value === 'ogg') {
				args.push('-c:a', 'libvorbis', '-b:a', selectedQuality.bitrate);
			} else if (selectedFormat.value === 'wav') {
				args.push('-c:a', 'pcm_s16le');
			} else if (selectedFormat.value === 'flac') {
				args.push('-c:a', 'flac', '-compression_level', '8');
			}

			// Output format
			args.push('-f', selectedFormat.value === 'm4a' ? 'mp4' : selectedFormat.value);
			args.push('-y', `output${selectedFormat.extension}`);

			console.log('FFmpeg audio args:', args);

			await ffmpeg.exec(args);

			message = 'Reading compressed audio...';
			const data = (await ffmpeg.readFile(`output${selectedFormat.extension}`)) as Uint8Array;
			processedAudio = data;
			compressedSize = data.length;

			await ffmpeg.unmount(inputDir);
			await ffmpeg.deleteDir(inputDir);
			await ffmpeg.deleteFile(`output${selectedFormat.extension}`);

			message = 'Audio compression completed successfully!';
		} catch (error) {
			console.error('Audio compression failed:', error);
			errorMessage = 'Audio compression failed. Please try again with different settings.';
			message = 'Compression failed';
		} finally {
			isProcessing = false;
			progress = 0;
			startTime = 0;
			estimatedTimeRemaining = 0;
		}
	};

	const downloadAudio = (): void => {
		if (!processedAudio) return;

		const mimeTypes: Record<string, string> = {
			mp3: 'audio/mpeg',
			aac: 'audio/aac',
			opus: 'audio/opus',
			ogg: 'audio/ogg',
			m4a: 'audio/mp4',
			wav: 'audio/wav',
			flac: 'audio/flac'
		};

		const blob = new Blob([new Uint8Array(processedAudio)], {
			type: mimeTypes[selectedFormat.value] || 'audio/mpeg'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		const filename = `compressed_${selectedFormat.value}_${selectedFile?.name.replace(/\.[^/.]+$/, '')}${selectedFormat.extension}`;

		a.download = filename;
		a.href = url;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
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

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<Card.Root>
		<Card.Header>
			<Card.Title>{m.upload_audio()}</Card.Title>
			<Card.Description>{m.upload_audio_description()}</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div>
				<Label for="audio-upload">{m.choose_audio_file()}</Label>
				<Input
					id="audio-upload"
					type="file"
					accept="audio/*"
					onchange={handleFileSelect}
					disabled={!isLoaded}
					class="mt-2"
				/>
			</div>

			{#if audioMetadata}
				<div class="space-y-2">
					<h4 class="font-medium">{m.audio_information()}</h4>
					<div class="grid grid-cols-2 gap-2 text-sm">
						<div>{m.duration()}: {formatDuration(audioMetadata.duration)}</div>
						<div>{m.bitrate()}: {audioMetadata.bitrate} kbps</div>
						<div>{m.size()}: {formatFileSize(audioMetadata.size)}</div>
						<div>{m.sample_rate()}: {audioMetadata.sampleRate} Hz</div>
						<div>{m.channels()}: {audioMetadata.channels}</div>
					</div>
				</div>
			{/if}

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

			{#if errorMessage}
				<Alert.Root class="border-destructive">
					<Alert.Description>{errorMessage}</Alert.Description>
				</Alert.Root>
			{/if}

			{#if isChromium}
				<Alert.Root class="mt-2">
					<Alert.Description>
						{m.chromium_warning()}
					</Alert.Description>
				</Alert.Root>
			{/if}

			<Button
				onclick={compressAudio}
				disabled={!selectedFile || !isLoaded || isProcessing}
				class="w-full"
			>
				{#if isProcessing}
					{m.compressing_audio()}
				{:else}
					{m.compress_audio()}
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

	<Card.Root>
		<Card.Header>
			<Card.Title>{m.audio_results()}</Card.Title>
			<Card.Description>{m.audio_results_description()}</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if processedAudio}
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.original_size()}:</span>
						<Badge variant="secondary">{formatFileSize(originalSize)}</Badge>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.compressed_size()}:</span>
						<Badge variant="default">
							{formatFileSize(compressedSize)}
						</Badge>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.size_reduction()}:</span>
						<Badge variant="outline">{compressionRatio.toFixed(1)}%</Badge>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{m.output_format()}:</span>
						<Badge variant="secondary">{selectedFormat.label}</Badge>
					</div>

					<Button onclick={downloadAudio} class="w-full">
						{m.download_compressed_audio()}
					</Button>
				</div>
			{:else}
				<div class="py-8 text-center text-muted-foreground">
					{m.upload_compress_audio_message()}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
