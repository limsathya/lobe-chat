import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import InitClientDB from './InitClientDB';

import { AppLoadingStage } from './type';

interface ContentProps {
  loadingStage: AppLoadingStage;
}
const Content = memo<ContentProps>(({ loadingStage }) => {
  const { t } = useTranslation('common');
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);

  return isPgliteNotInited ? (
    <InitClientDB />
  ) : (
    <FullscreenLoading title={t(`appLoading.${loadingStage}`)} />  );
});

export default Content;
