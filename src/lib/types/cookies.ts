export enum CookiesMethod {
  NONE,
  RAW,
  BROWSER,
}

export enum CookiesFromBrowserMethod {
  CHROME, BRAVE, EDGE, OPERA, VIVALDI, WHALE, FIREFOX, SAFARI, OTHER,
}

export type CookiesPreferences = { 
  cookiesMethod: CookiesMethod,
  cookiesRaw: string,
  cookiesFromBrowserMethod: CookiesFromBrowserMethod
  cookiesFromBrowserMethodOther: string
}
