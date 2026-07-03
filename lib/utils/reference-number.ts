export function generateReferenceNumber(
  count: number
) {
  const year = new Date().getFullYear();

  return `FB-${year}-${String(count).padStart(
    6,
    "0"
  )}`;
}