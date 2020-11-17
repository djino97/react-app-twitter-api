import React from 'react';
import HashtagInputPanel from './HashtagInputPanel';
import TweetContent from './TweetContent';
import getResponseFromQuery, {requestTweetsByCount, requestAllTweets} from './RequestsToTwitterAPP';
import '../styles/styles.css';

export default class MainComponent extends React.Component {
    constructor(props) {
        super(props);

        this.tweetsContent = this.tweetsContent.bind(this);
        this.removeTweetContentComponent = this.removeTweetContentComponent.bind(this);
        this.searchTweets = this.searchTweets.bind(this);

        this.tweetsComponents = [];
        this.hashtag = '';

        this.localStorageKey = {
            tweetsIds: 'tweetsIds',
            removedTweets: 'removedTweets',
            hashtag: 'hashtag',
            currentCountTweets:'CurrentCountTweets'
        }

        this.state = {
            isSearchTweets: false,
            tweets: [],
            users: {},
            currentCount:0,
            scrollX: window.screenX,
            scrollY: window.screenY
        }
    }
    
    tweetsContent(tweets) {
        this.tweetsComponents = tweets.map((tweet, index) => {

            if(this.state.isSearchTweets) {

                let arr = JSON.parse(localStorage.getItem(this.localStorageKey.removedTweets));

                if(arr !== null && arr.includes(tweet.id_str))
                    return;
            }
           
            const style = tweets.pop().id_str === tweet.id_str ? 
            'tweet-block-border': 'tweet-block';

            return <TweetContent 
                        key={index} 
                        tweet={tweet} 
                        blockStyle={style}
                        user={this.state.users[tweet.user_id_str]} 
                        removeTweetContentComponent={this.removeTweetContentComponent}
                    />
        });

        return this.tweetsComponents
    }

    setNewTweets(newTweets, newUsers) {
        this.setState({tweets:newTweets, users: newUsers, isSearchTweets: true})
    }

    removeAllTweets() {
        this.setState({isSearchTweets: false, currentCount: 0});

        localStorage.removeItem(this.localStorageKey.tweetsIds);
        localStorage.removeItem(this.localStorageKey.hashtag);
        localStorage.removeItem(this.localStorageKey.currentCountTweets);
    }

    async searchTweets(Func = requestTweetsByCount,newHashtag = null) {
        let responseTweets = [];
        
        if(newHashtag === null) {
            this.hashtag = localStorage.getItem(this.localStorageKey.hashtag);
        }
        else {
            this.hashtag = newHashtag;
            localStorage.setItem(this.localStorageKey.hashtag, this.hashtag);
        }

        const responseData = await getResponseFromQuery(
                Func,this.hashtag, this.state.currentCount);
        const responseTweetsObj = await responseData.response;

        this.setState({currentCount: responseData.newCurrentCount});

        for(let tweet in responseTweetsObj.globalObjects.tweets) {
            responseTweets.push(responseTweetsObj.globalObjects.tweets[tweet]);
        }

        this.setNewTweets(responseTweets, responseTweetsObj.globalObjects.users);
        this.saveSearchTweets(responseTweets);

        localStorage.setItem(this.localStorageKey.currentCountTweets, parseInt(responseData.newCurrentCount));
    }

    saveSearchTweets(responseTweets) {
        const tweetsIds = responseTweets.map((tweet) => tweet['id_str']);

        localStorage.setItem(this.localStorageKey.tweetsIds, JSON.stringify(tweetsIds));
    }

    removeTweetContentComponent(tweetId) {
        let newRemovedTweets = [];
        let storyRemovedTweets = JSON.parse(localStorage.getItem(this.localStorageKey.removedTweets));

        if(storyRemovedTweets !== null && storyRemovedTweets.lenght !== 0) {
            newRemovedTweets = storyRemovedTweets;
            newRemovedTweets.push(tweetId)
        }
        else {
            newRemovedTweets.push(tweetId)
        }

        localStorage.setItem(this.localStorageKey.removedTweets, JSON.stringify(newRemovedTweets))
    }

    loadNextTweets() {
        this.searchTweets(requestAllTweets);
        console.log(window.event.clientX);
        console.log(event.clientX);
        window.scrollTo(0, 0);
    }

    componentWillMount() {
        for(let i=0; i<localStorage.length; i++) {

            if(localStorage.key(i) === this.localStorageKey.tweetsIds) {
                const localStorageHashtag = localStorage.getItem(this.localStorageKey.hashtag);

                this.hashtag =  localStorageHashtag;

                this.setState({
                    currentCount:parseInt(localStorage.getItem(this.localStorageKey.currentCountTweets))
                },() => this.searchTweets());
            }
        }
    }

    render() {
        return (
            <div>
                {
                    this.state.isSearchTweets ?
                    <React.Fragment>
                        <div>
                            <h1 className='header-tweets-content'>
                                Tweets by hashtag
                            </h1>
                            <h2 className='header-tweets-content'>
                                # {this.hashtag}
                            </h2>
                            <p class ='back-to-search-button'>
                                <button onClick={()=> this.removeAllTweets()}>
                                    Back to search🔎
                                </button>
                            </p>
                        </div>
                        <div className='tweet-blocks'>
                            {this.tweetsContent(this.state.tweets)}
                        </div>
                        <p class ='back-to-search-button'>
                            <button onClick={()=> this.loadNextTweets(requestAllTweets)}>
                                See more
                            </button>
                        </p>
                    </React.Fragment>
                    :
                    <HashtagInputPanel 
                        setTweets={
                            (newTweets, newUsers) => this.setNewTweets(newTweets, newUsers)
                        }
                        localStorageKey={this.localStorageKey}
                        searchTweets={(func, newHashtag) => this.searchTweets(func, newHashtag)}
                    />
                }
            </div>
        )
    }
}