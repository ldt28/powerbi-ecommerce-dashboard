import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this data. Please try again.",
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm">{message}</p>
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function DataFetchError({
  error,
  onRetry,
}: {
  error: Error | string;
  onRetry?: () => void;
}) {
  const message = typeof error === "string" ? error : error.message;
  return (
    <ErrorState
      title="Failed to load data"
      message={message}
      onRetry={onRetry}
      showRetry={!!onRetry}
    />
  );
}

export function EmptyState({
  title = "No data available",
  message = "There's no data to display at the moment.",
  icon: Icon = AlertCircle,
}: {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
    </div>
  );
}

export function ConnectionError({
  platform,
  onRetry,
}: {
  platform: string;
  onRetry?: () => void;
}) {
  return (
    <ErrorState
      title={`${platform} Connection Error`}
      message={`Failed to connect to ${platform}. Please check your credentials and try again.`}
      onRetry={onRetry}
      showRetry={!!onRetry}
    />
  );
}
