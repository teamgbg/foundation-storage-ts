/**
 * @system storage
 * @status handwritten
 */

import type { StorageEntry } from "./types.ts";

class StorageRegistry {
	private entries = new Map<string, StorageEntry>();

	register(namespace: string, entry: StorageEntry): void {
		if (this.entries.has(namespace)) {
			throw new Error(
				`[storage] Duplicate namespace "${namespace}" — each storage namespace must be unique`,
			);
		}
		this.entries.set(namespace, entry);
	}

	getAll(): StorageEntry[] {
		return Array.from(this.entries.values());
	}

	disable(namespace: string): void {
		const entry = this.entries.get(namespace);
		if (entry) entry.enabled = false;
	}

	enable(namespace: string): void {
		const entry = this.entries.get(namespace);
		if (entry) entry.enabled = true;
	}
}

export const storageRegistry = new StorageRegistry();
