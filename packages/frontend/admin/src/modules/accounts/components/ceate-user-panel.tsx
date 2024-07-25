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
  createUserMutation,
  EarlyAccessType,
  FeatureType,
  listUsersQuery,
} from '@affine/graphql';
import { CheckIcon, XIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useRightPanel } from '../../layout';

export function CreateUserPanel() {
  const { closePanel } = useRightPanel();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [features, setFeatures] = useState<FeatureType[]>([]);

  const disableSave = useMemo(() => !name || !email, [name, email]);

  const { trigger: createUser } = useMutation({
    mutation: createUserMutation,
  });

  const { trigger: addToEarlyAccess } = useMutation({
    mutation: addToEarlyAccessMutation,
  });

  const { trigger: addToAdmin } = useMutation({
    mutation: addToAdminMutation,
  });

  const revalidate = useMutateQueryResource();

  const updateFeatures = useCallback(() => {
    const shoutAddToAdmin = features.includes(FeatureType.Admin);
    const shoutAddToAIEarlyAccess = features.includes(
      FeatureType.AIEarlyAccess
    );

    return Promise.all([
      shoutAddToAdmin && addToAdmin({ email }),
      shoutAddToAIEarlyAccess &&
        addToEarlyAccess({ email, type: EarlyAccessType.AI }),
    ]);
  }, [addToAdmin, addToEarlyAccess, email, features]);

  const onConfirm = useAsyncCallback(async () => {
    await createUser({
      input: {
        name,
        email,
        password,
      },
    })
      .then(async () => {
        await updateFeatures();
        await revalidate(listUsersQuery);
        toast('User created successfully');
        closePanel();
      })
      .catch(e => {
        toast(e.message);
        console.error(e);
      });
  }, [
    closePanel,
    createUser,
    email,
    name,
    password,
    revalidate,
    updateFeatures,
  ]);

  const onEarlyAccessChange = useCallback(
    (checked: boolean) => {
      setFeatures(
        checked
          ? [...features, FeatureType.AIEarlyAccess]
          : features.filter(f => f !== FeatureType.AIEarlyAccess)
      );
    },
    [features]
  );

  const onAdminChange = useCallback(
    (checked: boolean) => {
      setFeatures(
        checked
          ? [...features, FeatureType.Admin]
          : features.filter(f => f !== FeatureType.Admin)
      );
    },
    [features]
  );

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
        <span className="text-base font-medium">Create Account</span>
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
          </div>{' '}
          <Separator />
          <div className="px-5 space-y-3">
            <Label className="text-sm font-medium">Password</Label>
            <Input
              type="password"
              className="py-2 px-3 ext-base font-normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

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
      </div>
    </div>
  );
}
