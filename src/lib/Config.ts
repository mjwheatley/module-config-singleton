import ConfigBuilder from './ConfigBuilder';

/**
 * Config Class
 */
export class Config {
  private _config: any;

  /**
   * Constructs
   * @param {Object?} config
   */
  constructor(config?: any) {
    if (!config || (config && typeof config !== `object`)) {
      config = {};
    }
    this._config = config;
  }

  /**
   * Updates config.
   * @param {Object} param0
   * @param {Object} param0.config
   */
  update({ config }: { config: any }) {
    if (!config || (config && typeof config !== `object`)) {
      config = {};
    }
    this._config = config;
  }

  /**
   * Returns config.
   *
   * Allows clientConfig to override global config.
   * @param   {Object} sessionData Redis data
   * @param   {Object?} logger   Winston logger
   * @return {Object} Config
   */
  get(sessionData?: any, logger?: any) {
    if (sessionData && Object.keys(sessionData).length) {
      try {
        return ConfigBuilder.safeMerge({
          globalConfig: this._config,
          clientConfig: sessionData
        });
      } catch (error) {
        if (logger) {
          logger.warn(`Config.get() with clientConfig`, error);
        }
      }
    }
    return this._config;
  }
}
