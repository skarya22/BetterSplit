import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function ArrowSVG(props) {
  return (
    <Svg
      width={props.width}
      height={30}
      backgroundColor="transparent"
      viewBox="0 0 261 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M3 16.5a2.5 2.5 0 000 5v-5zm256.768 4.268a2.5 2.5 0 000-3.536l-15.91-15.91a2.5 2.5 0 00-3.536 3.536L254.464 19l-14.142 14.142a2.5 2.5 0 003.536 3.536l15.91-15.91zM3 21.5h255v-5H3v5z"
        fill={props.color}
      />
    </Svg>
  );
}

export default ArrowSVG;
