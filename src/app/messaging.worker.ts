/// <reference lib="webworker" />
declare var fin;
let mmapBuffer: SharedArrayBuffer;
let mmapDataView: DataView;
addEventListener('message', ( message ) => {
  console.log('Message : ', message);

  if ( message.data.type === 'init') {

    mmapBuffer = message.data.mmapBuffer;
    mmapDataView = new DataView(mmapBuffer);

    // setInterval(() => {
    //   const m =  mmapDataView.getInt32(0, true);
    //   console.log('Data In Message Worker : ', m);
    // }, 1000);
  }

  if ( message.data.type === 'start') {

        setInterval(() => {
      const m =  mmapDataView.getInt32(0, true);
      console.log('Data In Message Worker : ', m);
    }, 1000);
  }
});
