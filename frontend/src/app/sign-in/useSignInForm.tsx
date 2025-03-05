import { useState } from "react";

export function useSignInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: { error: false, message: "" },
    password: { error: false, message: "" },
  });

  const validateField = (name: string, value: string) => {
    const newErrors = { ...formErrors };

    switch (name) {
      case "email":
        if (!value) {
          newErrors.email = { error: true, message: "Email is required." };
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = {
            error: true,
            message: "Please enter a valid email address.",
          };
        } else {
          newErrors.email = { error: false, message: "" };
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = {
            error: true,
            message: "Password is required.",
          };
        } else if (value.length < 6) {
          newErrors.password = {
            error: true,
            message: "Password must be at least 6 characters long.",
          };
        } else {
          newErrors.password = { error: false, message: "" };
        }
        break;
    }

    setFormErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
  };

  const validateAllFields = () => {
    validateField("email", formData.email);
    validateField("password", formData.password);

    return !(formErrors.email.error || formErrors.password.error);
  };

  return {
    formData,
    formErrors,
    handleInputChange,
    validateAllFields,
  };
}
