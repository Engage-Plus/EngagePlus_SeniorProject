// Tiny in-memory TTL cache (per API instance). Good enough on one free Render
// instance; entries are just lost on restart, which is fine for derived data.
export class TtlCache<V> {
  private readonly entries = new Map<string, { value: V; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 1000,
    private readonly clock: () => number = Date.now,
  ) {}

  get(key: string): V | undefined {
    const hit = this.entries.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt <= this.clock()) {
      this.entries.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V): void {
    this.entries.delete(key);
    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value; // Map keeps insertion order
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expiresAt: this.clock() + this.ttlMs });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }
}
