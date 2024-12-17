import { CheckCircleFilled } from '@ant-design/icons';
import { Icon } from '@lobehub/ui';
import { Progress, Typography } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { AlertCircle, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { DatabaseLoadingState } from '@/types/clientDB';

const useStyles = createStyles(({ css, token, isDarkMode, responsive }) => ({
  desc: css`
    width: 280px;
    color: ${token.colorTextSecondary};

    ${responsive.mobile} {
      line-height: ${token.lineHeight};
    }
  `,
  hint: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextTertiary};
    text-align: center;
  `,
  icon: css`
    color: ${isDarkMode ? token.blue : token.geekblue};
  `,
  iconCtn: css`
    width: 72px;
    height: 72px;
    background: ${isDarkMode ? token.blue1 : token.geekblue1};
    border-radius: 50%;
  `,
  intro: css`
    margin-block-end: 12px;

    ${responsive.mobile} {
      width: 350px;
      margin-block-start: 24px;
      line-height: ${token.lineHeight};
    }
  `,

  title: css`
    margin-block-end: 0;
    font-size: ${token.fontSizeLG}px;
    font-weight: bold;
  `,
}));

interface InitingProps {
  title: string | boolean;
}
const InitProgress = memo<InitingProps>(({ title }) => {
  const { t } = useTranslation('common');
  const currentStage = useGlobalStore((s) => s.initClientDBStage || 0);
  const process = useGlobalStore((s) => s.initClientDBProcess, isEqual);
  const { styles, theme } = useStyles();

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
    <>
      <Flexbox className={styles.intro} style={{ textAlign: 'center' }} width={460}>
        {title}
      </Flexbox>
      <Progress
        percent={(currentStage / DatabaseLoadingState.Ready) * 100}
        showInfo={false}
        strokeColor={theme.colorPrimary}
      />
      <Flexbox align={'center'} gap={4} horizontal>
        {currentStage === DatabaseLoadingState.Error ? (
          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
        ) : currentStage === DatabaseLoadingState.Ready ? (
          <CheckCircleFilled style={{ color: theme.colorSuccess }} />
        ) : currentStage === DatabaseLoadingState.LoadingDependencies ? (
          <Progress
            percent={process?.phase === 'dependencies' ? process?.progress : 5}
            size={16}
            strokeColor={theme.colorPrimary}
            type="circle"
          />
        ) : currentStage === DatabaseLoadingState.LoadingWasm ? (
          <Progress
            percent={process?.phase === 'wasm' ? process?.progress : 0}
            size={16}
            strokeColor={theme.colorPrimary}
            type="circle"
          />
        ) : (
          <Icon icon={Loader2} spin />
        )}
        <Typography.Text type={'secondary'}>
          {getStateMessage(currentStage, process?.progress)}
        </Typography.Text>
      </Flexbox>
    </>
  );
});

export default InitProgress;
