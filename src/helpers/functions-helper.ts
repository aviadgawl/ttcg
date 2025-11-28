export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for common mobile OS and browser patterns
  if (/android/i.test(userAgent) || /ipad|iphone|ipod/i.test(userAgent) || /windows phone/i.test(userAgent) || /blackberry/i.test(userAgent) || /iemobile/i.test(userAgent)) {
    return true;
  }

  // Check for specific mobile browser identifiers
  if (/mobile/i.test(userAgent) || /tablet/i.test(userAgent)) {
    return true;
  }

  return false;
}