import { APIConnections } from "@/components/dashboard/APIConnections";

/**
 * Social Tab - API Connections Management
 * Allows users to connect and manage their stores and social media accounts
 */
export default function Social() {
  return (
    <div className="space-y-6">
      <APIConnections />
    </div>
  );
}
