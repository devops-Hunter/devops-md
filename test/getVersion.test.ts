import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import getVersion from '../src/version';

const { expect } = chai;
chai.use(chaiAsPromised);
chai.should();

describe('getVersion', () => {
  it('getVersion is ok', async () => {
    const version = '4.1.1';
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => Promise.resolve(version),
    };

    return expect(getVersion()).to.eventually.equals(version);
  });

  it('getVersion  error', async () => {
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => Promise.reject('error'),
    };

    return expect(getVersion()).to.be.rejectedWith();
  });

  afterEach(() => {
    // @ts-ignore
    global.ISGFlutterBridge = {
      callHandler: () => null,
    };
  });
});
