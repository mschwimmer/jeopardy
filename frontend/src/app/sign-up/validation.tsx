export type FormData = { username: string; email: string; password: string };
export type FieldError = { error: boolean; message: string };
export type Errors = {
  username: FieldError;
  email: FieldError;
  password: FieldError;
};

const ok: FieldError = { error: false, message: "" };

export function validateAll(values: FormData): Errors {
  const errors: Errors = { username: ok, email: ok, password: ok };

  if (!values.username || values.username.trim() === "")
    errors.username = { error: true, message: "Username is required" };

  if (!values.email || values.email.trim() === "")
    errors.email = { error: true, message: "Email is required" };
  else if (!/\S+@\S+\.\S+/.test(values.email))
    errors.email = { error: true, message: "Email is invalid" };

  if (!values.password || values.password.trim() === "")
    errors.password = { error: true, message: "Password is required" };
  else if (values.password.length < 8)
    errors.password = {
      error: true,
      message: "Password must be at least 8 characters",
    };

  return errors;
}

export function validateField(
  name: keyof FormData,
  value: string,
  current: FormData
): FieldError {
  return validateAll({ ...current, [name]: value })[name];
}

export function isValid(errs: Errors): boolean {
  return !errs.username.error && !errs.email.error && !errs.password.error;
}
