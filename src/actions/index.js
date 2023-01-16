import * as actionTypes from './types.js';

//Uer actions
export const setUser = user => {
    return {
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user
        }
    }
};

export const clearUser = () => {
    return {
      type: actionTypes.CLEAR_USER
    };
};

//Channel actions

export const setCurrentChannel = channel => {
    return {
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel: channel
        }
    }
}

export const setPrivateChannel = isPrivate => {
    return {
        type: actionTypes.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivateChannel: isPrivate
        }
    }
}

export const setUserPosts =  userPosts => {
    return {
        type: actionTypes.SET_USER_POSTS,
        payload: {
            userPosts: userPosts
        }
    }
}

//Color action

export const setColors = (primaryColor, secondaryColor) => {
    return {
        type: actionTypes.SET_COLORS,
        payload: {
            primaryColor,
            secondaryColor
        }
    }
}