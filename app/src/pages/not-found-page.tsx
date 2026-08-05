import { FeedbackState } from "cleanplate";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <FeedbackState
      variant="error"
      title="Page not found"
      description="That tool or page does not exist."
      icon="search_off"
      primaryAction={{ label: "Go home", onClick: () => navigate("/") }}
      margin="4"
    />
  );
}
