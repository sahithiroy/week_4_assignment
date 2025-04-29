public with sharing class ForgotPasswordController {
    @AuraEnabled
    public static void sendGeneratedPassword(String email,String username) {
        List<UserDetail__c> users = [
            SELECT Id, Email__c FROM UserDetail__c WHERE Email__c = :email and username__c = :username LIMIT 1
        ];
        if (users.isEmpty()) {
            throw new AuraHandledException('Email not found. Please try again.');
        }
        UserDetail__c user = users[0];        
        String generatedPassword = generateRandomPassword();       
        user.Password__c = generatedPassword;
        update user;
        sendPasswordEmail(user.Email__c, generatedPassword);
    }
    private static String generateRandomPassword() {
        String charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        Integer passwordLength = 8; 
        String password = '';

        for (Integer i = 0; i < passwordLength; i++) {
            Integer randomIndex = Math.mod(Math.abs(Crypto.getRandomInteger()), charset.length());
            password += charset.substring(randomIndex, randomIndex + 1);
        }
        return password;
    }   
    private static void sendPasswordEmail(String recipientEmail, String newPassword) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { recipientEmail });
        mail.setSubject('Your New Password');
        mail.setPlainTextBody('Your new password is: ' + newPassword + '\n\nPlease use this to login to your account.');

        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
}
