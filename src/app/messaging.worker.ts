/// <reference lib="webworker" />
declare var fin;
let mmapBuffer: SharedArrayBuffer;
let mmapDataView: DataView;

if( typeof fin === 'undefined'){
  console.log('Fin is Not Available');
}

addEventListener('message', ( message ) => {
  console.log('Message : ', message);

  if ( message.data.type === 'init') {


  console.log('Got Init Message from Main Process');
  mmapBuffer = message.data.mmapBuffer;

  console.log('In WebWorker Shared Buffer Size = ', mmapBuffer.byteLength);

  }

  if ( message.data.type === 'start') {

        setInterval(() => {
      const m =  mmapDataView.getInt32(0, true);
      console.log('Data In Message Worker : ', m);
    }, 1000);
  }
});
