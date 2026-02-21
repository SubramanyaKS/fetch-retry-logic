export class FetchError extends Error {
  status: number;
  headers?:Headers;
  
  constructor(message: string, status: number,headers?:Headers) {
    super(message);
    this.status = status;
    this.headers=headers;
    Object.setPrototypeOf(this, FetchError.prototype);
  }
}