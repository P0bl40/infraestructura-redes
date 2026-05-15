const blacklist = new Set([]);

function isInBlacklist(ip){
	return blacklist.has(ip);
}

module.exports = { isInBlacklist  }
