const base = import.meta.env.BASE_URL;

export const resumePdfHref = `${base}resume.pdf`;

export function isResumePage() {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path === `${base}resume` || path === `${base}about`;
}

export function isProjectsPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}projects`;
}

export function isContactPage() {
  return window.location.pathname.replace(/\/+$/, '') === `${base}contact`;
}

export function navigationHref(section) {
  const projects = isProjectsPage();
  const contact = isContactPage();
  if (section === 'resume') return `${base}resume`;
  if (section === 'projects') return projects ? '#projects' : `${base}projects`;
  if (section === 'contact') return contact ? '#contact' : `${base}contact`;
  if (!projects && !contact) return `#${section}`;
  return `${base}#${section}`;
}
