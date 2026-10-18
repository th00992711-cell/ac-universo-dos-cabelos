export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

export const fail = (error: string): ActionResult<never> => ({ ok: false, error });
