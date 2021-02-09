/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2020-12-02 16:28:39
 * @modify date 2020-12-02 16:28:39
 * @desc [Componente per la visualizzazione delle code ajax in modalità grafico]
 */
import { AfterContentInit, Component, Input, OnInit } from '@angular/core';
import * as Chart from "chart.js";
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { PLDelay, PLUnsubscribe } from 'pl-core-utils-library';
import { Subject } from 'rxjs';
import {ErrorBean,  ErrorCode } from "src/app/home/configuration/core/bean/error-bean";
import {HttpService } from 'src/app/home/configuration/core/service/http.service';
import { Utils } from 'src/app/home/configuration/shared/utils/utils';
import { option } from './http-graphic-config';
@Component({
  selector: 'app-http-graphic-speed', 
  templateUrl: './http-graphic-speed.component.html',
  styleUrls: ['./http-graphic-speed.component.css']
})
@PLUnsubscribe()
export class HttpGraphicSpeedComponent implements OnInit, AfterContentInit {

  private option = option();

  public idChart = null;
  public percentProgress = 0;
  public idScroll = 0;
  public url = "";
  public loaded = 0;
  public size = 0;
  private charInstance = null;
  private uploaded = 0;
  private lastUpTime = 0;
  private max = 1;
  private process: Subject<any> = null;

  @Input() set configChart(config: { labelBackgroundColor: string, datasetsBackgroundColor: string, annotationsBorderColor: string, chartAreaBackgroundColor: string, pointBackgroundColor: string }) {
    if (config != null) {
      this.option.data.datasets[0].backgroundColor = [config.datasetsBackgroundColor];
      this.option.options.annotation.annotations[0].borderColor = config.annotationsBorderColor;
      this.option.options.annotation.annotations[0].label.backgroundColor = config.labelBackgroundColor;
      this.option.options.chartArea.backgroundColor = config.chartAreaBackgroundColor;
      this.option.options.elements.point.backgroundColor = config.pointBackgroundColor;
    }
  }
  @Input() width: number | string = "15";
  @Input() fileName: string = null;
  @Input() set idAjax(id: string) {
    try {
      if (id != null) {
        if (this.charInstance != null) {
          this.charInstance.destroy();
        }
        this.registerListener(id);
      }
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false);
    }
  };
  /******************************************************************************************* */

  public listenerQueueFlow = null;
  private asseXChart = 0;
  /**
 * @author @l.piciollo
 * @param id idAjax per risalire alla richiesta accodata
 * @description registrazione alla coda di rete per reperire i cambiamenti di flusso change..
 * utile per servizi di download e di upload file. 
 */
  private registerListener(id) {
    if (this.charInstance == null) {
      (<any>this.createChart()).subscribe(sb => {
        this.listenerQueueFlow = this.httpService.TAILAJXCALL(id).subscribe(obj => {
          this.url = obj.url;
          this.loaded = obj.loaded;
          this.size = obj.size;
          this.process = obj.interrupt;
          this.percentProgress = 1 + obj.percent;
          var endTime = (new Date()).getTime();
          var upSpeed = this.calculateSpeed(obj.byte, this.uploaded, endTime, this.lastUpTime)
          if (this.max < Number(upSpeed))
            this.max = Number(upSpeed);
          this.uploaded = obj.byte;
          this.lastUpTime = endTime;
          this.option.data.datasets[0].data.push({
            "x": this.asseXChart++,
            "y": (Number(upSpeed) * 100) > 0 ? ((Number(upSpeed) * 100) / this.max).toFixed(1) + 1 : 0
          })
          this.option.options.annotation.annotations[0].value = Number(((Number(upSpeed) * 100) / this.max).toFixed(0)) / 2 + 10;
          this.option.options.annotation.annotations[0].label.content = String((Number(upSpeed) / 1024).toFixed(2)) + "Mb";
          this.charInstance.update()
        }, error => { },
          () => {
            this.listenerQueueFlow.unsubscribe();
            this.listenerQueueFlow = null;
          })
      });
    }

  }
  /********************************************************************************************************************** */
  /**
   * @author @l.piciollo
   * @param chart instanza di chart creata 
   */
  private rectangleDrow(chart) {
    try {
      if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
        var ctx = chart.chart.ctx;
        let x = 0;
        try {
          x = (chart.chart.config.data.datasets[0].data.slice(chart.chart.config.data.datasets[0].data.length - 1)[0]).x
        } catch (e) {
          x = 0
        };
        var chartArea = chart.chartArea;
        ctx.save();
        ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
        ctx.fillRect(chartArea.left, chartArea.top, (chartArea.right - chartArea.left) / 100 * x, chartArea.bottom - chartArea.top);
        ctx.restore();
      }
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }
  /********************************************************************************************************************** */
  /**
   * @author @l.piciollo
   * kill del processo monitorato
   */
  public killProcess() {
    this.process.next(true);
  }
  /********************************************************************************************************************** */
  /**
   * @author @l.piciollo
   * @param byte   dati in byte caricati
   * @param uploaded dati in byte totali
   * @param endTime fine caricamento
   * @param lastUpTime inizio caricamento
   */
  private calculateSpeed(byte, uploaded, endTime, lastUpTime): string {
    try {
      return (((byte - uploaded) * 1000) / ((endTime - lastUpTime) * 1024)).toFixed(2);
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }
  /********************************************************************************************************************** */

  constructor(private httpService: HttpService) { }

  /********************************************************************************************************************** */
  ngAfterContentInit(): void {
    try {
      this.idChart = Utils.UUIDCODE();
      (<any>this.createChart()).subscribe(chart => {
        this.charInstance = chart;
      });
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /********************************************************************************************************************** */
  ngOnInit() { this.idScroll = Utils.UUIDCODE(); }
  /********************************************************************************************************************** */

  /**
   * @author @l.piciollo
   * schedulazione di creazione del grafico
   */
  @PLDelay(1)
  private createChart() {
    try {
      this.option.plugins.push({ beforeDraw: this.rectangleDrow });
      let canvas = document.getElementById(this.idChart);
      let ctx = (<any>canvas).getContext('2d');
      let namedChartAnnotation = ChartAnnotation;
      namedChartAnnotation["id"] = "annotation";
      Chart.pluginService.register(namedChartAnnotation);
      return new Chart(ctx, this.option);
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }


}
