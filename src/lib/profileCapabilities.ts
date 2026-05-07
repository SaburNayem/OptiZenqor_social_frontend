import { ViewerUser } from '../types';

function normalizeProfileType(user: ViewerUser | null | undefined) {
  const explicitType = (user?.profileType ?? '').trim().toLowerCase();
  if (explicitType === 'user' || explicitType === 'creator' || explicitType === 'business') {
    return explicitType;
  }

  const role = (user?.role ?? '').trim().toLowerCase();
  if (role === 'creator') {
    return 'creator';
  }
  if (role === 'business' || role === 'seller' || role === 'recruiter') {
    return 'business';
  }
  return 'user';
}

export function canCreateCommunity(user: ViewerUser | null | undefined) {
  return Boolean(user?.id);
}

export function canCreatePage(user: ViewerUser | null | undefined) {
  return Boolean(user?.capabilities?.canCreatePages) || normalizeProfileType(user) === 'creator';
}

export function canCreateJob(user: ViewerUser | null | undefined) {
  return Boolean(user?.capabilities?.canCreateJobs) || normalizeProfileType(user) === 'business';
}

export function canCreateMarketplace(user: ViewerUser | null | undefined) {
  return (
    Boolean(user?.capabilities?.canCreateMarketplaceProducts) ||
    normalizeProfileType(user) === 'business'
  );
}
