'use client';

import React, { memo } from 'react';

import InitClientDB from '@/features/InitClientDB';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Content from './Content';

interface ListProps {
  mobile?: boolean;
}

const Client = memo<ListProps>(({ mobile }) => {
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);

  if (isPgliteNotInited) return <InitClientDB />;

  return <Content mobile={mobile} />;
});

Client.displayName = 'ChatListClient';

export default Client;
