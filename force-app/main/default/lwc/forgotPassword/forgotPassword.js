import { LightningElement, track } from 'lwc';
import sendGeneratedPassword from '@salesforce/apex/ForgotPasswordController.sendGeneratedPassword';
import { NavigationMixin } from 'lightning/navigation';
export default class ForgotPassword extends NavigationMixin(LightningElement) {
    @track email = '';
    @track username='';
    @track successMessage = '';
    @track errorMessage = '';

    handleEmailChange(event) {
        this.email = event.target.value;
    }
    handleusernameChange(event){
        this.username = event.target.value;
    }


    handleSubmit() {
        this.successMessage = '';
        this.errorMessage = '';

        sendGeneratedPassword({ email: this.email ,username:this.username})
            .then(result => {
                this.successMessage = 'A new password has been sent to your email. Please use it to login.';
            })
            .catch(error => {
                this.errorMessage = 'Error: ' + error.body.message;
            });
    }
    navigateToLogin() {
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'Login_page'
                }
            });
        }
}
