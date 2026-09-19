export const LIST_PAGE_SIZE = 6;

export function sampleContentEnabled(): boolean {
  return process.env.SHOW_SAMPLE_CONTENT === "true";
}

export function sampleExperienceEnabled(): boolean {
  return process.env.NODE_ENV === "development" && sampleContentEnabled();
}

export function paginate<T>(items: readonly T[], rawPage: string | string[] | undefined) {
  const requestedPage = typeof rawPage === "string" && /^[1-9]\d*$/.test(rawPage)
    ? Number(rawPage)
    : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / LIST_PAGE_SIZE));
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(requestedPage, totalPages)
    : 1;
  const startIndex = (page - 1) * LIST_PAGE_SIZE;

  return {
    items: items.slice(startIndex, startIndex + LIST_PAGE_SIZE),
    page,
    totalPages,
    startIndex,
  };
}
