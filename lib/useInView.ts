"use client";

import React, { type RefObject } from "react";

const { useEffect, useState } = React;

export interface UseInViewOptions {
  amount?: "some" | "all" | number;
  once?: boolean;
  margin?: string;
}

export function useInView(
  ref: RefObject<Element | null>,
  options: UseInViewOptions = {}
): boolean {
  const { amount = "some", once = false, margin } = options;
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setIsInView(true));
      return;
    }

    const threshold =
      amount === "some" ? 0 : amount === "all" ? 1 : Math.max(0, Math.min(1, amount));

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        if (inView) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin: margin,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, amount, once, margin]);

  return isInView;
}
