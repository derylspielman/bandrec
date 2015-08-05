var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').execFileSync;
var trackregex = /^\d*/i;
var trackreplaceregex = /^\d*.\-./i;
var wavExt = '.wav';
var mp3Ext = '.mp3';
var ffmpeg = 'C:\\apps\\ffmpeg\\bin\\ffmpeg.exe';


// EDIT THIS
var artist = "Palm Tree Lumberjacks";
var album = "Practice 2015-07-22";
var year = "2015";
var recording = {
  year: year,
  artist: artist,
  album: album,
  totalTracks: 0,
  directory: "C:\\Users\\dukethrash\\Documents\\Cakewalk\\Cakewalk Projects\\" + artist + "\\" + album + "\\",
  wavs: []
};
var uploadFolder = "C:\\Users\\dukethrash\\Google Drive\\Music\\DrumHouse Records\\" + artist + "\\" + album;
// END EDIT

setWavs();
if (recording.wavs.length > 1) {
  convertWavsToMp3s();
  deleteNonMp3s();
  fs.copySync(recording.directory, uploadFolder);
  console.log("Success!");
} else {
  console.log("No wavs found");
}
function convertWavsToMp3s() {
  for (var i = 0; i < recording.wavs.length; i++) {
    var wavFileName = recording.wavs[i];

    var mp3 = {
      artist: recording.artist,
      album: recording.album,
      date: recording.year,
      title: wavFileName.replace(wavExt, '').replace(trackreplaceregex, ''),
      track: wavFileName.match(trackregex) + "/" + recording.totalTracks,
      bitRate: '192k',
      file: recording.directory + wavFileName.replace(wavExt, mp3Ext),
      wav: recording.directory + wavFileName
    };

    toMp3(mp3);
    fs.unlinkSync(mp3.wav);

  }
}

function setWavs() {
  var files = fs.readdirSync(recording.directory);

// find wav files that start with track numbers
  recording.wavs = files.filter(function (file) {
    return file.substr(-4) === wavExt && !isNaN(file.charAt(0));
  });
  recording.totalTracks = recording.wavs.length;
}

function deleteNonMp3s() {
  var files = fs.readdirSync(recording.directory);

// find files that do not end with .mp3
  var nonMp3s = files.filter(function (file) {
    return file.substr(-4) !== mp3Ext;
  });

  nonMp3s.forEach(function (nonMp3) {
    fs.unlinkSync(recording.directory + nonMp3);
  })
}


function toMp3(mp3) {
  console.log("Creating " + mp3.file);
  exec(ffmpeg,
    ["-i", mp3.wav,
      "-y",
      "-b:a", mp3.bitRate,
      "-id3v2_version", "3",
      "-metadata", 'album_artist=' + mp3.artist,
      "-metadata", 'artist=' + mp3.artist,
      "-metadata", 'album=' + mp3.album,
      "-metadata", 'title=' + mp3.title,
      "-metadata", 'track=' + mp3.track,
      "-metadata", 'date=' + mp3.date,
      mp3.file
    ]);

  //console.log(params);
}
