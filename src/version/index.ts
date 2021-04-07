function getVersion(): Promise<string> {
  if (!ISGFlutterBridge) return Promise.reject('ISGFlutterBridge is undefined');

  return ISGFlutterBridge.callHandler('getVersion');
}

export default getVersion;
