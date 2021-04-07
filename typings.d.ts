declare module '*.css';
declare module '*.less';

type MethodName = 'chooseImage' | 'previewImage' | 'getVersion';
type ISGFlutterBridgeProps = {
  callHandler: <T, P extends object>(
    methodName: MethodName,
    args?: P,
  ) => Promise<T>;
};

declare const ISGFlutterBridge: ISGFlutterBridgeProps;
