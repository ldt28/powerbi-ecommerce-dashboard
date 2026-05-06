import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, User, Eye, MoreVertical, Trash2, Edit } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
  joinedAt: Date;
  lastActive?: Date;
  status: "active" | "inactive" | "pending";
}

interface TeamMemberCardProps {
  member: TeamMember;
  isCurrentUser?: boolean;
  onEdit?: (member: TeamMember) => void;
  onRemove?: (memberId: number) => void;
}

/**
 * Team Member Card Component
 * Displays team member info with role badge and actions
 */
export function TeamMemberCard({
  member,
  isCurrentUser = false,
  onEdit,
  onRemove,
}: TeamMemberCardProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "editor":
        return <Edit className="h-4 w-4" />;
      case "viewer":
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-400";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Member Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{member.name}</h3>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{member.email}</p>

              {/* Role and Status */}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                  {getRoleIcon(member.role)}
                  {getRoleLabel(member.role)}
                </Badge>

                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`} />
                  <span className="text-xs text-muted-foreground">{getStatusLabel(member.status)}</span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Joined</p>
                  <p>{new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Last Active</p>
                  <p>{formatDate(member.lastActive)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(member)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Role
                  </DropdownMenuItem>
                )}
                {onRemove && (
                  <DropdownMenuItem onClick={() => onRemove(member.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Team Members Grid Component
 */
export function TeamMembersGrid({
  members,
  currentUserId,
  onEdit,
  onRemove,
}: {
  members: TeamMember[];
  currentUserId?: number;
  onEdit?: (member: TeamMember) => void;
  onRemove?: (memberId: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          isCurrentUser={member.id === currentUserId}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

/**
 * Role Badge Component (Standalone)
 */
export function RoleBadge({ role, size = "default" }: { role: "admin" | "editor" | "viewer"; size?: "sm" | "default" }) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />;
      case "editor":
        return <Edit className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />;
      case "viewer":
        return <Eye className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />;
      default:
        return <User className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Badge variant={getRoleBadgeVariant(role)} className={`gap-1 ${size === "sm" ? "text-xs" : ""}`}>
      {getRoleIcon(role)}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
