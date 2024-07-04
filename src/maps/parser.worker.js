import ParserBinary from './MapParser.wasm';
import ParserModule from './MapParser.jscc';

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = function(e) {
  let module = ParserModule({
    locateFile(name) {
      if (name === "MapParser.wasm") {
        return ParserBinary;
      } else {
        return name;
      }
    }
  });
  console.log('ParserModule created',module)
  module.then(wasm => {

    try {
      const meta = new Uint8Array(e.data.meta);
      const map = new Uint8Array(e.data.map);
  
      const addr_meta = wasm._malloc(meta.length);
      wasm.HEAPU8.set(meta, addr_meta);
      const addr_map = wasm._malloc(map.length);
      wasm.HEAPU8.set(map, addr_map);

      wasm._process(addr_meta, meta.length, addr_map, map.length);
    } catch (e) {
      /* eslint-disable-next-line no-restricted-globals */
      self.postMessage({error: e.toString()});
    }
  });
}
