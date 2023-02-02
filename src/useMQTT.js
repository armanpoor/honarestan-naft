import { useContext, useEffect, useState } from 'react';

import { Client as MqttClient } from './paho-mqtt';

var mqttTimer;
export default function useMQTT(channel = 'rfid') {
  // states
  const [mqttMessage, setMqttMessage] = useState();
  const [mqttStatus, setMqttStatus] = useState('DISCONNECTED');

  // ask for mqtt connection credentials from server
  useEffect(() => {
    // start mqtt websocket connection in browser
    startConnection(
      'broker.hivemq.com',
      '8000',
      '',
      '',
      false
    );
    // startConnection(
    //   'localhost',
    //   '8083',
    //   '@mehdiabdi1995',
    //   '6aJ5V77Wmzn6)E',
    //   false
    // );
  }, []);
  // // show notification every time a new mqtt message is received
  // useEffect(() => {
  //   useNotification(
  //     'newTag',
  //     setSnackbarColor,
  //     setSnackbarMessage,
  //     setSnackbarOpen
  //   );
  // }, [mqttMessage]);

  // show notification every time a new mqtt message is received
  // useEffect(() => {
  //   if (mqttStatus === 'CONNECTED') {
  //     useNotification(
  //       'success',
  //       setSnackbarColor,
  //       setSnackbarMessage,
  //       setSnackbarOpen,
  //       '',
  //       'اتصال با RFID برقرار شد'
  //     );
  //   } else if (mqttStatus === 'DISCONNECTED') {
  //     useNotification(
  //       'sending',
  //       setSnackbarColor,
  //       setSnackbarMessage,
  //       setSnackbarOpen,
  //       'در حال برقراری اتصال با RFID'
  //     );
  //   }
  // }, [mqttStatus]);

  // connection manager
  function startConnection(host, port, username, password, useSSL) {
    var client = new MqttClient(host, Number(port), '/mqtt', 'clientID-43');

    // called when the client connects
    function onConnect() {
      setMqttStatus('CONNECTED');
      client.subscribe(channel);
    }
    // called when a message arrives
    function onMessageArrived(message) {
      setMqttMessage(message.payloadString);
    }
    // called when the client loses its connection
    function onConnectionLost(responseObject) {
      setMqttStatus('DISCONNECTED');
      if (responseObject.errorCode !== 0) {
        console.log(`onConnectionLost:${responseObject.errorMessage}`);
      }
      try {
        clearInterval(mqttTimer);
        mqttTimer = setInterval(() => {
          if (!client.isConnected()) {
            client.connect({
              onSuccess: onConnect,
              useSSL: useSSL,
              userName: username,
              password: password,
            });
          }
        }, 3000);
      } catch {}
    }

    try {
      // set callback handlers
      client.onConnectionLost = onConnectionLost;
      client.onMessageArrived = onMessageArrived;

      // connect the client
      client.connect({
        onSuccess: onConnect,
        useSSL: useSSL,
        userName: username,
        password: password,
      });
      document.querySelector('#button').addEventListener('click', function (e) {
        const message = document.querySelector('#input')?.textContent;
        client.publish('rfid', message);
      });
    } catch {
      onConnectionLost();
    }
  }

  return { mqttMessage, mqttStatus };
}
