/*
 * script.js - parse DOM to add id to "commerce_search-product-card", then add "Flag" section
 * Credits: Franck Feix @ Salesforce
 * 
 */
;
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory()) :
        global.prdFlags = factory()
}(this, (function() {
    var prdFlags = {

        /**
         * 
         * @param DomElement oDomElement
         * @param Object oOptions
         * @return self
         */
        attachTo: function(oDomElement, oOptions) {

            if (oDomElement.prdFlagsData !== undefined) {
                throw new Error("prdFlags is already initialized for DOM element " + oDomElement);
            }

            // initializing options and variables on DomElement
            oDomElement.prdFlagsData = {
                loaded: true,
                options: oOptions,
            };

            
            prdFlags.loadElements(oDomElement, oOptions);
            
            return this;
        },

        loadElements: function(oDomElement, oOptions) {
            var productIds = [];
            setTimeout(function(){
                if (oOptions.consoleLog) { console.group('%c b2bAddCategoryProductFlag - loadElements', 'background: #76b72a; color: #ffffff'); }
                /* B2B Template */
                var cards = oDomElement.body.getElementsByTagName("commerce_search-product-card");
                if (oOptions.consoleLog) { console.log('cards= %O', cards); }
                for (let i = 0; i < cards.length; i++) {
                    var productId = cards[i].getAttribute('data-id');
                    productIds.push(productId);
                    cards[i].id = [productId];
                    if (oOptions.consoleLog) { console.log('Found productId= %O', productId); }
                }
                /* D2C Template */
                if(cards.length == 0) {
                    cards = document.body.getElementsByTagName("commerce-product-card");
                    for (let i = 0; i < cards.length; i++) {
                        var a = cards[i].getElementsByTagName('a')[0];
                        var index = a.href.lastIndexOf("/");
                        var productId = a.href.substring(index+1);
                        productIds.push(productId);
                        cards[i].id = [productId];
                    }
                }
                oOptions.onDomCardsReady.call(oDomElement, productIds, oOptions.pageRef);

                if (oOptions.consoleLog) { console.groupEnd(); }
            }, 1000);

            
            prdFlags.productIds = productIds;
        },

        appendCards: function(oDomElement, oOptions) {
            if (oOptions.consoleLog) { console.group('%c b2bAddCategoryProductFlag - appendCards', 'background: #76b72a; color: #ffffff'); }
            if (oOptions.consoleLog) { console.log('oOptions: %O', oOptions); }
            if (oOptions.consoleLog) { console.log('oOptions.flags: %O', oOptions.flags); }
            if (oOptions.consoleLog) { console.log('oOptions.flags.length: %O', oOptions.flags.length); }
            if (oOptions.consoleLog) { console.log('oOptions.local: %O', oOptions.local); }

            /* oOptions.flags 
            [
                {
                    "Flag__r": {
                        "Label__c": "Limited Edition", ==> [Mandatory] Label to render
                        "Background_Color__c": "#e64141", ==> [Optional] Flag Background Color, default #000000 is in CSS
                        "Color__c": "yellow" ==> [Optional] Flag Text Color, default #ffffff is in CSS
                        "Rotate__c": "-15deg", ==> [Optional] Flag Rotate, default -30deg is in CSS
                        "Animate__c": "Stretch", ==> [Optional] CSS Animation to use, value can be Pulse, Stretch or Swing. See CSS for @keyframes
                        "Id": "aFiJ7000000KyrRKAS",
                    },
                    "Flag__c": "aFiJ7000000KyrRKAS",
                    "Id": "01t7Q000005wNiYQAU" ==> Product ID
                }
            ]
            */

            for (let i = 0; i < oOptions.flags.length; i++) {
                if (oOptions.consoleLog) { console.log('flag: %O', oOptions.flags[i].Id); }

                var card = oDomElement.getElementById(oOptions.flags[i].Id);

                var producttileFlag = oDomElement.createElement("div");
                producttileFlag.className = "producttile-flag";
                if(oOptions.flags[i].Flag__r.Rotate__c){
                    producttileFlag.style.rotate = oOptions.flags[i].Flag__r.Rotate__c; 
                }
            
                var textFlagWrapper = oDomElement.createElement("div");
                textFlagWrapper.className = "text-flag-wrapper";
            
                var textFlag = oDomElement.createElement("div");
                textFlag.className = "text-flag";
                if(oOptions.flags[i].Flag__r.Color__c){
                    textFlag.style.color = oOptions.flags[i].Flag__r.Color__c; 
                }
                if(oOptions.flags[i].Flag__r.Background_Color__c) {
                    textFlag.style.background = oOptions.flags[i].Flag__r.Background_Color__c; 
                }
                if(oOptions.flags[i].Flag__r.Animate__c) {
                    switch (oOptions.flags[i].Flag__r.Animate__c) {
                        case "Pulse": {
                            textFlag.style.animation = "pulse 5s infinite";
                            break;
                        }
                        case "Stretch": {
                            textFlag.style.animation = "stretch 1.5s ease-out 0s alternate infinite none running";
                            break;
                        }
                        case "Swing": {
                            textFlag.style.animation = "swing ease-in-out 1s infinite alternate";
                            break;
                        }
                        default: {
                            console.log(`No Animation Found`);
                        }
                      }                    
                }

                var textFlagLabel = oDomElement.createElement("span");
                textFlagLabel.className = "text-flag-label";
                
                let label = oOptions.flags[i].Flag__r.Label__c;
                if(oOptions.flags[i].Flag__r.Translation__c) {
                    let translations = JSON.parse(oOptions.flags[i].Flag__r.Translation__c);
                    let translation = translations.find(translation => translation.local === oOptions.local);
                    if(translation) {
                        label = translation.label;
                    }
                }
                textFlagLabel.innerHTML = label;
            
                producttileFlag.appendChild(textFlagWrapper);
                textFlagWrapper.appendChild(textFlag);
                textFlag.appendChild(textFlagLabel);
            
                card.prepend(producttileFlag);
                if (oOptions.consoleLog) { console.log('done card= %O', card); }

            }

            if (oOptions.consoleLog) { console.groupEnd(); }

        },

        /**
         * 
         * @param DomElement oDomElement
         * @return void
         */
        detachFrom: function(oDomElement) {
            // clearing data off DomElement
            oDomElement.prdFlagsData = undefined;
            return;
        },

        /**
         * Returns TRUE if prdFlags is attached to the given DOM element and FALSE otherwise.
         * 
         * @param DomElement
         * @return boolean
         */
        isAttachedTo: function(oDomElement) {
            return (oDomElement.prdFlagsData !== undefined);
        }
    };

    return prdFlags;
})));