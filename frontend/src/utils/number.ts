export const getFileSize = (bytes: number) => {
  const exp = (Math.log(bytes) / Math.log(1024)) | 0;
  const value = bytes / Math.pow(1024, exp);

  if (exp === 0) {
    return value.toFixed(0) + " bytes";
  } else {
    const result = value.toFixed(2);
    return result + " " + "KMGTPEZY"[exp - 1] + "B";
  }
};
