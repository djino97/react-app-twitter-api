import React from 'react';
import {requestAllTweets} from './RequestsToTwitterAPP';

export default class HashtagInputPanel extends React.Component {

    constructor(props) {
        super(props)

        this.inputHashtag = '';
        this.resultValidation = false;

        this.onInputChanged = this.onInputChanged.bind(this);
        this.submitHashtag = this.submitHashtag.bind(this);
        this.validationHashtag = this.validationHashtag.bind(this);

        this.state = { 
            tweetsIds: [],
            currentCount: 0,
            descriptionOfValidationError: ''
        };
    }

    submitHashtag() {
        if(this.resultValidation) {
            this.props.searchTweets(requestAllTweets,this.inputHashtag)
            localStorage.removeItem(this.props.localStorageKey.removedTweets);
        }
    }

    onInputChanged(event) {
        this.resultValidation = this.validationHashtag(event);
    }

    validationHashtag(event){
        let validationError = '';
        let str = event.target.value;

        if(str === '') {
            validationError = 'hashtag must not be empty';
            this.setState({descriptionOfValidationError: validationError});

            return false;
        }
        else if(new RegExp(' ').test(str)) {
            validationError = 'hashtag has spaces';
            this.setState({descriptionOfValidationError: validationError});

            return false;
        }
        else {
            this.inputHashtag = str;

            return true;
        }
    }

    render() {
        return (
            <div>
                <h1 className='enter-hashtag'>
                        Enter your hashtag
                </h1>
                <p className='flex-components'>
                    <div className='hashtag'>#</div>
                    <input className='input-field' onChange={this.onInputChanged}/>
                    <button className='submit-button' onClick={this.submitHashtag}>
                        Search
                    </button>
                </p>
                <p className="error-validation-hashtag">
                    {this.state.descriptionOfValidationError}
                </p>
            </div>
        )
    }
}