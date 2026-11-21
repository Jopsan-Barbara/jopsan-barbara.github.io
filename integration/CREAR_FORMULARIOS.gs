// Ejecutar una sola vez en Google Apps Script con la cuenta propietaria.
const BOOK_ID = '1WVDs5uB8MjFG2TwyTrhEU5H5U_4hQrfyQRj3mtRxMTY';
function prepararGoogleForms() {
  const book=SpreadsheetApp.openById(BOOK_ID),props=PropertiesService.getScriptProperties();
  function make(key,title,build,tab) {
    const old=props.getProperty(key);
    if(old){const existing=FormApp.openById(old);if(existing.getDestinationId()!==BOOK_ID||!book.getSheetByName(tab))throw Error('Revisar conexión existente de '+title);return existing;}
    if(book.getSheetByName(tab))throw Error('Ya existe la pestaña '+tab+'; no se crearán duplicados.');
    const f=FormApp.create(title,false);props.setProperty(key,f.getId());
    f.setCollectEmail(false).setLimitOneResponsePerUser(false).setPublishingSummary(false).setAllowResponseEdits(false);
    build(f);
    const before=new Set(book.getSheets().map(s=>s.getSheetId()));
    f.setDestination(FormApp.DestinationType.SPREADSHEET,BOOK_ID);SpreadsheetApp.flush();
    const added=book.getSheets().filter(s=>!before.has(s.getSheetId()));
    if(added.length!==1)throw Error('No se pudo identificar la pestaña de respuestas de '+title);
    added[0].setName(tab);
    if(f.supportsAdvancedResponderPermissions())f.setPublished(true);
    f.setAcceptingResponses(true);
    return f;
  }
  const rsvp=make('RSVP_FORM','Jopsan y Bárbara · Confirmación de asistencia',f=>{
    f.setDescription('Confirma hasta el 31 de enero de 2027. Considera únicamente a las personas invitadas.').setConfirmationMessage('Tu respuesta quedó registrada. ¡Muchas gracias!').setShowLinkToRespondAgain(false).setCustomClosedFormMessage('El tiempo para confirmar asistencia ha finalizado.');
    f.addTextItem().setTitle('Nombre').setRequired(true);
    f.addTextItem().setTitle('Apellido').setRequired(true);
    const choice=f.addMultipleChoiceItem().setTitle('¿Asistirás?').setRequired(true);
    const yes=f.addPageBreakItem().setTitle('Detalles de asistencia');
    f.addListItem().setTitle('Personas que asistirán, incluyéndote').setChoiceValues(Array.from({length:20},(_,i)=>String(i+1))).setRequired(true);
    f.addParagraphTextItem().setTitle('Nombres de acompañantes, si corresponde');
    f.addParagraphTextItem().setTitle('Restricciones alimentarias (opcional)');
    choice.setChoices([choice.createChoice('Sí',yes),choice.createChoice('No',FormApp.PageNavigationType.SUBMIT)]);
  },'Formulario RSVP');
  const song=make('SONG_FORM','Jopsan y Bárbara · Canciones para la fiesta',f=>{
    f.setDescription('¿Qué canción no puede faltar?').setConfirmationMessage('¡Gracias! Tu canción quedó registrada.').setShowLinkToRespondAgain(true);
    f.addTextItem().setTitle('Canción y artista').setRequired(true);
  },'Formulario canciones');
  // Preserva los registros existentes y añade las nuevas respuestas a las vistas privadas.
  book.getSheetByName('Confirmados').getRange('A2').setFormula('=IFNA(QUERY(VSTACK(CHOOSECOLS(Respuestas!C6:I,1,2,5,6,7,4),CHOOSECOLS(\'Formulario RSVP\'!B2:G,1,2,4,5,6,3)),"select Col1,Col2,Col3,Col4,Col5 where Col6 = \'Sí\'",0),"Aún no hay confirmaciones")');
  book.getSheetByName('No asistirán').getRange('A2').setFormula('=IFNA(QUERY(VSTACK(Respuestas!C6:F,CHOOSECOLS(\'Formulario RSVP\'!B2:G,1,2,5,3)),"select Col1,Col2 where Col4 = \'No\'",0),"Aún no hay respuestas negativas")');
  book.getSheetByName('Playlist DJ').getRange('A2').setFormula('=IFNA(SORT(UNIQUE(TOCOL(VSTACK(Canciones!C2:C,\'Formulario canciones\'!B2:B),1))),"Aún no hay canciones sugeridas")');
  const summary=book.getSheetByName('Resumen');
  summary.getRange('B4:B7').setFormulas([
    ['=COUNTIF(Respuestas!C6:C,"?*")+COUNTIF(\'Formulario RSVP\'!B2:B,"?*")'],
    ['=COUNTIF(Respuestas!F6:F,"Sí")+COUNTIF(\'Formulario RSVP\'!D2:D,"Sí")'],
    ['=COUNTIF(Respuestas!F6:F,"No")+COUNTIF(\'Formulario RSVP\'!D2:D,"No")'],
    ['=SUMIF(Respuestas!F6:F,"Sí",Respuestas!G6:G)+SUMPRODUCT(IFERROR(VALUE(\'Formulario RSVP\'!E2:E),0),N(\'Formulario RSVP\'!D2:D="Sí"))']
  ]);
  if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='cerrarConfirmaciones'))ScriptApp.newTrigger('cerrarConfirmaciones').timeBased().at(new Date('2027-02-01T03:00:00Z')).create();
  const config={rsvpForm:rsvp.getPublishedUrl(),songForm:song.getPublishedUrl()};
  console.log(JSON.stringify(config));return config;
}
function cerrarConfirmaciones(){const id=PropertiesService.getScriptProperties().getProperty('RSVP_FORM');if(id)FormApp.openById(id).setAcceptingResponses(false);}
