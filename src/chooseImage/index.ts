// //0 相册 ，1 拍照 ，2 all

const SourceTypeMap = {
  album: 0,
  camera: 1,
  all: 2,
};
export type SourceType = keyof typeof SourceTypeMap;
export type ChooseImageProps = {
  count: number;
  sourceType?: SourceType;
  saveToAlbum?: boolean;
  compress?: boolean;
};

export type ChooseImageResult = {
  url: string;
};

function chooseImage(props: ChooseImageProps): Promise<ChooseImageResult[]> {
  if (!ISGFlutterBridge)
    return Promise.reject(new Error('ISGFlutterBridge is undefined'));
  const {
    count = 1,
    sourceType = 'all',
    saveToAlbum = true,
    compress = true,
  } = props;

  return ISGFlutterBridge.callHandler('chooseImage', {
    count,
    sourceType: SourceTypeMap[sourceType],
    saveToGallery: saveToAlbum,
    compress,
  });
}

export default chooseImage;
