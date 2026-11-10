/**
 * Device detector utilities.
 * File generico, senza dipendenze esterne.
 */

/**
 * @author l.piciollo
 * Enumerazione delle tipologie di dispositivo rilevabili: mobile, tablet, desktop oppure sconosciuto.
 */
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  UNKNOWN = 'unknown',
}

/**
 * @author l.piciollo
 * Enumerazione dei sistemi operativi rilevabili dallo user agent (Windows, macOS, iOS, Android, Linux) o sconosciuto.
 */
export enum OperatingSystem {
  WINDOWS = 'windows',
  MAC_OS = 'mac-os',
  IOS = 'ios',
  ANDROID = 'android',
  LINUX = 'linux',
  UNKNOWN = 'unknown',
}

/**
 * @author l.piciollo
 * Enumerazione dei browser rilevabili dallo user agent (Edge, Chrome, Firefox, Safari, Opera, IE) o sconosciuto.
 */
export enum BrowserType {
  EDGE = 'edge',
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  OPERA = 'opera',
  IE = 'ie',
  UNKNOWN = 'unknown',
}

/**
 * @author l.piciollo
 * Informazioni sul dispositivo corrente ricavate da user agent e larghezza della finestra.
 * E' il risultato delle funzioni detectDeviceInfo e detectCurrentDeviceInfo.
 */
export interface DeviceInfo {
  /** tipologia di dispositivo (mobile, tablet, desktop, sconosciuto) */
  type: DeviceType;
  /** sistema operativo rilevato */
  os: OperatingSystem;
  /** browser rilevato */
  browser: BrowserType;
  /** true se il dispositivo e' di tipo mobile */
  isMobile: boolean;
  /** true se il dispositivo e' di tipo tablet */
  isTablet: boolean;
  /** true se il dispositivo e' di tipo desktop */
  isDesktop: boolean;
  /** stringa user agent da cui sono state ricavate le informazioni */
  userAgent: string;
  /** larghezza in pixel della finestra al momento del rilevamento */
  width: number;
}

/**
 * @author l.piciollo
 * Costante di configurazione con le soglie di larghezza (in pixel) usate per distinguere mobile, tablet e desktop.
 */
export const DEVICE_BREAKPOINTS = {
  /** larghezza massima (inclusa) per considerare il dispositivo mobile */
  mobileMaxWidth: 767,
  /** larghezza minima (inclusa) per considerare il dispositivo tablet */
  tabletMinWidth: 768,
  /** larghezza massima (inclusa) per considerare il dispositivo tablet */
  tabletMaxWidth: 1024,
};

/**
 * @author l.piciollo
 * Costante di configurazione con le espressioni regolari applicate allo user agent per riconoscere tipo di
 * dispositivo, sistema operativo e browser. L'ordine di applicazione e' deciso dalle funzioni detect*.
 */
export const DEVICE_USER_AGENT_PATTERNS = {
  /** riconoscimento dei dispositivi mobile */
  mobile: /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i,
  /** riconoscimento dei tablet */
  tablet: /iPad|Tablet|PlayBook|Silk/i,

  /** sistema operativo Windows */
  windows: /Windows NT/i,
  /** sistema operativo macOS */
  macOs: /Macintosh|Mac OS X/i,
  /** sistema operativo iOS */
  ios: /iPhone|iPad|iPod/i,
  /** sistema operativo Android */
  android: /Android/i,
  /** sistema operativo Linux */
  linux: /Linux/i,

  /** browser Microsoft Edge (basato su Chromium) */
  edge: /Edg\//i,
  /** browser Opera */
  opera: /OPR|Opera/i,
  /** browser Firefox (inclusa la versione iOS) */
  firefox: /Firefox|FxiOS/i,
  /** browser Internet Explorer */
  ie: /MSIE|Trident/i,
  /** browser Chrome (inclusa la versione iOS); va escluso Edge e Opera che lo contengono nello user agent */
  chrome: /Chrome|CriOS/i,
  /** browser Safari; va escluso Chrome che lo contiene nello user agent */
  safari: /Safari/i,
};

/**
 * @author l.piciollo
 * Determina il tipo di dispositivo: prima controlla lo user agent (tablet, poi mobile), poi usa la larghezza
 * della finestra con le soglie di DEVICE_BREAKPOINTS; se nulla corrisponde restituisce desktop.
 * @param userAgent  :stringa user agent del browser (se vuota viene trattata come stringa vuota)
 * @param width      :larghezza in pixel della finestra
 * @returns la tipologia di dispositivo rilevata
 */
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

/************************************************************************************************************************/

/**
 * @author l.piciollo
 * Determina il sistema operativo dallo user agent (l'ordine dei controlli conta: iOS prima di macOS, Android prima di Linux).
 * @param userAgent  :stringa user agent del browser
 * @returns il sistema operativo rilevato oppure UNKNOWN
 */
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

/************************************************************************************************************************/

/**
 * @author l.piciollo
 * Determina il browser dallo user agent (l'ordine dei controlli conta perche' Edge, Opera e Chrome condividono parti dello user agent).
 * @param userAgent  :stringa user agent del browser
 * @returns il browser rilevato oppure UNKNOWN
 */
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

/************************************************************************************************************************/

/**
 * @author l.piciollo
 * Compone l'oggetto DeviceInfo completo (tipo, sistema operativo, browser e flag) a partire da user agent e larghezza.
 * @param userAgent  :stringa user agent del browser
 * @param width      :larghezza in pixel della finestra
 * @returns le informazioni sul dispositivo
 */
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

/************************************************************************************************************************/

/**
 * @author l.piciollo
 * Rileva le informazioni del dispositivo corrente leggendo navigator.userAgent e window.innerWidth.
 * Se l'oggetto window non esiste (es. rendering lato server) restituisce valori sconosciuti.
 * @returns le informazioni sul dispositivo corrente
 */
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