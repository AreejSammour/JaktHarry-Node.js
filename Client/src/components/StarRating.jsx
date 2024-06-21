import React, { useContext, useEffect, useState } from 'react'
import StarOutline from '../assets/img/star-outline.svg'
import StarIcon from '../assets/img/star.svg'
import HalfStarIcon from '../assets/img/star-half.svg'
import axios from 'axios'
import { Star } from 'lucide-react'
import { AuthContext } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

const defArr = Array(5)
	.fill(0)
	.map((e) => StarOutline)

const StarRating = ({ disabled, userId, post, initUserHasRated }) => {
	const navigate = useNavigate()
	const [postRatingArr, setPostRatingArr] = useState(defArr)
	const [disableRating, setDisableRating] = useState(disabled)
	const [message, setMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [userHasRated, setUserHasRated] = useState(false)
	const [hoverValue, setHoverValue] = useState(0)
	const { currentUser } = useContext(AuthContext)
	const [userRating, setUserRating] = useState(null)
	const [averageRating, setAverageRating] = useState(null)

	useEffect(() => {
    if (!post.postId || !currentUser?.id) return;
		(async () => {
			try {
				if(post.postId && currentUser.id){

          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/posts/getRating/${post.postId}`,
            { params: { userId: currentUser.id } }
          );

				  if (data) {
            setUserRating(data);
          } else {
            setUserRating(null);
            console.log("No rating found for the post.");
          }
				
				  const { data: ratingData } = await axios.get(
				  	`${process.env.REACT_APP_API_URL}/api/posts/getAverageRating/${post.postId}`
				  )

          if (ratingData) {
            setAverageRating(ratingData);
          } else {
            setAverageRating(null);
            console.log("No average rating found for the post.");
          }
        }
			} catch (err) {
        console.log("Error fetching ratings:", err);
        setMessage(err.message || 'Error fetching ratings');
        
    }
		})()
  }, [post, currentUser.id]);

	useEffect(() => {
		if (post?.averageRating) {
			setAverageRating({
				averageRating: post.averageRating || post.avg_rating,
				totalLength: post.totalLength,
				usersRated: post.usersRated,
			})
		}
	}, [post])

	const handleRating = (idx) => {
		if (disableRating || !userRating) return

		setAverageRating((prev) => ({
			...prev,
			averageRating: prev?.averageRating
				? (idx + prev?.averageRating) / (prev?.totalLength + 1)
				: idx,
		}))
		setDisableRating(true)
		submitRating(idx)
	}

	const submitRating = async (rating) => {
		try {
			if (!currentUser?.id) {
				return navigate('/login')
			}
			const data = {
				postId: post.postId,
				rating,
				userId: currentUser.id,
			}
			setIsLoading(true)

			await axios.put(
				`${process.env.REACT_APP_API_URL}/api/posts/rate/${data.postId}`,
				data
			)

			setMessage('rating submitted successfully')
      console.log(message)
			setIsLoading(false)

			setIsLoading(rating)

			setTimeout(() => {
				setMessage('')
			}, 3000)
		} catch (err) {
			setMessage(err.message || 'Error submitting rating')
			setIsLoading(false)
		}
	}

	useEffect(() => {
		setDisableRating(disabled || isLoading || userHasRated)

		if (post.avg_rating) {
			const avgRating = Math.floor(post.avg_rating)

			const newStars = Array(avgRating)
				.fill(0)
				.map((e) => StarIcon)

			if (post.avg_rating < 5 && post.avg_rating % 2 !== 0) {
				newStars.push(HalfStarIcon)
			}

			const fullStarlen = newStars.length

			const allStars = [
				...newStars,
				...Array(5 - fullStarlen)
					.fill(0)
					.map((e) => StarOutline),
			]

			setPostRatingArr(allStars)
		}
	}, [disabled, isLoading, post, userHasRated])


	useEffect(() => {
		if (post?.postId && userId && initUserHasRated) {
			const fetchData = async () => {
				try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/posts/getRating/${post.postId}`,
            { params: { userId } }
          );

					const { status } = res.data

					setUserHasRated(status)
				} catch (err) {
					setMessage('Error processing rating')
				}
			}
			fetchData()
		}
	}, [post.postId, userId, initUserHasRated])

	return (
		<div className='star-rating' style={{ marginBottom:10 }}>
			{postRatingArr.map((star, idx) => {
				return (
          <div key={`star-${idx}`}>
					<Star
						onMouseOver={() => setHoverValue(idx + 1)}
						// onClick={() => handleRating(idx + 1)}
						onClick={(e) => {
							e.stopPropagation()
							e.preventDefault()
							handleRating(idx + 1)
						}}
						key={idx}
						style={{
							cursor: 'pointer',
							color: '#FDCC0D', //value <= rating
						}}
						fill={
							averageRating && idx < averageRating?.averageRating
								? '#FDCC0D'
								: hoverValue <= idx
								? 'none'
								: '#FDCC0D'
						}
						strokeWidth={2}
						onMouseLeave={() => setHoverValue(0)}
					/>
          </div>
				)
			})}
		</div>
	)
}

export default StarRating