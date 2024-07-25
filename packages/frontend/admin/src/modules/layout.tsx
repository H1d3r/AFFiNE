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
  useMemo,
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
  isOpen: boolean;
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
    to: '/admin/accounts',
  },
  {
    title: 'AI',
    icon: Cpu,
    to: '/admin/ai',
  },
  {
    title: 'Config',
    icon: ClipboardList,
    to: '/admin/config',
  },
  {
    title: 'Settings',
    icon: Settings,
    to: '/admin/settings',
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
  const [open, setOpen] = useState(false);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const handleExpand = useCallback(() => {
    if (rightPanelRef.current?.getSize() === 0) {
      rightPanelRef.current?.resize(30);
    }
    setOpen(true);
  }, [rightPanelRef]);

  const handleCollapse = useCallback(() => {
    if (rightPanelRef.current?.getSize() !== 0) {
      rightPanelRef.current?.resize(0);
    }
    setOpen(false);
  }, [rightPanelRef]);

  const openPanel = useCallback(() => {
    handleExpand();
    rightPanelRef.current?.expand();
  }, [handleExpand]);

  const closePanel = useCallback(() => {
    handleCollapse();
    rightPanelRef.current?.collapse();
  }, [handleCollapse]);

  const togglePanel = useCallback(
    () => (rightPanelRef.current?.isCollapsed() ? openPanel() : closePanel()),
    [closePanel, openPanel]
  );

  const activeTab = useMemo(() => {
    const path = window.location.pathname;

    return (
      navLinks.find(link => path.endsWith(link.title.toLocaleLowerCase()))
        ?.title || ''
    );
  }, []);

  return (
    <RightPanelContext.Provider
      value={{
        isOpen: open,
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
            <Nav links={navLinks} activeTab={activeTab} />
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
              onCollapse={handleCollapse}
            >
              {rightPanelContent}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </TooltipProvider>
    </RightPanelContext.Provider>
  );
}
