let _headerRequestTweet = {}
let _currentCount

export default async function getResponseFromQuery(queryFunc, requestItem, currentCount=null) {
    let response;

    _currentCount = currentCount;
    _headerRequestTweet = JSON.parse(localStorage.getItem('headerRequestTweet'));

    if(_headerRequestTweet === null) {
        await getTokenData();
        response = await queryFunc(requestItem, currentCount);
    }
    
    response = await queryFunc(requestItem, currentCount);

    if(response.status === 403 || response.status === 429) {
        await getTokenData();
        response = await queryFunc(requestItem, currentCount);
    }

    return  {response: await response.json(), newCurrentCount: _currentCount};
}


export async function requestAllTweets(hashtag, _ = null) {
    const count = 20;
    const newCount = count + _currentCount;

    const url = `https://api.twitter.com/2/search/adaptive.json` +
        `?cursor=${_currentCount}&count=${newCount}&include_entities=true&q=%23${hashtag}`;

    const response = await fetch(url, {
        headers: _headerRequestTweet
    });

    _currentCount = newCount;
    
    return response;
}

export async function requestTweetsByCount(hashtag, countTweets) {
    const url = `https://api.twitter.com/2/search/adaptive.json` +
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