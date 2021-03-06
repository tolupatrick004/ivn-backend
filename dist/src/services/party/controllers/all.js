'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _waterfall2.default)(args, [checkQuery, fetchParties, fmtResult]);
};

var _waterfall = require('../../../../lib/compose/waterfall');

var _waterfall2 = _interopRequireDefault(_waterfall);

var _error = require('../../../../lib/error');

var _models = require('../../../models');

var _models2 = _interopRequireDefault(_models);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Check query object
function checkQuery(req, res, callback) {
  return callback(null, req.query, res);
}

function fetchParties(data, res, callback) {
  // TODO: ADD only admin action
  return (0, _models2.default)('party').leftJoin('party_follow', 'party_follow.party_id', 'party.id').leftJoin('party_member', 'party_member.party_id', 'party.id').select(['party.*', 'party_follow.id as follower', 'party_member.id as member']).then(function (res) {
    data.parties = (0, _util.formatParties)(res);
    return callback(null, data, res);
  }).catch(function (error) {
    return (0, _error.errorHandler)(error, res);
  });
}

function fmtResult(data, res, callback) {
  var parties = data.parties.map(function (party) {
    return party;
  });
  return callback(null, { parties: parties });
}