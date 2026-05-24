/**
 * Device detector utilities.
 * File generico, senza dipendenze esterne.
 */

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  UNKNOWN = 'unknown',
}

export enum OperatingSystem {
  WINDOWS = 'windows',
  MAC_OS = 'mac-os',
  IOS = 'ios',
  ANDROID = 'android',
  LINUX = 'linux',
  UNKNOWN = 'unknown',
}

export enum BrowserType {
  EDGE = 'edge',
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  OPERA = 'opera',
  IE = 'ie',
  UNKNOWN = 'unknown',
}

export interface DeviceInfo {
  type: DeviceType;
  os: OperatingSystem;
  browser: BrowserType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
  width: number;
}

export const DEVICE_BREAKPOINTS = {
  mobileMaxWidth: 767,
  tabletMinWidth: 768,
  tabletMaxWidth: 1024,
};

export const DEVICE_USER_AGENT_PATTERNS = {
  mobile: /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i,
  tablet: /iPad|Tablet|PlayBook|Silk/i,

  windows: /Windows NT/i,
  macOs: /Macintosh|Mac OS X/i,
  ios: /iPhone|iPad|iPod/i,
  android: /Android/i,
  linux: /Linux/i,

  edge: /Edg\//i,
  opera: /OPR|Opera/i,
  firefox: /Firefox|FxiOS/i,
  ie: /MSIE|Trident/i,
  chrome: /Chrome|CriOS/i,
  safari: /Safari/i,
};

export function detectDeviceType(
  userAgent: string,
  width: number,
): DeviceType {
  const normalizedUserAgent = userAgent || '';

  if (DEVICE_USER_AGENT_PATTERNS.tablet.test(normalizedUserAgent)) {
    return DeviceType.TABLET;
  }

  if (DEVICE_USER_AGENT_PATTERNS.mobile.test(normalizedUserAgent)) {
    return DeviceType.MOBILE;
  }

  if (width <= DEVICE_BREAKPOINTS.mobileMaxWidth) {
    return DeviceType.MOBILE;
  }

  if (
    width >= DEVICE_BREAKPOINTS.tabletMinWidth &&
    width <= DEVICE_BREAKPOINTS.tabletMaxWidth
  ) {
    return DeviceType.TABLET;
  }

  return DeviceType.DESKTOP;
}

export function detectOperatingSystem(userAgent: string): OperatingSystem {
  const normalizedUserAgent = userAgent || '';

  if (DEVICE_USER_AGENT_PATTERNS.ios.test(normalizedUserAgent)) {
    return OperatingSystem.IOS;
  }

  if (DEVICE_USER_AGENT_PATTERNS.android.test(normalizedUserAgent)) {
    return OperatingSystem.ANDROID;
  }

  if (DEVICE_USER_AGENT_PATTERNS.windows.test(normalizedUserAgent)) {
    return OperatingSystem.WINDOWS;
  }

  if (DEVICE_USER_AGENT_PATTERNS.macOs.test(normalizedUserAgent)) {
    return OperatingSystem.MAC_OS;
  }

  if (DEVICE_USER_AGENT_PATTERNS.linux.test(normalizedUserAgent)) {
    return OperatingSystem.LINUX;
  }

  return OperatingSystem.UNKNOWN;
}

export function detectBrowser(userAgent: string): BrowserType {
  const normalizedUserAgent = userAgent || '';

  if (DEVICE_USER_AGENT_PATTERNS.edge.test(normalizedUserAgent)) {
    return BrowserType.EDGE;
  }

  if (DEVICE_USER_AGENT_PATTERNS.opera.test(normalizedUserAgent)) {
    return BrowserType.OPERA;
  }

  if (DEVICE_USER_AGENT_PATTERNS.firefox.test(normalizedUserAgent)) {
    return BrowserType.FIREFOX;
  }

  if (DEVICE_USER_AGENT_PATTERNS.ie.test(normalizedUserAgent)) {
    return BrowserType.IE;
  }

  if (
    DEVICE_USER_AGENT_PATTERNS.chrome.test(normalizedUserAgent) &&
    !DEVICE_USER_AGENT_PATTERNS.edge.test(normalizedUserAgent) &&
    !DEVICE_USER_AGENT_PATTERNS.opera.test(normalizedUserAgent)
  ) {
    return BrowserType.CHROME;
  }

  if (
    DEVICE_USER_AGENT_PATTERNS.safari.test(normalizedUserAgent) &&
    !DEVICE_USER_AGENT_PATTERNS.chrome.test(normalizedUserAgent)
  ) {
    return BrowserType.SAFARI;
  }

  return BrowserType.UNKNOWN;
}

export function detectDeviceInfo(
  userAgent: string,
  width: number,
): DeviceInfo {
  const type = detectDeviceType(userAgent, width);

  return {
    type: type,
    os: detectOperatingSystem(userAgent),
    browser: detectBrowser(userAgent),
    isMobile: type === DeviceType.MOBILE,
    isTablet: type === DeviceType.TABLET,
    isDesktop: type === DeviceType.DESKTOP,
    userAgent: userAgent || '',
    width: width,
  };
}

export function detectCurrentDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: DeviceType.UNKNOWN,
      os: OperatingSystem.UNKNOWN,
      browser: BrowserType.UNKNOWN,
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      userAgent: '',
      width: 0,
    };
  }

  return detectDeviceInfo(
    window.navigator.userAgent,
    window.innerWidth,
  );
}