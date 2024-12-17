import type { PgliteDatabase } from 'drizzle-orm/pglite';

import { ClientDBLoadingProgress, DatabaseLoadingState } from '@/types/clientDB';
import { sleep } from '@/utils/sleep';

import * as schema from '../schemas';
import migrations from './migrations.json';

type DrizzleInstance = PgliteDatabase<typeof schema>;

export interface DatabaseLoadingCallbacks {
  onProgress?: (progress: ClientDBLoadingProgress) => void;
  onStateChange?: (state: DatabaseLoadingState) => void;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private dbInstance: DrizzleInstance | null = null;
  private initPromise: Promise<DrizzleInstance> | null = null;
  private callbacks?: DatabaseLoadingCallbacks;
  private isLocalDBSchemaSynced = false;

  // CDN 配置
  private static WASM_CDN_URL =
    'https://registry.npmmirror.com/@electric-sql/pglite/0.2.15/files/dist/postgres.wasm';

  private constructor() {}

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // 加载并编译 WASM 模块
  private async loadWasmModule(): Promise<WebAssembly.Module> {
    const start = Date.now();
    this.callbacks?.onStateChange?.(DatabaseLoadingState.LoadingWasm);

    const response = await fetch(DatabaseManager.WASM_CDN_URL);

    const contentLength = Number(response.headers.get('Content-Length')) || 0;
    const reader = response.body?.getReader();

    if (!reader) throw new Error('Failed to start WASM download');

    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    // 读取数据流
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      // 计算并报告进度
      const progress = Math.min(Math.round((receivedLength / contentLength) * 100), 100);
      this.callbacks?.onProgress?.({
        phase: 'wasm',
        progress,
      });
    }

    // 合并数据块
    const wasmBytes = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      wasmBytes.set(chunk, position);
      position += chunk.length;
    }

    this.callbacks?.onProgress?.({
      costTime: Date.now() - start,
      phase: 'wasm',
      progress: 100,
    });

    // 编译 WASM 模块
    return WebAssembly.compile(wasmBytes);
  }

  // 异步加载 PGlite 相关依赖
  private async loadDependencies() {
    const start = Date.now();
    this.callbacks?.onStateChange?.(DatabaseLoadingState.LoadingDependencies);

    const imports = [
      import('@electric-sql/pglite').then((m) => ({ default: m.PGlite })),
      import('@electric-sql/pglite/vector'),
      import('drizzle-orm/pglite'),
      import('@electric-sql/pglite'),
    ];

    let loaded = 0;
    const results = await Promise.all(
      imports.map(async (importPromise) => {
        const result = await importPromise;
        loaded += 1;

        // 计算加载进度
        this.callbacks?.onProgress?.({
          phase: 'dependencies',
          progress: Math.min(Math.round((loaded / imports.length) * 100), 100),
        });
        return result;
      }),
    );

    this.callbacks?.onProgress?.({
      costTime: Date.now() - start,
      phase: 'dependencies',
      progress: 100,
    });

    // @ts-ignore
    const [{ default: PGlite }, { vector }, { drizzle }, { IdbFs, MemoryFS }] = results;

    return { IdbFs, MemoryFS, PGlite, drizzle, vector };
  }

  // 数据库迁移方法
  private async migrate(skipMultiRun = false): Promise<DrizzleInstance> {
    if (this.isLocalDBSchemaSynced && skipMultiRun) return this.db;

    const start = Date.now();
    try {
      this.callbacks?.onStateChange?.(DatabaseLoadingState.Migrating);

      // refs: https://github.com/drizzle-team/drizzle-orm/discussions/2532
      // @ts-expect-error
      await this.db.dialect.migrate(migrations, this.db.session, {});
      this.isLocalDBSchemaSynced = true;

      console.info(`✅ Local database ready in ${Date.now() - start}ms`);
    } catch (cause) {
      console.error('❌ Local database schema migration failed', cause);
      throw cause;
    }

    return this.db;
  }

  // 初始化数据库
  async initialize(callbacks?: DatabaseLoadingCallbacks): Promise<DrizzleInstance> {
    if (this.initPromise) return this.initPromise;

    this.callbacks = callbacks;

    this.initPromise = (async () => {
      try {
        if (this.dbInstance) return this.dbInstance;

        // 初始化数据库
        this.callbacks?.onStateChange?.(DatabaseLoadingState.Initializing);

        // 加载依赖
        const { PGlite, vector, drizzle, IdbFs, MemoryFS } = await this.loadDependencies();

        // 加载并编译 WASM 模块
        const wasmModule = await this.loadWasmModule();

        const db = new PGlite({
          extensions: { vector },
          fs: typeof window === 'undefined' ? new MemoryFS('lobechat') : new IdbFs('lobechat'),
          relaxedDurability: true,
          wasmModule,
        });

        this.dbInstance = drizzle({ client: db, schema });

        await this.migrate(true);

        this.callbacks?.onStateChange?.(DatabaseLoadingState.Finished);
        await sleep(50);

        this.callbacks?.onStateChange?.(DatabaseLoadingState.Ready);

        return this.dbInstance as DrizzleInstance;
      } catch (error) {
        this.initPromise = null;
        this.callbacks?.onStateChange?.(DatabaseLoadingState.Error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  // 获取数据库实例
  get db(): DrizzleInstance {
    if (!this.dbInstance) {
      throw new Error('Database not initialized. Please call initialize() first.');
    }
    return this.dbInstance;
  }

  // 创建代理对象
  createProxy(): DrizzleInstance {
    return new Proxy({} as DrizzleInstance, {
      get: (target, prop) => {
        return this.db[prop as keyof DrizzleInstance];
      },
    });
  }
}

// 导出单例
const dbManager = DatabaseManager.getInstance();

// 保持原有的 clientDB 导出不变
export const clientDB = dbManager.createProxy();

// 导出初始化方法，供应用启动时使用
export const initializeDB = (callbacks?: DatabaseLoadingCallbacks) =>
  dbManager.initialize(callbacks);
