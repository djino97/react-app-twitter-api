let _nextCursor;
let _newCountTweets;
let _headerRequestTweet = {};

const CountPackTweets = 20;
const ErrorCodes = [403, 429, 400];
const ProxyUrl = 'https://cors-anywhere.herokuapp.com/';
const PartOfUrl = window.location.href.split('/').slice(0, 3).join('/');

/**
 * Calls functions to form a header for the following requests and to receive data from Twitter.
 * Returns an object with search results for tweets by hashtag and the current number of tweets.
 * 
 * @param {(param1, param2:String, param3: Number) => Object}queryFunc
 * param1 -- requested object.
 * param2 -- used proxies, parameter can be empty ''.
 * param3 -- current tweet count.
 * function that returns the query result.
 * 
 * @param {any}requestItem -- requested object.
 * @param {Boolean}isUseProxy -- whether a proxy is being used for that request.
 * @param {Number}currentCountTweets -- current tweet count.
 * @param {Number}nextCursor -- cursor for load scroll content.
 * @returns {Object} -- response query and new  tweet count,
 * example:{response: {}, newCurrentCount: Number}.
 */
export default async function getResponseFromQuery(queryFunc, requestItem, isUseProxy, currentCountTweets=null, nextCursor=null) {
    let response;
    const proxy = isUseProxy ? ProxyUrl : '';

    _nextCursor = nextCursor;

    _headerRequestTweet = JSON.parse(localStorage.getItem('headerRequestTweet'));

    if(!_headerRequestTweet) {
        await getTokenData();
        response = await queryFunc(requestItem, proxy, currentCountTweets);
    }
    
    response = await queryFunc(requestItem, proxy, currentCountTweets);

    if(ErrorCodes.includes(response.status)) {
        await getTokenData();
        response = await queryFunc(requestItem, proxy, currentCountTweets);
    }

    return {response: await response.json(), newCurrentCount: _newCountTweets};
}

/**
 * Returns all tweets with a given number and a specific hashtag.
 * 
 * @param {String} hashtag 
 * @param {String} proxy 
 * @param {*} _  -- not used.
 * @returns {Object} - response object.
 */
export async function requestAllTweets(hashtag, proxy, _ = null) {
    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?count=${CountPackTweets}&include_entities=true&q=%23${hashtag}`;
    _newCountTweets = CountPackTweets;

    return fetch(url, {
        headers: _headerRequestTweet
    });
}

/** 
 * Returns a list of tweets that is a continuation of the old list of tweets.
 * Gets a new list for a specific list identifier "cursor" with a specific
 * "CountPackTweets" hashtag and number of tweets.
 * 
 * @param {String} hashtag 
 * @param {String} proxy
 * @param {Number} currentCountTweets -- current tweet count.
 * @returns {Object} - response object.
*/
export async function requestNextTweetsByCursor(hashtag, proxy, currentCountTweets) {
    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?cursor=${_nextCursor}&count=${CountPackTweets}&include_entities=true&q=%23${hashtag}`;

    _newCountTweets = CountPackTweets + currentCountTweets;
    return fetch(url, {
        headers: _headerRequestTweet
    });
}

/**
 * Returns a list of tweets and related other objects with a specified number
 * of tweets "countTweets" and hashtag.
 * 
 * @param {String} hashtag 
 * @param {String} proxy
 * @param {Number} countTweets -- the required number of tweets.
 * @returns {Object} - response object.
 */
export async function requestTweetsByCount(hashtag, proxy, countTweets) {
    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?count=${countTweets}&include_entities=true&q=%23${hashtag}`;

    _newCountTweets = countTweets;

    return fetch(url, {
        headers: _headerRequestTweet
    });
}

/**
 * Returns the received guest token and other additional parameters
 * for generating headers for other requests "_headerRequestTweet".
 */
async function getTokenData() {
    const url = `${PartOfUrl}/twitterToken`;

    let responseObj = null;

    while(!responseObj) {
        const response = await fetch(url);
        responseObj = await response.json();
    }

    _headerRequestTweet = {
        'Content-Type': 'application/json', 
        'authorization': responseObj['authorization'],
        'x-twitter-client-language': 'en-GB', 
        'x-csrf-token': responseObj['x-csrf-token'], 
        'x-guest-token': responseObj['x-guest-token']
    }

    localStorage.setItem('headerRequestTweet', JSON.stringify(_headerRequestTweet));
}