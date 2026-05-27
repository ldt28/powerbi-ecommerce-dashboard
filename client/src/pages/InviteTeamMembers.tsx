import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Mail, RotateCcw, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function InviteTeamMembers() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: invitations, isLoading, refetch } = trpc.teamInvitations.listInvitations.useQuery();
  const sendInvitation = trpc.teamInvitations.sendInvitation.useMutation();
  const resendInvitation = trpc.teamInvitations.resendInvitation.useMutation();
  const cancelInvitation = trpc.teamInvitations.cancelInvitation.useMutation();

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendInvitation.mutateAsync({ email, role, message });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setMessage('');
      setRole('editor');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      await resendInvitation.mutateAsync({ invitationId });
      toast.success('Invitation resent');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelInvitation.mutateAsync({ invitationId });
      toast.success('Invitation cancelled');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (invitation: any) => {
    if (invitation.acceptedAt) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <Clock className="w-4 h-4 text-yellow-600" />;
  };

  const getStatusText = (invitation: any) => {
    if (invitation.acceptedAt) {
      return 'Accepted';
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      return 'Expired';
    }
    return 'Pending';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invite Team Members</h1>
        <p className="text-muted-foreground mt-2">Send invitations to join your team and assign roles</p>
      </div>

      {/* Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
          <CardDescription>Invite a new team member by email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="team@example.com"
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
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="editor">Editor - Can edit dashboards</SelectItem>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Optional)</label>
              <Textarea
                placeholder="Add a personal message to the invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>{invitations?.length || 0} invitations sent</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invitations...</div>
          ) : invitations && invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation: any) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitation)}
                      <span className="text-sm font-medium">{getStatusText(invitation)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {format(new Date(invitation.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={getRoleColor(invitation.role)}>
                      {invitation.role}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusText(invitation) === 'Pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResend(invitation.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this invitation to {invitation.email}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(invitation.id)} className="bg-red-600 hover:bg-red-700">
                                Cancel Invitation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No invitations sent yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Admin</Badge>
              <p className="text-sm">Full access to all features, team management, and settings</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Editor</Badge>
              <p className="text-sm">Can create, edit, and delete dashboards and reports</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Viewer</Badge>
              <p className="text-sm">Read-only access to dashboards and reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
