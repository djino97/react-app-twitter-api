import React from 'react';

export default class TweetContent extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            showTweetContent: true
        }

        this.removeTweet = this.removeTweet.bind(this);
    }

    imagesContent(entities) {
        if (entities['media'] !== undefined) {
            return entities.media.map((url, index) =>
                <div className='tweet-image-div'>
                    <img className='tweet-image' key={index} src={url.media_url_https}/>
                </div>
            );
        }
    }

    removeTweet() {
        this.setState({showTweetContent: false});
        this.props.removeTweetContentComponent(this.props.tweet.id_str);
    }

    render() {
        const imageProfile =  this.props.user === undefined ?
            null : this.props.user['profile_image_url_https'];
        const userName = this.props.user === undefined ?
            null : this.props.user['name'];

        return (
            <div className={this.state.showTweetContent ? this.props.blockStyle : 'tweet-block-hidden'}>
                <div className='user-logo-div'>
                    <img className='user-logo' src={imageProfile}/>
                </div>
                <div id ={"tweet"+ this.props.keyTweet} className="tweet-div-data">
                    <div className='tweet-user-data'>
                        <p>
                            <span className='user-name'>{userName}</span>
                            <span>{this.props.tweet.created_at.replace('+0000', '')}</span>
                            <button className='remove-button' onClick={()=> this.removeTweet()}>✖</button>
                        </p>
                    </div>
                    <div className='tweet-content-div'>
                        {this.props.tweet.text}
                        <div className='tweet-images-div'>
                            {this.imagesContent(this.props.tweet.entities)}
                        </div>
                        <p className='like'>
                            {this.props.tweet.favorite_count}
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}