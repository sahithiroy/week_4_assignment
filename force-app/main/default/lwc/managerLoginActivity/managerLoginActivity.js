import { LightningElement, api, track } from 'lwc';

export default class ManagerLoginActivity extends LightningElement {
    @api activities = [];
    formatDateToIST(date) {
        if (!date) return null;

        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        };

        return new Intl.DateTimeFormat('en-IN', {
            ...options,
            timeZone: 'Asia/Kolkata'
        }).format(new Date(date));
    }

    get processedActivities() {
        return this.activities.map(row => {
            const loginTime = new Date(row.LoginTiming__c);
            const logoutTime = row.LogoutTiming__c ? new Date(row.LogoutTiming__c) : null;
            let screenTime = 'In Progress'; 
            if (logoutTime) {
                const timeDiff = logoutTime - loginTime; 
                const hours = (timeDiff / 1000 / 60 / 60).toFixed(2); 
                screenTime = `${hours} Hours`;
            }
            return {
                ...row,
                formattedLoginTime: this.formatDateToIST(row.LoginTiming__c),
                formattedLogoutTime: this.formatDateToIST(row.LogoutTiming__c),
                statusIcon: row.LogoutTiming__c ? '' : '',
                statusClass: row.LogoutTiming__c ? 'gray-dot' : 'green-dot',
                screenTime: screenTime
            };
        });
    }
    
}




