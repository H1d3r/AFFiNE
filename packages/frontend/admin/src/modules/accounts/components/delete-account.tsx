import { Button } from '@affine/admin/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@affine/admin/components/ui/dialog';
import { Input } from '@affine/admin/components/ui/input';
import { useCallback, useState } from 'react';

export const DeleteAccountDialog = ({
  email,
  open,
  onClose,
  onDelete,
  onOpenChange,
}: {
  email: string;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const [input, setInput] = useState('');
  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    [setInput]
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account ?</DialogTitle>
          <DialogDescription>
            <span className="font-bold">{email}</span> will be permanently
            deleted. This operation is irreversible. Please proceed with
            caution.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          value={input}
          onChange={handleInput}
          placeholder="Please type email to confirm"
        />
        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onDelete}
              size="sm"
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
