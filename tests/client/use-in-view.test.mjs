import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import React, { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { useInView } from "../../lib/useInView.ts";

let dom;
let root;
let container;
let observers;
let savedGlobals;
const globalKeys = ["window", "document", "IntersectionObserver", "IS_REACT_ACT_ENVIRONMENT"];

class FakeIntersectionObserver {
  targets = new Set();
  disconnected = false;
  unobserved = [];
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    observers.push(this);
  }
  observe(target) { this.targets.add(target); }
  unobserve(target) { this.unobserved.push(target); this.targets.delete(target); }
  disconnect() { this.disconnected = true; this.targets.clear(); }
  async emit(intersectionRatio, isIntersecting = intersectionRatio > 0) {
    await act(async () => {
      this.callback([...this.targets].map(target => ({ target, intersectionRatio, isIntersecting })));
    });
  }
}

function Probe({ options, attach = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, options);
  // createElement passes the ref to React; it does not read ref.current during render.
  // eslint-disable-next-line react-hooks/refs
  return React.createElement("div", { ref: attach ? ref : undefined, "data-in-view": String(inView) });
}

async function render(options = {}, attach = true, strict = false) {
  const probe = React.createElement(Probe, { options, attach });
  await act(async () => root.render(strict ? React.createElement(React.StrictMode, null, probe) : probe));
}
function visible() { return container.firstChild.getAttribute("data-in-view") === "true"; }

beforeEach(() => {
  savedGlobals = Object.fromEntries(globalKeys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  dom = new JSDOM("<!doctype html><html><body></body></html>");
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IntersectionObserver: FakeIntersectionObserver,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  observers = [];
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  dom.window.close();
  for (const key of globalKeys) {
    if (savedGlobals[key]) Object.defineProperty(globalThis, key, savedGlobals[key]);
    else delete globalThis[key];
  }
});

test("starts hidden, becomes visible on intersection, and hides after leaving", async () => {
  await render();
  assert.equal(visible(), false);
  assert.equal(observers.length, 1);
  assert.equal(observers[0].targets.has(container.firstChild), true);
  await observers[0].emit(0.1);
  assert.equal(visible(), true);
  await observers[0].emit(0, false);
  assert.equal(visible(), false);
});

test("fractional amount requires the requested visible ratio, not just intersection", async () => {
  await render({ amount: 0.75 });
  assert.equal(observers[0].options.threshold, 0.75);
  await observers[0].emit(0.5, true);
  assert.equal(visible(), false);
  await observers[0].emit(0.75, true);
  assert.equal(visible(), true);
  await observers[0].emit(0.6, true);
  assert.equal(visible(), false);
});

test("all requires full visibility and resets when partially outside", async () => {
  await render({ amount: "all" });
  assert.equal(observers[0].options.threshold, 1);
  await observers[0].emit(0.99, true);
  assert.equal(visible(), false);
  await observers[0].emit(1, true);
  assert.equal(visible(), true);
  await observers[0].emit(0.99, true);
  assert.equal(visible(), false);
});

test("once stops observing only after the threshold is reached and stays visible", async () => {
  await render({ once: true, amount: 0.5 });
  const observer = observers[0];
  await observer.emit(0.25, true);
  assert.equal(visible(), false);
  assert.equal(observer.unobserved.length, 0);
  await observer.emit(0.5, true);
  assert.equal(visible(), true);
  assert.deepEqual(observer.unobserved, [container.firstChild]);
  assert.equal(observer.targets.size, 0);
  // A regular re-render must not restart observation or lose the revealed state.
  await render({ once: true, amount: 0.5 });
  assert.equal(visible(), true);
  assert.equal(observers.length, 1);
});

test("passes the root margin and disconnects the old observer when options change", async () => {
  await render({ margin: "-50px", amount: 0.5 });
  const first = observers[0];
  assert.equal(first.options.rootMargin, "-50px");
  await render({ margin: "10px", amount: 1 });
  assert.equal(first.disconnected, true);
  assert.equal(first.targets.size, 0);
  assert.equal(observers.length, 2);
  assert.equal(observers[1].options.rootMargin, "10px");
  assert.equal(observers[1].options.threshold, 1);
  await observers[1].emit(1);
  assert.equal(visible(), true);
});

test("disconnects observation on unmount", async () => {
  await render();
  await act(async () => root.unmount());
  root = null;
  assert.equal(observers[0].disconnected, true);
  assert.equal(observers[0].targets.size, 0);
});

test("falls back to visible when IntersectionObserver is unavailable", async () => {
  delete globalThis.IntersectionObserver;
  await render();
  assert.equal(visible(), true);
  assert.equal(observers.length, 0);
});

test("does not observe a missing target", async () => {
  await render({}, false);
  assert.equal(visible(), false);
  assert.equal(observers.length, 0);
});

test("clamps numeric thresholds to the supported range", async () => {
  await render({ amount: -1 });
  assert.equal(observers[0].options.threshold, 0);
  await observers[0].emit(0.1);
  assert.equal(visible(), true);
  await render({ amount: 2 });
  assert.equal(observers[1].options.threshold, 1);
  await observers[1].emit(0.5, true);
  assert.equal(visible(), false);
});

test("Strict Mode cleanup leaves only one active observer", async () => {
  await render({}, true, true);
  assert.equal(observers.length, 2);
  assert.equal(observers[0].disconnected, true);
  assert.equal(observers[1].targets.size, 1);
  await observers[1].emit(0.5);
  assert.equal(visible(), true);
});
