(function() {
    var tcpClient;

    var host = 'localhost';
    var port = 61804;
    connect(host, port);

    /**
   * Connects to a host and port
   *
   * @param {String} host The remote host to connect to
   * @param {Number} port The port to connect to at the remote host
   */
    function connect(host, port) {
        tcpClient = new TcpClient(host, port);
        console.log('Trying to connect to ' + host + ':' + port);
        tcpClient.connect(function () {
            console.log('Connected to ' + host + ':' + port);
            tcpClient.addResponseListener(function (data) {
                try {
                    var dataString = JSON.parse(data);
                    console.log('Data received: ' + dataString);
                }
                catch(ex) {
                    console.log();
                }
            });
        });
    }
})();

