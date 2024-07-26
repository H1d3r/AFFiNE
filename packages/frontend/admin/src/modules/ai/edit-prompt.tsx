import { Button } from '@affine/admin/components/ui/button';
import { ScrollArea } from '@affine/admin/components/ui/scroll-area';
import { Separator } from '@affine/admin/components/ui/separator';
import { Textarea } from '@affine/admin/components/ui/textarea';
import { CheckIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useRightPanel } from '../layout';
import type { Prompt } from './prompts';

export function EditPrompt({ item }: { item: Prompt }) {
  const { closePanel } = useRightPanel();

  const [messages, setMessages] = useState(item.messages);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      console.log(e);
    },
    []
  );

  const onConfirm = useCallback(() => {
    closePanel();
  }, [closePanel]);

  //TODO(Jimmfly): add logic to save
  const [disableSave, _] = useState(true);

  useEffect(() => {
    setMessages(item.messages);
  }, [item.messages]);

  return (
    <div className="flex flex-col h-screen gap-1">
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
        <span className="text-base font-medium">Edit Prompt</span>
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
      <ScrollArea>
        <div className="px-5 py-4 overflow-y-auto space-y-[10px] flex flex-col gap-5">
          <div className="flex flex-col">
            <div className="text-sm font-medium">Name</div>
            <div className="text-sm font-normal text-zinc-500">{item.name}</div>
          </div>
          {item.action ? (
            <div className="flex flex-col">
              <div className="text-sm font-medium">Action</div>
              <div className="text-sm font-normal text-zinc-500">
                {item.action}
              </div>
            </div>
          ) : null}
          <div className="flex flex-col">
            <div className="text-sm font-medium">Model</div>
            <div className="text-sm font-normal text-zinc-500">
              {item.model}
            </div>
          </div>
          {item.config ? (
            <div className="flex flex-col border rounded p-3">
              <div className="text-sm font-medium">Config</div>
              {Object.entries(item.config).map(([key, value], index) => (
                <div key={key} className="flex flex-col">
                  {index !== 0 && <Separator />}
                  <span className="text-sm font-normal">{key}</span>
                  <span className="text-sm font-normal text-zinc-500">
                    {value?.toString()}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="px-5 py-4 overflow-y-auto space-y-[10px] flex flex-col">
          <div className="text-sm font-medium">Messages</div>
          {messages.map((message, index) => (
            <div key={index} className="flex flex-col gap-3">
              {index !== 0 && <Separator />}
              <div>
                <div className="text-sm font-normal">Role</div>
                <div className="text-sm font-normal text-zinc-500">
                  {message.role}
                </div>
              </div>

              {message.params ? (
                <div>
                  <div className="text-sm font-medium">Params</div>
                  {Object.entries(message.params).map(([key, value], index) => (
                    <div key={key} className="flex flex-col">
                      {index !== 0 && <Separator />}
                      <span className="text-sm font-normal">{key}</span>
                      <span className="text-sm font-normal text-zinc-500">
                        {value.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="text-sm font-normal">Content</div>
              <Textarea
                className=" min-h-48"
                value={message.content}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
