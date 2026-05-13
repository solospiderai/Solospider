import { useProject } from "./ProjectLayout";
import { SocialPostEditor } from "@/components/SocialPostEditor";
import { useNavigate } from "react-router-dom";

export function SocialPostsPage() {
  const { project } = useProject();
  const navigate = useNavigate();

  return (
    <SocialPostEditor
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          // If they try to dismiss, send them back to the dashboard
          navigate("/app/en/dashboard");
        }
      }}
      projectId={project?.id || ""}
      idea={null}
      existingPost={null}
      onSaved={() => {
        // Handled internally by the editor, or navigate away if needed
      }}
    />
  );
}
