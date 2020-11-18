let _headerRequestTweet = {};
let _newCountTweets;
let _nextCursor;

const CountPackTweets = 20;
const ProxyUrl = 'https://cors-anywhere.herokuapp.com/';

export default async function getResponseFromQuery(queryFunc, requestItem, isUseProxy, currentCountTweets=null, nextCursor=null) {
    let response;
    const proxy = isUseProxy ? ProxyUrl : '';

    _nextCursor = nextCursor;

    _headerRequestTweet = JSON.parse(localStorage.getItem('headerRequestTweet'));

    if(_headerRequestTweet === null) {
        await getTokenData();
        response = await queryFunc(requestItem, proxy, currentCountTweets);
    }
    
    response = await queryFunc(requestItem, proxy, currentCountTweets);

    const status = response.status;

    if(status === 403 || status === 429 || status === 400) {
        await getTokenData();
        response = await queryFunc(requestItem, proxy, currentCountTweets);
    }

    return  {response: await response.json(), newCurrentCount: _newCountTweets};
}


export async function requestAllTweets(hashtag, proxy, _ = null) {
    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?count=${CountPackTweets}&include_entities=true&q=%23${hashtag}`;

    const response = await fetch(url, {
        headers: _headerRequestTweet
    });

    _newCountTweets = CountPackTweets;
    
    return response;
}

export async function requestNextTweetsByCursor(hashtag, proxy, currentCountTweets) {
    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?cursor=${_nextCursor}&count=${CountPackTweets}&include_entities=true&q=%23${hashtag}`;

    const response = await fetch(url, {
        headers: _headerRequestTweet
    });

    _newCountTweets = CountPackTweets + currentCountTweets;
    
    return response;
}

export async function requestTweetsByCount(hashtag, proxy, countTweets) {
    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?count=${countTweets}&include_entities=true&q=%23${hashtag}`;

    const response = await fetch(url, {
        headers: _headerRequestTweet
    });

    _newCountTweets = countTweets;
    
    return response;
}

async function getTokenData() {
    const partOfUrl = window.location.href.split('/').slice(0, 3).join('/');
    const url = `${partOfUrl}/twitterToken`;

    let responseObj = null;

    while(responseObj === null) {
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