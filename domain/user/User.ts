export interface AppUser {
  id:        string;
  email:     string;
  fullName:  string;
  firstName: string;
  initials:  string;
}

export function mapUser(raw: {
  id: string;
  email?: string;
  user_metadata?: Record<string, string>;
}): AppUser {
  const fullName  = raw.user_metadata?.full_name || raw.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0];
  const initials  = fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  return { id: raw.id, email: raw.email || '', fullName, firstName, initials };
}
