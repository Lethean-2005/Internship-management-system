export function getDefaultPerPage(): number {
  const saved = localStorage.getItem('perPage');
  return saved ? Number(saved) : 20;
}
