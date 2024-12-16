public with sharing class B2bCategoryAddProductFlagsController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsFlags(String productIds){
        Set<Id> prdIds = new Set<Id>();
        for(String id : productIds.split(',')){
            prdIds.add(id);
        }
        return [SELECT Flag__c, Flag__r.Label__c, Flag__r.Color__c, Flag__r.Background_Color__c, Flag__r.Rotate__c, Flag__r.Animate__c, Flag__r.Translation__c
                FROM Product2
                WHERE Id = :prdIds AND Flag__c != null];
    }

}
