export function parseIntOrDefault(string: string | null, def: number, radix?: number) {
  if (string === null) {
    return def;
  }
  
  const parsed = parseInt(string, radix);

  if (isNaN(parsed)) {
    return def;
  }

  return parsed;
}

export function trimObject(object: any) {
  const clone = structuredClone(object);

  Object.keys(clone).forEach(k => {
    if (clone[k] === undefined) 
      delete clone[k];
  });

  return clone;
}

const apiUrl = process.env.VITE_API_URL;
export const fetchApi = (path: string, init?: RequestInit) => fetch(`${apiUrl}${path}`, init);