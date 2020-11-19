import React from 'react';

/**
 * Component for forming the tweet block itself with internal tweet information
 */
export default class TweetContent extends React.PureComponent {

    constructor(props) {
        super(props)

        this.removeTweet = this.removeTweet.bind(this);
        
        this.state = {
            showTweetContent: true
        }
    }

    // Get image for each tweet
    getImagesContent(entities) {
        if (entities.media) {
            return entities.media.map((url, index) =>
                <div className='tweet-image-div'>
                    <img className='tweet-image' key={index} src={url.media_url_https}/>
                </div>
            );
        }
    }

    // Remove the selected tweet from the list
    removeTweet() {
        this.setState({showTweetContent: false});
        this.props.removeTweetContentComponent(this.props.tweet.id_str);
    }

    render() {
        const userName = this.props.user.name;
        const tweetsImages = this.getImagesContent(this.props.tweet.entities);
        const profileImage = this.props.user['profile_image_url_https'];

        const styleImagesTweet = !tweetsImages ?  {overoverflow:'hidden'} : {height: '480px'};

        return (
            <div className={this.state.showTweetContent ? this.props.blockStyle : 'tweet-block-hidden'}>
                <div className='user-logo-div'>
                    <img className='user-logo' src={profileImage}/>
                </div>
                <div id={'tweet' + this.props.keyTweet} className='tweet-div-data'>
                    <div className='tweet-user-data'>
                        <p>
                            <span className='user-name'>{userName}</span>
                            <span>{this.props.tweet.created_at.replace('+0000', '')}</span>
                            <button className='remove-button' onClick={this.removeTweet}>✖</button>
                        </p>
                    </div>
                    <div className='tweet-content-div'>
                        {this.props.tweet.text}
                    </div>
                    <div style={{textAlign:'-webkit-center'}}>
                        <div className='tweet-images-div' style={styleImagesTweet}>
                            {tweetsImages}
                        </div>
                    </div>
                    <p className='like'>
                            {this.props.tweet.favorite_count}
                    </p>
                </div>
            </div>
        )
    }
}