import React from 'react';
import TweetContent from '../TweetContent';

describe('TweetContent Component', () => {

    describe('getImagesContent method tests', () => {
        const component = new TweetContent();

        const tweetsEntities = {
            media: [
                { media_url_https: 'https//images.com/firstImage' },
                { media_url_https: 'https//images.com/secondImage' }
            ]
        };

        it('Should return new tweets', () => {
            const expectedTweetFirst = <div className='tweet-image-div'>
                <img className='tweet-image' key={0} src='https//images.com/firstImage' />
            </div>

            const expectedTweetSecond = <div className='tweet-image-div'>
                <img className='tweet-image' key={1} src='https//images.com/secondImage' />
            </div>

            const expectedNewTweets = [expectedTweetFirst, expectedTweetSecond];

            const newTweets = component.getImagesContent(tweetsEntities);

            expect(newTweets).toEqual(expectedNewTweets);
        });

        it('Should return null', () => {

            tweetsEntities.media = undefined;

            const newTweets = component.getImagesContent(tweetsEntities);

            expect(newTweets).toEqual(null);
        });
    })

    describe('getImagesContent method tests', () => {
        const component = new TweetContent();

        const tweetsEntities = {
            media: [
                { media_url_https: 'https//images.com/firstImage' },
                { media_url_https: 'https//images.com/secondImage' }
            ]
        };

        it('Should return new tweets', () => {
            const expectedTweetFirst = <div className='tweet-image-div'>
                <img className='tweet-image' key={0} src='https//images.com/firstImage' />
            </div>

            const expectedTweetSecond = <div className='tweet-image-div'>
                <img className='tweet-image' key={1} src='https//images.com/secondImage' />
            </div>

            const expectedNewTweets = [expectedTweetFirst, expectedTweetSecond];

            const newTweets = component.getImagesContent(tweetsEntities);

            expect(newTweets).toEqual(expectedNewTweets);
        });

        it('Should return null', () => {

            tweetsEntities.media = undefined;

            const newTweets = component.getImagesContent(tweetsEntities);

            expect(newTweets).toEqual(null);
        });
    })
})