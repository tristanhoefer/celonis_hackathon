// Copied from: https://netbasal.com/automagically-unsubscribe-in-angular-4487e9853a88
/**
 * Directive for Automatically Unsubscribe from open Subscriptions
 * @param blackList
 * @constructor
 */
export function AutoUnsubscribe(blackList = []) {
  return function (constructor: any) {
    const original = constructor.prototype.ngOnDestroy;

    constructor.prototype.ngOnDestroy = function () {
      for (let prop in this) {
        if (this.hasOwnProperty(prop)) {
          const property = this[prop];
          // @ts-ignore
          if (!blackList.includes(prop) && property && (typeof property.unsubscribe === "function")) {
            property.next(true);
            property.unsubscribe();
          }
        }
      }
      original && typeof original === 'function' && original.apply(this, arguments);
    };
  }
}
