import { Injectable } from '@angular/core';
import { ConfigAndDST } from 'src/app/Domain/Export/configAndDst';
import { createTitleAndDescriptionSVGElement } from 'src/app/Service/Export/exportUtil';
import { ModelerService } from '../Modeler/modeler.service';
import { deepCopy } from '../../Utils/deepCopy';

@Injectable({
  providedIn: 'root',
})
export class SvgService {
  private cacheData = '';

  constructor(private modelerService: ModelerService) {}

  public createSVGData(
    title: string,
    description: string,
    dst: ConfigAndDST
  ): string {
    this.cacheData = this.modelerService.getEncoded();

    let data = deepCopy(this.cacheData);

    // to ensure that the title and description are inside the SVG container and do not overlap with any elements,
    // we change the confines of the SVG viewbox
    let viewBoxIndex = data.indexOf('width="');

    let { width, height, viewBox } = this.viewBoxCoordinates(data);

    let xLeft: number;
    let xRight: number;
    let yUp: number;
    let yDown: number;
    const splitViewBox = viewBox.split(/\s/);

    height += 80;
    xLeft = +splitViewBox[0];
    yUp = +splitViewBox[1];
    xRight = +splitViewBox[2];
    yDown = +splitViewBox[3];

    if (xRight < 300) {
      xRight += 300;
      width += 300;
    }

    // to display the title and description in the SVG-file, we need to add a container for the text-elements
    const { insertText, extraHeight } = createTitleAndDescriptionSVGElement(
      title,
      description,
      xLeft,
      yUp,
      width
    );
    height += extraHeight;

    const bounds = this.createBounds(width, height, xLeft, yUp, xRight, yDown);

    const dataStart = data.substring(0, viewBoxIndex);
    viewBoxIndex = data.indexOf('" version');

    const dataEnd = data.substring(viewBoxIndex);
    dataEnd.substring(viewBoxIndex);

    data = dataStart + bounds + dataEnd;

    const insertIndex = this.findIndexTOInsertData(data);

    data = [
      data.slice(0, insertIndex),
      insertText,
      data.slice(insertIndex),
    ].join('');

    data = this.appendDST(data, dst);

    return encodeURIComponent(data);
  }

  private findIndexTOInsertData(data: string) {
    let insertIndex = data.indexOf('</defs>');
    if (insertIndex < 0) {
      insertIndex = data.indexOf('version="1.2">') + 14;
    } else {
      insertIndex += 7;
    }
    return insertIndex;
  }

  private createBounds(
    width: number,
    height: number,
    xLeft: number,
    yUp: number,
    xRight: number,
    yDown: number
  ): string {
    return (
      'width="' +
      width +
      '" height=" ' +
      height +
      '" viewBox="' +
      xLeft +
      ' ' +
      (yUp - 80) +
      ' ' +
      xRight +
      ' ' +
      (yDown + 30)
    );
  }

  private viewBoxCoordinates(svg: string): {
    width: number;
    height: number;
    viewBox: string;
  } {
    const ViewBoxCoordinate =
      /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
    const match = svg.match(ViewBoxCoordinate);
    if (match) {
      return { width: +match[1], height: +match[2], viewBox: match[3] };
    }
    return { width: 0, height: 0, viewBox: '' };
  }

  private appendDST(data: string, dst: ConfigAndDST): string {
    data += '\n<!-- <DST>\n' + JSON.stringify(dst) + '\n </DST> -->';
    return data;
  }
}
