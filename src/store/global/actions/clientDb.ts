import { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { useOnlyFetchOnceSWR } from '@/libs/swr';
import type { GlobalStore } from '@/store/global';
import { DatabaseLoadingState } from '@/types/clientDB';

/**
 * 设置操作
 */
export interface GlobalClientDBAction {
  initializeClientDB: () => Promise<void>;
  markPgliteEnabled: () => void;
  useInitClientDB: () => SWRResponse;
}

export const clientDBSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  GlobalClientDBAction
> = (set, get) => ({
  initializeClientDB: async () => {
    // if the db has started initialized or not error, just skip.
    if (
      get().initClientDBStage !== DatabaseLoadingState.Idle &&
      get().initClientDBStage !== DatabaseLoadingState.Error
    )
      return;

    const { initializeDB } = await import('@/database/client/db');
    await initializeDB({
      onProgress: (data) => {
        set({ initClientDBProcess: data });
      },
      onStateChange: (state) => {
        set({ initClientDBStage: state });
      },
    });
  },
  markPgliteEnabled: () => {
    get().updateSystemStatus({ isEnablePglite: true });
  },
  useInitClientDB: () => useOnlyFetchOnceSWR('initClientDB', () => get().initializeClientDB()),
});
