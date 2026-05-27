import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Share2, Copy, Trash2, Lock, Eye, Edit } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface DashboardShareModalProps {
  dashboardId: string;
  dashboardName: string;
}

export function DashboardShareModal({ dashboardId, dashboardName }: DashboardShareModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: shares, refetch } = trpc.dashboardSharing.getDashboardShares.useQuery({
    dashboardId,
  });

  const shareMutation = trpc.dashboardSharing.shareDashboard.useMutation();
  const updateRoleMutation = trpc.dashboardSharing.updateShareRole.useMutation();
  const revokeMutation = trpc.dashboardSharing.revokeDashboardShare.useMutation();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await shareMutation.mutateAsync({
        dashboardId,
        sharedWithUserId: email,
        role,
      });
      toast.success(`Dashboard shared with ${email}`);
      setEmail('');
      setRole('viewer');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        dashboardId,
        sharedWithUserId: userId,
        role: newRole as 'viewer' | 'editor' | 'admin',
      });
      toast.success('Role updated');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await revokeMutation.mutateAsync({
        dashboardId,
        sharedWithUserId: userId,
      });
      toast.success('Access revoked');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      case 'editor':
        return <Edit className="w-4 h-4" />;
      case 'admin':
        return <Lock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'viewer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'editor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Share "{dashboardName}" with team members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Form */}
          <form onSubmit={handleShare} className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Read only</SelectItem>
                  <SelectItem value="editor">Editor - Can edit</SelectItem>
                  <SelectItem value="admin">Admin - Full control</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Sharing...' : 'Share Dashboard'}
            </Button>
          </form>

          {/* Current Shares */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Shared With</h3>
            {shares && shares.length > 0 ? (
              <div className="space-y-2">
                {shares.map((share: any) => (
                  <div key={share.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2 flex-1">
                      <Badge className={getRoleColor(share.role)}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(share.role)}
                          {share.role}
                        </span>
                      </Badge>
                      <span className="text-sm truncate">{share.sharedWithUserId}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Select
                        value={share.role}
                        onValueChange={(newRole) => handleUpdateRole(share.sharedWithUserId, newRole)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove access for {share.sharedWithUserId}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevoke(share.sharedWithUserId)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not shared with anyone yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
