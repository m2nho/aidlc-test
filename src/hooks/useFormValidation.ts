import { useState, useCallback, useRef } from 'react';
import { ValidationRules } from '../services/types';

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void>;
}

/**
 * Custom hook for form validation with debounced onChange, onBlur, and onSubmit support
 */
export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    {} as Record<keyof T, string | null>
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce timer refs
  const debounceTimersRef = useRef<Record<string, number>>({});

  // Validate single field
  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      const validationRule = validationRules[field];
      if (!validationRule) return null;
      return validationRule(value);
    },
    [validationRules]
  );

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const newErrors: Record<keyof T, string | null> = {} as Record<
      keyof T,
      string | null
    >;
    let hasErrors = false;

    (Object.keys(values) as Array<keyof T>).forEach((field) => {
      const error = validateField(field, values[field]);
      newErrors[field] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [values, validateField]);

  // Handle change with debounce (300ms)
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      // Update value immediately
      setValues((prev) => ({ ...prev, [field]: value }));

      // Only validate if field has been touched
      if (touched[field]) {
        // Clear existing timer
        if (debounceTimersRef.current[field as string]) {
          clearTimeout(debounceTimersRef.current[field as string]);
        }

        // Set new timer for debounced validation
        debounceTimersRef.current[field as string] = window.setTimeout(() => {
          const error = validateField(field, value);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }, 300);
      }
    },
    [validateField, touched]
  );

  // Handle blur - immediate validation
  const handleBlur = useCallback(
    (field: keyof T) => {
      // Mark field as touched
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Immediate validation
      const error = validateField(field, values[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateField, values]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = (Object.keys(values) as Array<keyof T>).reduce(
        (acc, field) => {
          acc[field] = true;
          return acc;
        },
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      // Validate all fields
      const isValid = validateAllFields();

      if (!isValid) {
        return;
      }

      // Submit
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAllFields, onSubmit]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | null>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);

    // Clear all debounce timers
    Object.values(debounceTimersRef.current).forEach((timer) => {
      clearTimeout(timer);
    });
    debounceTimersRef.current = {};
  }, [initialValues]);

  // Set specific field value (useful for programmatic updates)
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set specific field error (useful for server-side validation)
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
}
