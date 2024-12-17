// 定义加载状态类型
export enum DatabaseLoadingState {
  Idle,
  Initializing,
  LoadingDependencies,
  LoadingWasm,
  Migrating,
  Finished,
  Ready,
  Error,
}

// 定义进度回调接口
export interface ClientDBLoadingProgress {
  costTime?: number;
  phase: 'wasm' | 'dependencies';
  progress: number;
}
