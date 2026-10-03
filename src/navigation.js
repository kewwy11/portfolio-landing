const base = import.meta.env.BASE_URL;

export function isAboutPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}about`;
}

export function navigationHref(section) {
  if (section === 'about') return isAboutPage() ? '#about' : `${base}about`;
  if (!isAboutPage() || section === 'contact') return `#${section}`;
  return `${base}#${section}`;
}
