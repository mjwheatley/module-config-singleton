const { expect, assert } = require(`chai`);
const configBuilder = require(`../../lib/ConfigBuilder`);

let newConfig;
let globalConfig;
let secondaryConfig;

const resetValues = () => {
   globalConfig = {
      "gOne": `Global1`,
      "gTwo": `Global2`,
      "gThree": `Global3`,
      "globalLock": [`gTwo`]
   };
   secondaryConfig = {
      "lOne": `Lambda1`,
      "lTwo": `Lambda2`,
      "lNest": { "lNest1": `Nest1` },
      "globalOverride": {
         "gOne": `FromLambda1`,
         "gTwo": `FromLambda2`
      }
   };
};

describe(`# ConfigBuilder Unit Tests`, function() {
   beforeEach(() => {
      resetValues();
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
   });
   it(`should override globalConfig properties if property in nested globalOverride object`, () => {
      const expectedConfig = {
         "gOne": `FromLambda1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "globalLock": [`gTwo`],
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {
            "gOne": `FromLambda1`
         }
      };
      expect(expectedConfig).to.deep.equal(newConfig);
   });
   it(`should handle undefined globalOverride`, () => {
      delete secondaryConfig.globalOverride;
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(newConfig.gOne).to.be.equal(`Global1`);
      expect(newConfig.gTwo).to.be.equal(`Global2`);
   });
   it(`should delete property from the globalConfig override on root level`, () => {
      globalConfig = {
         "gOne": `Global1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         },
         "globalLock": [`gTwo`]
      };
      secondaryConfig = {
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {
            "gOne": `FromLambda1`,
            "gTwo": `FromLambda2`
         }
      };
      const expectedConfig = {
         "gOne": `FromLambda1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         },
         "globalLock": [`gTwo`],
         "globalOverride": {
            "gOne": `FromLambda1`
         }
      };

      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(newConfig).to.deep.equal(expectedConfig);
   });
   it(`should delete a nested property from the globalConfig override`, () => {
      globalConfig = {
         "gOne": `Global1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         },
         "globalLock": [`gTwo`, `gNest.gNest2`, `gNest.gNest3.gNest3`]
      };
      secondaryConfig = {
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {
            "gOne": `FromLambda1`,
            "gTwo": `FromLambda2`,
            "gNest": {
               "gNest1": `LAMBDANEST1`,
               "gNest2": `LAMBDANEST2`,
               "gNest3": {
                  "gNest3": `toBeDeleted`,
                  "gNest3a": `shouldStay`
               }
            }
         }
      };
      const expectedConfig = {
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "gOne": `FromLambda1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `LAMBDANEST1`,
            "gNest2": `GNEST2`,
            "gNest3": {
               "gNest3a": `shouldStay`
            }
         },
         "globalLock": [`gTwo`, `gNest.gNest2`, `gNest.gNest3.gNest3`],
         "globalOverride": {
            "gOne": `FromLambda1`,
            "gNest": {
               "gNest1": `LAMBDANEST1`,
               "gNest3": {
                  "gNest3a": `shouldStay`
               }
            }
         }
      };
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(newConfig).to.deep.equal(expectedConfig);
   });
   it(`should delete all nested properties if the parent of the nested properties is in the globalConfig lock`, () => {
      globalConfig = {
         "gOne": `Global1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         },
         "globalLock": [`gTwo`, `gNest.gNest2`, `gNest.gNest3`]
      };

      secondaryConfig = {
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {
            "gOne": `FromLambda1`,
            "gTwo": `FromLambda2`,
            "gNest": {
               "gNest1": `LAMBDANEST1`,
               "gNest2": `LAMBDANEST2`,
               "gNest3": {
                  "gNest3": `toBeDeleted`,
                  "gNest3a": `shouldStay`
               }
            }
         }
      };

      const expectedConfig = {
         "gOne": `FromLambda1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `LAMBDANEST1`,
            "gNest2": `GNEST2`
         },
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalLock": [`gTwo`, `gNest.gNest2`, `gNest.gNest3`],
         "globalOverride": {
            "gOne": `FromLambda1`,
            "gNest": {
               "gNest1": `LAMBDANEST1`
            }
         }
      };
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(expectedConfig).to.deep.equal(newConfig);
   });
   it(`should accept an undefined globalOverrides object`, () => {
      secondaryConfig = {
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` }
      };

      const expectedConfig = {
         "gOne": `Global1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "globalLock": [`gTwo`],
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` }
      };
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(newConfig).to.deep.equal(expectedConfig);
   });
   it(`should accept an empty globalOverrides object`, () => {
      secondaryConfig = {
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {}
      };
      const expectedConfig = {
         "gOne": `Global1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "globalLock": [`gTwo`],
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {}
      };
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(newConfig).to.deep.equal(expectedConfig);
   });
   it(`should accept an empty globalLock array`, () => {
      globalConfig = {
         "gOne": `Global1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         },
         "globalLock": []
      };
      const expectedConfig = {
         "gOne": `FromLambda1`,
         "gTwo": `FromLambda2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         },
         "globalLock": [],
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {
            "gOne": `FromLambda1`,
            "gTwo": `FromLambda2`
         }
      };
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(expectedConfig).to.deep.equal(newConfig);
   });
   it(`should accept an undefined globalLock array`, () => {
      globalConfig = {
         "gOne": `Global1`,
         "gTwo": `Global2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         }
      };
      const expectedConfig = {
         "gOne": `FromLambda1`,
         "gTwo": `FromLambda2`,
         "gThree": `Global3`,
         "gNest": {
            "gNest1": `GNEST1`,
            "gNest2": `GNEST2`
         },
         "lOne": `Lambda1`,
         "lTwo": `Lambda2`,
         "lNest": { "lNest1": `Nest1` },
         "globalOverride": {
            "gOne": `FromLambda1`,
            "gTwo": `FromLambda2`
         }
      };
      newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig });
      expect(expectedConfig).to.deep.equal(newConfig);
   });
   describe(`clientConfig`, function() {
      it(`should only update 2nd audio in array`, function() {
         const flowConfig = {
            menuConfig: {
               initial: {
                  audios: [
                     {
                        type: `Play`,
                        content: `GREATING.wav`
                     },
                     {
                        type: `Say`,
                        content: `We found your acount with Sprint.`
                     },
                     {
                        type: `Say`,
                        content: `Is this correct?`
                     }
                  ],
                  reporting: {
                     outcome: `Prompt permission`,
                     reportKey: `7790`
                  }
               },
               maxNoInput: 3,
               maxNoMatch: 3,
               menuType: `TwiMLMenu`,
               numDigits: 5
            }
         };
         const clientConfig = {
            configReplace: JSON.stringify({
               "menuConfig.initial.audios.1": {
                  type: `Say`,
                  content: `We found your acount with A T and T.`
               }
            })
         };
         const expectedConfig = {
            menuConfig: {
               initial: {
                  audios: [
                     {
                        type: `Play`,
                        content: `GREATING.wav`
                     },
                     {
                        type: `Say`,
                        content: `We found your acount with A T and T.`
                     },
                     {
                        type: `Say`,
                        content: `Is this correct?`
                     }
                  ],
                  reporting: {
                     outcome: `Prompt permission`,
                     reportKey: `7790`
                  }
               },
               maxNoInput: 3,
               maxNoMatch: 3,
               menuType: `TwiMLMenu`,
               numDigits: 5
            }
         };

         newConfig = configBuilder.safeMerge({ globalConfig: flowConfig, clientConfig });
         expect(newConfig).to.deep.equal(expectedConfig);
      });
      it(`should update 2nd audio and reportKey`, function() {
         const flowConfig = {
            menuConfig: {
               initial: {
                  audios: [
                     {
                        type: `Play`,
                        content: `GREATING.wav`
                     },
                     {
                        type: `Say`,
                        content: `We found your acount with Sprint.`
                     },
                     {
                        type: `Say`,
                        content: `Is this correct?`
                     }
                  ],
                  reporting: {
                     outcome: `Prompt permission`,
                     reportKey: `7790`
                  }
               },
               maxNoInput: 3,
               maxNoMatch: 3,
               menuType: `TwiMLMenu`,
               numDigits: 5
            }
         };
         const clientConfig = {
            configReplace: JSON.stringify({
               "menuConfig.initial.audios.1": {
                  type: `Say`,
                  content: `We found your acount with A T and T.`
               },
               "menuConfig.initial.reporting.reportKey": `1234`
            })
         };
         const expectedConfig = {
            menuConfig: {
               initial: {
                  audios: [
                     {
                        type: `Play`,
                        content: `GREATING.wav`
                     },
                     {
                        type: `Say`,
                        content: `We found your acount with A T and T.`
                     },
                     {
                        type: `Say`,
                        content: `Is this correct?`
                     }
                  ],
                  reporting: {
                     outcome: `Prompt permission`,
                     reportKey: `1234`
                  }
               },
               maxNoInput: 3,
               maxNoMatch: 3,
               menuType: `TwiMLMenu`,
               numDigits: 5
            }
         };

         newConfig = configBuilder.safeMerge({ globalConfig: flowConfig, clientConfig });
         expect(newConfig).to.deep.equal(expectedConfig);
      });
      it(`should create new objects for nested values in configReplace`, function() {
         globalConfig = {
            "gOne": `Global1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "gNest": {
               "gNest1": `GNEST1`,
               "gNest2": `GNEST2`
            },
            "globalLock": [`gTwo`],
            "DEFAULT_MENU": {
               "MAX_NO_INPUT": `3`
            }
         };
         const clientConfig = {
            "lOne": `Lambda1`,
            "lTwo": `Lambda2`,
            "lNest": { "lNest1": `Nest1` },
            "configReplace": JSON.stringify({
               "DEFAULT_MENU.AUDIOS.RETRIES.COUNT": `3`
            })
         };
         const expectedConfig = {
            "gOne": `Global1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "gNest": {
               "gNest1": `GNEST1`,
               "gNest2": `GNEST2`
            },
            "globalLock": [`gTwo`],
            "DEFAULT_MENU": {
               "MAX_NO_INPUT": `3`,
               "AUDIOS": {
                  "RETRIES": {
                     "COUNT": `3`
                  }
               }
            }
         };

         newConfig = configBuilder.safeMerge({ globalConfig, clientConfig });
         expect(newConfig).to.deep.equal(expectedConfig);
      });
      it(`should throw ParseError`, function() {
         const clientConfig = {
            "configMerge": `Not a JS Object or a JSON String`
         };
         globalConfig = {
            "gOne": `Global1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "globalLock": [`gTwo`],
            "UTTERANCES": {
               "YES": {
                  "variations": [`sure`]
               },
               "SAMSUNG": {
                  "variations": [`same song`, `samsung`]
               }
            }
         };
         const throwsParseError = () => {
            configBuilder.safeMerge({ globalConfig, secondaryConfig, clientConfig });
         };
         assert.throws(throwsParseError, configBuilder.ParseError, `Unable to parse to JSON.`);
      });
      it(`should merge clientConfig with config.`, function() {
         const clientConfig = {
            "configMerge": {
               "UTTERANCES": {
                  "YES": {
                     "variations": [`yes`]
                  }
               }
            }
         };
         globalConfig = {
            "gOne": `Global1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "globalLock": [`gTwo`],
            "UTTERANCES": {
               "YES": {
                  "variations": [`sure`]
               },
               "SAMSUNG": {
                  "variations": [`same song`, `samsung`]
               }
            }
         };
         const expectedConfig = {
            "gOne": `FromLambda1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "globalLock": [`gTwo`],
            "lOne": `Lambda1`,
            "lTwo": `Lambda2`,
            "lNest": { "lNest1": `Nest1` },
            "globalOverride": {
               "gOne": `FromLambda1`
            },
            "UTTERANCES": {
               "YES": {
                  "variations": [`yes`]
               },
               "SAMSUNG": {
                  "variations": [`same song`, `samsung`]
               }
            }
         };
         newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig, clientConfig });
         expect(newConfig).to.deep.equal(expectedConfig);
      });

      it(`should replace clientConfig`, function() {
         const globalConfig = {
            "gOne": `Global1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "globalLock": [`gTwo`],
            "UTTERANCES": {
               "YES": {
                  "type": `RESPONSE`,
                  "variations": [`sure`]
               },
               "SAMSUNG": {
                  "variations": [`same song`, `samsung`]
               }
            }
         };

         let clientConfig = {
            "configReplace": {
               "UTTERANCES.YES.type": `REPLY`,
               "gOne": `FromClient1`,
               "gTwo": `FromClient2`
            }
         };
         newConfig = configBuilder.safeMerge({ globalConfig, clientConfig });
         expect(newConfig.UTTERANCES.YES.type).to.equal(`REPLY`);
         expect(newConfig.gOne).to.equal(`FromClient1`);
         expect(newConfig.gTwo).to.equal(`Global2`);

         // Stringified configReplace
         clientConfig = {
            "configReplace": JSON.stringify({
               "UTTERANCES.YES.type": `REPLY`,
               "gOne": `FromClient1`,
               "gTwo": `FromClient2`
            })
         };
         newConfig = configBuilder.safeMerge({ globalConfig, clientConfig });
         expect(newConfig.UTTERANCES.YES.type).to.equal(`REPLY`);
         expect(newConfig.gOne).to.equal(`FromClient1`);
         expect(newConfig.gTwo).to.equal(`Global2`);
      });


      it(`should remove key(s) from clientConfig if set to 'undefined'`, function() {
         const clientConfig = {
            "configReplace": JSON.stringify({
               "UTTERANCES.YES.type": `undefined`
            })
         };
         globalConfig = {
            "gOne": `Global1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "globalLock": [`gTwo`],
            "UTTERANCES": {
               "YES": {
                  "type": `RESPONSE`,
                  "variations": [`sure`]
               },
               "SAMSUNG": {
                  "variations": [`same song`, `samsung`]
               }
            }
         };
         const expectedConfig = {
            "gOne": `FromLambda1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "globalLock": [`gTwo`],
            "lOne": `Lambda1`,
            "lTwo": `Lambda2`,
            "lNest": { "lNest1": `Nest1` },
            "globalOverride": {
               "gOne": `FromLambda1`
            },
            "UTTERANCES": {
               "YES": {
                  "variations": [`sure`]
               },
               "SAMSUNG": {
                  "variations": [`same song`, `samsung`]
               }
            }
         };
         newConfig = configBuilder.safeMerge({ globalConfig, secondaryConfig, clientConfig });
         expect(newConfig).to.deep.equal(expectedConfig);
      });
   });
   describe(`Original Config values`, function() {
      it(`should leave the secondaryConfig config unchanged after operation`, function() {
         expect(secondaryConfig).to.deep.equal({
            "lOne": `Lambda1`,
            "lTwo": `Lambda2`,
            "lNest": { "lNest1": `Nest1` },
            "globalOverride": {
               "gOne": `FromLambda1`,
               "gTwo": `FromLambda2`
            }
         });
      });
      it(`should leave the globalConfig config unchanged after operation`, function() {
         expect(globalConfig).to.deep.equal({
            "gOne": `Global1`,
            "gTwo": `Global2`,
            "gThree": `Global3`,
            "globalLock": [`gTwo`]
         });
      });
   });
});
