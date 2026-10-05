const base = import.meta.env.BASE_URL;

export function isAboutPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}about`;
}

export function isProjectsPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}projects`;
}

export function isContactPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}contact`;
}

export function navigationHref(section) {
  const about = isAboutPage();
  const projects = isProjectsPage();
  const contact = isContactPage();
  if (section === 'about') return about ? '#about' : `${base}about`;
  if (section === 'projects') return projects ? '#projects' : `${base}projects`;
  if (section === 'contact') return contact ? '#contact' : `${base}contact`;
  if (!about && !projects && !contact) return `#${section}`;
  return `${base}#${section}`;
}
