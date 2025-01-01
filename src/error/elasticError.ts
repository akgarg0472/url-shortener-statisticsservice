export class ElasticInitError extends Error {
  err: any;

  constructor(message: string, err: any) {
    super(message);
    this.err = err;
  }
}
