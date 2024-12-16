import { LightningElement, api, track, wire } from 'lwc';

import { getRecord, getFieldValue, updateRecord, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import ID from "@salesforce/schema/CommerceFlag__c.Id";
import ANIMATE from "@salesforce/schema/CommerceFlag__c.Animate__c";
import BACKGROUNDCOLOR from "@salesforce/schema/CommerceFlag__c.Background_Color__c";
import COLOR from "@salesforce/schema/CommerceFlag__c.Color__c";
import LABEL from "@salesforce/schema/CommerceFlag__c.Label__c";
import NAME from "@salesforce/schema/CommerceFlag__c.Name";
import ROTATE from "@salesforce/schema/CommerceFlag__c.Rotate__c";
import TRANSLATION from "@salesforce/schema/CommerceFlag__c.Translation__c";

export default class CommerceFlag extends LightningElement {
    @api recordId;
    @api objectApiName;

    @api animate;
    @api backgroundcolor;
    @api color;
    @api label;
    @api name;
    @api rotate;
    @track animateOptions = [];
    @api translation;
    @api translationDatatable;

    @api columns = [{
        label: 'Local',
        fieldName: 'local',
        type: 'String',
        editable: true,
        hideDefaultActions: 'true',
        sortable: "true",
    },
    {
        label: 'Label',
        fieldName: 'label',
        type: 'String',
        editable: true,
        hideDefaultActions: 'true',
        sortable: "true",
    },
    {label: 'Actions',	type: 'action', initialWidth : 150, typeAttributes: { rowActions: [{
        'label': 'Delete',
        'name': 'delete'
    }], menuAlignment: 'auto' } }
];

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [
            ANIMATE,
            BACKGROUNDCOLOR,
            COLOR,
            LABEL,
            NAME,
            ROTATE,
            TRANSLATION
        ]
    })
    getRecord({error, data}){
        if(data){
            this.animate = getFieldValue(data, ANIMATE);
            this.backgroundcolor = getFieldValue(data, BACKGROUNDCOLOR);
            this.color = getFieldValue(data, COLOR);
            this.label = getFieldValue(data, LABEL);
            this.name = getFieldValue(data, NAME);
            this.rotate = getFieldValue(data, ROTATE);
            this.translation = getFieldValue(data, TRANSLATION);

            this.getTranslation();
        }else if(error){
            console.error('CommerceFlag getRecord Error:%O', error); 
        }
    }

    @wire(getPicklistValues, { 
        recordTypeId: "012000000000000AAA", 
        fieldApiName: ANIMATE 
    })
    getPicklistValues({error, data}){
        if(data){
            this.animateOptions.push({ label: '--None--', value: '' });
            data.values.forEach(value => {
                this.animateOptions.push({ label: value.label, value: value.value });
            });
        }else if(error){
            console.error('CommerceFlag getPicklistValues Error:%O', error); 
        }
    }

    getTranslation() {
        let dataTable = [];
        let json = JSON.parse(this.translation);
        let key = 1;
        if(json) {
            json.forEach(local => {
                if(local.local) {
                let o = {};
                o.key = key.toString();
                o.local = local.local;
                o.label = local.label;
                dataTable.push(o);
                key += 1;
            }
            });
        }
        // Add new line
        dataTable.push({"key":key,"local":"","label":""});
        this.translationDatatable = dataTable;
    }

    draftValues = [];

    handleSave(event) {
        const updatedFields = event.detail.draftValues;
        // Prepare the record IDs for notifyRecordUpdateAvailable()
        const notifyChangeIds = { "recordId": this.recordId };

        var _translationDatatable = [...this.translationDatatable];
        updatedFields.forEach(updatedField => {
            let keyIndex = _translationDatatable.findIndex(keyIndex => keyIndex.key === updatedField.key);
            // if new local line, push it
            if(keyIndex == -1) {
                _translationDatatable.push(updatedField);
            }
            else {
                if(updatedField.local) {
                    _translationDatatable[keyIndex].local = updatedField.local;
                }
                if(updatedField.label) {
                    _translationDatatable[keyIndex].label = updatedField.label;
                }
            }
        });
        this.translationDatatable = _translationDatatable;
        this.translation = JSON.stringify(_translationDatatable);
        this.updateFlag();

        this.draftValues = [];

    }

    handleRowAction(event){
		const action = event.detail.action;
		const row = event.detail.row;
		switch (action.name) {
			case 'delete':
                var _translationDatatable = [...this.translationDatatable];
                let keyIndex = _translationDatatable.findIndex(keyIndex => keyIndex.key === row.key);
                _translationDatatable.splice(keyIndex, 1);
                this.translationDatatable = _translationDatatable;
                this.translation = JSON.stringify(_translationDatatable);
                this.updateFlag();
			    break;
 		}
	}
    
    handleNameChange(event) { this.name = event.detail.value; }
    handleLabelChange(event) { this.label = event.detail.value; }
    handleBgColorChange(event) { this.backgroundcolor = event.detail.value; }
    handleColorChange(event) { this.color = event.detail.value; }
    handleRotateChange(event) { this.rotate = event.detail.value; }
    handleAnimateChange(event) { this.animate = event.detail.value; }

    updateFlag() {
        // Create the recordInput object
        const fields = {};
        fields[ID.fieldApiName] = this.recordId;
        fields[ANIMATE.fieldApiName] = this.animate;
        fields[BACKGROUNDCOLOR.fieldApiName] = this.backgroundcolor;
        fields[COLOR.fieldApiName] = this.color;
        fields[LABEL.fieldApiName] = this.label;
        fields[NAME.fieldApiName] = this.name;
        fields[ROTATE.fieldApiName] = this.rotate;
        fields[TRANSLATION.fieldApiName] = this.translation;
        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Flag updated",
                        variant: "success",
                    }),
            );
        })
        .catch((error) => {
            this.dispatchEvent(
            new ShowToastEvent({
                title: "Error updating record",
                message: error.body.message,
                variant: "error",
            }),
            );
        });

    }
}