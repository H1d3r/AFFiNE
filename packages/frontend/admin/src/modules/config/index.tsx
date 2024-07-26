import { Separator } from '@affine/admin/components/ui/separator';
import { useQuery } from '@affine/core/hooks/use-query';
import { serverConfigQuery } from '@affine/graphql';

import { Layout } from '../layout';

export function Config() {
  return <Layout content={<ConfigPage />} />;
}

export function ConfigPage() {
  const {
    data: { serverConfig },
  } = useQuery({
    query: serverConfigQuery,
  });
  console.log(serverConfig);
  console.log(runtimeConfig);

  return (
    <div className=" h-screen flex-1 space-y-1 flex-col flex">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-base font-medium">Config</div>
      </div>
      <Separator />
    </div>
  );
}
export { Config as Component };
