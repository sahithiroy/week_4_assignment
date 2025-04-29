public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(){
        try {
            return [SELECT Id, Name, Industry,Phone FROM Account];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getRelatedLists(Id accountId) {
    Map<String, Object> result = new Map<String, Object>();

    result.put('opportunities', [
        SELECT Id, Name, StageName, Amount
        FROM Opportunity
        WHERE AccountId = :accountId
    ]);

    result.put('contacts', [
        SELECT Id, FirstName, LastName, Email
        FROM Contact
        WHERE AccountId = :accountId
    ]);

    result.put('cases', [
        SELECT Id, CaseNumber, Status, Priority
        FROM Case
        WHERE AccountId = :accountId
    ]);

    return result;
}

    
}