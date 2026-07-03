export function formatDate(
  date: string | Date,
  locale = "en-GB"
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(date));
}