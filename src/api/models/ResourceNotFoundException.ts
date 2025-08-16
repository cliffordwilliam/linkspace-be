export class ResourceNotFoundException extends Error {
  code = "RESOURCE_NOT_FOUND";
  constructor(message: string) {
    super(message);
    this.name = "ResourceNotFoundException";
  }
}
