import React from 'react';
import '../styles/styles.css';
import TweetContent from './TweetContent';
import getResponseFromQuery, {
    requestTweetsByCount, requestNextTweetsByCursor
} from '../requests/RequestsToTwitterApi';
import HashtagInputPanel from './HashtagInputPanel';

/**
 * The main component switches between two state -- using the input interface,
 * hashtag search and output to the page of all found tweets.
 * 
 * If the hashtag has not been entered on the page, an input field appears with a button
 * otherwise, all found tweets for this hashtag are displayed.
 */
export default class MainComponent extends React.Component {
    constructor(props) {
        super(props);

        this.setNewTweets = this.setNewTweets.bind(this);
        this.searchTweets = this.searchTweets.bind(this);
        this.setStateProxy = this.setStateProxy.bind(this);
        this.loadNextTweets = this.loadNextTweets.bind(this);
        this.removeAllTweets = this.removeAllTweets.bind(this);
        this.getTweetsPageElements =this.getTweetsPageElements.bind(this);
        this.getInputPanelPageElement = this.getInputPanelPageElement.bind(this);
        this.removeTweetContentComponent = this.removeTweetContentComponent.bind(this);

        this.tweetsComponents = [];
        this.hashtag = '';

        this.localStorageKeys = {
            tweetsIds: 'tweetsIds',
            removedTweets: 'removedTweets',
            hashtag: 'hashtag',
            currentCountTweets: 'CurrentCountTweets',
            isUseProxy: 'isUseProxy',
            headerRequestTweet: 'headerRequestTweet',
        };

        this.state = {
            isSearchTweets: false,
            isUseProxy: false,
            tweets: [],
            users: {},
            currentCount: 0,
            scrollX: window.screenX,
            scrollY: window.screenY,
            nextCursorRequest: ''
        };
    }

    setStateProxy() {
        this.setState(initialState => ({
            isUseProxy: !initialState.isUseProxy
        }));
    }

    setNewTweets(newTweets, newUsers, cursorResponse) {
        this.setState({
            tweets: newTweets,
            users: newUsers,
            isSearchTweets: true,
            nextCursorRequest: cursorResponse
        });
    }

    /**
     * Search for tweets is set by three functions that are set in the parameter "func"
     * identified in module "RequestsToTwitterApi": requestTweetsByCount, requestAllTweets, and requestNextTweetsByCursor.
     * The method calls functions to search for tweets and calls methods to process input responses with tweets.
     * 
     * @param {(param1, param2:String, param3: Number) => object} func
     * param1 -- requested object.
     * param2 -- used proxies, parameter can be empty ''.
     * param3 -- current tweet count.
     * function that returns the query result.
     * 
     * @param {String} newHashtag -- requeste twets by specifi hasgtag.
     */
    async searchTweets(func = requestTweetsByCount, newHashtag = null) {
        let responseTweets = [];

        this.CheckHashtag(newHashtag);

        const responseData = await getResponseFromQuery(
            func, this.hashtag, this.state.isUseProxy,
            this.state.currentCount, this.state.nextCursorRequest);

        const responseTweetsObj = await responseData.response;

        const cursor = this.getCursorFromResponse(responseTweetsObj);

        for (let tweet in responseTweetsObj.globalObjects.tweets) {
            responseTweets.push(responseTweetsObj.globalObjects.tweets[tweet]);
        }

        let responseUsers = responseTweetsObj.globalObjects.users;

        if (Object.keys(this.state.tweets).length) {
            const newTweets = this.filterTweets(responseTweets);

            responseUsers = Object.assign(this.state.users, responseUsers);
            responseTweets = [...this.state.tweets, ...newTweets];
        }

        this.setState({ currentCount: responseTweets.length });
        this.setNewTweets(responseTweets, responseUsers, cursor);
        this.saveStatePage(responseData);
    }

    CheckHashtag(newHashtag) {
        if (!newHashtag) {
            this.hashtag = localStorage.getItem(this.localStorageKeys.hashtag);
        }
        else {
            this.hashtag = newHashtag;
            localStorage.setItem(this.localStorageKeys.hashtag, this.hashtag);
        }
    }

    getCursorFromResponse(responseTweetsObj) {
        const instructionFirst = responseTweetsObj.timeline.instructions[0];
        const instructionSecond = responseTweetsObj.timeline.instructions[2];
        let cursor = '';

        if (!this.state.nextCursorRequest || !instructionSecond) {
            cursor = instructionFirst.addEntries.entries[instructionFirst.addEntries.entries.length - 1].
                content.operation.cursor.value;
        }
        else {
            cursor = instructionSecond.replaceEntry.entry.content.operation.cursor.value;
        }

        return cursor
    }

    filterTweets(responseTweets) {
        const newTweets = responseTweets.filter((tweet) => {
            let isNotContain = true;

            for (let i = 0; i < Object.keys(this.state.tweets).length; i++) {
                if (tweet.id_str == this.state.tweets[i].id_str) {
                    isNotContain = false;
                }
            }

            if (isNotContain) {
                return true;
            }

            return false;
        });

        return newTweets;
    }

    saveStatePage(responseData) {
        localStorage.setItem(this.localStorageKeys.currentCountTweets, parseInt(responseData.newCurrentCount));

        if (!localStorage.getItem(this.localStorageKeys.isUseProxy)) {
            localStorage.setItem(this.localStorageKeys.isUseProxy, JSON.stringify(this.state.isUseProxy));
        }
    }

    // Calling a method that implements pagination on a tweet page.
    // Implementing scrolling on the page with fixation on the last tweet before calling the paginated method.
    loadNextTweets() {
        const [body] = document.getElementsByTagName('body');
        const scrollTopElement = body.scrollTop;

        this.searchTweets(requestNextTweetsByCursor);

        body.scrollTop = scrollTopElement - scrollTopElement / this.state.currentCount / 3.2;
    }

    // Remove all tweets from the page and go to the hashtag input state.
    removeAllTweets() {
        this.setState({
            isSearchTweets: false,
            currentCount: 0,
            isUseProxy: false,
            nextCursorRequest: '',
            tweets: [],
            users: {}
        });

        for (let i = localStorage.length - 1; i >= 0; i--) {
            if (localStorage.key(i) != this.localStorageKeys.headerRequestTweet) {
                localStorage.removeItem(localStorage.key(i));
            }
        }
    }

    // Remove a tweet from the list of tweets.
    removeTweetContentComponent(tweetId) {
        const storyRemovedTweets = JSON.parse(localStorage.getItem(this.localStorageKeys.removedTweets));
        const newRemovedTweets = storyRemovedTweets || [];

        newRemovedTweets.push(tweetId)
        localStorage.setItem(this.localStorageKeys.removedTweets, JSON.stringify(newRemovedTweets))
    }

    // Сreating a list of tweets from individual tweet blocks.
    getTweetsContent(tweets) {
        this.tweetsComponents = tweets.map((tweet, index) => {
            if (this.state.isSearchTweets) {

                const arr = JSON.parse(localStorage.getItem(this.localStorageKeys.removedTweets));

                if (arr && arr.includes(tweet.id_str)) {
                    return;
                }
            }

            const style = Object.keys(tweets).length - 1 === index ? 'tweet-block-border' : 'tweet-block';

            return (
                <TweetContent
                    keyTweet={index}
                    tweet={tweet}
                    blockStyle={style}
                    user={this.state.users[tweet.user_id_str]}
                    removeTweetContentComponent={this.removeTweetContentComponent}
                />
            )
        });

        return this.tweetsComponents
    }

    // Checking local storage for saved tweet data and restoring page state.
    componentWillMount() {
        for (let i = 0; i < localStorage.length; i++) {

            if (localStorage.key(i) === this.localStorageKeys.hashtag) {
                this.hashtag = localStorage.getItem(this.localStorageKeys.hashtag);

                const currentCount = parseInt(localStorage.getItem(this.localStorageKeys.currentCountTweets));
                const isUseProxy = JSON.parse(localStorage.getItem(this.localStorageKeys.isUseProxy));

                this.setState({
                    currentCount: currentCount,
                    isUseProxy: isUseProxy,
                    isSearchTweets: true
                }, () => this.searchTweets());
            }
        }
    }

    render() {
        return (
            <div>
                {this.state.isSearchTweets ?
                    this.getTweetsPageElements() : this.getInputPanelPageElement()
                }
            </div>
        )
    }

    getTweetsPageElements() {
        return (
            <React.Fragment>
                <div>
                    <h1 className='header-tweets-content'>
                        Tweets by hashtag
                            </h1>
                    <h2 className='header-tweets-content'>
                        # {this.hashtag}
                    </h2>
                    <p class='back-to-search-button'>
                        <button onClick={this.removeAllTweets}>
                            Back to search🔎
                        </button>
                    </p>
                </div>
                <div className='tweet-blocks'>
                    {this.getTweetsContent(this.state.tweets)}
                </div>
                <p class='back-to-search-button'>
                    <button onClick={this.loadNextTweets}>
                        See more
                    </button>
                </p>
            </React.Fragment>
        )
    }

    getInputPanelPageElement() {
        return (
            <HashtagInputPanel
                setTweets={this.setNewTweets}
                localStorageKeys={this.localStorageKeys}
                searchTweets={this.searchTweets}
                setStateProxy={this.setStateProxy}
            />
        )
    }
}