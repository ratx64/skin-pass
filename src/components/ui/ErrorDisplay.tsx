interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return (
    <p className="alert" role="alert">
      {message}
    </p>
  );
};
