const {GetRoomsByUserRequest, GetRoomsByUserResponse} = require('../proto/chat_js_proto_pb/chat/proto/chat_pb.js');
const {ChatServiceClient} = require('../proto/chat_js_proto_pb/chat/proto/chat_grpc_web_pb.js');

function Init() {
  // The listener from envoy.yaml
  var client = new ChatServiceClient('http://localhost:8080');

  var request = new GetRoomsByUserRequest();
  request.setUserId("0");

  var d = document.getElementById("request");
  var resp = [];
  resp.push("GetRoomsByUserRequest<br>");
  resp.push(request.getUserId());

  d.innerHTML = resp.join("");


  client.getRoomsByUser(request, {}, (err, response) => {
    if (err) {
      console.log(err);
    }
    var d = document.getElementById("response");
    var resp = [];
    for (i = 0; i < response.getRoomsList().length; i++) {
      if (i > 0) {
        resp.push("----<br>");
      }

      var r = response.getRoomsList()[i];
      resp.push(r.getId());
      resp.push("<br>");
      resp.push(r.getName());
      resp.push("<br>");
      resp.push(r.getArtistSlug());
      resp.push("<br>");

    }
    d.innerHTML = resp.join("");
  });
}

// Make Init available for body.OnLoad
window.Init = Init

