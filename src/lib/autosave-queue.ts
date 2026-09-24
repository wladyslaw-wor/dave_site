export type SaveStatus = { pending: boolean; error: string };
type Patch = Record<string, unknown>;

// Keep writes in order and merge edits that have not been sent yet.
// Failed patches stay queued so retrying cannot silently lose a field.
export function createAutosaveQueue(
  save: (key: string, patch: Patch) => Promise<unknown>,
  onStatus: (status: SaveStatus) => void,
  delay = 400,
) {
  const pending = new Map<string, Patch>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> | null = null;
  let error = "";

  function notify() {
    onStatus({ pending: pending.size > 0 || running !== null, error });
  }

  function flush(): Promise<void> {
    clearTimeout(timer);
    if (running) return running;
    if (!pending.size) return Promise.resolve();
    error = "";
    running = Promise.resolve().then(async () => {
      while (pending.size) {
        const [key, patch] = pending.entries().next().value!;
        pending.delete(key);
        try {
          await save(key, patch);
        } catch (err) {
          pending.set(key, { ...patch, ...pending.get(key) });
          error = err instanceof Error ? err.message : "Could not save changes.";
          throw err;
        }
      }
    }).finally(() => {
      running = null;
      if (!pending.size) clearTimeout(timer);
      notify();
    });
    notify();
    return running;
  }

  return {
    enqueue(key: string, patch: Patch) {
      pending.set(key, { ...pending.get(key), ...patch });
      clearTimeout(timer);
      timer = setTimeout(() => { void flush().catch(() => {}); }, delay);
      notify();
    },
    flush,
  };
}
