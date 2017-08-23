var Z_INDEX = 1,
    ANGLE_TOP = 180,
    ANGLE_LEFT = 90,
    ANGLE_BOTTOM = 0,
    ANGLE_RIGHT = 270,
    ARTIFACT_MESSAGE = 'message',
    ARTIFACT_IMAGE = 'image',
    ARTIFACT_POINT = 'point',
    ARTIFACT_LINK = 'link';

$.get(location.href + '/config.json', function (data) {
    if (jQuery.ui) {
        console.log('PAGE : connexionApp.ejs -> charge JQuery');
    } else {
        console.log('PAGE : connexionApp.ejs -> charge JQuery');
        console.log("PAGE : connexionApp.ejs : pas de chargement jQuery.ui");
    }

    console.log('PAGE : connexionApp.ejs -> on s occupe maintenant de la connexion');

    console.log('******************* PARAMETRE PASSE PAR LA REQUETE  ********************************');
    console.log('PAGE : workspace.ejs -> demande connection socket');

    var mZP = new ZP(data.configZP.idZP, window.location.hostname + ':' + data.configZP.portWebSocket),
        connection = new Connection(mZP, data.event);
    new MenuView(mZP, connection);
    new ZPView(mZP, connection);
    new ZEView(mZP, connection);
    new ToolView(mZP, connection);
    new ArtifactView(mZP, connection);
    new LineView(mZP, connection);
});