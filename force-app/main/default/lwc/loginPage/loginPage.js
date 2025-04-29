import { LightningElement, track } from 'lwc';
import validateLoginDetails from '@salesforce/apex/UserDetails.validateLoginDetails';
import { NavigationMixin } from 'lightning/navigation';

export default class LoginPage extends NavigationMixin(LightningElement) {
    @track username = '';
    @track password = '';
    @track error = '';

    handleUsernameChange(event) {
        this.username = event.target.value;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

   

    handleLogin() {
    this.error = '';
    validateLoginDetails({ username: this.username, password: this.password })
        .then(loginActivityId => {
            if (loginActivityId) {
                // Store activity ID in session for logout use
                sessionStorage.setItem('loginActivityId', loginActivityId);

                this[NavigationMixin.Navigate]({
                    type: 'standard__navItemPage',
                    attributes: { apiName: 'accountViewer' }
                });
            } else {
                this.error = 'Invalid credentials.';
            }
        })
        .catch(error => {
            this.error = 'Error: ' + error.body.message;
        });
    }

    navigateToSignup() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'SignupPage'
            }
        });
    }

    navigateToForgotPassword() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'ForgotPassword'
            }
        });
    }
    
}
