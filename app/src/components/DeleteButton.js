import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { Button, Confirm, Icon } from 'semantic-ui-react'

import { FETCH_POSTS_QUERY } from '../util/graphql'
import Popups from '../util/Popups'

function DeleteButton({ postId, commentId, callback }){
    const[confirmOpen, setConfirmOpen] = useState(false);

    const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;

    const [deletePostOrMutation] = useMutation(mutation, {
        update(proxy, res) {
            setConfirmOpen(false);
            const data = proxy.readQuery({
              query: FETCH_POSTS_QUERY,
            });
            res = data.getPosts.filter((p) => p.id !== postId);
            proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: { getPosts: res } });
            if (callback) callback();
          },
        variables: {
            postId,
            commentId
        }
    });

return(
    <>
    <Popups
        content={commentId ? 'Delete comment' : 'Delete post'}>
        <Button
            as="div"
            color="red"
            floated="right"
            onClick={() => setConfirmOpen(true)}>
                <Icon name="trash" style={{ margin: 0 }} />
        </Button>        
    </Popups>
    <Confirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deletePostOrMutation}
    />
    </>
);
}

const DELETE_POST_MUTATION = gql`
    mutation deletePost($postId: ID!){
        deletePost(postId: $postId)
    }
`;

const DELETE_COMMENT_MUTATION = gql`
    mutation deleteComment($postId: ID!, $commentId: ID!){
        deleteComment(postId: $postId, commentId: $commentId){
            id
            comments{
                id
                username
                createdAt
                body
            }
            commentCount
        }
    }
`;

export default DeleteButton;