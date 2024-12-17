'use client';

import { Spin } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const Modal = dynamic(() => import('./Modal'), { loading: () => <Spin fullscreen />, ssr: false });

const Migration = memo(() => {
  const showModal = useGlobalStore(systemStatusSelectors.isPgliteNotEnabled);

  return showModal && <Modal open={showModal} />;
});

export default Migration;
