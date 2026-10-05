const base = import.meta.env.BASE_URL;

export function isAboutPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}about`;
}

export function isProjectsPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}projects`;
}

export function navigationHref(section) {
  const about = isAboutPage();
  const projects = isProjectsPage();
  if (section === 'about') return about ? '#about' : `${base}about`;
  if (section === 'projects') return projects ? '#projects' : `${base}projects`;
  if ((!about && !projects) || (about && section === 'contact')) return `#${section}`;
  return `${base}#${section}`;
}
