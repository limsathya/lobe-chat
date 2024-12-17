import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import InitProgress from '@/features/InitClientDB/InitProgress';
import { useGlobalStore } from '@/store/global';

const InitClientDB = memo(() => {
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);

  useInitClientDB();

  return (
    <Flexbox height={'100%'} style={{ position: 'relative', userSelect: 'none' }} width={'100%'}>
      <Center flex={1} gap={0} width={'100%'}>
        <ProductLogo size={48} type={'combine'} />
        <Center width={200}>
          <InitProgress title={false} />
        </Center>
      </Center>
    </Flexbox>
  );
});

export default InitClientDB;
