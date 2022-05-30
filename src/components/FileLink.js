import { Button } from "antd";
import * as api from '../api';
import { checkUploadStatus } from "../utils/util";

function FileLink({ bucket = 'file', filekey, url, filename, style, refetchUrl = false }) {
  const handleClick = async () => {
    if (refetchUrl) {
      const res = await api.downloadUrl(bucket, filekey);
      url = res.data;
    }
    const result = await checkUploadStatus(filekey);
    if (result) {
      window.open(url, '_blank', 'noopener');
    }
  };

  return (
    <Button
      type="link"
      onClick={handleClick}
      style={{ padding: 0, ...style }}
    >
      {filename}
    </Button>
  );
}

export default FileLink;
