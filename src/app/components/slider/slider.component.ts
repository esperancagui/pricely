import { Component } from '@angular/core';
import { TestService } from '../../services/test.service';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent {

  constructor(private testService: TestService) {
    this.testService.getAllProducts().then(products => {
      console.log(products);
    });
  }

}
