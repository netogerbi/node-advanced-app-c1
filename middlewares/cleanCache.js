const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) =>{
    await next(); // with this little tricky we well clear the cache after execution of endpoint.

    clearHash(req.user.id);
}