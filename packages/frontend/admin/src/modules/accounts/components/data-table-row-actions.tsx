import { Button } from '@affine/admin/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@affine/admin/components/ui/dropdown-menu';
import { useAsyncCallback } from '@affine/core/hooks/affine-async-hooks';
import {
  useMutateQueryResource,
  useMutation,
} from '@affine/core/hooks/use-mutation';
import {
  createChangePasswordUrlMutation,
  deleteUserMutation,
  listUsersQuery,
} from '@affine/graphql';
import type { Row } from '@tanstack/react-table';
import {
  LockIcon,
  MoreVerticalIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useRightPanel } from '../../layout';
import { userSchema } from '../schema';
import { DeleteAccountDialog } from './delete-account';
import { EditPanel } from './edit-panel';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const user = userSchema.parse(row.original);
  const { setRightPanelContent, openPanel } = useRightPanel();

  const { trigger: onResetPassword } = useMutation({
    mutation: createChangePasswordUrlMutation,
  });
  const { trigger: deleteUserById } = useMutation({
    mutation: deleteUserMutation,
  });

  const revalidate = useMutateQueryResource();

  const handleResetPassword = useCallback(() => {
    onResetPassword({
      userId: user.id,
      callbackUrl: '/auth/changePassword?isClient=false',
    }).then(res => {
      navigator.clipboard.writeText(res.createChangePasswordUrl);
      toast('Reset password link copied to clipboard');
    });
  }, [onResetPassword, user.id]);

  const handleDelete = useAsyncCallback(async () => {
    await deleteUserById({ id: user.id })
      .then(async () => {
        toast('User deleted successfully');
        await revalidate(listUsersQuery);
        setDeleteDialogOpen(false);
      })
      .catch(e => {
        toast.error('Failed to delete user: ' + e.message);
      });
  }, [deleteUserById, revalidate, user.id]);

  const openDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleEdit = useCallback(() => {
    setRightPanelContent(
      <EditPanel
        user={user}
        onResetPassword={handleResetPassword}
        onDeleteAccount={openDeleteDialog}
      />
    );
    openPanel();
  }, [
    handleResetPassword,
    openDeleteDialog,
    openPanel,
    setRightPanelContent,
    user,
  ]);

  return (
    <div className="flex justify-end items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreVerticalIcon size={20} />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[214px] p-[5px] gap-2">
          <div className="px-2 py-[6px] text-sm font-semibold overflow-hidden text-ellipsis text-nowrap">
            {user.name}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="px-2 py-[6px] text-sm font-medium gap-2 cursor-pointer"
            onSelect={handleResetPassword}
          >
            <LockIcon size={16} /> Reset Password
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleEdit}
            className="px-2 py-[6px] text-sm font-medium gap-2 cursor-pointer"
          >
            <SettingsIcon size={16} /> Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="px-2 py-[6px] text-sm font-medium gap-2 text-red-700 cursor-pointer focus:text-red-700"
            onSelect={openDeleteDialog}
          >
            <TrashIcon size={16} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAccountDialog
        email={user.email}
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </div>
  );
}
