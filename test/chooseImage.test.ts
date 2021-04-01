import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chooseImage, {
  ChooseImageProps,
  ChooseImageResult,
} from '../src/chooseImage';
import { fakeChooseImageResult } from './utils';

const { expect } = chai;
chai.use(chaiAsPromised);
chai.should();

describe('chooseImage', () => {
  it('count is 4', async () => {
    const result: ChooseImageResult[] = Array.from({ length: 4 }).map(
      (_, idx) => ({
        url: `http://${idx}.jpg`,
      }),
    );
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => fakeChooseImageResult(result),
    };

    const params: ChooseImageProps = {
      count: 4,
      sourceType: 'all',
    };
    return expect(chooseImage(params)).to.eventually.deep.equals(result);
  });

  afterEach(() => {
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => null,
    };
  });
});
