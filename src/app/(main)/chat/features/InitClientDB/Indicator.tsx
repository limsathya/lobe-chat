'use client';

import { Progress } from 'antd';
import { createStyles } from 'antd-style';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { DatabaseLoadingState } from '@/types/clientDB';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  bg: css`
    padding-block: 12px;
    padding-inline: 12px 24px;
    background: ${token.colorText};
    border-radius: 40px;
  `,
  container: css`
    position: fixed;
    z-index: 1000;
  `,
  progress: css`
    .${prefixCls}-progress-text {
      font-size: 12px;
      color: ${token.colorBgContainer} !important;
    }
  `,
  progressReady: css`
    .${prefixCls}-progress-text {
      color: ${token.colorSuccessBorder} !important;
    }
  `,

  text: css`
    color: ${token.colorBgContainer};
  `,
}));

interface IndicatorProps {
  bottom?: number;
}

const Indicator = memo<IndicatorProps>(({ bottom = 80 }) => {
  const { styles, theme, cx } = useStyles();
  const currentStage = useGlobalStore((s) => s.initClientDBStage || 0);
  const { t } = useTranslation('common');
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);

  useInitClientDB();
  const [shouldRender, setShouldRender] = useState(true);

  // 当状态变为 Ready 时，延迟隐藏
  useEffect(() => {
    if (currentStage === DatabaseLoadingState.Ready) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 800); // 延迟 800ms 后隐藏

      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  const getStateMessage = (state: DatabaseLoadingState) => {
    switch (state) {
      case DatabaseLoadingState.Ready: {
        return t('clientDB.initing.ready');
      }

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
        return t('clientDB.initing.loadingDependencies');
      }

      case DatabaseLoadingState.LoadingWasm: {
        return t('clientDB.initing.loadingWasmModule');
      }

      case DatabaseLoadingState.Migrating: {
        return t('clientDB.initing.migrating');
      }
    }
  };

  return (
    <AnimatePresence>
      {shouldRender && (
        <Center className={styles.container} style={{ bottom }} width={'100%'}>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            initial={{ opacity: 0, y: 30 }}
            key="loading-indicator"
            transition={{ duration: 0.3, type: 'tween' }}
          >
            <Flexbox align={'center'} className={styles.bg} gap={12} horizontal>
              <Progress
                className={cx(
                  styles.progress,
                  currentStage === DatabaseLoadingState.Ready && styles.progressReady,
                )}
                percent={(currentStage / DatabaseLoadingState.Ready) * 100}
                size={40}
                strokeColor={
                  currentStage === DatabaseLoadingState.Ready
                    ? theme.colorSuccessActive
                    : theme.colorBgContainer
                }
                strokeLinecap={'round'}
                strokeWidth={12}
                trailColor={rgba(theme.colorBgContainer, 0.1)}
                type={'circle'}
              />
              <span className={styles.text}>{getStateMessage(currentStage)}</span>
            </Flexbox>
          </motion.div>
        </Center>
      )}
    </AnimatePresence>
  );
});
export default Indicator;
