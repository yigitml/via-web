import { createWriteStream } from 'fs';
import { finished } from 'stream/promises';
import axios from 'axios';

export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });

  const writer = createWriteStream(outputPath);
  response.data.pipe(writer);
  await finished(writer);
}

