const express = require('express')
const path = require('path')
const ReviewsService = require('./reviews-service')

const reviewsRouter = express.Router()
const jsonBodyParser = express.json()
const { requireAuth } = require('../middleware/jwt-auth')

reviewsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    console.log("DDDDDDDDDDDDDDD")
    const { thing_id, rating, text } = req.body
    const newReview = { thing_id, rating, text }

    for (const [key, value] of Object.entries(newReview))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
      
    newReview.user_id = req.user.id;
    console.log(newReview.user_id, 'PPPPPPPPPPPPPPPPP')
    
    ReviewsService.insertReview(
      req.app.get('db'),
      newReview
    )
      .then(review => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${review.id}`))
          .json(ReviewsService.serializeReview(review))
      })
      .catch(next)
    })

module.exports = reviewsRouter
