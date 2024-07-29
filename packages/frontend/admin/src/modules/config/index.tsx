import { Separator } from '@affine/admin/components/ui/separator';

import { Layout } from '../layout';
import { AboutAFFiNE } from './about';

export function Config() {
  return <Layout content={<ConfigPage />} />;
}

export function ConfigPage() {
  return (
    <div className=" h-screen flex-1 space-y-1 flex-col flex">
      <div className="flex items-center justify-between px-6 py-3 max-md:ml-9">
        <div className="text-base font-medium">Config</div>
      </div>
      <Separator />
      <AboutAFFiNE />
    </div>
  );
}

export { Config as Component };
