//include fs and serialport modules
const fs = require('fs');
const SerialPort = require('serialport');

//declare variables we will use later.
window.hexLocation = "/extraResources/hex.txt";
window.COM = null;
window.port = null;
window.baudRate = 115200;
window.currentNumber = 0;
window.acceptData = true;
window.dataReceived = false;

//get COM port
serialport.list((err, ports) => {
    if (err) {
        console.log("Error getting ports: " + err);
    } else if (ports.length === 0) {
        console.log("No open ports");
    } else {
        ports.forEach(function(element) {
            if (element["manufacturer"] == "FTDI") {
                COM = element["comName"];
                startWriting();
            }
        });
    }
});

function startWriting() {
    //open port
    port = new SerialPort(COM, {
        baudRate: window.baudRate
    });

    //read hex to array by line
    var hex = fs.readFileSync(hexLocation).toString();
    window.lines = hex.split("\n");

    //re-declare variables
    currentNumber = 0;
    acceptData = true;

    //start writing after port is opened
    port.on('open', function() {
        write(currentNumber);
    });

    //error received
    port.on('error', function(err) {
        console.log('Error from serialport: ', err.message);
        connection_error();
    })

    //data received
    port.on('data', function(data) {
        dataReceived = true;
        //handle data
        if (acceptData) {
            currentNumber++;
            write(currentNumber);
        }
    });
}

function write(currentNumber) {
    if (currentNumber > lines.length) {
        console.log('Finished');
    } else {
        line = lines[currentNumber];
        port.write(line, function(err) {
            //error occurred
            if (err) {
                console.log('Error on write: ', err.message);
                return;
            }
            //success
            console.log('message written (' + currentNumber + '/' + lines.length + ')');
        });
    }
}
