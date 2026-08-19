export interface IRegistry<T> {
  register(item: T): void
  unregister(id: string): void
  getItems(): T[]
}
