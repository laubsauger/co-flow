interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export async function shareOrCopy(data: ShareData): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (e) {
      // User cancelled or share failed — fall through to clipboard
      if (e instanceof DOMException && e.name === 'AbortError') {
        return 'shared'; // User cancelled, treat as handled
      }
    }
  }

  await navigator.clipboard.writeText(data.url);
  return 'copied';
}
