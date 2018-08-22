import composeWaterfall from 'lib/compose/waterfall'
import { errorHandler } from 'lib/error'
import paginate from 'lib/compose/paginate'
import knex from '_models'

import { fmtRawResponse } from '@question/controllers/util'

function checkQuery (req, res, callback) {
  const data = { user: {} }
  let { limit = 10, page = 1 } = req.query
  if (isNaN(limit) || isNaN(page)) {
    limit = 10
    page = 1
  }
  data.query = { limit: Number(limit), page: Number(page) }
  data.user.id = req.params.user_id

  return callback(null, data, res)
}

function findUser (data, res, callback) {
  const error = { message: 'User not found', code: 404 }
  return knex('user')
    .where({ id: data.user.id })
    .select('id')
    .then(result => {
      return result.length === 0
        ? callback(error)
        : callback(null, data, res)
    })
    .catch(() => callback(error))
}

function fetchTimeLine (data, res, callback) {
  return knex('user')
    .leftJoin('user_follow as following', 'following.follower_id', 'user.id')
    .leftJoin('question', function () {
      this.on('question.candidate_id', '=', 'following.following_id')
        .orOn('question.candidate_id', '=', 'user.id')
    })
    .leftJoin('answer', 'answer.question_id', 'question.id')
    .leftJoin('comment', 'comment.question_id', 'question.id')
    .leftJoin('question_like', 'question_like.question_id', 'question.id')
    .leftJoin('user as cm', 'cm.id', 'comment.user_id')
    .leftJoin('user as candidate', 'candidate.id', 'question.candidate_id')
    .leftJoin('user as lu', 'lu.id', 'question_like.user_id')
    .leftJoin('user as asker', 'asker.id', 'question.asker_id')
    .select([
      'question.*',
      'answer.answer',
      'answer.id as answer_id',
      'comment.id as comment_id',
      'comment.comment',
      'comment.user_id as comment_user_id',
      'question_like.id as like_id',
      'question_like.user_id as like_user_id',
      'cm.id as comment_user_id',
      'cm.firstName as comment_user_firstName',
      'cm.lastName as comment_user_lastName',
      'cm.avatar as comment_user_avatar',
      'candidate.id as candidate_user_id',
      'candidate.firstName as candidate_user_firstName',
      'candidate.lastName as candidate_user_lastName',
      'candidate.avatar as candidate_user_avatar',
      'lu.id as like_user_id',
      'lu.firstName as like_user_firstName',
      'lu.lastName as like_user_lastName',
      'lu.avatar as like_user_avatar',
      'asker.id as asker_user_id',
      'asker.firstName as asker_user_firstName',
      'asker.lastName as asker_user_lastName',
      'asker.avatar as asker_user_avatar'
    ])
    .where({ 'user.id': data.user.id })
    .orderBy('question.created_at', 'desc')
    .options({ nestTables: true })
    .then(result => {
      data.timeline = fmtRawResponse(result)
      return callback(null, data, res)
    })
    .catch(e => errorHandler(e, res))
}

function fmtResult (data, res, callback) {
  const result = paginate(data.timeline, data.query.page, data.query.limit)
  return callback(null, { timeline: result.data }, result.metadata)
}

export default function (...args) {
  return composeWaterfall(args, [
    checkQuery,
    findUser,
    fetchTimeLine,
    fmtResult
  ])
}
