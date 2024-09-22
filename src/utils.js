export function parsedCookies (request) {
  const list = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function(cookie) {
    const [name, content] = cookie.split('=');
    /*
    for (let i = 0; i < cookie.length; i++) {
      if (i > 0 && cookie[i] == '=') {
        name = cookie.slice(0, i);
        content = cookie.slice(i+1);
        break;
      }
    }
    */
    if (name && content) {
      list[name] = decodeURIComponent(content);
    }
  });

  return list;
}

export function asyncCleanSessionStorage(batchSize, storage) {
  const storageEntries = storage.entries();

  function cleanBatch() {
    // main cleaning logic
    let cleanNextBatch = true;
    for (let i = 0; i < batchSize; i++) {
      const value = storageEntries.next().value;
      if (value) {
        // check expiery time
        if (Date.now() > value[1].expTime) storage.delete(value[0]);
      } else {
        cleanNextBatch = false;
        break;
      }
    }
    // end of cleaning logic
    if (cleanNextBatch == false) {  
      console.log('Expired sessions were removed');
      return;
    }
    // Schedule next operation asynchronously.
    setImmediate(cleanBatch.bind(null));
  }

  cleanBatch();
}