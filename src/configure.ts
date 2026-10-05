/**
 * @system storage
 * @status handwritten
 */

import type { StorageOverride } from "./types.ts";

let _overrides: Record<string, StorageOverride> = {};

export function configure(opts: {
	namespaces?: Record<string, StorageOverride> | null;
}): void {
	_overrides = opts.namespaces ?? {};
}

export function getConfiguredOverrides(
	namespace: string,
): StorageOverride | undefined {
	return _overrides[namespace];
}
