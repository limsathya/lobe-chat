import { Icon } from '@lobehub/ui';
import { Button, Result } from 'antd';
import { CheckCircle, CpuIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import DataStyleModal from '@/components/DataStyleModal';
import InitProgress from '@/features/InitClientDB/InitProgress';
import { useGlobalStore } from '@/store/global';
import { DatabaseLoadingState } from '@/types/clientDB';

import Failed from './Failed';
import Idle from './Idle';

interface EnableClientDBModalProps {
  open: boolean;
}

const EnableClientDBModal = memo<EnableClientDBModalProps>(({ open }) => {
  const { t } = useTranslation('common');

  const [initClientDBStage, markPgliteEnabled] = useGlobalStore((s) => [
    s.initClientDBStage,
    s.markPgliteEnabled,
  ]);

  const renderContent = () => {
    if (initClientDBStage === DatabaseLoadingState.Idle) return <Idle />;

    if (initClientDBStage === DatabaseLoadingState.Ready)
      return (
        <Result
          extra={
            <Button onClick={markPgliteEnabled} size={'large'} type={'primary'}>
              {t('clientDB.ready.button')}
            </Button>
          }
          icon={<Icon icon={CheckCircle} />}
          status={'success'}
          style={{ paddingBlock: 24, paddingTop: 0 }}
          subTitle={t('clientDB.ready.desc')}
          title={t('clientDB.ready.title')}
        />
      );

    if (initClientDBStage === DatabaseLoadingState.Error) return <Failed />;

    return <InitProgress title={t('clientDB.modal.init.desc')} />;
  };

  return (
    <DataStyleModal
      hideTitle={initClientDBStage === DatabaseLoadingState.Ready}
      icon={CpuIcon}
      open={open}
      title={t('clientDB.modal.title')}
    >
      {renderContent()}
    </DataStyleModal>
  );
});

export default EnableClientDBModal;
