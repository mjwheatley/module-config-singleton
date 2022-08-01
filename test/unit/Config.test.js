const sinon = require(`sinon`);
const { expect } = require(`chai`);
const rewire = require(`rewire`);
const Config = rewire(`../../lib/Config`);
const ConfigBuilder = sinon.stub();

Config.__set__(`ConfigBuilder`, ConfigBuilder);

describe(`# Config Unit Tests`, function() {
   describe(`constructor()`, function() {
      it(`should construct a Config instance and set the internal _config to the object passed as the config arg`,
         function() {
            const config = new Config({ constructed: `This key/value pair was passed in to the constructor.` });
            expect(config.get().constructed).to.exist;
            expect(config.get().constructed).to.be.a(`string`);
            expect(config.get().constructed).to.equal(`This key/value pair was passed in to the constructor.`);
         });

      it(`should default the internal _config to an empty object if the config arg is not defined`,
         function() {
            const config = new Config();
            expect(config.get()).to.be.an(`object`);
            expect(JSON.stringify(config.get())).to.equal(JSON.stringify({}));
         });

      it(`should default the internal _config to an empty object if the config arg is not an object`,
         function() {
            const config = new Config(`This is not an object.`);
            expect(config.get()).to.be.an(`object`);
            expect(JSON.stringify(config.get())).to.equal(JSON.stringify({}));
         });
   });

   describe(`update()`, function() {
      it(`should update the internal _config object`, function() {
         const config = new Config({ constructed: `This key/value pair was passed in to the constructor.` });
         config.update({ config: { update: `This key/value pair is in the config passed to the update() method.` } });
         expect(config.get().constructed).to.not.exist;
         expect(config.get().update).to.exist;
         expect(config.get().update).to.be.a(`string`);
         expect(config.get().update)
            .to.equal(`This key/value pair is in the config passed to the update() method.`);
      });

      it(`should update the internal _config to an empty object if the config arg is not defined`,
         function() {
            const config = new Config({ constructed: `This key/value pair was passed in to the constructor.` });
            expect(config.get().constructed).to.exist;
            expect(config.get().constructed).to.be.a(`string`);
            expect(config.get().constructed).to.equal(`This key/value pair was passed in to the constructor.`);

            config.update({});
            expect(config.get().constructed).to.not.exist;
            expect(config.get()).to.be.an(`object`);
            expect(JSON.stringify(config.get())).to.equal(JSON.stringify({}));
         });

      it(`should update the internal _config to an empty object if the config arg is not an object`,
         function() {
            const config = new Config({ constructed: `This key/value pair was passed in to the constructor.` });
            expect(config.get().constructed).to.exist;
            expect(config.get().constructed).to.be.a(`string`);
            expect(config.get().constructed).to.equal(`This key/value pair was passed in to the constructor.`);

            config.update({ config: `This is not an object.` });
            expect(config.get().constructed).to.not.exist;
            expect(config.get()).to.be.an(`object`);
            expect(JSON.stringify(config.get())).to.equal(JSON.stringify({}));
         });
   });

   describe(`get()`, function() {
      it(`should return app config without session data`, function() {
         const config = new Config({ get: `it` });
         expect(config.get().get).to.equal(`it`);
      });

      it(`should return app config with session data`, function() {
         const data = { get: `it` };
         const config = new Config(data);
         const sessionData = { got: `them` };
         ConfigBuilder.safeMerge = sinon.stub().returns({ ...data, ...sessionData });
         expect(config.get(sessionData).got).to.equal(`them`);
      });

      it(`should catch and not log an error when merging app config and session data`, function() {
         const data = { get: `it` };
         const config = new Config(data);
         const sessionData = { got: `them` };
         const logger = sinon.stub();
         logger.warn = sinon.stub();
         ConfigBuilder.safeMerge = sinon.stub().throws();
         expect(config.get(sessionData).got).to.not.exist;
         expect(logger.warn.called).to.be.false;
      });

      it(`should catch and log an error when merging app config and session data`, function() {
         const data = { get: `it` };
         const config = new Config(data);
         const sessionData = { got: `them` };
         const logger = sinon.stub();
         logger.warn = sinon.stub();
         ConfigBuilder.safeMerge = sinon.stub().throws();
         expect(config.get(sessionData, logger).got).to.not.exist;
         expect(logger.warn.called).to.be.true;
      });
   });
});
