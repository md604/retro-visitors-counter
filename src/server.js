import http from 'node:http';
import { getCounterImage } from './image.js';
import { parsedCookies, asyncCleanSessionStorage } from './utils.js';
import { Readable } from 'node:stream';
import uid from 'uid-safe';

// inmemory session storage
const activeSessions = new Map();
/*
for (let j = 0; j < 5000; j++) {
  const clientInfo = {
    sid: uid.sync(18),
    views: 1,
    visitors: 1,
    expTime: Date.now()
  };
  activeSessions.set(clientInfo.sid, clientInfo);
}
*/
setInterval(
  () => {
    // remove expired sessions once in 5 mins
    asyncCleanSessionStorage(250, activeSessions);
  }, 
  5 * 60 * 1000
);
// global values
const cookieMaxAgeSec = 3*60;
let totalVisitors = 0;

http
  .createServer(async (request, response) => {
    request.on('error', err => {
      console.error(err);
      response.statusCode = 400;
      response.end();
    });
    response.on('error', err => {
      console.error(err);
    });

    if (request.method === 'GET' && request.url === '/counter') {
      let clientInfo = {
        sid: null,
        views: 1,
        visitors: 1,
        expTime: Date.now() + cookieMaxAgeSec * 1000 + 1000
      };
      
      const clientCookies = parsedCookies(request);
      let userSession = null;

      if (clientCookies?.sid) {
        userSession = activeSessions.get(clientCookies.sid);
      }

      if (userSession) {
        clientInfo = { 
          ...userSession, 
          views: userSession.views + 1, 
          visitors: totalVisitors
        };
      } else {
        clientInfo.sid = uid.sync(18);
        clientInfo.visitors = ++totalVisitors;
      }

      console.log('Request cookie:', request.headers['cookie']); // clientCookies['sid']
      const imgData = await getCounterImage(clientInfo);
      const imgStream = Readable.from(imgData);
      response.statusCode = 200;
      response.setHeader('Content-Type', 'image/png');
      if (clientInfo.sid) {
        // update session storage + set client cookie
        activeSessions.set(clientInfo.sid, {...clientInfo});
        response.setHeader('Set-Cookie',[`sid=${clientInfo.sid};max-age=${cookieMaxAgeSec};HttpOnly`]);
      }
      imgStream.pipe(response);
    } else {
      response.statusCode = 404;
      response.end();
    }
  })
  .listen(8080);