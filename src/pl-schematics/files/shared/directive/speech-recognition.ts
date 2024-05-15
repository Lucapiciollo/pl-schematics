import { Directive, ElementRef, HostListener, Input, Renderer2 } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Unsubscribe } from "pl-decorator";

@Directive({
  selector: '[speech]'

})
@Unsubscribe()
export class SpeechDirective {
  private recognition = null;

  constructor(private element: ElementRef, private renderer: Renderer2) {
    try {
      this.recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
      this.recognition.interimResults = false;
      this.recognition.lang = "it-IT";
      this.recognition.continuous = false;
    } catch (error) { }
  }

  /************************************************************************************************************************************************************************ */

  @Input() formGroupToSpeech: FormGroup;
  @Input() formControlNameToSpeech: string;

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  start() {
    this.renderer.setStyle(this.element.nativeElement, "color", "red");
    this.recognition.start();
    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const content = event.results[i][0].transcript.trim();
          let value = this.formGroupToSpeech.get(this.formControlNameToSpeech).value || "";
          this.formGroupToSpeech.get(this.formControlNameToSpeech).setValue(value + " " + content);
        }
      }
    };
  };

  /************************************************************************************************************************************************************************ */

  @HostListener('window:touchend', ['$event'])
  @HostListener('window:mouseup', ['$event'])
  stop() {
    setTimeout(() => {
      this.renderer.setStyle(this.element.nativeElement, "color", "black");
      this.recognition.stop();
    }, 1500);
  }
}
