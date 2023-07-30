import { LOGO } from './logo';
import { CollaborateurService } from './../services/collaborateur.service';
import { PlanningService } from './../services/planning.service';
import { Component, Inject, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-pdf-generator',
  templateUrl: './pdf-generator.component.html',
  styleUrls: ['./pdf-generator.component.scss']
})
export class PdfGeneratorComponent {
    //@Input() data: string;
  @Input() context: any;
  @Input() data: any;

  constructor(
    private dialogRef: NbDialogRef<PdfGeneratorComponent>,
    private planningService: PlanningService,
    private collaborateurService: CollaborateurService
  ) { }

  public dateFormat(date: Date): string {
     let year = date.getFullYear();
     let month = date.getMonth()+1;
     let day = date.getDate();
     return year+'-'+month+'-'+day
   }

  giveDay(date: Date): string {
    let days = [ 'Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    return days[date.getDay()]
  }

  giveDate(date: Date): string {
    let day = date.getDate().toString();
    let monthInt = date.getMonth() + 1;
    let month = monthInt.toString();
    if (day.length === 1 ) {
      day = '0'+day;
    }
    if (month.length === 1 ) {
      month = '0'+month;
    }
    return day+'/'+month
  }

  giveMonth(date: Date): string {
    let month = [ 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    let day = date.getDate().toString();
    let monthInt = date.getMonth();
    let actualMonth = month[monthInt];
    return day+' '+ actualMonth
  }

  giveFullDate(): string {
    let date = new Date();
    let days = [ 'Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    let day = date.getDate().toString();
    let monthInt = date.getMonth()+1;
    let month = monthInt.toString();
    let year = date.getFullYear().toString();
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    if (day.length === 1 ) {
      day = '0'+day;
    }
    if (month.length === 1 ) {
      month = '0'+month;
    }
    if (hours.length === 1 ) {
      hours = '0'+hours;
    }
    if (minutes.length === 1 ) {
      minutes = '0'+minutes;
    }
    return '[Version du '+day+'/'+month+'/'+year+' à '+hours+':'+minutes+']'
  }

  async getCollabName( l: number, j : number) {
    return new Promise((resolve, reject) => {
      this.collaborateurService.fetch(this.data.userId, JSON.parse(this.data.listEquipeId[l][2])[j]).subscribe(
        (res) => {
           let trueDay = JSON.parse(JSON.stringify(res));
          let nom = "";
           if (trueDay.length != 0 ) {
            nom = trueDay[0]['name'];

          }
           resolve(nom);
          },
          (error) => {
            reject(error);
          }
          );
        });
      }

  async getCreneau(day: string, l: number, j: number) {
    return new Promise((resolve, reject) => {
      this.planningService.find(this.data.userId, day, this.data.listEquipeId[l][0], JSON.parse(this.data.listEquipeId[l][2])[j]).subscribe(
        (res) => {
           let trueDay = JSON.parse(JSON.stringify(res));
           let creneau = '';
           let color = '';
           if (trueDay.length != 0 ) {
            trueDay = JSON.parse(JSON.stringify(res).slice(1,-1));
            let info = trueDay['creneau'];
            let infoCreneau = [""];
            if (info[0] != '[') {
              let infoParse = info.split(',');
              infoCreneau = [infoParse[0], infoParse[1]+', '+ infoParse[2]+ ', '+ infoParse[3], infoParse[4]];
            } else {
              infoCreneau = JSON.parse(info);
            }
           
           creneau = infoCreneau[0];
           color = infoCreneau[1];
          }
           resolve([creneau, color]);
          },
          (error) => {
            reject(error);
          }
          );
        });
      }


  async closeDialog(nomEquipe: boolean) {
    this.dialogRef.close();

    let widths = ['*'];
    let dateBody = [{ text: ` `, fillColor: 'white', color:'#3c82c8' }];
    let dateFormatList = [''];
    dateFormatList.pop();
    let k = this.data.week.length;
    let weekLength = this.data.week[k-1].length;
    for (let j = 0; j<k; j++) {
      for (let i= 0; i < this.data.week[0].length; i++) {
        dateBody.push({ text: this.giveDay(this.data.week[j][i])+ ' '+ this.giveDate(this.data.week[j][i]), fillColor: 'white', color:'#3c82c8' });
        dateFormatList.push(this.dateFormat(this.data.week[j][i])); // mets les dates au bon format pour la fonction find
        widths.push('*');
      }
    }


    var documentDefinition = {
      pageMargins: [ 40, 60, 40, 60 ],
      content: [
        {
          columns: [
            { text: 'Planning du '+ this.giveMonth(this.data.week[0][0]) + ' au '+ this.giveMonth(this.data.week[k-1][weekLength-1]), fontSize: 12, width: "45%" },
            { text: this.giveFullDate() , fontSize: 10, width: "45%" },
            {
              image: LOGO,
              height: 10,
              width: 10,
              alignment: 'right',
            },
            { image: LOGO, text: 'Planeezy' ,  style: 'Roboto' }
          ]
        },
        {
          canvas: [
            {
    
              type: 'line',
              x1: 0, y1: 5,
              x2: 520, y2: 5,
              lineWidth: 3,
              lineColor: '#a5c3f5',
            }
          ]
        },
        
    		{ text: '', fontSize: 12 },
        {
          style: 'titre',
          layout: 'noBorders',
          table: {
            widths: widths,
            body: [
              dateBody,
            ]
          }
        },

    ],
    styles: {
      titre: {
        color: '#3c82c8',
        margin: [0, 25, 0, 5], 
        fontSize: 10,
        bold: true,
      },
      equipe: {
        margin: [0, 0, 0, 5], 
        fontSize: 10,
        fillColor: 'red',
      },
      Roboto: {
          fontSize: 10, 
          alignment: 'right', 
          italics: true,
          color:'#3c82c8',
          //font: './../assets/roboto.medium-italic.ttf'
          }
        }
      };
      
      for (let l =0; l < this.data.listEquipeId.length; l++) {
        let body = [[{ text: ``, fillColor: 'white', color: 'black' }]];
        body.pop();
        for (let j = 0; j<JSON.parse(this.data.listEquipeId[l][2]).length; j++) {
          let nom = await this.getCollabName(l, j);
          let name = JSON.parse(JSON.stringify(nom))
          let bodyPart = [{ text: name.toString(), fillColor: 'white', color: '#3c82c8' }];
         
          for (let d = 0; d< dateFormatList.length; d++) {
            let bodyElements = await this.getCreneau(dateFormatList[d], l, j);
            let elements = JSON.parse(JSON.stringify(bodyElements));
            bodyPart.push({ text: elements[0].toString(), fillColor: elements[1].toString(), color: 'black' });
          }
          body.push(bodyPart);
        }
       if (nomEquipe){
        documentDefinition.content.push(
          { text: this.data.listEquipeId[l][1], fontSize: 10 })
       } else {
        documentDefinition.content.push(
          { text: '', fontSize: 10})
       }
        documentDefinition.content.push(
          {
           style: 'equipe',
           layout: 'noBorders',
           table: {
            widths: widths,
            body: body
            }
          },
        );
      }

    
      console.log('pdfOpen');
    pdfMake.createPdf(documentDefinition).open();
  }
}
