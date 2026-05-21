type FormMessageProps = {
  message: string | null;
};

export function FormMessage({ message }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="form-message" role="alert">
      {message}
    </p>
  );
}
