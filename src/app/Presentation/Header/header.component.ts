import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ModelerService} from '../../Service/Modeler/modeler.service';
import {TitleService} from '../../Service/Title/title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  showDescription: Observable<boolean>;
  currentDomainName: Observable<string>;

  constructor(private titleService: TitleService) {
    this.showDescription = this.titleService.getShowDescriptionObservable();
    this.currentDomainName = this.titleService.getDomainNameAsObservable();
  }
}