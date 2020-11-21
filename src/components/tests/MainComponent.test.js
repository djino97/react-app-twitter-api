import React from 'react';
import MainComponent from '../MainComponent';
import { getResponseFromQuery } from '../../requests/RequestsToTwitterApi';
import renderer from 'react-test-renderer';

jest.mock('../../requests/RequestsToTwitterApi');
jest.mock('../TweetContent', () => 'TweetContent');

describe('MainComponent Component', () => {

    const tweetsResponse = {
        1326581362829221890: {
            id_str: '1326581362829221890',
            user_id_str: '1326581'
        },
        326591272581206019: {
            id_str: '13265923472581206019',
            user_id_str: '13265912'
        },
        1326658780248104962: {
            id_str: '1326591272581206019',
            user_id_str: '13265912'
        }
    };

    const usersResponse = {
        1326581: {
            id_str: '1326581'

        },
        3265912: {
            id_str: '13265912'
        },
        13266587: {
            id_str: '13265912'
        }
    };

    const cursorValueFirst = 'scroll sDVvDsDVsdvdvvSVDVdVc';
    const cursorValueSecond = 'scroll dscscsdcdsvbbfdbfd';

    const entry = {
        entry: {
            content: {
                operation: {
                    cursor: {
                        value: cursorValueSecond
                    }
                }
            }
        }
    };


    const timeline = {
        instructions: [
            {
                addEntries: {
                    entries: [
                        {
                            content: {
                                operation: {
                                    cursor: {
                                        value: cursorValueFirst
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            {},
            {
                replaceEntry: ''
            }
        ]
    };

    let responseTweetsObj = {
        globalObjects: {
            tweets: tweetsResponse,
            users: usersResponse
        },
        timeline: timeline
    };

    describe('searchTweets method tests', () => {
        const component = renderer.create(<MainComponent />).getInstance();
        const hashtag = 'photos';

        const expectedTweetsArray = [
            {
                id_str: '1326581362829221890',
                user_id_str: '1326581'
            },
            {
                id_str: '13265923472581206019',
                user_id_str: '13265912'
            },
            {
                id_str: '1326591272581206019',
                user_id_str: '13265912'
            }
        ];

        it('Should search all tweets by specific hashtag', async () => {

            const responseData = {
                response: responseTweetsObj,
                newCurrentCount: 20
            }

            getResponseFromQuery.mockResolvedValue(responseData)

            await component.searchTweets(() => responseData, hashtag);

            expect(component.state.tweets).toEqual(expectedTweetsArray);
            expect(component.state.users).toEqual(usersResponse);
            expect(component.state.currentCount).toEqual(3);
            expect(component.state.nextCursorRequest).toEqual(cursorValueFirst);
        }); 

        it('Should search next tweets by specific hashtag', async () => {

            const nextTweets = {
                1326658780342104962: {
                    id_str: '132659123258120659',
                    user_id_str: '13265912'
                },
                1326652424248104962: {
                    id_str: '1326591272325206019',
                    user_id_str: '13265912'
                }
            };

            const nextTweetsArray = [
                {
                    id_str: '132659123258120659',
                    user_id_str: '13265912'
                },
                {
                    id_str: '1326591272325206019',
                    user_id_str: '13265912'
                }
            ];

            const nextUsers = {
                1326581: {
                    id_str: '1326581'
        
                },
                3265912: {
                    id_str: '13265912'
                },
                13266587: {
                    id_str: '13265912'
                },
                13232381: {
                    id_str: '1326581'
        
                },
                33235912: {
                    id_str: '13265912'
                },
                13455587: {
                    id_str: '13265912'
                }
            }

            const expectedNextTweets = [...expectedTweetsArray, ...nextTweetsArray];

            responseTweetsObj.globalObjects.tweets = nextTweets;
            responseTweetsObj.globalObjects.users = nextUsers;

            const responseData = {
                response: responseTweetsObj,
                newCurrentCount: 20
            }

            getResponseFromQuery.mockResolvedValue(responseData)

            await component.searchTweets(() => responseData, hashtag);

            expect(component.state.tweets).toEqual(expectedNextTweets);
            expect(component.state.users).toEqual(usersResponse);
        });
    });

    describe('checkHashtag method tests', () => {
        const component = renderer.create(<MainComponent />).getInstance();

        const hashtag = 'photos';

        beforeEach(() => {
            localStorage.clear();
        });

        it('Should get hashtag from localStorage', () => {

            localStorage.setItem('hashtag', hashtag);

            component.checkHashtag(hashtag);

            expect(component.hashtag).toEqual(hashtag);
        });

        it('Should set hashtag to localStorage', () => {

            component.checkHashtag(hashtag);

            expect(localStorage.getItem('hashtag')).toEqual(hashtag);
        });
    })

    describe('getCursorFromResponse method tests', () => {
        const component = renderer.create(<MainComponent />).getInstance();
        timeline.instructions[2].replaceEntry = entry;
        responseTweetsObj.timeline = timeline;

        it('Should get cursor from first request', () => {

            const cursor = component.getCursorFromResponse(responseTweetsObj);

            expect(cursor).toEqual(cursorValueFirst);

        });

        it('Should get default cursor from next requests', () => {
            component.state.nextCursorRequest = 'scroll';

            const cursor = component.getCursorFromResponse(responseTweetsObj);

            expect(cursor).toEqual(cursorValueSecond);
        });
    })
})