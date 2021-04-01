import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import previewImage, { PreviewImageProps } from '../src/previewImage';

const { expect } = chai;
chai.use(chaiAsPromised);
chai.should();

describe('previewImage', () => {
  it('preview image is ok', async () => {
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => Promise.resolve('ok'),
    };

    const urls = Array.from({ length: 4 }).map((_, idx) => 'http://${idx}.jpg');
    const params: PreviewImageProps = {
      urls,
      current: 'http://1.jpg',
    };

    return expect(previewImage(params)).to.eventually.fulfilled;
  });

  it('preview image is error', async () => {
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => Promise.reject('error'),
    };

    const urls = Array.from({ length: 4 }).map((_, idx) => 'http://${idx}.jpg');
    const params: PreviewImageProps = {
      urls,
      current: 'http://1.jpg',
    };

    return expect(previewImage(params)).to.be.rejectedWith();
  });

  afterEach(() => {
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => null,
    };
  });
});
