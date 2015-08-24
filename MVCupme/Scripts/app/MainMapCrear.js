/************************
Funciones de Creacion y validacion del elemento
****************************/
/********************
Inicializa el campo de creacion de 
*****************/



/*******************
Pica en el mapa
*******************/
function onMapClick(e) {
    if (map.hasLayer(FeatureSubEstacion)) {
        map.removeLayer(FeatureSubEstacion);
    }
    $("#InpLatitudCP").val(e.latlng.lat);
    $("#InpLongitudCP").val(e.latlng.lng);
    FeatureSubEstacion = L.marker(e.latlng, { icon: L.AwesomeMarkers.icon({ icon: 'bolt', prefix: 'fa', markerColor: 'red' }) });
    map.addLayer(FeatureSubEstacion);
    FunValidarUbi();
}

function FunValidarUbi() {
    if ($("#InpLongitudCP").val() != "" || $("#InpLatitudCP").val() != "") {
        var point = turf.point([$("#InpLongitudCP").val(), $("#InpLatitudCP").val()]);
        //console.log('Inside: ' + turf.inside(point, FeatureMunicipio));
        if (map.hasLayer(FeatureSubEstacion)) {
            map.removeLayer(FeatureSubEstacion);
        }

        FeatureSubEstacion = new L.Marker([$("#InpLatitudCP").val(), $("#InpLongitudCP").val()], { icon: L.AwesomeMarkers.icon({ icon: 'bolt', prefix: 'fa', markerColor: 'red' }) });
        map.addLayer(FeatureSubEstacion);
        map.panTo(FeatureSubEstacion.getLatLng());

        if (turf.inside(point, FeatureMunicipio)) {
            $("#PValidaUbi").removeClass("text-danger").addClass("text-success").empty().append("La Ubicacion es Valida");
            $("#Pgn3Sig").removeClass("disabled");
            return true;
        } else {
            $("#PValidaUbi").removeClass("text-success").addClass("text-danger").empty().append("La Ubicacion NO es  Valida");
            $("#Pgn3Sig").addClass("disabled");
            return false;
        }
    } else {
        $("#PValidaUbi").removeClass("text-success").addClass("text-danger").empty().append("La Ubicacion NO es  Valida");
        $("#Pgn3Sig").addClass("disabled");
        return false;
    }
}




function CrearSubEstacion(UbiCP) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta seguro de crear la SubEstacion?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    LyrSubEstacions_T.addFeature(UbiCP, function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            msj_exito("Se CREO la SubEstacion exitosamente!");
                            $("#FormCPPgn4").addClass("hide");
                            $("#FormCPPgn5").removeClass("hide");
                            limpiarFormularioCaptura("");
                            return true;
                        } else {
                            msj_peligro("ERROR, REVISE EL SERVIDOR DE MAPAS !");
                            return false;
                        }
                    });
                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
            }
        }]
    });
}



function CrearFeature(prevalue) {
    var UbiCP = FeatureSubEstacion.toGeoJSON();
    UbiCP.properties.ACTIVO = 1;
    UbiCP.properties.ALTITUD = 0;
    UbiCP.properties.AMPLIACION = $("#SectAmpliacion").val();
    UbiCP.properties.CAPACIDAD_MVA = $("#InpCapacidadMVA").val().replace(".", ",");
    UbiCP.properties.COD_SUB_UPME = 7;
    UbiCP.properties.FECHA_OPERACION = $('#dateOperacion').data("DateTimePicker").date().format('DD/MM/YYYY');
    UbiCP.properties.ID_CONTACTO = id_user;
    UbiCP.properties.ID_ESTADO_SUB = $("#SectEstado").val();
    UbiCP.properties.ID_ORGANIZACION = UsrOrgJson[0].idorganizacion;
    UbiCP.properties.ID_SUBESTACION = 0;
    UbiCP.properties.LONGITUD = UbiCP.geometry.coordinates[0];
    UbiCP.properties.LATITUD = UbiCP.geometry.coordinates[1];
    UbiCP.properties.ID_NIVEL_TENSION = $("#" + prevalue + "SectNivelTesion").val();
    UbiCP.properties.NOM_SUBESTACION =$("#" + prevalue + "InpNomCP").val().toUpperCase();
    UbiCP.properties.OBSERVACION =$("#" + prevalue + "InpObservacion").val();
    UbiCP.properties.PORCENTAJE_CARGA = $("#" + prevalue + "InpPorcentajeCarga").val().replace(".", ",");
    UbiCP.properties.ID_TENSION_SUB = $("#" + prevalue + "SectTensionSub").val();
    UbiCP.properties.FECHA_CREACION = moment().format('DD/MM/YYYY h:mm:ss a');
    UbiCP.properties.FECHA_CORTE_UPME = moment('31/12/' + moment().subtract(1, 'year').format('YYYY'), 'DD/MM/YYYY').format('DD/MM/YYYY');
    UbiCP.properties.ID_USUARIO_VALIDA = 0;
    UbiCP.properties.FECHA_VALIDACION = null;
    UbiCP.properties.ACTUALIZACION = 0;
    UbiCP.properties.COD_DPTO = FeatureMunicipio.properties.DPTO_CCDGO;
    UbiCP.properties.COD_MPIO = FeatureMunicipio.properties.MPIO_CCDGO;
    console.log(UbiCP);
    CrearSubEstacion(UbiCP);
}



$('#dateOperacion').datetimepicker({
    format: 'DD/MM/YYYY',
    locale: 'es'
});




