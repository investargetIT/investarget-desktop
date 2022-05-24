import { useRef, useState } from "react";

function RetryImg(props) {
  const { times = 3, interval = 1000, ...propsToKeep } = props;
  const imgElem = useRef(null);
  const [remainingTimes, setRemainingTimes] = useState(times);
  const timer = useRef(null);

  const handleLoad = () => {
    clearTimeout(timer.current);
    setRemainingTimes(times);
  };

  const handleError = () => {
    if (remainingTimes === 0) return;

    timer.current = setTimeout(() => {
      imgElem.current.src = props.src + '?t=' + Date.now();
      setRemainingTimes(remainingTimes - 1);
    }, interval);
  };

  return (
    <img
      {...propsToKeep}
      ref={imgElem}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

export default RetryImg;
