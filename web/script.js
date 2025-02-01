// Frontend für Ollama und TTS

'use strict';

// Austauschen durch eigenen Bearer
const BEARER = 'BEARER_TOKEN';

var HOST = "localhost";

var frageDefault =  "Wie heißt du?";

$( document ).ready(function() {
    

    $("#eingabe").val(frageDefault);
    $("#eingabe").select();
   
    $('form[name="soundform"]').on("submit",function() {
        var eingabe = $("#eingabe").val();
        console.log("generiere jetzt:"+eingabe);
        
        //Eigenes nicht sprechen
        //getAudio(eingabe);


        
        getGPTResult(eingabe);
        return false;
    });

    $("#eingabe").on("change",function() {
            console.log("changed");
            $("#generiere").trigger("click");
    });

    function ucFirst(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    function getAudio(eingabe) {

        $("#generiere").addClass("working");
        
        var voice = $('select[name="voice"]').val();


        console.log("generiere mp3 mit voice '"+voice+"' für wert: "+eingabe);

        $.ajax({
        url: 'http://'+HOST+':8000/v1/audio/speech',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            model: "tts-1",
            input: eingabe,
            //voice: "alloy",
            voice: voice,
            response_format: "mp3",
            //speed: 1.0
            speed: 1.0
        }),
        xhrFields: {
            responseType: 'blob' // Damit wird die Antwort als Binärdaten behandelt
        },
        success: function (data) {
            // Die Antwort (MP3-Datei) wird als Blob gespeichert
            const url = URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.innerHTML ="Download Audio '"+eingabe+"': speech.mp3";
            link.download = 'speech.mp3';
            link.className="mp3link";

            document.body.appendChild(link);

            $("body").append('<audio controls src="'+url+'"></audio>');

            $("body").append("<hr>");



            //link.click();
            //document.body.removeChild(link);
            //URL.revokeObjectURL(url);

              // Die URL in das <audio> Element einfügen
                const audioPlayer = $('#audio-player')[0];
                        audioPlayer.src = url;
                        audioPlayer.play(); // Audio automatisch abspielen
               
                        $("#eingabe").focus();
                        $("#eingabe").select();
                        $("#generiere").removeClass("working");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Fehler:', textStatus, errorThrown);
        }
    });
    }


   
    
    function getGPTResult(s){

        // Profil des Avatars
        var frage = s; 
        
        var voice = $('select[name="voice"]').val();

        // Initiales Verhalten mitgeben
        s="Dein Name ist "+ucFirst(voice)+", du bist ein hilfsbereiter Assistent. Antworte bitte immer kurz. Ein Benutzer schreibt: "+s;

        $("#generiere").addClass("working");

        $.ajax({
            type: 'POST',
            url: 'http://'+HOST+':3000/api/chat/completions',
            headers: {
            Authorization: 'Bearer '+BEARER,
            'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "model": "llama3.2:latest",
                "messages": [
                {
                "role": "user",
                "content": s
                }
                ]
            })
        }).done(function(data){
            var antwort = data.choices[0].message.content;

            console.log(antwort);

            var htmlantwort = antwort.replaceAll("\n", "<br>")
            $("body").append(frage+"<br>"+htmlantwort+"<br>");
            
            $("#generiere").removeClass("working");

            getAudio(antwort);

            window.scrollTo(0, document.body.scrollHeight);

        }).fail(function(error){
            console.error("Fehler",error);
            $("body").append("Fehler:<br>"+JSON.stringify(error)+"<br>");
       
        });
        }

        
    });

