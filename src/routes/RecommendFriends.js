import React from 'react'
import { connect } from 'dva'
import RecommendFriendsComponent from '../components/RecommendFriends/RecommendFriends'

function RecommendFriends({ dispatch, friends, selectedFriends }) {

  function onFriendToggle(friend) {
    dispatch({
      type: 'recommendFriends/toggleFriend',
      payload: friend
    })
  }

  function onFriendsSkip() {
    dispatch({
      type: 'recommendFriends/skipFriends',
    })
  }

  function onFriendsSubmit() {
    dispatch({
      type: 'recommendFriends/addFriends'
    })
  }

  return (
      <RecommendFriendsComponent
        key={1}
        friends={friends}
        selectedFriends={selectedFriends}
        onFriendToggle={onFriendToggle}
        onFriendsSkip={onFriendsSkip}
        onFriendsSubmit={onFriendsSubmit}
      />
  )

}


function mapStateToProps(state) {
  const { friends, selectedFriends } = state.recommendFriends
  return { friends, selectedFriends }
}

export default connect(mapStateToProps)(RecommendFriends)
