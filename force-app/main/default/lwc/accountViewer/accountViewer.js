import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import handleLogout from '@salesforce/apex/UserDetails.handleLogout';
import managerAuthenticated from '@salesforce/apex/UserDetails.managerAuthenticated';
import { NavigationMixin } from 'lightning/navigation';
import getActiveUserCount from '@salesforce/apex/UserDetails.getActiveUserCount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getEmployeeLoginActivities from '@salesforce/apex/UserDetails.getEmployeeLoginActivities';
import getAllUsers from '@salesforce/apex/UserDetails.getAllUsers';
import CEOAuthentication from '@salesforce/apex/UserDetails.CEOAuthentication';
export default class AccountViewer extends NavigationMixin(LightningElement) {
    @track accounts = [];
    @track selectedAccountId;
    @track isManager = false;
    @track employeeLoginActivities = [];
    @track isCeo=false;
    @track allUsers = [];

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Industry', fieldName: 'Industry' },
        { label: 'Phone', fieldName: 'Phone' },
        {
            type: 'button',
            typeAttributes: {
                label: 'View Related',
                name: 'view_related',
                variant: 'brand'
            }
        }
    ];

    connectedCallback() {
        this.checkManagerStatus();
        this.checkUserLoad();
        this.checkCEO();
    }

    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        if (action === 'view_related') {
            this.selectedAccountId = row.Id;
        }
    }

    navigateToLogin() {
        const activityId = sessionStorage.getItem('loginActivityId');
        if (activityId) {
            handleLogout({ loginActivityId: activityId })
                .then(() => {
                    sessionStorage.removeItem('loginActivityId');
                    this[NavigationMixin.Navigate]( {
                        type: 'standard__navItemPage',
                        attributes: {
                            apiName: 'Login_page'
                        }
                    });
                })
                .catch(error => {
                    console.error('Logout error:', error);
                });
        } else {
            console.warn('No login activity ID found.');
        }
    }

    checkManagerStatus() {
        const activityId = sessionStorage.getItem('loginActivityId');
        if (activityId) {
            managerAuthenticated({ loginActivityId: activityId })
    .then((managerId) => {
        console.log('Manager ID:', managerId); 
        if (managerId) {
            this.isManager = true;
            this.managerId = managerId;
            this.loadEmployeeActivities();
        } else {
            this.isManager = false;
        }
    })
    .catch((error) => {
        console.error('Error checking manager status:', error);
    });

        }
    }
    
    loadEmployeeActivities() {
        getEmployeeLoginActivities({ managerId: this.managerId })
            .then((data) => {
                console.log('Employee login activities:', data);  
                this.employeeLoginActivities = data;
                console.log('this.employeeLoginActivities'+this.employeeLoginActivities);
            })
            .catch((error) => {
                console.error('Error loading employee activities:', error);
            });
        console.log('this.employeeLoginActivities'+this.employeeLoginActivities);
    }  
     
    checkUserLoad() {
        getActiveUserCount()
            .then(count => {
                if (count > 3) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Heavy Traffic',
                            message: 'The page is under heavy traffic, please be cautious when initiating any long running job.',
                            variant: 'warning',
                            mode: 'sticky'
                        })
                    );
                }
            })
            .catch(error => {
                console.error('Error fetching active user count:', error);
            });
    }
    checkCEO() {
        const activityId = sessionStorage.getItem('loginActivityId');
        if (activityId) {
            CEOAuthentication({ loginActivityId: activityId })
                .then((ceoId) => {
                    if (ceoId) {
                        this.isCeo = true;
                    } else {
                        this.isCeo = false;
                    }
                })
                .catch((error) => {
                    console.error('Error checking CEO authentication:', error);
                    this.isCeo = false;
                });
        }
    }
    fetchAllUsers() {
        getAllUsers().then(data => {
            this.allUsers = data;
            this.filteredUsers = data;
        });
    }
    handleSearch(event) {
        const searchKey = event.target.value.toLowerCase();
        this.filteredUsers = this.allUsers.filter(user => user.Name.toLowerCase().includes(searchKey));
    }
    
}