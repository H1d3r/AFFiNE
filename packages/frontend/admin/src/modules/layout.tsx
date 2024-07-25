import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@affine/admin/components/ui/resizable';
import { Separator } from '@affine/admin/components/ui/separator';
import { TooltipProvider } from '@affine/admin/components/ui/tooltip';
import { cn } from '@affine/admin/utils';
import { ClipboardList, Cpu, Settings, Users } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';

import { Logo } from './accounts/components/logo';
import type { NavProp } from './nav/nav';
import { Nav } from './nav/nav';

interface LayoutProps {
  content: ReactNode;
}

interface RightPanelContextType {
  rightPanelContent: ReactNode;
  setRightPanelContent: (content: ReactNode) => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
}
const RightPanelContext = createContext<RightPanelContextType | undefined>(
  undefined
);

const navLinks: NavProp[] = [
  {
    title: 'Accounts',
    icon: Users,
    variant: 'default',
  },
  {
    title: 'AI',
    icon: Cpu,
    variant: 'ghost',
  },
  {
    title: 'Config',
    icon: ClipboardList,
    variant: 'ghost',
  },
  {
    title: 'Settings',
    icon: Settings,
    variant: 'ghost',
  },
];

export const useRightPanel = () => {
  const context = useContext(RightPanelContext);

  if (!context) {
    throw new Error('useRightPanel must be used within a RightPanelProvider');
  }

  return context;
};

export function Layout({ content }: LayoutProps) {
  const [rightPanelContent, setRightPanelContent] = useState<ReactNode>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const handleExpand = useCallback(() => {
    if (rightPanelRef.current?.getSize() === 0) {
      rightPanelRef.current?.resize(30);
    }
  }, [rightPanelRef]);

  const openPanel = useCallback(() => {
    handleExpand();
    rightPanelRef.current?.expand();
  }, [handleExpand]);

  const closePanel = useCallback(() => {
    rightPanelRef.current?.collapse();
  }, [rightPanelRef]);

  const togglePanel = useCallback(
    () => (rightPanelRef.current?.isCollapsed() ? openPanel() : closePanel()),
    [closePanel, openPanel]
  );

  return (
    <RightPanelContext.Provider
      value={{
        rightPanelContent,
        setRightPanelContent,
        togglePanel,
        openPanel,
        closePanel,
      }}
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex">
          <div className="flex flex-col min-w-52 max-w-sm border-r">
            <div
              className={cn(
                'flex h-[52px] items-center gap-2 px-4 text-base font-medium'
              )}
            >
              <Logo />
              AFFiNE
            </div>
            <Separator />
            <Nav links={navLinks} />
          </div>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel minSize={50}>{content}</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              ref={rightPanelRef}
              defaultSize={0}
              maxSize={30}
              collapsible={true}
              collapsedSize={0}
              onExpand={handleExpand}
            >
              {rightPanelContent}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </TooltipProvider>
    </RightPanelContext.Provider>
  );
}
