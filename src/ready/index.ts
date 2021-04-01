type ReadyCallback = () => void;

function ready(callback: ReadyCallback) {
  function internalReady() {
    callback?.();
  }
  if (typeof ISGFlutterBridge == 'undefined') {
    document.addEventListener(
      'flutterInAppWebViewPlatformReady',
      internalReady,
      false,
    );
  } else {
    internalReady();
  }
}

export default ready;
