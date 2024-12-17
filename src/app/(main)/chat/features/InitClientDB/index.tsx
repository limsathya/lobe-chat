'use client';

import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Indicator from './Indicator';

interface InitClientDBProps {
  bottom?: number;
}

const InitClientDB = memo<InitClientDBProps>(({ bottom = 80 }) => {
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);

  return isPgliteNotInited && <Indicator bottom={bottom} />;
});

export default InitClientDB;
