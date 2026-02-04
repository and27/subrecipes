export type MetaEntry = {
  key: string;
  value: string;
};

export interface MetaRepository {
  get(key: string): Promise<string | undefined>;
  set(entry: MetaEntry): Promise<void>;
}
