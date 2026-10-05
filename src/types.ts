/**
 * @system storage
 * @status handwritten
 */

export interface StorageOptions {
	namespace: string;
	ttlMs?: number;
}

export interface StorageOverride {
	enabled?: boolean;
	ttlMs?: number;
}

export interface StorageEntry {
	namespace: string;
	enabled: boolean;
	ttlMs?: number;
	size: number;
}
