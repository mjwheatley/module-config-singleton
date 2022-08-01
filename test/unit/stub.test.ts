import { expect } from 'chai';
import { Config } from '../../src';

describe(`# Config Unit Tests`, function () {
  describe(`constructor()`, function () {
    it(`should construct a Config instance and set the internal _config to the object passed as the config arg`,
      function () {
        const config = new Config({ constructed: `This key/value pair was passed in to the constructor.` });
        expect(config.get().constructed).to.exist;
        expect(config.get().constructed).to.be.a(`string`);
        expect(config.get().constructed).to.equal(`This key/value pair was passed in to the constructor.`);
      })
  });
});
