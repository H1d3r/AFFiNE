import { Button } from '@affine/admin/components/ui/button';
import { Separator } from '@affine/admin/components/ui/separator';
import { useQuery } from '@affine/core/hooks/use-query';
import type { CopilotModels, CopilotPromptMessageRole } from '@affine/graphql';
import { getPromptsQuery } from '@affine/graphql';
import { useCallback } from 'react';

import { useRightPanel } from '../layout';
import { EditPrompt } from './edit-prompt';

export type Prompt = {
  __typename?: 'CopilotPromptType';
  name: string;
  model: CopilotModels;
  action: string | null;
  config: {
    __typename?: 'CopilotPromptConfigType';
    jsonMode: boolean | null;
    frequencyPenalty: number | null;
    presencePenalty: number | null;
    temperature: number | null;
    topP: number | null;
  } | null;
  messages: Array<{
    __typename?: 'CopilotPromptMessageType';
    role: CopilotPromptMessageRole;
    content: string;
    params: Record<string, string> | null;
  }>;
};

export function Prompts() {
  const { data } = useQuery({
    query: getPromptsQuery,
  });

  const list = data.listCopilotPrompts;
  const { setRightPanelContent, openPanel } = useRightPanel();

  const handleEdit = useCallback(
    (item: Prompt) => {
      setRightPanelContent(<EditPrompt item={item} />);
      openPanel();
    },
    [openPanel, setRightPanelContent]
  );

  return (
    <div className="flex flex-col h-full gap-3 py-5 px-6 w-full">
      <div className="flex items-center">
        <span className="text-xl font-semibold">Prompts</span>
      </div>
      <div className="flex-grow overflow-y-auto space-y-[10px]">
        <div className="flex flex-col rounded-md border w-full">
          {list.map((item, index) => (
            <div key={item.name.concat(index.toString())}>
              {index !== 0 && <Separator />}
              <Button
                variant="ghost"
                className="flex flex-col gap-1 w-full items-start px-6 py-[14px] h-full "
                onClick={() => handleEdit(item)}
              >
                <div>{item.name}</div>
                <div className="text-left w-full opacity-50 overflow-hidden text-ellipsis whitespace-nowrap break-words text-nowrap">
                  {item.messages.flatMap(message => message.content).join(' ')}
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
