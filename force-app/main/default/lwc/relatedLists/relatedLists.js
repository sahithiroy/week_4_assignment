import { LightningElement, api, wire, track } from 'lwc';
import getRelatedLists from '@salesforce/apex/AccountController.getRelatedLists';

export default class RelatedLists extends LightningElement {
    @api recordId;

    @track opps = [];
    @track contacts = [];
    @track cases = [];
   

    oppColumns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Stage', fieldName: 'StageName' },
        { label: 'Amount', fieldName: 'Amount', type: 'currency' }
    ];

    contactColumns = [
        { label: 'First Name', fieldName: 'FirstName' },
        { label: 'Last Name', fieldName: 'LastName' },
        { label: 'Email', fieldName: 'Email' }
    ];

    caseColumns = [
        { label: 'Case Number', fieldName: 'CaseNumber' },
        { label: 'Status', fieldName: 'Status' },
        { label: 'Priority', fieldName: 'Priority' }
    ];

    @wire(getRelatedLists, { accountId: '$recordId' })
    wiredData({ error, data }) {
        if (data) {
            this.opps = data.opportunities;
            this.contacts = data.contacts;
            this.cases = data.cases;
        } else if (error) {
            console.error('Error loading related lists', error);
        }
    }
}
