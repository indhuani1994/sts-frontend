export const API = "https://sts-backend-aew0.onrender.com";

export const resolveFileUrl = (value) => {
  if (!value) return '';
  if (typeof value !== 'string') return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${API}${value}`;
  return `${API}/uploads/${value}`;
};
