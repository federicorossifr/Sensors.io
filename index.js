const sl = require('./lib/source_loader.js');
const ab = require('./lib/abstract_sensor.js');
sl.get().then(data=> {
	var acq = ab.acquireFactory(data.ftpExample);
	acq.acquireAll().then(d => console.log(d));
})
