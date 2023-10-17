/**
 * Internal Error class
 */
export class DenoWorkspacesError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export const ERROR_SOURCE_WORKSPACES_POSTFIX =
  `This error comes from Deno Workspaces. If you think this is a bug, please file a bug report at `;
export const ERROR_SOURCE_EXTERNAL_PREFIX =
  `This following error does not come from Deno Workspaces, but from an external place. File any bug report with the respective projects.`;
