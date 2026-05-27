import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Filter, Lock, Eye, Edit } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';

export default function SharedDashboards() {
  const [filterRole, setFilterRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: sharedDashboards, isLoading } = trpc.dashboardSharing.getSharedDashboards.useQuery();

  const filteredDashboards = sharedDashboards?.filter((dashboard: any) => {
    const matchesRole = !filterRole || dashboard.role === filterRole;
    const matchesSearch = !searchQuery || 
      dashboard.dashboardName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.sharedBy?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  }) || [];

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shared Dashboards</h1>
        <p className="text-muted-foreground mt-2">Dashboards shared with you by team members</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterRole('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared Dashboards Grid */}
      <div>
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading shared dashboards...
            </CardContent>
          </Card>
        ) : filteredDashboards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDashboards.map((dashboard: any) => (
              <Card key={dashboard.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{dashboard.dashboardName}</CardTitle>
                      <CardDescription className="mt-1">
                        Shared by {dashboard.sharedBy}
                      </CardDescription>
                    </div>
                    <Badge className={getRoleColor(dashboard.role)}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(dashboard.role)}
                        {dashboard.role}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Shared on {format(new Date(dashboard.sharedAt), 'MMM d, yyyy')}</p>
                    {dashboard.expiresAt && (
                      <p className="text-orange-600">
                        Expires {format(new Date(dashboard.expiresAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <Button className="w-full" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      View Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No Shared Dashboards</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterRole
                  ? 'No dashboards match your filters'
                  : 'No dashboards have been shared with you yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Access Levels Info */}
      <Card>
        <CardHeader>
          <CardTitle>Access Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Eye className="w-3 h-3 mr-1" />
                Viewer
              </Badge>
              <p className="text-sm">View dashboards and reports only</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Edit className="w-3 h-3 mr-1" />
                Editor
              </Badge>
              <p className="text-sm">View and edit dashboards</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Lock className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <p className="text-sm">Full access including sharing and deletion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
