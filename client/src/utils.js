export const processData = (data, color, pattern) => {
  const filteredData = {};

  for (const colorKey in data) {
    if (!color || colorKey === color) {
      for (const patternKey in data[colorKey]) {
        if (!pattern || patternKey === pattern) {
          for (const dataType in data[colorKey][patternKey]) {
            if (!filteredData[dataType]) {
              filteredData[dataType] = 0;
            }
            filteredData[dataType] += data[colorKey][patternKey][dataType];
          }
        }
      }
    }
  }

  return filteredData;
};

export function base64ToBlob(base64Data, contentType = "") {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}