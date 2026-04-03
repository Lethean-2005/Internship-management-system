export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  // Parse directly from ISO string to avoid timezone conversion
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!match) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(match[2]) - 1];
  const day = parseInt(match[3]);
  const year = match[1];
  const hr = parseInt(match[4]);
  const min = match[5];
  const p = hr >= 12 ? 'PM' : 'AM';
  const h12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${month} ${day}, ${year}, ${h12}:${min} ${p}`;
}

export function formatRelative(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(iso);
}
