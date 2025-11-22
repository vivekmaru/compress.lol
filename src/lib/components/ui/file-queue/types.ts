export type FileStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface QueuedFile {
	id: string;
	file: File;
	status: FileStatus;
	error?: string;
	result?: Uint8Array;
	compressedSize?: number;
}
