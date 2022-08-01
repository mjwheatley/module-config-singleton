const { expect } = require(`chai`);
const { ConfigSingleton, Config } = require(`../../lib`);

describe(`# ConfigSingleton Unit Tests`, function() {
   it(`should create a singleton instance`, function() {
      expect(ConfigSingleton.instance).to.not.exist;
      const singleton = new ConfigSingleton();
      expect(ConfigSingleton.instance).to.exist;
      expect(singleton).to.equal(ConfigSingleton.instance);
   });

   it(`should return an existing singleton instance`, function() {
      /**
       * Prove class is not a singleton
       * **/
      const config1 = new Config({ name: `config1` });
      const config2 = new Config({ name: `config2` });
      expect(config1).to.not.equal(config2);
      expect(config1.get().name).to.equal(`config1`);
      expect(config2.get().name).to.equal(`config2`);
      config1.update({ config: { name: `updateConfig1` } });
      expect(config1.get().name).to.equal(`updateConfig1`);
      expect(config2.get().name).to.equal(`config2`);
      config2.update({ config: { name: `updateConfig2` } });
      expect(config1.get().name).to.equal(`updateConfig1`);
      expect(config2.get().name).to.equal(`updateConfig2`);
      /**
       * Prove singleton class is a singleton
       * **/
      ConfigSingleton.instance = null;
      expect(ConfigSingleton.instance).to.not.exist;
      const singleton1 = new ConfigSingleton({ name: `singleton1` });
      const singleton2 = new ConfigSingleton({ name: `singleton2` });
      expect(singleton1).to.equal(singleton2);
      expect(singleton1.get().name).to.equal(`singleton1`);
      expect(singleton2.get().name).to.equal(`singleton1`);
      singleton1.update({ config: { name: `updateSingleton1` } });
      expect(singleton1.get().name).to.equal(`updateSingleton1`);
      expect(singleton2.get().name).to.equal(`updateSingleton1`);
      singleton2.update({ config: { name: `updateSingleton2` } });
      expect(singleton1.get().name).to.equal(`updateSingleton2`);
      expect(singleton2.get().name).to.equal(`updateSingleton2`);
   });
});
