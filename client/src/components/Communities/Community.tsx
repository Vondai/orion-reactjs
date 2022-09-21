import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AboutCommunity from './AboutCommunity';
import PostsListingFilterButtons from '../Posts/PostsListingFilterButtons';
import PostListing from '../Posts/PostListing';
import PageNotFound from '../PageNotFound';
import { useAuth } from '../../contexts/AuthContext';
import CreateModal from '../Posts/CreateModal';
import { NotificationContext } from '../Notifications/NotificationProvider';
import { fetchCommunity, joinCommunity } from '../../services/communityService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PostListingSkeleton from '../skeletons/PostListingSkeleton';
import { TCommunity } from '../../types/TCommunity';
import AuthModal from '../AuthModal';
type TJoinResponse = {
  message: string;
};
const Community = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { communityName } = useParams();
  const dispatch = useContext(NotificationContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [postError, setPostError] = useState('');
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();
  const token: string = currentUser.token;
  const joinCommunityMutation = useMutation(
    () => joinCommunity<TJoinResponse>(communityName!, token),
    {
      onSuccess: (data) => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'SUCCESS',
            message: data.message
          }
        });
        queryClient.invalidateQueries(['community']);
      },
      onError: (error: any) => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            type: 'ERROR',
            message: error.message
          }
        });
      }
    }
  );
  useEffect(() => {
    return () => {
      setIsAuthModalOpen(false);
    };
  }, [isAuthenticated, queryClient]);
  const {
    isLoading,
    isSuccess,
    isError,
    data: community
  } = useQuery(
    ['community', communityName, token],
    () => fetchCommunity<TCommunity>(communityName!, token),
    {
      retry: false,
      refetchOnWindowFocus: false
    }
  );

  // function handleCreatePostClick() {
  //   setPostError('');
  //   setIsOpen(true);
  // }

  // function createPostSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   const { title, content } = Object.fromEntries(
  //     new FormData(e.currentTarget)
  //   );
  //   console.log(title);

  //   // if (title.length < 5) {
  //   //   return setPostError('Title must be atleast five characters.');
  //   // }
  //   // if (content.length < 5) {
  //   //   return setPostError('Content must be atleast five characters.');
  //   // }
  //   setLoading(true);
  //   postService
  //     .create(title, content, communityName, token)
  //     .then((data) => {
  //       dispatch({
  //         type: 'ADD_NOTIFICATION',
  //         payload: {
  //           type: 'SUCCESS',
  //           message: 'Post successfully published.'
  //         }
  //       });
  //       navigate(`/community/${communityName}/comments/${data.message}`);
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //       dispatch({
  //         type: 'ADD_NOTIFICATION',
  //         payload: {
  //           type: 'ERROR',
  //           message: "Couldn't publish post."
  //         }
  //       });
  //     });
  // }

  const handleJoinBtnClick = async () => {
    if (!isAuthenticated) return setIsAuthModalOpen(true);
    await joinCommunityMutation.mutateAsync();
  };

  if (isError) {
    return <PageNotFound />;
  }

  return (
    <>
      <div className='flex justify-between gap-28 items-start'>
        <div className='w-3/4'>
          <div className='bg-base-200 py-5 mb-3 rounded-lg'>
            <PostsListingFilterButtons />
          </div>
          {isLoading && (
            <>
              <PostListingSkeleton />
              <PostListingSkeleton />
              <PostListingSkeleton />
              <PostListingSkeleton />
            </>
          )}
          {isSuccess &&
            community.posts.map((post) => (
              <PostListing
                key={post.id}
                post={post}
              />
            ))}
        </div>
        <div className='w-1/3 p-4 bg-base-200 rounded-lg'>
          {isSuccess && (
            <AboutCommunity
              community={community}
              handleJoinBtnClick={handleJoinBtnClick}
            />
          )}
        </div>
      </div>
      <AuthModal
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
      />
    </>
  );
};

export default Community;
