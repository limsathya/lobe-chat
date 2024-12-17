'use client';

import { Progress } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { DatabaseLoadingState } from '@/types/clientDB';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  bg: css`
    padding-block: 8px;
    padding-inline: 16px;
    background: ${token.colorTextLightSolid};
    border-radius: 40px;
  `,
  container: css`
    position: fixed;
    z-index: 1000;
  `,
  progress: css`
    .${prefixCls}-progress-text {
      color: ${token.colorBgContainer} !important;
    }
  `,
  text: css`
    color: ${token.colorBgContainer};
  `,
}));

interface InitClientDBProps {
  bottom?: number;
}

const InitClientDB = memo<InitClientDBProps>(({ bottom = 80 }) => {
  const { styles, theme } = useStyles();
  const currentStage = useGlobalStore((s) => s.initClientDBStage || 0);
  const process = useGlobalStore((s) => s.initClientDBProcess, isEqual);
  const { t } = useTranslation('common');
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);

  useInitClientDB();

  const getStateMessage = (state: DatabaseLoadingState, progress?: number) => {
    switch (state) {
      case DatabaseLoadingState.Error: {
        return t('clientDB.initing.error');
      }
      case DatabaseLoadingState.Idle: {
        return t('clientDB.initing.idle');
      }
      case DatabaseLoadingState.Initializing: {
        return t('clientDB.initing.initializing');
      }
      case DatabaseLoadingState.LoadingDependencies: {
        return t('clientDB.initing.loadingDependencies', { progress });
      }

      case DatabaseLoadingState.LoadingWasm: {
        return t('clientDB.initing.loadingWasmModule', { progress });
      }

      case DatabaseLoadingState.Migrating: {
        return t('clientDB.initing.migrating');
      }

      case DatabaseLoadingState.Ready: {
        return t('clientDB.initing.ready');
      }
    }
  };

  return (
    <AnimatePresence>
      {isPgliteNotInited && (
        <Center className={styles.container} style={{ bottom }} width={'100%'}>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, type: 'tween' }}
          >
            <Flexbox align={'center'} className={styles.bg} gap={12} horizontal>
              <Progress
                className={styles.progress}
                percent={(currentStage / DatabaseLoadingState.Ready) * 100}
                size={40}
                strokeColor={theme.colorBgContainer}
                strokeLinecap={'round'}
                strokeWidth={12}
                trailColor={rgba(theme.colorBgContainer, 0.1)}
                type={'circle'}
              />
              <span className={styles.text}>
                {getStateMessage(currentStage, process?.progress)}
              </span>
            </Flexbox>
          </motion.div>
        </Center>
      )}
    </AnimatePresence>
  );
});
export default InitClientDB;
