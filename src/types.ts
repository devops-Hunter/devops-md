export type MethodName = 'chooseImage' | 'previewImage';
export type ISGFlutterBridgeProps = {
  callHandler: <T, P extends object>(
    methodName: MethodName,
    args: P,
  ) => Promise<T>;
};
