/**
 * Decodes an audio blob into an AudioBuffer.
 */
export async function decodeAudioBlob(blob: Blob): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    // Use decodeAudioData to handle various codecs inside containers like M4A
    return await audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Converts an AudioBuffer to a WAV Blob.
 */
function bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    let pos = 0;

    // Helper functions
    const setUint16 = (data: number) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };
    const setUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // format chunk size
    setUint16(1); // audio format (1 is PCM)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample
    // data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    // Write PCM samples
    const channels: Float32Array[] = [];
    for (let i = 0; i < numOfChan; i++) {
        channels.push(buffer.getChannelData(i));
    }

    for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < numOfChan; j++) {
            let sample = Math.max(-1, Math.min(1, channels[j][i])); // clamp
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF; // scale to 16-bit
            view.setInt16(pos, sample, true);
            pos += 2;
        }
    }

    return new Blob([view], { type: 'audio/wav' });
}


/**
 * Converts any supported audio blob to WAV format.
 * If the input is already WAV, it returns it as is.
 * @param audioBlob The input audio blob.
 * @returns A promise that resolves to a WAV blob.
 */
export async function convertAudioToWav(audioBlob: Blob): Promise<Blob> {
    if (audioBlob.type === 'audio/wav') {
        return audioBlob;
    }

    try {
        const audioBuffer = await decodeAudioBlob(audioBlob);
        const wavBlob = bufferToWav(audioBuffer);
        return wavBlob;
    } catch (error) {
        console.error("오디오 변환 실패:", error);
        throw new Error("지원되지 않는 오디오 형식이거나 파일이 손상되었습니다. WAV, MP3, M4A 형식 파일을 사용해보세요.");
    }
}

/**
 * Splits a WAV audio blob into multiple chunks of a specified size.
 * @param audioBlob The input WAV blob.
 * @param chunkSizeInBytes The maximum size of each chunk in bytes.
 * @returns A promise that resolves to an array of WAV blobs.
 */
export async function splitAudioBlob(audioBlob: Blob, chunkSizeInBytes: number): Promise<Blob[]> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const originalBuffer = await decodeAudioBlob(audioBlob);

    const bytesPerFrame = originalBuffer.numberOfChannels * 2; // 16-bit PCM has 2 bytes per sample
    const wavHeaderSize = 44;
    // Calculate how many frames of audio data can fit in a chunk, accounting for the header
    const maxDataBytesPerChunk = chunkSizeInBytes - wavHeaderSize;
    const framesPerChunk = Math.floor(maxDataBytesPerChunk / bytesPerFrame);
    
    if (framesPerChunk <= 0) {
        console.error("Chunk size is too small for even one frame of audio.");
        return [audioBlob]; // Return original blob if chunk size is impractical
    }

    const totalFrames = originalBuffer.length;
    const numChunks = Math.ceil(totalFrames / framesPerChunk);
    const chunkBlobs: Blob[] = [];

    for (let i = 0; i < numChunks; i++) {
        const startFrame = i * framesPerChunk;
        const endFrame = Math.min(startFrame + framesPerChunk, totalFrames);
        const chunkFrameCount = endFrame - startFrame;

        if (chunkFrameCount <= 0) continue;

        const chunkBuffer = audioContext.createBuffer(
            originalBuffer.numberOfChannels,
            chunkFrameCount,
            originalBuffer.sampleRate
        );

        // Copy data for each channel
        for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
            const originalChannelData = originalBuffer.getChannelData(channel);
            const chunkChannelData = chunkBuffer.getChannelData(channel);
            chunkChannelData.set(originalChannelData.subarray(startFrame, endFrame));
        }

        chunkBlobs.push(bufferToWav(chunkBuffer));
    }

    return chunkBlobs;
}
