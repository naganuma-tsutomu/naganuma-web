export const READER_LAYOUT_EVENT = "naganuma:reader-layout";
export const READER_ANCHOR_EVENT = "naganuma:reader-anchor";

export function getReadingViewport() {
  const reader = document.querySelector<HTMLElement>('[data-page-reader][data-scroll="internal"], [data-home-reader][data-scroll="internal"]');
  const element = reader ?? document.documentElement;
  return {
    element,
    target: reader ?? window,
    top: reader?.getBoundingClientRect().top ?? 0,
    height: reader?.clientHeight ?? window.innerHeight,
    scrollTop: reader?.scrollTop ?? window.scrollY,
    scrollHeight: element.scrollHeight,
    paddingTop: parseFloat(getComputedStyle(element).scrollPaddingTop) || 0,
  };
}
