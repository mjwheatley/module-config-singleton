import merge from 'lodash.merge';
import flatten from 'lodash.flatten';
import { deepCopy } from '@mawhea/module-nodejs-utils';

/**
 * ParseError Class
 * **/
class ParseError extends Error {
   /**
    * @param {String} message
    * **/
   constructor(message = `Unable to parse to JSON.`) {
      super(message);
      this.name = `ParseError`;
   }
}

export default (function() {
   `use strict`;

   let _config: any;
   let _globalConfig: any;
   let _secondaryConfig: any;
   let _clientConfig: any;

   /**
    * Removes properties from _secondaryConfig.globalOverride if the property is included
    * in the _globalConfig.globalLock array
    */
   const _nestedLockGlobal = () => {
      if (_globalConfig.globalLock && _globalConfig.globalLock.length > 0) {
         let { configMerge, configReplace } = _clientConfig;
         try {
            if (configReplace && typeof configReplace === `string`) {
               configReplace = JSON.parse(configReplace);
            }
            if (configMerge && typeof configMerge === `string`) {
               configMerge = JSON.parse(configMerge);
            }
         } catch (error) {
            throw new ParseError();
         }

         if (configMerge) {
            _removeLockedKeys({ override: configMerge });
         }
         if (configReplace) {
            Object.keys(configReplace).forEach((replace) => {
               if (_globalConfig.globalLock.includes(replace)) {
                  delete configReplace[replace];
               }
            });
            _clientConfig.configReplace = configReplace;
         }
         if (_secondaryConfig.globalOverride) {
            _removeLockedKeys({ override: _secondaryConfig.globalOverride });
         }
      }
   };

   /**
    * Remove global locked keys if in override.
    * @param {Object} param0
    * @param {Object} param0.override
    */
   const _removeLockedKeys = ({ override }: {override: any}) => {
      _mapObject(override).forEach((prop: any) => {
         let keyToRemove = override;
         // found that something in the global override exists in the globalLock
         if (_globalConfig.globalLock.includes(prop)) {
            // represents our segments of the object property to be deleted
            const segments = prop.split(`.`);
            segments.forEach((seg: any, i: number, a: any) => {
               if (keyToRemove[seg]) {
                  i === a.length - 1 && delete keyToRemove[seg];
                  keyToRemove = keyToRemove[seg];
               }
            });
         }
      });
   };

   /**
    * Passed object is recursively mapped and properties are returned
    * in array with the layers denoted by .
    * @param   {Object}  obj
    * @param   {String}  prev
    * @return {Array}  result
    */
   const _mapObject = (obj: any, prev = ``): Array<any> => flatten(
      Object
         .entries(obj)
         .map((entry) => {
            const [k, v] = entry;
            if (v !== null && typeof v === `object`) {
               const newK = prev ? `${prev}.${k}` : `${k}`;
               return [newK, ..._mapObject(v, newK)];
            }
            return prev ? `${prev}.${k}` : k;
         })
   );

   /**
    * Merges _clientConfig and _secondaryConfig with _globalConfig.
    * @throws {ParseError}
    */
   const _overrideGlobal = () => {
      let { configReplace, configMerge } = _clientConfig;
      try {
         if (typeof configReplace === `string`) {
            configReplace = JSON.parse(configReplace);
         }
         if (typeof configMerge === `string`) {
            configMerge = JSON.parse(configMerge);
         }
      } catch (error) {
         throw new ParseError();
      }
      configReplace && _replaceKeys({ configReplace });

      const mergingConfigs: any[] = [_globalConfig];
      _secondaryConfig.globalOverride && mergingConfigs.push(_secondaryConfig.globalOverride);

      configMerge && mergingConfigs.push(configMerge);

      // @ts-ignore
      merge(...mergingConfigs);
   };

   /**
    * Directly replaces config keys.
    * @param {Object} param0
    * @param {Object} param0.configReplace
    */
   const _replaceKeys = ({ configReplace }: {configReplace: any}) => {
      if (Object.keys(configReplace).length) {
         Object.keys(configReplace).forEach((replace) => {
            let keyToReplace = _globalConfig;
            const segments = replace.split(`.`);
            segments.forEach((seg, i, a) => {
               if (i === a.length - 1) {
                  if (configReplace[replace] === `undefined`) {
                     delete keyToReplace[seg];
                  } else {
                     keyToReplace[seg] = configReplace[replace];
                  }
               } else {
                  keyToReplace[seg] = keyToReplace[seg] || {};
                  keyToReplace = keyToReplace[seg];
               }
            });
         });
      }
   };

   /**
    * Safely merges configs.
    * @param   {Object} param0
    * @param   {Object} param0.globalConfig Contains globalLock (Eg global config, State config)
    * @param   {Object} param0.secondaryConfig  Contains globalOverride(Eg LambdaConfig, FlowConfig)
    * @param   {Object} param0.clientConfig  Contains configReplace & configMerge
    * @return  {Object} _config  new config
    * @throws  {ParseError}  Will throw error if cannot parse _clientConfig.
    */
   function _safeMerge({
                          globalConfig,
                          secondaryConfig = {},
                          clientConfig = {}
   }: {
      globalConfig: any,
      secondaryConfig?: any,
      clientConfig?: any
   }) {
      _globalConfig = deepCopy(globalConfig);
      _secondaryConfig = deepCopy(secondaryConfig);
      _clientConfig = deepCopy(clientConfig);
      _nestedLockGlobal();
      _overrideGlobal();
      _config = merge(_globalConfig, _secondaryConfig);
      return _config;
   }

   return {
      safeMerge: _safeMerge,
      ParseError
   };
})();
