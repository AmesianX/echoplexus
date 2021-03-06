exports.DrawingServer = function (sio, redisC, EventBus, Channels, ChannelModel) {
	
	var DRAWSPACE = "/draw",
		config = require('./config.js').Configuration,
		Client = require('../client/client.js').ClientModel,
		Clients = require('../client/client.js').ClientsCollection,
		_ = require('underscore');

	var DEBUG = config.DEBUG;

	var DrawServer = require('./AbstractServer.js').AbstractServer(sio, redisC, EventBus, Channels, ChannelModel);

	DrawServer.initialize({
		name: "DrawServer",
		SERVER_NAMESPACE: DRAWSPACE,
		events: {
			"draw:line": function (namespace, socket, channel, client, data) {
				var room = channel.get("name");

				channel.replay.push(data);

				socket.in(room).broadcast.emit('draw:line:' + room, _.extend(data,{
					id: client.get("id")
				}));
			},
			"trash": function (namespace, socket, channel, client, data) {
				var room = channel.get("name");

				channel.replay = [];
				socket.in(room).broadcast.emit('trash:' + room, data);
			}
		}
	});

	DrawServer.start({
		error: function (err, socket, channel, client) {
			if (err) {
				DEBUG && console.log("DrawServer: ", err);
				return;
			}
		},
		success: function (namespace, socket, channel, client) {
			var room = channel.get("name");
		
			// play back what has happened
			socket.emit("draw:replay:" + namespace, channel.replay);
		}
	});



};