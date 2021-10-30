export const fadeEffect = ({channelData, sampleRate}: {channelData: Float32Array; sampleRate: number}) => {
  const getNumSamplesForDuration = (duration: number) => Math.round((duration / 1000) * sampleRate);

  return {
    fadeIn: (fadeInDuration: number) => {
      const samplesToFadeIn = getNumSamplesForDuration(fadeInDuration);

      for (let sample = 0; sample < samplesToFadeIn; sample++) {
        const modifier = sample / samplesToFadeIn;
        channelData[sample] *= modifier;
      }
    },
    fadeOut: (fadeOutDuration: number) => {
      const samplesToFadeOut = getNumSamplesForDuration(fadeOutDuration);

      for (let sample = channelData.length - samplesToFadeOut; sample < channelData.length; sample++) {
        const modifier = (channelData.length - sample) / samplesToFadeOut;
        channelData[sample] *= modifier;
      }
    },
  };
};
