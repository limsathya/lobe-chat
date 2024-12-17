import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';

import InitProgress from './InitProgress';

const InitClientDB = memo(() => {
  const { t } = useTranslation('common');
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);

  useInitClientDB();

  return (
    <Center height={'100%'}>
      <Center width={300}>
        <InitProgress title={t('clientDB.autoInit.title')} />
      </Center>
    </Center>
  );
});

export default InitClientDB;
