public with sharing class UserDetails {
    @AuraEnabled
    public static Id validateLoginDetails(String username, String password) {
        List<UserDetail__c> users = [
            SELECT Id, username__c, password__c, Email__c ,Manager_Name__r.Email__c
            FROM UserDetail__c 
            WHERE Username__c = :username AND Password__c = :password 
        ];

        if (!users.isEmpty()) {
            UserDetail__c user = users[0];
            List<Login_Activity__c> activities = [
                SELECT Id, LoginTiming__c 
                FROM Login_Activity__c 
                WHERE Name = :username 
                ORDER BY CreatedDate DESC 
               
            ];

            Login_Activity__c activity;
            if (!activities.isEmpty()) {
                activity = activities[0];
                activity.LoginTiming__c = System.now();
                activity.LogoutTiming__c=null;
                update activity;
            } else {
                    activity = new Login_Activity__c(
                    Name = username,
                    User__c = user.Id,
                    LoginTiming__c = System.now()
                );
                insert activity;
            }

            if (user.Manager_Name__r != null && user.Manager_Name__r.Email__c != null) {
                /*sendEmail(user.Email__c,user.Manager_Name__r.Email__c,
                    'Login Notification',
                    'User ' + username + ' logged in at ' + System.now().format());*/
            }

            return activity.Id;
        }

        return null;
    }

    @AuraEnabled
    public static void handleLogout(Id loginActivityId) {
        Login_Activity__c activity = [
            SELECT Id, LoginTiming__c ,Login_Activity__c.User__r.Email__c,Login_Activity__c.User__r.Manager_Name__r.Email__c
            FROM Login_Activity__c 
            WHERE Id = :loginActivityId 
            LIMIT 1
        ];

        activity.LogoutTiming__c = System.now();
        update activity;

        Long timeSpent = activity.LogoutTiming__c.getTime() - activity.LoginTiming__c.getTime();
        String duration = String.valueOf((Integer)(timeSpent / 60000)) + ' minutes';

        /*sendEmail(activity.User__r.Email__c, activity.User__r.Manager_Name__r.Email__c,
            'Logout Notification',
            'User logged out at ' + System.now().format() +
            '\nLogin Time: ' + activity.LoginTiming__c.format() +
            '\nTime spent: ' + duration);*/
    }

    private static void sendEmail(String to1, String to2, String subject, String body) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { to1, to2 });
        mail.setSubject(subject);
        mail.setPlainTextBody(body);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
    @AuraEnabled(cacheable=true)
    public static List<Login_Activity__c> getRecentLogins() {
        DateTime cutoff = System.now().addHours(-24);
        return [
            SELECT Id, Name, LoginTiming__c, LogoutTiming__c, User__c
            FROM Login_Activity__c
            WHERE LoginTiming__c >= :cutoff
        ];
    }
    @AuraEnabled(cacheable=true)
    public static Id managerAuthenticated(Id loginActivityId) {
        Login_Activity__c loginActivity = [
        SELECT Id, User__r.Id, User__r.Name, User__r.Manager__c
        FROM Login_Activity__c
        WHERE Id = :loginActivityId AND User__r.Manager__c = true
        LIMIT 1
        ];

        if (loginActivity != null) {
        List<Manager__c> matchingManagers = [
            SELECT Id
            FROM Manager__c
            WHERE Name = :loginActivity.User__r.Name
            
            ];

            if (!matchingManagers.isEmpty()) {
            return matchingManagers[0].Id;
            }
        }

        return null;
    }

    @AuraEnabled(cacheable=true)
    public static List<Login_Activity__c> getEmployeeLoginActivities(Id managerId) {
        
        List<Login_Activity__c> activities =[SELECT Id, Name, LoginTiming__c, LogoutTiming__c, User__c, User__r.Name,User__r.Manager_Name__c
            FROM Login_Activity__c
            WHERE User__r.Manager_Name__c = :managerId 
            ORDER BY LoginTiming__c DESC];
        return activities;   
    }

    @AuraEnabled(cacheable=true)
    public static Integer getActiveUserCount() {
        DateTime cutoff = System.now().addHours(-1); 
        return [SELECT COUNT() FROM Login_Activity__c WHERE LogoutTiming__c = : NULL AND LoginTiming__c >= :cutoff];
    }
    @AuraEnabled(cacheable=true)
    public static Id CEOAuthentication(id ceoId){
        Login_Activity__c ceo=[SELECT Id,User__r.Id,User__r.Manager__c from Login_Activity__c where User__r.id =:ceoId and User__r.Manager__c=true and user__r.Manager_Name__c=null];
        return ceo.User__r.Id;
    }
    @AuraEnabled(cacheable=true)
    public static List<UserDetail__c> getAllUsers() {
        return [
            SELECT Id, Name, Email__c, Role__c, Manager__c, Manager_Name__r.Name
            FROM UserDetail__c
        ];
    }

}



