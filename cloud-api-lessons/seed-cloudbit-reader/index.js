var koa = require('koa')
var koaParseJson = require('koa-parse-json')
var route = require('koa-route')
var fetch = require('node-fetch');



var port = Number(process.env.PORT) || 7800
var app = koa()



app.use(koaParseJson())



/* On a root GET respond with a friendly message explaining that this
application has no interesting client-side component. */

app.use(route.get('/', function *() {

  this.body = 'Hello, this is a trivial cloudBit Reader App. Nothing else to see here; all the action happens server-side.  To see any recent input activity from webhook-registered cloudBits do this on the command line: `heroku logs --tail`.'

}))



/* On a root POST log info about the (should be) cloudBit event. */

app.use(route.post('/', function *() {

  console.log('received POST: %j', this.request.body)

  if (this.request.body && this.request.body.type) {
    handleCloudbitEvent(this.request.body)
  }

  this.body = 'OK'

}))



app.listen(port)
console.log('App booted on port %d', port)



// Helpers

function handleCloudbitEvent(event) {
  switch (event.type) {
    case 'amplitude':
      // Do whatever you want with the amplitde
      console.log(event.payload)
      console.log('cloudBit input received: %d%', event.payload.percent)
      fetch('https://manufacturingfr.my.salesforce.com/services/data/v41.0/sobjects/LittleBits_Event__e/', { 
        method: 'POST',
        body:    JSON.stringify({"id__c":"123","Power__c":event.payload.percent,"Device_ID__c":"Lego City"}),
        headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer 00D1r000000rzxu!AR8AQE1u8zuyWwxYrGOGyffV94Kinqe._Ti6VIjdl1CB3bVZ.n_WpKf2DQz34E.0a.J5Bvz8koQioz2KFbzYIaB8REDhDXkn'},
      })
	      .then(res => res.json())
	      .then(json => console.log(json));
      break
    case 'connectionChange':
      // One day, cloudBits will emit this event too, but not yet.
      break
    default:
      console.warn('cloudBit sent an unexpected event: %j', event)
      break
  }
}
