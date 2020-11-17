import React from 'react';
import HashtagInputPanel from './HashtagInputPanel';
import TweetContent from './TweetContent';
import getResponseFromQuery, {requestTweetsByCount, requestAllTweets} from './RequestsToTwitterApi';
import '../styles/styles.css';

export default class MainComponent extends React.Component {
    constructor(props) {
        super(props);

        this.setNewTweets = this.setNewTweets.bind(this);
        this.loadNextTweets = this.loadNextTweets.bind(this);
        this.searchTweets = this.searchTweets.bind(this);
        this.setStateProxy = this.setStateProxy.bind(this);
        this.removeTweetContentComponent = this.removeTweetContentComponent.bind(this);

        this.tweetsComponents = [];
        this.hashtag = '';

        this.localStorageKeys = {
            tweetsIds: 'tweetsIds',
            removedTweets: 'removedTweets',
            hashtag: 'hashtag',
            currentCountTweets:'CurrentCountTweets',
            isUseProxy: 'isUseProxy',
            headerRequestTweet: 'headerRequestTweet'
        }

        this.state = {
            isSearchTweets: false,
            isUseProxy: false,
            tweets: [],
            users: {},
            currentCount: 0,
            scrollX: window.screenX,
            scrollY: window.screenY
        }
    }

    setStateProxy() {
        this.setState(initialState => ({
            isUseProxy: !initialState.isUseProxy
        }));
    }

    setNewTweets(newTweets, newUsers) {
        this.setState({tweets:newTweets, users: newUsers, isSearchTweets: true})
    }

    async searchTweets(func = requestTweetsByCount, newHashtag = null) {
        let responseTweets = [];
        
        if(newHashtag === null) {
            this.hashtag = localStorage.getItem(this.localStorageKeys.hashtag);
        }
        else {
            this.hashtag = newHashtag;
            localStorage.setItem(this.localStorageKeys.hashtag, this.hashtag);
        }

        const responseData = await getResponseFromQuery(
                func, this.hashtag, this.state.isUseProxy, this.state.currentCount);
        const responseTweetsObj = await responseData.response;

        this.setState({currentCount: responseData.newCurrentCount});

        for(let tweet in responseTweetsObj.globalObjects.tweets) {
            responseTweets.push(responseTweetsObj.globalObjects.tweets[tweet]);
        }

        let newTweets = [];
        if(Object.keys(this.state.tweets).length !== 0) {
            newTweets = responseTweets.filter((tweet) => {
                let isNotContain = true;
                
                for(let i =0; i < Object.keys(this.state.tweets).length; i++) {
                    if(tweet['id_str'] == this.state.tweets[i].id_str) {
                        isNotContain = false;
                    }
                }
                if(isNotContain) {
                    return true;
                }
                else{
                    return false;
                }

            });
            responseTweets = [].concat(this.state.tweets, newTweets);
        }

        this.setNewTweets(responseTweets, responseTweetsObj.globalObjects.users);
        this.saveSearchTweets(responseTweets);
        
        localStorage.setItem(this.localStorageKeys.currentCountTweets, parseInt(responseData.newCurrentCount));
    }

    saveSearchTweets() {
        if(localStorage.getItem(this.localStorageKeys.isUseProxy) === null) {
            localStorage.setItem(this.localStorageKeys.isUseProxy, JSON.stringify(this.state.isUseProxy));
        }
    }

    loadNextTweets() {
        this.searchTweets(requestAllTweets);
        window.scrollTo(window.event.clientX, window.event.clientY * this.state.currentCount / 3);
    }

    removeAllTweets() {
        this.setState({isSearchTweets: false, currentCount: 0, isUseProxy: false});

        for(let i=0; i<=localStorage.length; i++) {
            console.log(localStorage.key(i));
            if(localStorage.key(i) !== this.localStorageKeys.headerRequestTweet) {
                localStorage.removeItem(localStorage.key(i));
            }
        }
    }


    removeTweetContentComponent(tweetId) {
        let newRemovedTweets = [];
        let storyRemovedTweets = JSON.parse(localStorage.getItem(this.localStorageKeys.removedTweets));

        if(storyRemovedTweets !== null && storyRemovedTweets.lenght !== 0) {
            newRemovedTweets = storyRemovedTweets;
            newRemovedTweets.push(tweetId)
        }
        else {
            newRemovedTweets.push(tweetId)
        }

        localStorage.setItem(this.localStorageKeys.removedTweets, JSON.stringify(newRemovedTweets))
    }

    tweetsContent(tweets) {
        this.tweetsComponents = tweets.map((tweet, index) => {

            if(this.state.isSearchTweets) {

                let arr = JSON.parse(localStorage.getItem(this.localStorageKeys.removedTweets));

                if(arr !== null && arr.includes(tweet.id_str))
                    return;
            }
           
            const style = Object.keys(tweets).length - 1 === index ? 
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

    componentWillMount() {
        for(let i=0; i<localStorage.length; i++) {

            if(localStorage.key(i) === this.localStorageKeys.hashtag) {
                const localStorageHashtag = localStorage.getItem(this.localStorageKeys.hashtag);

                this.hashtag =  localStorageHashtag;

                const currentCount = parseInt(localStorage.getItem(this.localStorageKeys.currentCountTweets));
                const isUseProxy = JSON.parse(localStorage.getItem(this.localStorageKeys.isUseProxy));

                this.setState({
                    currentCount:currentCount,
                    isUseProxy: isUseProxy
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
                            <button onClick={this.loadNextTweets}>
                                See more
                            </button>
                        </p>
                    </React.Fragment>
                    :
                    <HashtagInputPanel 
                        setTweets={this.setNewTweets}
                        localStorageKeys={this.localStorageKeys}
                        searchTweets={this.searchTweets}
                        setStateProxy={this.setStateProxy}
                    />
                }
            </div>
        )
    }
}