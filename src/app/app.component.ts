import {Component, OnInit, ViewChild} from '@angular/core';
import {MarketData} from './MarketData';
import {AgGridAngular} from 'ag-grid-angular';
declare var fin;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements  OnInit {
  title = 'openfin-mmap-poc';
  mmpData: any;
  private worker: Worker;
  private buffer: SharedArrayBuffer;
  public marketDataList: Array<MarketData> = new Array<MarketData>();

  @ViewChild('agGrid', {static: true}) agGrid: AgGridAngular;


  columnDefs = [
    {headerName: 'Symbol', field: 'symbol' },
    {headerName: 'Mid', field: 'mid' },
    {headerName: 'Bid', field: 'bidPrice0'},
    {headerName: 'BidSize', field: 'bidSize0'},
    {headerName: 'Ask', field: 'askPrice0'},
    {headerName: 'AskSize', field: 'askSize0'}
  ];
  rowData: any;

  public startReadingMMAP(): void {
    const MappedFiles = fin && fin.experimental && fin.experimental.MappedFiles;
    if ( MappedFiles ) {
      console.log('Memory Mapped Files is Enabled!!!');
      const files = MappedFiles.getSync();
      console.log('files : ', files);
      const file = files[0];
      console.log('File Name : ', file.name());
      console.log('File Path : ', file.path());
      this.buffer = file.map();
      console.log('Memory Map Buffer Size: ', this.buffer.byteLength);
      const numOfRecords = this.buffer.byteLength / MarketData.SIZE;

      for (let i = 0; i < numOfRecords; i++) {

        const md = new MarketData(this.buffer, i);
        this.marketDataList.push(md);

      }

      this.agGrid.api.updateRowData({add: this.marketDataList});



      setInterval(() => {
        this.marketDataList.forEach(value => {
          value.refresh();
        });
        this.agGrid.api.refreshCells();
      }, 200);

    }
  }

  ngOnInit(): void {



  }

  startMessagingWorker($event: MouseEvent): void {

    this.startReadingMMAP();
    // this.worker = new Worker('./messaging.worker', { type: 'module'});
    // this.worker.postMessage(this.buffer);

  }

  startReadingInMessagingWorker($event: MouseEvent) {
    this.worker.postMessage({type: 'start', mmapBuffer: null});
  }

  onGridReady($event: any) {

    this.agGrid.api.setRowData(this.marketDataList);

  }
}
