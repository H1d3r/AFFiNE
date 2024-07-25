import { Badge } from '@affine/admin/components/ui/badge';
import { Button } from '@affine/admin/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@affine/admin/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@affine/admin/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@affine/admin/components/ui/table';
import { useQuery } from '@affine/core/hooks/use-query';
import { listUsersQuery } from '@affine/graphql';
import { CircleUser, MoreHorizontal } from 'lucide-react';

export function Users() {
  const {
    data: { users },
  } = useQuery({
    query: listUsersQuery,
    variables: {
      filter: {
        first: 5,
        skip: 0,
      },
    },
  });

  const usersCells = users.map(user => {
    const avatar = user.avatarUrl ? (
      <img
        alt="User avatar"
        className="aspect-square rounded-md object-cover"
        height="64"
        src={user.avatarUrl}
        width="64"
      />
    ) : (
      <CircleUser size={36} />
    );
    return (
      <TableRow key={user.id}>
        <TableCell className="hidden sm:table-cell">{avatar}</TableCell>
        <TableCell className="hidden md:table-cell">{user.id}</TableCell>
        <TableCell className="font-medium">{user.name}</TableCell>
        <TableCell>
          <Badge variant="outline">
            {user.emailVerified ? 'Email Verified' : 'Not yet verified'}
          </Badge>
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell className="hidden md:table-cell">
          {user.hasPassword ? '✅' : '❌'}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Card x-chunk="dashboard-06-chunk-0" className="h-screen">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Manage your users and edit their properties.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead className="hidden md:table-cell">Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">
                Has password
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{usersCells}</TableBody>
          <TableFooter />
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
      </CardFooter>
    </Card>
  );
}

export { Users as Component };
