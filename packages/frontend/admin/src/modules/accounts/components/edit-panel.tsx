import { Button } from '@affine/admin/components/ui/button';
import { Input } from '@affine/admin/components/ui/input';
import { Label } from '@affine/admin/components/ui/label';
import { Separator } from '@affine/admin/components/ui/separator';
import { Switch } from '@affine/admin/components/ui/switch';
import { useAsyncCallback } from '@affine/core/hooks/affine-async-hooks';
import {
  useMutateQueryResource,
  useMutation,
} from '@affine/core/hooks/use-mutation';
import {
  addToAdminMutation,
  addToEarlyAccessMutation,
  EarlyAccessType,
  FeatureType,
  listUsersQuery,
  removeAdminMutation,
  removeEarlyAccessMutation,
  updateAccountMutation,
} from '@affine/graphql';
import { CheckIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useRightPanel } from '../../layout';
import type { User } from '../schema';

interface EditPanelProps {
  user: User;
  onResetPassword: () => void;
  onDeleteAccount: () => void;
}

export function EditPanel({
  user,
  onResetPassword,
  onDeleteAccount,
}: EditPanelProps) {
  const { closePanel } = useRightPanel();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [features, setFeatures] = useState(user.features);

  const disableSave = useMemo(
    () =>
      name === user.name && email === user.email && features === user.features,
    [email, features, name, user.email, user.features, user.name]
  );
  const { trigger: updateAccount } = useMutation({
    mutation: updateAccountMutation,
  });

  const { trigger: addToEarlyAccess } = useMutation({
    mutation: addToEarlyAccessMutation,
  });
  const { trigger: removeEarlyAccess } = useMutation({
    mutation: removeEarlyAccessMutation,
  });
  const { trigger: addToAdmin } = useMutation({
    mutation: addToAdminMutation,
  });
  const { trigger: removeAdmin } = useMutation({
    mutation: removeAdminMutation,
  });

  const revalidate = useMutateQueryResource();

  const updateFeatures = useCallback(() => {
    const shoutAddToAdmin = features.includes(FeatureType.Admin);
    const shoutAddToAIEarlyAccess = features.includes(
      FeatureType.AIEarlyAccess
    );

    return Promise.all([
      shoutAddToAdmin ? addToAdmin({ email }) : removeAdmin({ email }),
      shoutAddToAIEarlyAccess
        ? addToEarlyAccess({ email, type: EarlyAccessType.AI })
        : removeEarlyAccess({ email, type: EarlyAccessType.AI }),
    ]);
  }, [
    addToAdmin,
    addToEarlyAccess,
    email,
    features,
    removeAdmin,
    removeEarlyAccess,
  ]);

  const onConfirm = useAsyncCallback(async () => {
    updateAccount({
      id: user.id,
      input: {
        name,
        email,
      },
    })
      .then(async () => {
        await updateFeatures();
        await revalidate(listUsersQuery);
        toast('Account updated successfully');
        closePanel();
      })
      .catch(e => {
        toast.error('Failed to update account: ' + e.message);
      });
  }, [closePanel, email, name, revalidate, updateAccount, updateFeatures]);

  const onEarlyAccessChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        setFeatures([...features, FeatureType.AIEarlyAccess]);
      } else {
        setFeatures(features.filter(f => f !== FeatureType.AIEarlyAccess));
      }
    },
    [features]
  );

  const onAdminChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        setFeatures([...features, FeatureType.Admin]);
      } else {
        setFeatures(features.filter(f => f !== FeatureType.Admin));
      }
    },
    [features]
  );

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setFeatures(user.features);
  }, [user]);

  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex justify-between items-center py-[10px] px-6">
        <Button
          type="button"
          size="icon"
          className="w-7 h-7"
          variant="ghost"
          onClick={closePanel}
        >
          <XIcon size={20} />
        </Button>
        <span className="text-base font-medium">Edit Account</span>
        <Button
          type="submit"
          size="icon"
          className="w-7 h-7"
          variant="ghost"
          onClick={onConfirm}
          disabled={disableSave}
        >
          <CheckIcon size={20} />
        </Button>
      </div>
      <Separator />
      <div className="p-4 flex-grow overflow-y-auto space-y-[10px]">
        <div className="flex flex-col rounded-md border py-4 gap-4">
          <div className="px-5 space-y-3">
            <Label className="text-sm font-medium">Name</Label>
            <Input
              type="text"
              className="py-2 px-3 text-base font-normal"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <Separator />
          <div className="px-5 space-y-3">
            <Label className="text-sm font-medium">Email</Label>
            <Input
              type="email"
              className="py-2 px-3 ext-base font-normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>
        <Button
          className="w-full flex items-center justify-between text-sm font-medium px-4 py-3"
          variant="outline"
          onClick={onResetPassword}
        >
          <span>Reset Password</span>
          <ChevronRightIcon size={16} />
        </Button>
        <div className="border rounded-md">
          <Label className="flex items-center justify-between px-4 py-3">
            <span>Enable AI Access</span>
            <Switch
              checked={features.includes(FeatureType.AIEarlyAccess)}
              onCheckedChange={onEarlyAccessChange}
            />
          </Label>
          <Separator />
          <Label className="flex items-center justify-between px-4 py-3">
            <span>Admin</span>
            <Switch
              checked={features.includes(FeatureType.Admin)}
              onCheckedChange={onAdminChange}
            />
          </Label>
        </div>
        <Button
          className="w-full text-red-500 px-4 py-3 rounded-md flex items-center justify-between text-sm font-medium hover:text-red-500"
          variant="outline"
          onClick={onDeleteAccount}
        >
          <span>Delete Account</span>
          <ChevronRightIcon size={16} />
        </Button>
      </div>
    </div>
  );
}
