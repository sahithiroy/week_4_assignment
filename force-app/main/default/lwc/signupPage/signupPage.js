import { LightningElement, track } from 'lwc';
import createUser from '@salesforce/apex/SignupController.createUser';
import getManagers from '@salesforce/apex/SignupController.getManagers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class SignupPage extends NavigationMixin(LightningElement) {
    @track name = '';
    @track username = '';
    @track password = '';
    @track email = '';
    @track role = '';
    @track age = '';
    @track birthday = '';
    @track joiningDate = '';
    @track Manager = '';  
    @track isManager = false;
    @track managerOptions = []; 

    connectedCallback() {
        this.loadManagerOptions();
    }

    loadManagerOptions() {
        getManagers()
            .then((data) => {
                this.managerOptions = data.map(manager => ({
                    label: manager.Name, 
                    value: manager.Id      
                }));
                console.log('Manager Options: ', this.managerOptions);
            })
            .catch((error) => {
                console.error('Error fetching manager options:', error);
            });
    }

    handleChange(event) {
        const field = event.target.dataset.id;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this[field] = value;
    }

    handleSubmit() {
        createUser({
            name: this.name,
            username: this.username,
            password: this.password,
            email: this.email,
            role: this.role,
            age: parseInt(this.age),
            birthday: this.birthday,
            joiningDate: this.joiningDate,
            ManagerName: this.Manager, 
            isManager: this.isManager
        })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account created successfully. You can now login!',
                    variant: 'success'
                })
            );
            this.clearForm();
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    clearForm() {
        this.name = '';
        this.username = '';
        this.password = '';
        this.email = '';
        this.role = '';
        this.age = '';
        this.birthday = '';
        this.joiningDate = '';
        this.Manager = '';  
        this.isManager = false;
    }

    navigateToLogin() {
        this[NavigationMixin.Navigate]( {
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Login_page'
            }
        });
    }
}


