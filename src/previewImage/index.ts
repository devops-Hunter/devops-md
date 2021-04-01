export type PreviewImageProps = {
  urls: string[];
  idx?: number;
  current: string;
};
function previewImage<T extends any>(parmas: PreviewImageProps): Promise<T> {
  if (!ISGFlutterBridge) return Promise.reject('ISGFlutterBridge is undefined');
  const { urls } = parmas;

  if (!Array.isArray(urls)) return Promise.reject('urls is must array');

  return ISGFlutterBridge.callHandler('previewImage', parmas);
}

export default previewImage;
