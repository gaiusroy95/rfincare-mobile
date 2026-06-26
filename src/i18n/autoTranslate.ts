/**
 * Runtime auto-translation for React Native.
 *
 * The app has only ~137 hand-written translation keys; almost all UI text is
 * hardcoded English. There is no DOM to walk on mobile, so instead we globally
 * override the `Text` component's render (and `TextInput`'s placeholder) so that
 * any English string child is swapped for its translation from a per-language
 * cache. Cache misses are queued and fetched from the backend /translate
 * endpoint; when results arrive we notify subscribers and every Text re-renders.
 *
 * Each Text subscribes via useSyncExternalStore, so language changes and newly
 * fetched translations update the UI without remounting (state is preserved).
 */
import React from 'react';
import { Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiClient } from '@/src/api/apiClient';

const CACHE_PREFIX = 'rfincare_tcache_';
const BATCH_SIZE = 150;
const DEBOUNCE_MS = 250;

let currentLang = 'en';
let version = 0;
const listeners = new Set<() => void>();

const caches = new Map<string, Map<string, string>>(); // lang -> (source -> translated)
const loadedLangs = new Set<string>();
const pending = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let installed = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot() {
  return version;
}
function notify() {
  version += 1;
  listeners.forEach((l) => l());
}

function getCache(lang: string) {
  let c = caches.get(lang);
  if (!c) {
    c = new Map();
    caches.set(lang, c);
  }
  return c;
}

async function loadCacheFromDisk(lang: string) {
  if (loadedLangs.has(lang)) return;
  loadedLangs.add(lang);
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + lang);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, string>;
      const c = getCache(lang);
      Object.keys(obj).forEach((k) => c.set(k, obj[k]));
      notify();
    }
  } catch {
    /* ignore */
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(lang: string) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const c = getCache(lang);
      const obj: Record<string, string> = {};
      c.forEach((v, k) => { obj[k] = v; });
      await AsyncStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(obj));
    } catch {
      /* ignore */
    }
  }, 1000);
}

function hasLetters(s: string) {
  return /[A-Za-z]/.test(s);
}

function queue(key: string) {
  const cache = getCache(currentLang);
  if (cache.has(key)) return;
  pending.add(key);
  if (!flushTimer) flushTimer = setTimeout(flush, DEBOUNCE_MS);
}

async function flush() {
  flushTimer = null;
  const lang = currentLang;
  if (lang === 'en' || pending.size === 0) {
    pending.clear();
    return;
  }
  const cache = getCache(lang);
  const need = [...pending].filter((k) => !cache.has(k));
  pending.clear();
  if (need.length === 0) return;

  try {
    for (let i = 0; i < need.length; i += BATCH_SIZE) {
      const batch = need.slice(i, i + BATCH_SIZE);
      // eslint-disable-next-line no-await-in-loop
      const res = await apiClient.post('/translate', { q: batch, target: lang, source: 'en' });
      const out: string[] = res?.data?.translations || [];
      batch.forEach((k, idx) => cache.set(k, out[idx] ?? k));
    }
    scheduleSave(lang);
    if (currentLang === lang) notify();
  } catch {
    /* network/provider issue — keep English, retry on next render pass */
  }
}

function translateString(text: string): string {
  if (currentLang === 'en') return text;
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  const core = text.slice(lead.length, text.length - trail.length);
  if (!core || !hasLetters(core)) return text;
  const cache = getCache(currentLang);
  const hit = cache.get(core);
  if (hit !== undefined) return lead + hit + trail;
  queue(core);
  return text;
}

function translateChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') return translateString(children);
  if (Array.isArray(children)) {
    let changed = false;
    const mapped = children.map((child) => {
      if (typeof child === 'string') {
        const t = translateString(child);
        if (t !== child) changed = true;
        return t;
      }
      return child;
    });
    return changed ? mapped : children;
  }
  return children;
}

/**
 * Override a forwardRef component's render so string children/placeholder are
 * translated. Returns true if the patch was applied.
 */
function patchComponent(
  Component: { render?: (props: Record<string, unknown>, ref: unknown) => React.ReactElement },
  transform: (props: Record<string, unknown>) => Record<string, unknown>,
) {
  if (!Component || typeof Component.render !== 'function') return false;
  const original = Component.render;
  if ((original as { __rfAutoTranslate?: boolean }).__rfAutoTranslate) return true;

  const patched = function (this: unknown, props: Record<string, unknown>, ref: unknown) {
    // Subscribe so this instance re-renders when language/cache changes.
    React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const nextProps = currentLang === 'en' ? props : transform(props);
    return original.call(this, nextProps, ref);
  };
  (patched as { __rfAutoTranslate?: boolean }).__rfAutoTranslate = true;
  Component.render = patched;
  return true;
}

export function installMobileAutoTranslate() {
  if (installed) return;
  installed = true;

  patchComponent(Text as never, (props) => {
    if (!('children' in props)) return props;
    const translated = translateChildren(props.children as React.ReactNode);
    return translated === props.children ? props : { ...props, children: translated };
  });

  patchComponent(TextInput as never, (props) => {
    const placeholder = props.placeholder;
    if (typeof placeholder !== 'string') return props;
    const t = translateString(placeholder);
    return t === placeholder ? props : { ...props, placeholder: t };
  });
}

/** Call when the active language changes (also on first init). */
export function setMobileAutoTranslateLanguage(lang: string | undefined) {
  const code = (lang || 'en').split('-')[0];
  if (code === currentLang) return;
  currentLang = code;
  if (code !== 'en') loadCacheFromDisk(code);
  notify();
}
