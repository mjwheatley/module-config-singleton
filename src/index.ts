import { Config, ConfigBuilder, ConfigSingleton } from './lib';

const singleton = new ConfigSingleton();
Object.seal(singleton);

export { Config, ConfigBuilder, singleton };
