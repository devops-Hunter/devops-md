export function fakeChooseImageResult<T>(res: T): Promise<T> {
  return Promise.resolve(res);
}
