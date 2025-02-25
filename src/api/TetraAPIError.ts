export class TetraAPIError extends Error {
  public code: number;
  public message: string;
  public reference?: string;

  constructor(code: number, message?: string, reference?: string) {
    if (!message) message = "An error occurred";
    if (message && message.length > 128) {
      message = message.slice(0, 128) + "...";
    }
    super(message);
    this.code = code;
    this.message = message;
    this.reference = reference;
  }

  public toString(): string {
    return `${this.code}: ${this.message} ${this.reference ? `(${this.reference})` : ""}`;
  }
}
