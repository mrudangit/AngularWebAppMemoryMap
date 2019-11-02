import {Component, OnInit, ViewChild} from '@angular/core';
import {MarketData} from './MarketData';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef} from 'ag-grid-community';
declare var fin;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements  OnInit {
  title = 'openfin-mmap-poc';
  mmpData: any;
  private worker: Worker;
  private buffer: SharedArrayBuffer;
  public marketDataList: Array<MarketData> = new Array<MarketData>();

  private marketDataMap: Map<string, MarketData> = new Map<string, MarketData>();

  @ViewChild('agGrid', {static: true}) agGrid: AgGridAngular;


  columnDefs = [
    {headerName: 'Symbol', field: 'symbol', resizable: true },
    {headerName: 'Mid', field: 'mid' },

    {headerName: 'Bid', field: 'bidPrice0'},
    {headerName: 'Spread', field: 'spread' },
    {headerName: 'Ask', field: 'askPrice0'},
    {headerName: 'BidSize', field: 'bidSize0'},

    {headerName: 'AskSize', field: 'askSize0'},

    {headerName: 'Bid1', field: 'bidPrice1'},
    {headerName: 'BidSize1', field: 'bidSize1'},
    {headerName: 'Bid2', field: 'bidPrice2'},
    {headerName: 'BidSize2', field: 'bidSize2'},
    {headerName: 'Bid3', field: 'bidPrice3'},
    {headerName: 'BidSize3', field: 'bidSize3'},
    {headerName: 'Bid4', field: 'bidPrice4'},
    {headerName: 'BidSize4', field: 'bidSize4'},

    {headerName: 'Ask1', field: 'askPrice1'},
    {headerName: 'AskSize1', field: 'askSize1'},
    {headerName: 'Ask2', field: 'askPrice2'},
    {headerName: 'AskSize2', field: 'askSize2'},
    {headerName: 'Ask3', field: 'askPrice3'},
    {headerName: 'AskSize3', field: 'askSize3'},
    {headerName: 'Ask4', field: 'askPrice4'},
    {headerName: 'AskSize4', field: 'askSize4'},


    {headerName: 'RevisionID', field: 'revisionId'}
  ];
  rowData: any;
  private intervalHandle: any;
  numOfRecords: number;
  firstRow: number;
  lastRow: number;
  totalDisplayedRows: number;

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
      this.numOfRecords = this.buffer.byteLength / MarketData.SIZE;

      console.log('Number of Records in Memory Map File : ', this.numOfRecords);

      for (let i = 0; i < this.numOfRecords; i++) {

        const md = new MarketData(this.buffer, i);
        this.marketDataList.push(md);

        md.refresh();

      }

      this.agGrid.api.updateRowData({add: this.marketDataList});

      this.marketDataList.forEach(value => {
        this.marketDataMap.set(value.symbol, value);
      });


      this.startUpdateLoop();


    }
  }

  ngOnInit(): void {



  }


  startUpdateLoop(): void {

    this.intervalHandle = setInterval(() => {

       this.firstRow = this.agGrid.api.getFirstDisplayedRow();
       this.lastRow = this.agGrid.api.getLastDisplayedRow();
       this.totalDisplayedRows = this.agGrid.api.getDisplayedRowCount();
       console.log('Number of Rows Displayed : ', this.totalDisplayedRows, ' First Row = ', this.firstRow, ' Last Row : ', this.lastRow);


       for (let i = this.firstRow; i < this.lastRow; i++) {
        const rowNode = this.agGrid.api.getDisplayedRowAtIndex(i);
        const key = rowNode.data.symbol;
        // console.log('Row Node ID :', key);

        const md = this.marketDataMap.get(key);
        md.refresh();
      }

       this.agGrid.api.refreshCells();
    }, 200);
  }

  startMessagingWorker($event: MouseEvent): void {

    this.startReadingMMAP();
    console.log('Starting Web Worker !!!');
    this.worker = new Worker('./messaging.worker', { type: 'module'});

  }

  startReadingInMessagingWorker($event: MouseEvent) {
    const buffer = this.buffer.slice(0);
    console.log('Buffer Size = ', buffer.byteLength);
    this.worker.postMessage({type: 'init', mmapBuffer: this.buffer});
    console.log('Buffer Size After Post Message: ', buffer.byteLength);
  }

  onGridReady($event: any) {

    this.agGrid.api.setRowData(this.marketDataList);

  }

  pauseUpdating($event: MouseEvent) {

    clearInterval(this.intervalHandle);
  }

  resumeUpdating($event: MouseEvent) {

    this.startUpdateLoop();
  }
}
