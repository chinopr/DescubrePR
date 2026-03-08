type AdminLikeUser = {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

export function isAdminFromAuthMetadata(user: AdminLikeUser | null | undefined) {
  const role =
    user?.app_metadata?.rol ??
    user?.app_metadata?.role ??
    user?.user_metadata?.rol ??
    user?.user_metadata?.role;

  return role === 'admin';
}

export function hasAdminAccess(roleFromProfile: string | null | undefined, user: AdminLikeUser | null | undefined) {
  if (roleFromProfile === 'admin') {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && isAdminFromAuthMetadata(user)) {
    return true;
  }

  return false;
}
