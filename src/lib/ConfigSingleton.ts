import { Config } from './Config';

/**
 * Singleton extension for Config class
 * **/
export class ConfigSingleton extends Config {
  private static instance: ConfigSingleton;

  /**
   * Constructs or returns the single instance
   * @param {Object?} config
   * @return {Object} ConfigSingleton.instance
   */
  constructor(config?: any) {
    if (!ConfigSingleton.instance) {
      super(config);
      ConfigSingleton.instance = this;
    } else {
    }
    return ConfigSingleton.instance;
  }
}
