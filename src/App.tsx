import {useState, useMemo, useCallback, ChangeEvent} from 'react';
import {WaveChart} from './WaveChart';
import {fadeEffect} from './effects';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fadeInDuration, setFadeInDuration] = useState(500);
  const [fadeOutDuration, setFadeOutDuration] = useState(500);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const {files} = event.target;
    if (files?.length) {
      const [file] = files;

      setSelectedFile(file);
      setAudioBuffer(null);

      loadFile(file);
    }
  }, []);

  const loadFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    const decodedData = await audioContext.decodeAudioData(buffer);

    setAudioBuffer(decodedData);
  };

  const channelBuffers = useMemo(() => {
    if (!audioBuffer) {
      return [];
    }

    const buffers = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      buffers[i] = audioBuffer.getChannelData(i);
    }

    return buffers;
  }, [audioBuffer]);

  const applyFadeEffect = useCallback(() => {
    if (audioBuffer) {
      const modifiedAudioBuffer = new AudioBuffer(audioBuffer);

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = new Float32Array(audioBuffer.length);
        audioBuffer.copyFromChannel(channelData, channel);

        const effect = fadeEffect({channelData, sampleRate: audioBuffer.sampleRate});
        effect.fadeIn(fadeInDuration);
        effect.fadeOut(fadeOutDuration);

        modifiedAudioBuffer.copyToChannel(channelData, channel);
      }

      setAudioBuffer(modifiedAudioBuffer);
    }
  }, [fadeInDuration, fadeOutDuration, audioBuffer]);

  const play = useCallback(() => {
    if (audioBuffer) {
      const audioContext = new AudioContext();

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.start();
    }
  }, [audioBuffer]);

  return (
    <div className="App">
      <h1>Garso signal?? apdorojimas laiko srityje</h1>
      <div>
        <input type="file" onChange={onFileChange} />
      </div>
      <div>
        {selectedFile ? <h3>Failo "{selectedFile.name}" analiz??</h3> : null}
        {audioBuffer ? (
          <div>
            <p>
              Trukm?? - {audioBuffer.duration.toFixed(2)}s (signalo ilgis - {audioBuffer.length})
            </p>
            <p>Da??nis - {audioBuffer.sampleRate}Hz</p>
            <p>Kanal?? kiekis - {audioBuffer.numberOfChannels}</p>
            <div>
              <h2>Fade in/Fade out</h2>
              <div>
                <label htmlFor="fade-in">Fade in trukm?? (ms):</label>
                <input
                  id="fade-in"
                  type="text"
                  placeholder="Fade in trukm??"
                  value={fadeInDuration}
                  onChange={(e) => setFadeInDuration(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label htmlFor="fade-out">Fade out trukm?? (ms):</label>
                <input
                  id="fade-out"
                  type="text"
                  placeholder="Fade out trukm??"
                  value={fadeOutDuration}
                  onChange={(e) => setFadeOutDuration(parseInt(e.target.value) || 0)}
                />
              </div>
              <button onClick={applyFadeEffect}>Pritaikyti efekt??</button>
            </div>
            <button onClick={play}>Groti</button>
            {channelBuffers.map((buffer, index) => (
              <WaveChart
                key={index}
                title={`Amplitud??: kanalas ${index}`}
                buffer={buffer}
                sampleRate={audioBuffer.sampleRate}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
