export class Preferences {
  private storage: Storage | null = null;
  private prefix: string;
  private cookieExpiryDays = 100;

  constructor(prefix: string) {
    this.prefix = prefix;
    // Use Local Storage if available
    if (typeof(Storage) !== "undefined") {
      this.storage = localStorage;
    }
  }


  ///// Getting and setting preferences

  setPrefs(name: string, value: any): void {
    let key = this.prefix + '.' + name;
    let json = JSON.stringify(value);
    if (this.storage) {
      // Use local storage
      this.storage.setItem(key, json);
    } else {
      // Use a cookie
      this.setCookie(key, json, this.cookieExpiryDays);
    }
  }
  
  getPrefs(name: string): any {
    var key = this.prefix + '.' + name;
    let str: string = '';
    if (this.storage) {
      // Use local storage
      str = String(this.storage.getItem(key));
    } else {
      // Use a cookie
      let cookieData = this.getCookie(key);
      if (cookieData === null)
        return null;
      str = cookieData;
    }
    return JSON.parse(str);
  }


  ///// Cookie helpers

  // (ported from w3schools example)

  private setCookie(cname: string, cvalue: string, expiryDays: number): void {
    var d = new Date();
    d.setTime(d.getTime() + (expiryDays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  private getCookie(cname: string): string | null {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
  }
}