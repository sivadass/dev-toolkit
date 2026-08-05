import { FeedbackState } from "cleanplate";
import { useNavigate, useParams } from "react-router-dom";
import { getToolById } from "../config/tools";
import { NotFoundPage } from "./not-found-page";

export function ComingSoonPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const tool = toolId ? getToolById(toolId) : undefined;

  if (!tool || tool.status !== "coming-soon") {
    return <NotFoundPage />;
  }

  return (
    <FeedbackState
      variant="empty"
      title={tool.title}
      description="Coming soon — this tool is not built yet."
      icon={tool.icon as never}
      primaryAction={{ label: "All tools", onClick: () => navigate("/") }}
      margin="4"
    />
  );
}
