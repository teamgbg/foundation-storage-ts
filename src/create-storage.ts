/**
 * @system storage
 * @status handwritten
 */

import { rawGet, rawKeys, rawRemove, rawSet } from "./client.ts";
import { getConfiguredOverrides } from "./configure.ts";
import { storageRegistry } from "./registry.ts";
import type { StorageOptions, StorageOverride } from "./types.ts";

export function createStorage(
	namespace: string,
	opts: StorageOptions,
): {
	get<T = string>(key: string): T | undefined;
	set(key: string, value: string, ttlMs?: number): void;
	getJSON<T>(key: string): T | undefined;
	setJSON(key: string, value: unknown, ttlMs?: number): void;
	remove(key: string): void;
	clear(): void;
	keys(): string[];
	readonly namespace: string;
	readonly enabled: boolean;
} {
	const overrides: StorageOverride | undefined =
		getConfiguredOverrides(namespace);

	const resolvedTtl = overrides?.ttlMs ?? opts.ttlMs;
	const enabled = overrides?.enabled ?? true;
	const prefix = `${opts.namespace}:`;

	const entry = {
		namespace,
		enabled,
		ttlMs: resolvedTtl,
		size: 0,
	};
	storageRegistry.register(namespace, entry);

	function prefixedKey(key: string): string {
		return `${prefix}${key}`;
	}

	function isExpired(raw: string | null): boolean {
		if (!raw) return true;
		if (!resolvedTtl) return false;
		try {
			const parsed = JSON.parse(raw);
			if (parsed._ts && typeof parsed._ts === "number") {
				return Date.now() - parsed._ts > (resolvedTtl as number);
			}
		} catch {}
		return false;
	}

	function unwrap(raw: string | null): string | undefined {
		if (raw === null) return undefined;
		if (isExpired(raw)) {
			return undefined;
		}
		try {
			const parsed = JSON.parse(raw);
			if (parsed._ts && parsed._v !== undefined) {
				return parsed._v;
			}
		} catch {}
		return raw;
	}

	function wrapValue(value: string, ttlMs?: number): string {
		const effectiveTtl = ttlMs ?? resolvedTtl;
		if (effectiveTtl) {
			return JSON.stringify({ _v: value, _ts: Date.now() });
		}
		return value;
	}

	return {
		get namespace() {
			return namespace;
		},
		get enabled() {
			return entry.enabled;
		},
		get<T = string>(key: string): T | undefined {
			if (!entry.enabled) return undefined;
			return unwrap(rawGet(prefixedKey(key))) as T | undefined;
		},
		set(key: string, value: string, ttlMs?: number): void {
			if (!entry.enabled) return;
			rawSet(prefixedKey(key), wrapValue(value, ttlMs));
		},
		getJSON<T>(key: string): T | undefined {
			if (!entry.enabled) return undefined;
			const raw = unwrap(rawGet(prefixedKey(key)));
			if (raw === undefined) return undefined;
			try {
				return JSON.parse(raw) as T;
			} catch {
				return undefined;
			}
		},
		setJSON(key: string, value: unknown, ttlMs?: number): void {
			if (!entry.enabled) return;
			rawSet(prefixedKey(key), wrapValue(JSON.stringify(value), ttlMs));
		},
		remove(key: string): void {
			if (!entry.enabled) return;
			rawRemove(prefixedKey(key));
		},
		clear(): void {
			if (!entry.enabled) return;
			const allKeys = rawKeys(prefix);
			for (const k of allKeys) {
				rawRemove(k);
			}
		},
		keys(): string[] {
			if (!entry.enabled) return [];
			return rawKeys(prefix).map((k) => k.slice(prefix.length));
		},
	};
}
