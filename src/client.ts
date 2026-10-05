/**
 * @system storage
 * @status handwritten
 */

const isClient =
	typeof window !== "undefined" && typeof localStorage !== "undefined";

export function rawGet(key: string): string | null {
	if (!isClient) return null;
	return localStorage.getItem(key);
}

export function rawSet(key: string, value: string): void {
	if (!isClient) return;
	localStorage.setItem(key, value);
}

export function rawRemove(key: string): void {
	if (!isClient) return;
	localStorage.removeItem(key);
}

export function rawKeys(prefix: string): string[] {
	if (!isClient) return [];
	const keys: string[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const k = localStorage.key(i);
		if (k?.startsWith(prefix)) keys.push(k);
	}
	return keys;
}
