// Resilient In-Memory & Local Cache for User Profiles & Sessions
export interface UserProfileCache {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  phone?: string | null;
  whatsapp?: string | null;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  photoUrl?: string | null;
  passwordHash?: string;
}

const memoryUserCache = new Map<string, UserProfileCache>();

export function cacheUser(user: UserProfileCache): UserProfileCache {
  const cleanReg = user.registrationNumber.toUpperCase();
  const cleanEmail = user.email.toLowerCase();

  const entry: UserProfileCache = {
    ...user,
    registrationNumber: cleanReg,
    email: cleanEmail,
  };

  memoryUserCache.set(user.id, entry);
  memoryUserCache.set(cleanReg, entry);
  memoryUserCache.set(cleanEmail, entry);

  return entry;
}

export function getCachedUserByIdentifier(identifier: string): UserProfileCache | null {
  if (!identifier) return null;
  const key = identifier.trim();
  const keyUpper = key.toUpperCase();
  const keyLower = key.toLowerCase();

  return (
    memoryUserCache.get(key) ||
    memoryUserCache.get(keyUpper) ||
    memoryUserCache.get(keyLower) ||
    null
  );
}

export function updateCachedUserPhoto(identifier: string, photoUrl: string | null): void {
  const cached = getCachedUserByIdentifier(identifier);
  if (cached) {
    cached.photoUrl = photoUrl;
    cacheUser(cached);
  }
}

export function updateCachedUserProfile(
  identifier: string,
  updates: Partial<UserProfileCache>
): UserProfileCache | null {
  const cached = getCachedUserByIdentifier(identifier);
  if (cached) {
    const updated = { ...cached, ...updates };
    return cacheUser(updated);
  }
  return null;
}
