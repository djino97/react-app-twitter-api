let _headerRequestTweet = {};
let _currentCount;
let newCountTweets;
const countPackTweets = 20;
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';


export default async function getResponseFromQuery(queryFunc, requestItem, isUseProxy, currentCount=null) {
    let response;

    _currentCount = currentCount;
    const proxy = isUseProxy ? proxyUrl : '';
    newCountTweets = countPackTweets + _currentCount;

    _headerRequestTweet = JSON.parse(localStorage.getItem('headerRequestTweet'));

    if(_headerRequestTweet === null) {
        await getTokenData();
        response = await queryFunc(requestItem, proxy, currentCount);
    }
    
    response = await queryFunc(requestItem, proxy, currentCount);

    const status = response.status;

    if(status === 403 || status === 429 || status === 400) {
        await getTokenData();
        response = await queryFunc(requestItem, proxy, currentCount);
    }

    return  {response: await response.json(), newCurrentCount: _currentCount};
}


export async function requestAllTweets(hashtag, proxy, _ = null) {
    console.log(newCountTweets);

    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?cursor=${_currentCount}&count=${newCountTweets}&include_entities=true&q=%23${hashtag}`;

    const response = await fetch(url, {
        headers: _headerRequestTweet,
        mode: 'cors'
    });
    console.log(url);
    _currentCount = newCountTweets;

    console.log(_currentCount);
    
    return response;
}

export async function requestTweetsByCount(hashtag, proxy, countTweets) {
    const url = `${proxy}https://api.twitter.com/2/search/adaptive.json` +
        `?count=${countTweets}&include_entities=true&q=%23${hashtag}`;

    const response = await fetch(url, {
        headers: _headerRequestTweet
    });
    
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