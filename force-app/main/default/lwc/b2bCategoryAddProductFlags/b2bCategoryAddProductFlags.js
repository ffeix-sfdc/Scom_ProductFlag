import { LightningElement, api, wire } from "lwc";

import { loadScript } from "lightning/platformResourceLoader";
import { loadStyle } from 'lightning/platformResourceLoader';
import b2bAddCategoryProductFlagLib from "@salesforce/resourceUrl/b2bAddCategoryProductFlagLib";

const DOMCARDSREADY_EVT = 'DOMCardsReady';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/b2bCategoryAddProductFlagsPubSub';

import getProductsFlags from '@salesforce/apex/B2bCategoryAddProductFlagsController.getProductsFlags';

import LANG from '@salesforce/i18n/lang';
import DIR from '@salesforce/i18n/dir';
import LOCAL from '@salesforce/i18n/locale';

export default class B2bCategoryAddProductFlags extends LightningElement {
    @api isInBuilder = false;
    @api consoleLog = false;

    @api searchResultsProducts;
    @api useHeadMarkupCSS;
    @api domCards;

    @api lang = LANG;
    @api dir = DIR;
    @api local = LOCAL;

    _searchResults;
    @api 
    get searchResults() {
        return this._searchResults;
    }
    set searchResults(v) {
        this._searchResults = v;
        // Call getProductsFlags
        if (this._searchResults) {
            this.searchResultsProducts == undefined;
            this.getProductsFlags();
        }
        // if domCards is already define, category page has change, so need to load cards from DOM
        if (this.domCards) {
            this.domCards = undefined;
            prdFlags.loadElements(document, {
                onDomCardsReady: function (productIds, pageRef) { 
                    fireEvent(pageRef, DOMCARDSREADY_EVT, productIds);
                },
                pageRef: this.pageRef,
                consoleLog: this.consoleLog
            });
        }
    }

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        // Define Console log is on
        var consoleLog = this.getUrlParamValue(window.location.href, 'log');
        if (consoleLog == 'true') {
            this.consoleLog = 'true';
        }

        console.log('lang= %O', this.lang);
        console.log('dir= %O', this.dir);
        console.log('local= %O', this.local);

        // Check if is in Builder
        var wlOrigin = window.location.origin;
        if (wlOrigin) {
            if (wlOrigin.includes('live-preview')) {
                this.isInBuilder = 'true';
            }
        }
        
        registerListener(DOMCARDSREADY_EVT, this.handleDomCardsReady, this);
        if(this.useHeadMarkupCSS == false) {
            loadStyle(this, b2bAddCategoryProductFlagLib + '/style.css');
        }

    }
    get isReadyAppend() {
        return this.domCards != undefined && this.searchResultsProducts != undefined;
    }

    handleDomCardsReady(productIds) {
        if (this.consoleLog) { console.group('%c B2bCategoryAddProductFlags - handleDomCardsReady', 'background: #76b72a; color: #ffffff'); }
        if (this.consoleLog) { console.log('inside handleDomCardsReady');}

        this.domCards = productIds.toString();

        if (this.consoleLog) { console.log('domCards: ' + this.domCards + ' type:' + typeof this.domCards); }
        if (this.consoleLog) { console.log('Call prdFlags.appendCards'); }
        if(this.isReadyAppend) {
            prdFlags.appendCards(document, {
                flags: this.searchResultsProducts,
                consoleLog: this.consoleLog,
                local: this.local
            });
        }
        if (this.consoleLog) { console.log('After prdFlags.appendCards'); }
        if (this.consoleLog) { console.groupEnd(); }
    }



    renderedCallback() {
        loadScript(this, b2bAddCategoryProductFlagLib + '/script.js')
            .then(() => {
                // Initialize with options
                prdFlags.attachTo(document, {
                    onDomCardsReady: function (productIds, pageRef) { // Alternative to document.addEventListener('scan')
                        fireEvent(pageRef, DOMCARDSREADY_EVT, productIds);
                    },
                    pageRef: this.pageRef,
                    consoleLog: this.consoleLog
                });

            })
            .catch(error => {
                if (!error.toString().includes('already initialized')) {
                    console.error('Failed to load ' + addCategoryProductFlaglib + '.js : ' + error);
                }
            });

    }

    getProductsFlags() {
        if (this.consoleLog) { console.group('%c B2bCategoryAddProductFlags - getProductsFlags', 'background: #76b72a; color: #ffffff'); }
        var _productIds = [];
        this.searchResults.cardCollection.forEach(card => {
            _productIds.push(card.id);
        })
        if (this.consoleLog) { console.log('_productIds.toString(): ' + _productIds.toString() + ' type:' + typeof _productIds.toString()); }

        getProductsFlags({
            productIds: _productIds.toString()
        })
            .then((result) => {
                if (this.consoleLog) { console.log('result = %O', result); }
                this.searchResultsProducts = result;

            }).catch((error) => {
                console.error('Failed to getProductsFlags: %0', error);

            });
        if (this.consoleLog) { console.groupEnd(); }
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
        prdFlags.detachFrom(document);

    }

    getUrlParamValue(url, key) {
        return new URL(url).searchParams.get(key);
    }    
}