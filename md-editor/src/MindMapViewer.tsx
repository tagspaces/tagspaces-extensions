import React, { useRef, useEffect } from 'react';
//@ts-ignore
import { Transformer } from 'markmap-lib';
import { Markmap, deriveOptions } from 'markmap-view';
import type { IMarkmapOptions } from 'markmap-view';
import { useTheme } from '@mui/material/styles';

const transformer = new Transformer();

interface Props {
  getContent: () => string;
}

const mmOptions: Partial<IMarkmapOptions> = deriveOptions({
  colorFreezeLevel: 2,
  // color: ['#2980b9']
});

export default function MindMapViewer(props: Props) {
  const { getContent } = props;
  const mdContent = getContent();
  const theme = useTheme();
  // markmap's embedded CSS switches node text, code and circle colors to
  // their dark variants only under an ancestor with the `markmap-dark` class
  const isDark = theme.palette.mode === 'dark';
  // const [value, setValue] = useState('');
  // Ref for SVG element
  const refSvg: any = useRef();
  // Ref for markmap object
  const refMm: any = useRef();

  useEffect(() => {
    // Create markmap and save to refMm
    if (refMm.current) return;
    refMm.current = Markmap.create(refSvg.current, mmOptions);
  }, [refSvg.current]);

  useEffect(() => {
    // Update data for markmap once value is changed
    const mm = refMm.current;
    if (!mm) return;
    const { root } = transformer.transform(mdContent);
    mm.setData(root);
    mm.fit();
  }, [refMm.current, mdContent]);

  // const handleChange = (e: any) => {
  //   setValue(e.target.value);
  // };

  return (
    <div
      className={isDark ? 'markmap-dark' : undefined}
      style={{ height: '100%', width: '100%' }}
    >
      <svg style={{ height: '100%', width: '100%' }} ref={refSvg} />
    </div>
  );
}
