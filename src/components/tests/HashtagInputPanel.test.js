import React from 'react';
import HashtagInputPanel from '../HashtagInputPanel';
import renderer from 'react-test-renderer';

describe('HashtagInputPanel Component', () => {

    describe('validationHashtag method tests', () => {
        const component = renderer.create(<HashtagInputPanel />).getInstance();
        let hashtagEntryEvent = {
            target: {
                value: ''
            }
        };

        it('Should validate hashtag successfully', () => {
            hashtagEntryEvent.target.value = 'photos';

            const isValid = component.validationHashtag(hashtagEntryEvent);

            expect(isValid).toBeTruthy();
            expect(component.state.descriptionOfValidationError).toEqual('');
        });

        it('Should validate hashtag fail when hashtag is empty', () => {
            hashtagEntryEvent.target.value = '';


            const isValid = component.validationHashtag(hashtagEntryEvent);

            expect(isValid).toBeFalsy();
            expect(component.state.descriptionOfValidationError).toEqual('hashtag must not be empty');
        });

        it('Should validate hashtag fail when hashtag has empty space', () => {
            hashtagEntryEvent.target.value = 'photos ';


            const isValid = component.validationHashtag(hashtagEntryEvent);

            expect(isValid).toBeFalsy();
            expect(component.state.descriptionOfValidationError).toEqual('hashtag has spaces');
        });
    })

    describe('submitHashtag method tests', () => {
        let component;
        let searchTweetsMock;

        beforeEach(() => {
            searchTweetsMock = jest.fn();
            component = renderer.create(<HashtagInputPanel
                searchTweets={searchTweetsMock} />
            ).getInstance();
        })

        it('Should call searchTweets method', () => {

            component.resultValidation = true;
            component.submitHashtag();

            expect(searchTweetsMock.mock.calls.length).toEqual(1);
        });

        it('Should not call searchTweets method', () => {

            component.resultValidation = false;
            component.submitHashtag();

            expect(searchTweetsMock.mock.calls.length).toEqual(0);
        });
    })

    describe('onInputChanged method tests', () => {
        const component = renderer.create(<HashtagInputPanel />).getInstance();

        let hashtagEntryEvent = {
            target: {
                value: ''
            }
        };

        it('Should resultValidation is false', () => {
            hashtagEntryEvent.target.value = '';

            component.onInputChanged(hashtagEntryEvent);

            expect(component.resultValidation).toBeFalsy();
        });

        it('Should resultValidation is true', () => {
            hashtagEntryEvent.target.value = 'photos';

            component.onInputChanged(hashtagEntryEvent);

            expect(component.resultValidation).toBeTruthy();
        });
    })
})
