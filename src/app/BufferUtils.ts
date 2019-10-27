


export class BufferUtils {



  public static BufferToStringASCII(buffer: ArrayBuffer, offset: number, length: number) {
    const src = new Uint8Array(buffer, offset, length);
    const dst = [];

    for (let i = 0; i < src.length; i++) {
      dst.push(String.fromCharCode.apply(null, src.subarray(i, i + 1)));
    }

    return dst.join('');

  }

  public static arrayBufferToString(buffer: ArrayBuffer) {
    const uint8array = new Uint8Array(buffer);
    return String.fromCharCode.apply(null, uint8array);

  }

  public static BufferToStringASCII2(buffer: ArrayBuffer) {
    const chunk_size = 0x8000;
    const chunks = [];
    const bytes = new Uint8Array(buffer);


    for (let i = 0; i < bytes.length; i += chunk_size) {
      chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk_size)));
    }

    const str =  chunks.join('').replace(/[^ -~]+/g, '');
    return str;

  }

}
