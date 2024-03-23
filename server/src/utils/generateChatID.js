const crypto = require('crypto');

function generateChatId(senderId, receiverId) {
  // Sort the sender and receiver IDs
  const ids = [senderId, receiverId].sort();

  // Create a hash of the sorted IDs
  const hash = crypto.createHash('sha256');
  hash.update(ids.join('-'));

  return hash.digest('hex');
}

module.exports = generateChatId;